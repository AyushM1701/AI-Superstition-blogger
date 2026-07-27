/**
 * Central site configuration.
 * All files that need the site URL should import from here
 * so there is a single place to update if the domain changes.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  'https://ai-superstition-blogger-4nnb.vercel.app';
