import { MetadataRoute } from 'next';
import { getAllPosts } from '../lib/posts';
import { SITE_URL } from '../lib/config';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_URL;

  const posts = getAllPosts();

  const postEntries = posts.map((post) => {
    const d = new Date(post.created_at);
    return {
      url: `${baseUrl}/${post.slug}`,
      lastModified: isNaN(d.getTime()) ? new Date() : d,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    };
  });

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    ...postEntries,
  ];
}
