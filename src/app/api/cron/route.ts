import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { generateContent } from '@/lib/gemini';

import { generateAudio } from '@/lib/tts';
import { submitRender } from '@/lib/shotstack';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    const slug = `superstition-${dateStr}`;

    // 1. Check if row exists for idempotency
    const { data: existing } = await supabaseAdmin
      .from('content_items')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ success: true, message: 'Already processed today' }, { status: 200 });
    }

    // Fetch last 10 days of titles to prevent repetition
    const tenDaysAgo = new Date();
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
    
    const { data: recentItems } = await supabaseAdmin
      .from('content_items')
      .select('title')
      .gte('created_at', tenDaysAgo.toISOString());
      
    const previousTitles = recentItems ? recentItems.map((item: { title: string }) => item.title) : [];

    // 2. Call Gemini for structured content
    let generatedContent;
    try {
      generatedContent = await generateContent(previousTitles);
    } catch (geminiError: any) {
      console.error('Gemini content generation failed:', geminiError.message);
      return NextResponse.json({ success: true, message: 'Skipped today due to Gemini failure' }, { status: 200 });
    }

    const { title, script, blog_html: cleanHtml, tags, image_prompts } = generatedContent;

    // 4. Call TTS to get narration audio
    let audioBuffer;
    try {
      audioBuffer = await generateAudio(script);
    } catch (ttsError: any) {
      console.error('TTS generation failed:', ttsError.message);
      // Explicitly check for quota limits if specific string matches
      if (ttsError.message.toLowerCase().includes('quota')) {
        console.error('[QUOTA EXHAUSTED] TTS Quota reached.');
      }
      return NextResponse.json({ success: true, message: 'Skipped today due to TTS failure' }, { status: 200 });
    }

    // Upload to Supabase Storage
    const filename = `${slug}.mp3`;
    const { error: uploadError } = await supabaseAdmin
      .storage
      .from('audio')
      .upload(filename, audioBuffer, {
        contentType: 'audio/mpeg',
        upsert: true
      });

    let tts_audio_url = '';
    if (!uploadError) {
      const { data } = supabaseAdmin.storage.from('audio').getPublicUrl(filename);
      tts_audio_url = data.publicUrl;
    } else {
      console.warn('Storage upload error (bucket might not exist):', uploadError.message);
      // Fallback for stub testing if bucket doesn't exist yet
      tts_audio_url = `https://stubbed.url/${filename}`;
    }

    // 5. Insert row with status='pending'
    const { data: insertedData, error: insertError } = await supabaseAdmin
      .from('content_items')
      .insert({
        slug,
        title,
        script,
        blog_html: cleanHtml,
        tags,
        tts_audio_url,
        status: 'pending'
      })
      .select()
      .single();

    if (insertError) {
      throw new Error(`Insert failed: ${insertError.message}`);
    }

    // 6. Call Shotstack to submit render
    try {
      const render_id = await submitRender(script, tts_audio_url, image_prompts);

      // 7. Update row to status='rendering' with render_id
      const { error: updateError } = await supabaseAdmin
        .from('content_items')
        .update({
          status: 'rendering',
          shotstack_render_id: render_id,
          updated_at: new Date().toISOString()
        })
        .eq('id', insertedData.id);

      if (updateError) throw new Error(`Update failed: ${updateError.message}`);
      
      return NextResponse.json({ success: true, message: 'Cron sequence completed', slug }, { status: 200 });
    } catch (shotstackError: any) {
      console.error('Shotstack submission failed:', shotstackError.message);
      
      let errorMessage = shotstackError.message;
      
      // Catch Shotstack 4xx quota/auth errors explicitly
      if (errorMessage.includes('403') || errorMessage.includes('429') || errorMessage.toLowerCase().includes('quota')) {
        errorMessage = `[QUOTA EXHAUSTED] ${errorMessage}`;
        console.error(errorMessage);
      }
      
      // Update row with error_message and status='error'
      await supabaseAdmin
        .from('content_items')
        .update({
          status: 'error',
          error_message: errorMessage,
          updated_at: new Date().toISOString()
        })
        .eq('id', insertedData.id);
        
      return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Cron error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
