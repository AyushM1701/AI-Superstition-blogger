import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { ContentSchema } from '../../src/types/content';
import { sanitizeContent } from '../../src/lib/sanitize';
import { submitRender } from '../../src/lib/shotstack';

async function runUnitTests() {
  console.log('--- Running Unit Tests ---\n');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`✅ Passed: ${testName}`);
      passed++;
    } else {
      console.error(`❌ Failed: ${testName}`);
      failed++;
    }
  }

  // 1. Gemini Schema Validator
  const validData = {
    title: 'Test Title',
    script: 'Test Script',
    blog_html: '<p>Test Html</p>',
    tags: ['test']
  };
  const invalidData = { title: 'Test' }; // Missing required fields

  assert(ContentSchema.safeParse(validData).success === true, 'Gemini Validator: Accepts valid schema');
  assert(ContentSchema.safeParse(invalidData).success === false, 'Gemini Validator: Rejects invalid schema');

  // 2. HTML Sanitizer
  const maliciousHtml = `<p>Clean text</p><script>alert('xss')</script><iframe src="malicious.com"></iframe><strong onclick="hack()">Bold</strong>`;
  const cleanHtml = sanitizeContent(maliciousHtml);
  
  assert(cleanHtml.includes('<p>Clean text</p>'), 'Sanitizer: Preserves allowed tags');
  assert(!cleanHtml.includes('<script>'), 'Sanitizer: Strips <script> tags completely');
  assert(!cleanHtml.includes('<iframe>'), 'Sanitizer: Strips <iframe> tags completely');
  assert(cleanHtml.includes('<strong>Bold</strong>') && !cleanHtml.includes('onclick'), 'Sanitizer: Strips malicious attributes but keeps tag');

  // 3. Duration Estimator (Oversized script)
  // 110 words
  const longScript = Array(110).fill('word').join(' ');
  try {
    await submitRender(longScript, 'https://example.com/audio.mp3', ['test 1', 'test 2', 'test 3', 'test 4']);
    assert(false, 'Duration Estimator: Should throw on oversized script');
  } catch (error: any) {
    assert(error.message.includes('Script exceeds 40-second limit'), 'Duration Estimator: Throws exact 40-second limit error');
  }

  console.log(`\nUnit Tests Completed: ${passed} Passed, ${failed} Failed\n`);
  if (failed > 0) process.exit(1);
}

runUnitTests();
