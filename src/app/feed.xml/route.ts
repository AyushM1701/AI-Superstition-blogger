import { getAllPosts } from '../../lib/posts';

export async function GET() {
  const posts = getAllPosts();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tona-totka.com';

  const feed = `<?xml version="1.0" encoding="utf-8"?>
  <rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
    <channel>
      <title>TONA TOTKA.COM</title>
      <link>${baseUrl}</link>
      <description>Uncover the world's most fascinating Indian superstitions, myths, and folklore.</description>
      <language>en-in</language>
      <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml"/>
      ${posts.map(post => {
        const postUrl = `${baseUrl}/${post.slug}`;
        const imageUrl = post.image_urls && post.image_urls.length > 0 
          ? `${baseUrl}${post.image_urls[0]}`
          : `https://image.pollinations.ai/prompt/${encodeURIComponent(post.title + ", cinematic, 8k")}?width=1200&height=630&nologo=true`;

        return `
        <item>
          <title><![CDATA[${post.title}]]></title>
          <link>${postUrl}</link>
          <guid isPermaLink="true">${postUrl}</guid>
          <pubDate>${new Date(post.created_at).toUTCString()}</pubDate>
          <description><![CDATA[
            <img src="${imageUrl}" alt="${post.title}" />
            <p>${post.script}</p>
            <p><a href="${postUrl}">Read the full superstition...</a></p>
          ]]></description>
        </item>`;
      }).join('')}
    </channel>
  </rss>`;

  return new Response(feed, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
