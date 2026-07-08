import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { submitRender, getRenderStatus } from '../src/lib/shotstack';

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runTest() {
  const sampleScript = "Welcome to today's AI update! In an unprecedented move, tech giants have just announced a major collaboration on open-source large language models. This joint effort promises to accelerate AI development globally, making advanced tools accessible to millions of developers. Meanwhile, startups continue to disrupt the market with incredibly fast and efficient specialized models. The future of AI is moving faster than ever, and we're here to keep you updated. Thanks for watching, and stay tuned for more breakthroughs!";
  
  // This script is approximately 78 words, perfectly fitting our 80-90 word maximum constraint.
  
  // A publicly accessible audio MP3
  const dummyAudioUrl = 'https://github.com/rafaelreis-hotmart/Audio-Sample-files/raw/master/sample.mp3';

  console.log('Submitting render to Shotstack...');
  try {
    const renderId = await submitRender(sampleScript, dummyAudioUrl, [
      'A futuristic AI research lab with holographic displays and glowing neural networks, cinematic lighting, 8k',
      'Tech developers collaborating around a massive screen showing code, modern office, dramatic lighting, 8k',
      'An abstract visualization of interconnected AI nodes spreading across a digital globe, cinematic, 8k',
      'A sunrise over a futuristic city skyline symbolizing technological progress, ultra wide angle, 8k'
    ]);
    console.log(`✅ Render submitted successfully! Render ID: ${renderId}`);
    
    let isDone = false;
    let attempts = 0;
    
    console.log('Polling for status every 10 seconds...');
    while (!isDone) {
      attempts++;
      const { status, url, error } = await getRenderStatus(renderId);
      console.log(`[Attempt ${attempts}] Current status: ${status}`);
      
      if (status === 'done') {
        console.log(`\n🎉 Render complete!`);
        console.log(`Final Video URL: ${url}`);
        isDone = true;
      } else if (status === 'failed') {
        console.error(`\n❌ Render failed! Reason: ${error}`);
        isDone = true;
      } else {
        // Wait 10 seconds
        await delay(10000);
      }
    }
  } catch (err: any) {
    console.error('❌ Render submission failed:', err.message);
  }
}

runTest();
