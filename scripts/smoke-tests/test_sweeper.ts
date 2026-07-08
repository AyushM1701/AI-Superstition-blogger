import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { supabaseAdmin } from '../../src/lib/supabase';
import { submitRender } from '../../src/lib/shotstack';

async function runTest() {
  const LOCAL_URL = 'http://localhost:3000';
  const CRON_SECRET = process.env.CRON_SECRET;
  
  console.log('--- Setting up Sweeper Test ---');
  
  const testSlug = 'test-sweeper-' + Date.now();

  // 1. Submit a real sandbox render to get a valid render ID
  console.log('Submitting a real render to Shotstack to simulate a pending job...');
  const dummyAudioUrl = 'https://github.com/rafaelreis-hotmart/Audio-Sample-files/raw/master/sample.mp3';
  let renderId;
  try {
    renderId = await submitRender('Sweeper test script.', dummyAudioUrl, ['test 1', 'test 2', 'test 3', 'test 4']);
    console.log(`✅ Render submitted successfully! Render ID: ${renderId}`);
  } catch (error: any) {
    console.error('❌ Failed to submit render:', error.message);
    return;
  }

  // 2. Insert the row into Supabase
  // We artificially backdate updated_at by 40 minutes so the sweeper picks it up immediately
  const fortyMinutesAgo = new Date(Date.now() - 40 * 60 * 1000).toISOString();
  
  console.log('Inserting row into database with artificially aged updated_at (40 minutes ago)...');
  const { error: insertError } = await supabaseAdmin.from('content_items').insert([
    {
      slug: testSlug,
      title: 'Sweeper Test',
      script: 'Test script',
      blog_html: '<p>Test</p>',
      status: 'rendering',
      shotstack_render_id: renderId,
      updated_at: fortyMinutesAgo
    }
  ]);

  if (insertError) {
    console.error('❌ Failed to insert test row:', insertError);
    return;
  }

  console.log('✅ Dummy orphaned rendering row created.');

  // 3. Call the local Sweeper endpoint
  console.log('\n--- Triggering Local Sweeper ---');
  const sweeperRes = await fetch(`${LOCAL_URL}/api/sweeper`, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${CRON_SECRET}` }
  });
  
  const sweeperData = await sweeperRes.json();
  console.log(`Sweeper HTTP status: ${sweeperRes.status}`);
  console.log('Sweeper Response:', sweeperData);
  
  // 4. Verify the database state
  console.log('\n--- Verifying Database State ---');
  const { data: row } = await supabaseAdmin
    .from('content_items')
    .select('status, attempt_count, updated_at')
    .eq('slug', testSlug)
    .single();

  if (!row) {
    console.error('❌ Failed to find row in database.');
    return;
  }

  console.log(`Current Status: ${row.status}`);
  console.log(`Attempt Count: ${row.attempt_count}`);
  
  // Since Shotstack was just triggered, it's almost certainly still "queued" or "rendering",
  // so the sweeper should have incremented the attempt_count rather than resolving it to published yet.
  if (row.attempt_count === 1 && row.status === 'rendering') {
    console.log('✅ Test Passed! Sweeper successfully detected the orphaned row and incremented the attempt counter.');
  } else if (row.status === 'published' || row.status === 'failed') {
    console.log(`✅ Test Passed! Sweeper successfully detected the orphaned row and instantly resolved it to ${row.status}.`);
  } else {
    console.error('❌ Test Failed! Row state is incorrect:', row);
  }

  // Cleanup
  console.log('\nCleaning up test row...');
  await supabaseAdmin.from('content_items').delete().eq('slug', testSlug);
  console.log('Done.');
}

runTest();
