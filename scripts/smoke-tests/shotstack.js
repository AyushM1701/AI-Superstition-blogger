const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env.local') });

async function testShotstack() {
  const apiKey = process.env.SHOTSTACK_API_KEY;
  const env = process.env.SHOTSTACK_ENV || 'stage';
  
  if (!apiKey) {
    console.error('❌ SHOTSTACK_API_KEY is missing from .env.local');
    process.exit(1);
  }
  
  console.log(`Testing Shotstack API on environment: ${env}...`);
  try {
    const res = await fetch(`https://api.shotstack.io/${env}/render`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'x-api-key': apiKey
      }
    });
    
    if (res.ok) {
      console.log('✅ Shotstack API authenticated successfully!');
    } else if (res.status === 401 || res.status === 403) {
      console.error(`❌ Shotstack API failed to authenticate. Status: ${res.status}`);
    } else {
      console.log(`✅ Shotstack API authenticated successfully! (Status: ${res.status})`);
    }
  } catch (err) {
    console.error('❌ Shotstack request failed:', err.message);
  }
}
testShotstack();
