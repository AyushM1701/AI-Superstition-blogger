import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { submitRender, getRenderStatus } from '../../src/lib/shotstack';

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testOversizedScript() {
  console.log('--- Testing Oversized Script ---');
  // Generate 160 words
  const longScript = Array(160).fill('word').join(' ');
  try {
    await submitRender(longScript, 'https://example.com/audio.mp3', ['test prompt 1', 'test prompt 2', 'test prompt 3', 'test prompt 4']);
    console.error('❌ Failed! Oversized script was submitted.');
  } catch (error: any) {
    if (error.message.includes('exceeds 40-second limit')) {
      console.log('✅ Success! Oversized script rejected correctly.');
    } else {
      console.error('❌ Failed! Unexpected error:', error);
    }
  }
}

async function testRenderAndPoll() {
  console.log('\n--- Testing Render Submission and Polling ---');
  const validScript = 'This is a short test script for the Shotstack sandbox.';
  const dummyAudio = 'https://github.com/rafaelreis-hotmart/Audio-Sample-files/raw/master/sample.mp3';
  
  try {
    console.log('Submitting render...');
    const renderId = await submitRender(validScript, dummyAudio, ['test prompt 1', 'test prompt 2', 'test prompt 3', 'test prompt 4']);
    console.log(`✅ Render submitted successfully! ID: ${renderId}`);
    
    let isDone = false;
    let attempts = 0;
    while (!isDone && attempts < 20) {
      attempts++;
      console.log(`Polling status (Attempt ${attempts})...`);
      const { status, url, error } = await getRenderStatus(renderId);
      console.log(`Current status: ${status}`);
      
      if (status === 'done') {
        console.log(`✅ Render complete! Video URL: ${url}`);
        isDone = true;
      } else if (status === 'failed') {
        console.error(`❌ Render failed in Shotstack. Reason: ${error}`);
        isDone = true;
      } else {
        await delay(5000); // Poll every 5s
      }
    }
    if (!isDone) {
      console.error('❌ Polling timed out.');
    }
  } catch (error: any) {
    console.error('❌ Render submission failed:', error.message);
  }
}

async function runTest() {
  await testOversizedScript();
  await testRenderAndPoll();
}

runTest();
