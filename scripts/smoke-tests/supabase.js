const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env.local') });

async function testSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
  
  if (!url || !key) {
    console.error('❌ SUPABASE_URL or keys are missing from .env.local');
    process.exit(1);
  }
  
  console.log('Testing Supabase API...');
  try {
    const res = await fetch(`${url}/rest/v1/`, {
      method: 'GET',
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`
      }
    });
    
    // Status 200 is typical for a successful GET to the root, but depending on table setup, 
    // we just want to ensure we don't get a 401 Unauthorized or 403 Forbidden.
    if (res.ok || res.status === 404) {
      console.log('✅ Supabase API authenticated successfully!');
    } else if (res.status === 401 || res.status === 403) {
      console.error(`❌ Supabase API failed to authenticate. Status: ${res.status}`);
    } else {
      console.log(`✅ Supabase API reached (Status: ${res.status})`);
    }
  } catch (err) {
    console.error('❌ Supabase request failed:', err.message);
  }
}
testSupabase();
