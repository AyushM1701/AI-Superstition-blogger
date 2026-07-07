const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env.local') });

async function testTTS() {
  const apiKey = process.env.TTS_API_KEY;
  
  if (!apiKey) {
    console.error('❌ TTS_API_KEY is missing from .env.local');
    process.exit(1);
  }
  
  console.log('Testing TTS Provider (Gemini 2.5 Flash)...');
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: "Hello for TTS test" }] }] })
    });
    
    if (res.ok) {
      console.log('✅ TTS API (Gemini) authenticated successfully!');
    } else {
      const errorText = await res.text();
      console.error(`❌ TTS API failed to authenticate. Status: ${res.status} - ${errorText}`);
    }
  } catch (err) {
    console.error('❌ TTS request failed:', err.message);
  }
}
testTTS();
