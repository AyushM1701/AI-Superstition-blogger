import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { supabase, supabaseAdmin } from '../../src/lib/supabase';

async function runTest() {
  console.log('--- Setting up RLS Test ---');
  
  const testSlugPublished = 'test-rls-published-' + Date.now();
  const testSlugPending = 'test-rls-pending-' + Date.now();

  // 1. Insert rows using admin client
  console.log('Inserting 1 published row and 1 pending row as Admin...');
  const { error: insertError } = await supabaseAdmin.from('content_items').insert([
    {
      slug: testSlugPublished,
      title: 'Published RLS Test',
      script: 'Test',
      blog_html: '<p>Test</p>',
      status: 'published'
    },
    {
      slug: testSlugPending,
      title: 'Pending RLS Test',
      script: 'Test',
      blog_html: '<p>Test</p>',
      status: 'pending'
    }
  ]);

  if (insertError) {
    console.error('Failed to insert test rows:', insertError);
    return;
  }
  
  // 2. Fetch using anon client
  console.log('Fetching rows using Anon Client...');
  const { data, error: fetchError } = await supabase
    .from('content_items')
    .select('slug, status')
    .in('slug', [testSlugPublished, testSlugPending]);
    
  if (fetchError) {
    console.error('Fetch error:', fetchError);
    return;
  }
  
  console.log('\n--- RLS Test Results ---');
  let sawPublished = false;
  let sawPending = false;
  
  data?.forEach(row => {
    console.log(`Found row: [${row.status}] ${row.slug}`);
    if (row.status === 'published') sawPublished = true;
    if (row.status === 'pending') sawPending = true;
  });
  
  if (sawPublished && !sawPending) {
    console.log('✅ Success! Anon client can only read the published row.');
  } else {
    console.error('❌ Failed! RLS policy is not working correctly.');
    console.error(`sawPublished: ${sawPublished}, sawPending: ${sawPending}`);
  }
  
  // Cleanup
  console.log('\nCleaning up test rows...');
  await supabaseAdmin.from('content_items').delete().in('slug', [testSlugPublished, testSlugPending]);
  console.log('Done.');
}

runTest();
