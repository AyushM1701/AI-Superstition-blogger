import sanitizeHtml from 'sanitize-html';

export function sanitizeContent(html: string) {
  return sanitizeHtml(html, {
    allowedTags: ['p', 'strong', 'em', 'ul', 'ol', 'li', 'h2', 'h3', 'a'],
    allowedAttributes: {
      'a': ['href', 'title', 'target']
    },
    // Scripts, styles, and event handlers are stripped by default, but we can be explicit:
    disallowedTagsMode: 'discard'
  });
}
