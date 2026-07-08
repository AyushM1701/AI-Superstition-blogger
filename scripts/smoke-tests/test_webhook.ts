import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { supabaseAdmin } from '../../src/lib/supabase';

async function runTest() {
  const WEBHOOK_URL = 'http://localhost:3000/api/webhook';
  
  console.log('--- Setting up DB for tests ---');
  // Clear old tests
  await supabaseAdmin.from('content_items').delete().like('slug', 'test-webhook-%');
  
  // Create test items
  const renderIdDone = 'test-render-id-done-' + Date.now();
  const renderIdFailed = 'test-render-id-fail-' + Date.now();

  await supabaseAdmin.from('content_items').insert([
    {
      slug: `test-webhook-done-${Date.now()}`,
      title: 'Test Webhook Done',
      script: 'Test',
      blog_html: '<p>Test</p>',
      status: 'rendering',
      shotstack_render_id: renderIdDone
    },
    {
      slug: `test-webhook-fail-${Date.now()}`,
      title: 'Test Webhook Fail',
      script: 'Test',
      blog_html: '<p>Test</p>',
      status: 'rendering',
      shotstack_render_id: renderIdFailed
    }
  ]);
  
  console.log('✅ Dummy rendering rows created.');

  // Test 1: Done Payload
  console.log('\n--- Test 1: Done Payload ---');
  const res1 = await fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'render',
      status: 'done',
      id: renderIdDone,
      url: 'https://example.com/video.mp4'
    })
  });
  console.log(`Webhook HTTP status: ${res1.status}`);
  
  const { data: row1 } = await supabaseAdmin.from('content_items').select('*').eq('shotstack_render_id', renderIdDone).single();
  if (row1 && row1.status === 'published' && row1.video_url === 'https://example.com/video.mp4') {
    console.log('✅ Test 1 Passed! Row successfully updated to published.');
  } else {
    console.error('❌ Test 1 Failed! Row not updated correctly.', row1);
  }

  // Test 2: Duplicate Payload (Idempotency)
  console.log('\n--- Test 2: Duplicate Payload ---');
  const res2 = await fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'render',
      status: 'done',
      id: renderIdDone,
      url: 'https://example.com/video.mp4'
    })
  });
  console.log(`Webhook HTTP status: ${res2.status}`);
  
  const { data: row2 } = await supabaseAdmin.from('content_items').select('*').eq('shotstack_render_id', renderIdDone).single();
  if (row2 && row2.status === 'published') {
    console.log('✅ Test 2 Passed! Route is idempotent.');
  } else {
    console.error('❌ Test 2 Failed!');
  }

  // Test 3: Failed Payload
  console.log('\n--- Test 3: Failed Payload ---');
  const res3 = await fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'render',
      status: 'failed',
      id: renderIdFailed,
      error: 'Audio rendering error'
    })
  });
  console.log(`Webhook HTTP status: ${res3.status}`);
  
  const { data: row3 } = await supabaseAdmin.from('content_items').select('*').eq('shotstack_render_id', renderIdFailed).single();
  if (row3 && row3.status === 'failed' && row3.error_message === 'Audio rendering error') {
    console.log('✅ Test 3 Passed! Row successfully updated to failed.');
  } else {
    console.error('❌ Test 3 Failed! Row not updated correctly.', row3);
  }
}

runTest();
