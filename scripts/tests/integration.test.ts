import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { getRenderStatus } from '../../src/lib/shotstack';
import { supabaseAdmin } from '../../src/lib/supabase';

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runLocalE2E() {
  const CRON_SECRET = process.env.CRON_SECRET;
  const LOCAL_URL = 'http://localhost:3000';

  console.log('🚀 Starting Local End-to-End Test Pipeline...\n');

  // 1. Trigger the Cron Route
  console.log('1️⃣  Triggering /api/cron to generate AI blog & submit video...');
  const cronRes = await fetch(`${LOCAL_URL}/api/cron`, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${CRON_SECRET}` }
  });

  const cronData = await cronRes.json();
  
  if (!cronRes.ok) {
    console.error('❌ Cron route failed:', cronData);
    return;
  }

  if (cronData.message === 'Already processed today') {
    console.log('⚠️  Cron route says "Already processed today". Deleting today\'s row to allow a fresh run...');
    const today = new Date().toISOString().split('T')[0];
    await supabaseAdmin.from('content_items').delete().eq('slug', `ai-news-${today}`);
    console.log('🔄 Restart script to try again!');
    return;
  }

  const slug = cronData.slug;
  console.log(`✅ Cron successful! Blog slug: ${slug}`);

  // 2. Fetch the render ID from the DB
  console.log('\n2️⃣  Fetching Render ID from Database...');
  const { data: row } = await supabaseAdmin
    .from('content_items')
    .select('shotstack_render_id')
    .eq('slug', slug)
    .single();

  if (!row || !row.shotstack_render_id) {
    console.error('❌ Failed to find rendering row in database.');
    return;
  }

  const renderId = row.shotstack_render_id;
  console.log(`✅ Found Render ID: ${renderId}`);

  // 3. Poll Shotstack until done
  console.log('\n3️⃣  Polling Shotstack for video completion (this takes ~60 seconds in Sandbox)...');
  let isDone = false;
  let attempts = 0;
  let videoUrl = '';

  while (!isDone && attempts < 30) {
    attempts++;
    const { status, url, error } = await getRenderStatus(renderId);
    console.log(`   [Attempt ${attempts}] Status: ${status}`);

    if (status === 'done') {
      videoUrl = url || '';
      console.log(`✅ Render complete! Video URL: ${videoUrl}`);
      isDone = true;
    } else if (status === 'failed') {
      console.error(`❌ Render failed in Shotstack: ${error}`);
      return;
    } else {
      await delay(10000); // 10s delay
    }
  }

  if (!isDone) {
    console.error('❌ Timed out waiting for Shotstack.');
    return;
  }

  // 4. Simulate Webhook Delivery
  console.log('\n4️⃣  Simulating Shotstack Webhook delivery to localhost...');
  const webhookRes = await fetch(`${LOCAL_URL}/api/webhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'render',
      status: 'done',
      id: renderId,
      url: videoUrl
    })
  });

  if (webhookRes.ok) {
    console.log(`✅ Webhook processed successfully! Row is now PUBLISHED.`);
    console.log(`\n🎉 ALL DONE! Check out your live AI blog post here:`);
    console.log(`➡️  ${LOCAL_URL}/${slug}`);
    console.log(`➡️  ${LOCAL_URL}/ (Homepage Grid)`);
  } else {
    console.error('❌ Failed to deliver webhook.', await webhookRes.text());
  }
}

runLocalE2E();
