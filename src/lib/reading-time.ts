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
