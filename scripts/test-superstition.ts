import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { GoogleGenAI } from '@google/genai';
import { submitRender } from '../src/lib/shotstack';
import { supabaseAdmin } from '../src/lib/supabase';
import { sanitizeContent } from '../src/lib/sanitize';

async function generateSuperstitionPost() {
  console.log('🔮 Starting Superstition-Based Post Generation...');
  
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const model = "gemini-2.5-flash";
  
  const systemPrompt = `You are a mystical blogger and narrator focused on global superstitions, folklore, and myths.
Your task is to generate a fascinating blog post and a matching narration script about a unique superstition (e.g., why people knock on wood, the evil eye, black cats, broken mirrors, etc.).
CRITICAL CONSTRAINTS:
1. Output MUST be valid JSON matching this schema:
{
  "title": "string",
  "script": "string",
  "blog_html": "string",
  "tags": ["string"],
  "image_prompts": ["string", "string", "string", "string"]
}
2. The 'script' field MUST be capped at roughly 80-90 words (designed to be spoken in under 35 seconds).
3. 'blog_html' should use standard HTML tags (p, h2, h3, ul, li, strong, em). Make the blog post engaging and spooky but educational.
4. 'image_prompts' MUST be an array of EXACTLY 4 highly detailed, cinematic, 8k prompts describing a sequential visual storyboard that perfectly captures the superstition's progression. No text or words in the prompts.`;

  console.log('🧠 1. Calling Gemini to generate a superstition story...');
  const response = await ai.models.generateContent({
    model,
    contents: "Generate a captivating blog post about a famous or obscure superstition.",
    config: {
      systemInstruction: systemPrompt,
      responseMimeType: "application/json",
    }
  });

  const rawResult = response.text;
  if (!rawResult) throw new Error("Empty response from Gemini");
  
  const parsed = JSON.parse(rawResult);
  console.log(`✅ Gemini generated: "${parsed.title}"`);
  
  const cleanHtml = sanitizeContent(parsed.blog_html);

  // Use the dummy audio since we are just testing the end-to-end pipeline
  console.log('🎙️ 2. Fetching Dummy TTS Audio...');
  const dummyAudioUrl = 'https://github.com/rafaelreis-hotmart/Audio-Sample-files/raw/master/sample.mp3';
  
  console.log('🎬 3. Submitting to Shotstack Sandbox...');
  const render_id = await submitRender(parsed.script, dummyAudioUrl, parsed.image_prompts);
  console.log(`✅ Render submitted! Render ID: ${render_id}`);
  
  const slug = `superstition-${Date.now()}`;
  
  console.log('💾 4. Saving to Supabase...');
  const { error: insertError } = await supabaseAdmin
    .from('content_items')
    .insert({
      slug,
      title: parsed.title,
      script: parsed.script,
      blog_html: cleanHtml,
      tags: parsed.tags,
      tts_audio_url: dummyAudioUrl,
      shotstack_render_id: render_id,
      status: 'rendering'
    });

  if (insertError) {
    console.error('❌ Failed to save to database:', insertError);
  } else {
    console.log(`✅ Success! The post is now rendering in Shotstack.`);
    console.log(`\n⏳ The Sweeper cron route will automatically detect this and publish it in the background when Shotstack finishes!`);
    console.log(`You can also view the local URL layout here (it will show 'rendering' or fallback until complete): http://localhost:3000/${slug}`);
  }
}

generateSuperstitionPost().catch(console.error);
