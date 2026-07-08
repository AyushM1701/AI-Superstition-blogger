import { sanitizeContent } from '../../src/lib/sanitize';

const maliciousHtml = `
  <div>
    <h2>Safe Heading</h2>
    <p>This is a <strong>safe</strong> paragraph with <a href="https://example.com" onclick="stealCookies()">a link</a>.</p>
    <script>alert('XSS!')</script>
    <style>body { display: none; }</style>
    <img src="x" onerror="alert('XSS 2!')" />
    <iframe src="javascript:alert('XSS 3!')"></iframe>
  </div>
`;

function runTest() {
  console.log('Testing sanitizeContent...');
  console.log('--- Original HTML ---');
  console.log(maliciousHtml);
  
  const cleanHtml = sanitizeContent(maliciousHtml);
  
  console.log('\n--- Cleaned HTML ---');
  console.log(cleanHtml);
  
  const hasScript = cleanHtml.includes('<script>');
  const hasOnclick = cleanHtml.includes('onclick');
  const hasIframe = cleanHtml.includes('<iframe');
  const hasStyle = cleanHtml.includes('<style>');
  const hasImg = cleanHtml.includes('<img'); // img is not in the allowed tags list
  
  if (!hasScript && !hasOnclick && !hasIframe && !hasStyle && !hasImg) {
    console.log('\n✅ Malicious and disallowed content successfully stripped!');
  } else {
    console.error('\n❌ Sanitizer failed to strip all malicious/disallowed content!');
  }
}

runTest();
