/**
 * Estimates reading time for an HTML string.
 * Strips tags, counts words, divides by average reading speed (200 wpm).
 */
export function getReadingTime(html: string): string {
  const text = html.replace(/<[^>]*>/g, '');
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(wordCount / 200));
  return `${minutes} min read`;
}

/**
 * Strips a leading <h2> or <h3> tag from blog_html if it matches the post title.
 * Fixes legacy posts that were generated before the Gemini prompt was updated.
 */
export function stripLeadingTitle(html: string, title: string): string {
  // Match <h2>Title</h2> or <h3>Title</h3> at the very start
  const pattern = /^\s*<h[23][^>]*>([^<]*)<\/h[23]>\s*/i;
  const match = html.match(pattern);
  if (match) {
    // Normalize both strings for comparison (trim, collapse whitespace)
    const headingText = match[1].trim().replace(/\s+/g, ' ');
    const normalizedTitle = title.trim().replace(/\s+/g, ' ');
    if (headingText === normalizedTitle) {
      return html.replace(pattern, '');
    }
  }
  return html;
}
