const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env.local') });

async function testGemini() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('❌ GEMINI_API_KEY is missing from .env.local');
    process.exit(1);
  }

  console.log('Testing Gemini API...');
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: "Hello" }] }] })
    });

    if (res.ok) {
      console.log('✅ Gemini API authenticated successfully!');
    } else {
      const error = await res.json();
      console.error('❌ Gemini API failed:', error);
    }
  } catch (err) {
    console.error('❌ Gemini request failed:', err.message);
  }
}
testGemini();
