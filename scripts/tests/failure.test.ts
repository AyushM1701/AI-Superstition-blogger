import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { supabaseAdmin } from '../../src/lib/supabase';
import { submitRender } from '../../src/lib/shotstack';

async function runFailureTests() {
  console.log('--- Running Failure-Path Tests ---\n');
  const WEBHOOK_URL = 'http://localhost:3000/api/webhook';
  
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, meta?: any) {
    if (condition) {
      console.log(`✅ Passed: ${testName}`);
      passed++;
    } else {
      console.error(`❌ Failed: ${testName}`, meta || '');
      failed++;
    }
  }

  // 1. Mismatched Webhook ID
  console.log('\n[Test] Webhook with Mismatched ID');
  const fakeId = 'fake-uuid-' + Date.now();
  const res1 = await fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'render', status: 'done', id: fakeId, url: 'fake.mp4' })
  });
  
  // Should return 200 to prevent retry loops
  assert(res1.status === 200, 'Webhook gracefully ignores mismatched ID with 200 OK');
  
  // 2. Duplicate Webhook Delivery
  console.log('\n[Test] Duplicate Webhook Delivery');
  const slug = `test-duplicate-${Date.now()}`;
  const renderId = `render-${Date.now()}`;
  
  // Insert a published row
  await supabaseAdmin.from('content_items').insert([{
    slug, title: 'Duplicate Test', script: 'Test', blog_html: '<p>Test</p>',
    status: 'published', shotstack_render_id: renderId, video_url: 'real.mp4'
  }]);
  
  const res2 = await fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'render', status: 'done', id: renderId, url: 'new.mp4' })
  });
  
  const { data: row } = await supabaseAdmin.from('content_items').select('video_url').eq('slug', slug).single();
  assert(res2.status === 200, 'Webhook returns 200 on duplicate delivery');
  assert(row?.video_url === 'real.mp4', 'Webhook idempotency prevents overwriting existing data');
  
  // Cleanup
  await supabaseAdmin.from('content_items').delete().eq('slug', slug);

  console.log(`\nFailure-Path Tests Completed: ${passed} Passed, ${failed} Failed\n`);
  if (failed > 0) process.exit(1);
}

runFailureTests();
