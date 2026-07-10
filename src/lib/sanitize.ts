import sanitizeHtml from 'sanitize-html';

export function sanitizeContent(html: string) {
  return sanitizeHtml(html, {
    allowedTags: ['p', 'strong', 'em', 'ul', 'ol', 'li', 'h2', 'h3', 'a'],
    allowedAttributes: { 'a': ['href', 'title', 'target'] },
    allowedSchemes: ['http', 'https', 'mailto'],
    transformTags: {
      'a': sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer' }, true)
    },
    disallowedTagsMode: 'discard'
  });
}
