import { MetadataRoute } from 'next';
import { getAllPosts } from '../lib/posts';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tona-totka.vercel.app';

  const posts = getAllPosts();

  const postEntries = posts.map((post) => ({
    url: `${baseUrl}/${post.slug}`,
    lastModified: new Date(post.created_at),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

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
