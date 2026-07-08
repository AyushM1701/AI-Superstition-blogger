const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env.local') });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
  console.error('Missing Supabase variables in .env.local');
  process.exit(1);
}

const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function runTest() {
  console.log('Inserting test rows using Admin Client...');
  const slug1 = 'test-published-' + Date.now();
  const slug2 = 'test-pending-' + Date.now();
  
  const { error: insertErr } = await supabaseAdmin.from('content_items').insert([
    { slug: slug1, title: 'Published Test', status: 'published' },
    { slug: slug2, title: 'Pending Test', status: 'pending' }
  ]);

  if (insertErr) {
    console.error('❌ Failed to insert rows:', insertErr.message);
    return;
  }
  
  console.log('✅ Inserted 2 rows (one published, one pending).');
  
  console.log('Fetching rows as Anon (RLS should block pending row)...');
  const { data: anonData, error: anonErr } = await supabaseAnon
    .from('content_items')
    .select('*')
    .in('slug', [slug1, slug2]);

  if (anonErr) {
    console.error('❌ Anon fetch failed:', anonErr.message);
    return;
  }
  
  const slugsFound = anonData.map(r => r.slug);
  console.log(`Anon fetch results: ${slugsFound.length} rows found.`);
  
  if (slugsFound.includes(slug1) && !slugsFound.includes(slug2)) {
    console.log('✅ RLS test passed! Anon client could only read the published row.');
  } else {
    console.error('❌ RLS test failed! Found:', slugsFound);
  }
  
  // Cleanup
  console.log('Cleaning up test rows...');
  await supabaseAdmin.from('content_items').delete().in('slug', [slug1, slug2]);
  console.log('✅ Cleanup complete.');
}

runTest();
