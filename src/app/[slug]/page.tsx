import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getPostBySlug, getAllPosts } from '../../lib/posts';
import { getReadingTime } from '../../lib/reading-time';
import ReelsPlayer from '../../components/ReelsPlayer';
import ShareButtons from '../../components/ShareButtons';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const post = getPostBySlug(resolvedParams.slug);

  if (!post) {
    return { title: 'Post Not Found' };
  }

  const desc = post.script.length > 150 ? post.script.substring(0, 150) + '...' : post.script;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ai-superstition-blogger-4nnb.vercel.app';
  
  // Default to Pollinations URL if we don't have local static images yet
  let ogImage = `https://image.pollinations.ai/prompt/${encodeURIComponent(post.title + ", cinematic, 8k")}?width=1200&height=630&nologo=true`;
  if (post.image_urls && post.image_urls.length > 0) {
    ogImage = `${baseUrl}${post.image_urls[0]}`;
  }

  return {
    title: `${post.title} | TONA TOTKA.COM`,
    description: desc,
    openGraph: {
      title: post.title,
      description: desc,
      images: [{ url: ogImage }],
    }
  };
}

export default async function PostPage({ params }: Props) {
  const resolvedParams = await params;
  const post = getPostBySlug(resolvedParams.slug);

  if (!post) {
    notFound();
  }

  return (
    <main className="detail-container">
      <Link href="/" className="back-link">
        ← Back to Archive
      </Link>
      
      <article>
        <header className="detail-header">
          <h1 className="detail-title">{post.title}</h1>
          <div className="detail-meta">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <time dateTime={post.created_at}>
                {new Date(post.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </time>
              <span className="reading-time">📖 {getReadingTime(post.blog_html)}</span>
            </div>
            <div className="tags">
              {post.tags && post.tags.map((tag: string) => (
                <span key={tag} className="tag">{tag}</span>
              ))}
            </div>
          </div>
        </header>

        <div style={{ marginBottom: '3rem' }}>
          <ReelsPlayer 
            imagePrompts={post.image_prompts || []} 
            imageUrls={post.image_urls}
            audioUrl={post.audio_url}
            durationInSeconds={35}
          />
        </div>

        <div 
          className="blog-content"
          dangerouslySetInnerHTML={{ __html: post.blog_html }}
        />

        <ShareButtons title={post.title} slug={post.slug} />
      </article>

      <footer className="site-footer">
        <p>🔮 <strong>TONA TOTKA.COM</strong> — AI-powered Indian folklore & superstitions.</p>
        <p>New stories generated daily by artificial intelligence.</p>
      </footer>
    </main>
  );
}
