const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env.local') });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const cronSecret = process.env.CRON_SECRET;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function runTest() {
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0];
  const slug = `ai-news-${dateStr}`;

  console.log(`Clearing today's test row (${slug}) if it exists...`);
  await supabaseAdmin.from('content_items').delete().eq('slug', slug);

  console.log('Triggering cron route 1st time...');
  const res1 = await fetch(`http://localhost:3000/api/cron`, {
    headers: { 'Authorization': `Bearer ${cronSecret}` }
  });
  const data1 = await res1.json();
  console.log('1st response:', data1);

  console.log('\nTriggering cron route 2nd time (should return early)...');
  const res2 = await fetch(`http://localhost:3000/api/cron`, {
    headers: { 'Authorization': `Bearer ${cronSecret}` }
  });
  const data2 = await res2.json();
  console.log('2nd response:', data2);

  console.log('\nVerifying rows in DB...');
  const { data: rows, error } = await supabaseAdmin.from('content_items').select('*').eq('slug', slug);
  
  if (error) {
    console.error('❌ Error fetching rows:', error);
    return;
  }

  if (rows && rows.length === 1) {
    console.log('✅ Success! Only one row was created.');
    console.log('Row details:', { status: rows[0].status, render_id: rows[0].shotstack_render_id });
  } else {
    console.error(`❌ Failed! Expected 1 row, found ${rows ? rows.length : 0}`);
  }
}

runTest();
