import Link from 'next/link';
import { supabase } from '../lib/supabase';
import { Metadata } from 'next';

export const revalidate = 3600; // 1 hour ISR

export const metadata: Metadata = {
  title: 'AI Superstition Blogger | Daily Folklore & Myths',
  description: 'Explore fascinating superstitions, folklore, and myths from around the world — fully automated with AI-generated content and cinematic video.',
};

function getThumbnailUrl(title: string): string {
  const prompt = encodeURIComponent(`${title}, dark mystical atmosphere, cinematic, 8k`);
  return `https://image.pollinations.ai/prompt/${prompt}?width=640&height=360&nologo=true`;
}

export default async function Home() {
  // Fetch only published items (RLS enforces this, but explicit query is good)
  const { data: posts, error } = await supabase
    .from('content_items')
    .select('id, slug, title, tags, created_at')
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching posts:', error);
  }

  return (
    <main className="container">
      <header className="header">
        <h1>🔮 Superstition Blogger</h1>
        <p>Uncover the world&apos;s most fascinating superstitions, myths, and folklore — powered by AI.</p>
      </header>

      {(!posts || posts.length === 0) ? (
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
          <p>No stories published yet. Check back soon!</p>
        </div>
      ) : (
        <div className="video-grid">
          {posts.map((post) => (
            <Link href={`/${post.slug}`} key={post.id} className="video-card">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={getThumbnailUrl(post.title)}
                alt={post.title}
                className="thumbnail-image"
                loading="lazy"
              />
              <div className="card-content">
                <h2 className="card-title">{post.title}</h2>
                <div className="tags">
                  {post.tags && Array.isArray(post.tags) && post.tags.map((tag: string) => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
