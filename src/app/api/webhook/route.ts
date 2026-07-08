import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../lib/supabase';

export async function POST(req: Request) {
  try {
    const payload = await req.json();

    // Ensure it's a Shotstack payload
    if (payload.action !== 'render' || !payload.id) {
      return NextResponse.json({ success: true }, { status: 200 }); // Fast no-op
    }

    const renderId = payload.id;
    const status = payload.status;
    const videoUrl = payload.url;
    const errorMsg = payload.error;

    // Fetch the corresponding row from Supabase
    const { data: item, error: fetchError } = await supabaseAdmin
      .from('content_items')
      .select('id, status')
      .eq('shotstack_render_id', renderId)
      .single();

    // If no matching row is found or there is a database error, just return 200 (ignore silently)
    if (fetchError || !item) {
      return NextResponse.json({ success: true }, { status: 200 });
    }

    // Idempotency check: if it's already 'published' or 'failed', no-op
    if (item.status === 'published' || item.status === 'failed') {
      return NextResponse.json({ success: true, message: 'Already processed' }, { status: 200 });
    }

    // Process 'done' or 'failed'
    if (status === 'done' && videoUrl) {
      await supabaseAdmin
        .from('content_items')
        .update({
          status: 'published',
          video_url: videoUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', item.id);
    } else if (status === 'failed') {
      await supabaseAdmin
        .from('content_items')
        .update({
          status: 'failed',
          error_message: errorMsg || 'Unknown Shotstack render error',
          updated_at: new Date().toISOString()
        })
        .eq('id', item.id);
    }

    // Always return a fast 200
    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error) {
    console.error('Webhook processing error:', error);
    // Still return 200 to prevent Shotstack from retrying infinitely for a bad payload
    return NextResponse.json({ success: true }, { status: 200 });
  }
}
