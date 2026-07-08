import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../lib/supabase';
import { getRenderStatus } from '../../../lib/shotstack';

const MAX_ATTEMPTS = 3;

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 30 minutes ago
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();

    // 1. Fetch all rendering rows older than 30 minutes
    const { data: stuckRows, error: fetchError } = await supabaseAdmin
      .from('content_items')
      .select('id, slug, shotstack_render_id, attempt_count')
      .eq('status', 'rendering')
      .lt('updated_at', thirtyMinutesAgo);

    if (fetchError) throw new Error(`Failed to fetch stuck rows: ${fetchError.message}`);

    if (!stuckRows || stuckRows.length === 0) {
      return NextResponse.json({ success: true, message: 'No stuck renders found.' }, { status: 200 });
    }

    let resolvedCount = 0;
    let timeoutCount = 0;

    // 2. Process each stuck row
    for (const row of stuckRows) {
      const { id, shotstack_render_id, attempt_count } = row;
      const currentAttempt = attempt_count || 0;

      if (!shotstack_render_id) {
        // Edge case: stuck in 'rendering' but no render_id. Force fail.
        await supabaseAdmin
          .from('content_items')
          .update({ status: 'failed', error_message: 'Missing render ID', updated_at: new Date().toISOString() })
          .eq('id', id);
        timeoutCount++;
        continue;
      }

      try {
        // Query Shotstack API
        const { status, url, error } = await getRenderStatus(shotstack_render_id);

        if (status === 'done' && url) {
          // It finished, but webhook was missed
          await supabaseAdmin
            .from('content_items')
            .update({ status: 'published', video_url: url, updated_at: new Date().toISOString() })
            .eq('id', id);
          resolvedCount++;
        } else if (status === 'failed') {
          // It failed, but webhook was missed
          await supabaseAdmin
            .from('content_items')
            .update({ status: 'failed', error_message: error || 'Shotstack internal failure', updated_at: new Date().toISOString() })
            .eq('id', id);
          resolvedCount++;
        } else {
          // Still queued/rendering in Shotstack
          if (currentAttempt >= MAX_ATTEMPTS) {
            // Force fail due to timeout
            await supabaseAdmin
              .from('content_items')
              .update({ status: 'failed', error_message: 'render timeout', updated_at: new Date().toISOString() })
              .eq('id', id);
            timeoutCount++;
          } else {
            // Increment attempt count
            await supabaseAdmin
              .from('content_items')
              .update({ attempt_count: currentAttempt + 1, updated_at: new Date().toISOString() })
              .eq('id', id);
          }
        }
      } catch (shotstackError: any) {
        console.error(`Sweeper failed to check render ${shotstack_render_id}:`, shotstackError.message);
        // We'll increment attempt_count even on API check failures to prevent infinite loops on broken IDs
        if (currentAttempt >= MAX_ATTEMPTS) {
          await supabaseAdmin
            .from('content_items')
            .update({ status: 'failed', error_message: 'render timeout (API error)', updated_at: new Date().toISOString() })
            .eq('id', id);
          timeoutCount++;
        } else {
          await supabaseAdmin
            .from('content_items')
            .update({ attempt_count: currentAttempt + 1, updated_at: new Date().toISOString() })
            .eq('id', id);
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Sweeper finished.', 
      resolved: resolvedCount, 
      timeouts: timeoutCount,
      total_processed: stuckRows.length
    }, { status: 200 });

  } catch (error: any) {
    console.error('Sweeper error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
