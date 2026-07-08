import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { generateContent } from '../../src/lib/gemini';

async function runTest() {
  console.log('Running Gemini generation 10 times to verify schema validation and retry logic...');
  let successCount = 0;
  
  for (let i = 1; i <= 10; i++) {
    console.log(`\n--- Iteration ${i} ---`);
    try {
      const data = await generateContent(['Previous Title 1', 'Previous Title 2']);
      console.log(`✅ Success!`);
      console.log(`Title: "${data.title}"`);
      console.log(`Script length: ${data.script.split(' ').length} words`);
      successCount++;
    } catch (err: any) {
      console.error(`❌ Failed:`, err.message);
    }
  }
  
  console.log(`\nTest complete: ${successCount}/10 successful.`);
  if (successCount === 10) {
    console.log('✅ Perfect score!');
  }
}

runTest();
