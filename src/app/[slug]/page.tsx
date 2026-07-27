import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getPostBySlug, getAllPosts } from '../../lib/posts';
import { getReadingTime, stripLeadingTitle } from '../../lib/reading-time';
import { buildPollinationsImageUrl } from '../../lib/image-style';
import ReelsPlayer from '../../components/ReelsPlayer';
import ShareButtons from '../../components/ShareButtons';
import CommentSection from '../../components/CommentSection';
import { SITE_URL } from '../../lib/config';

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
  const baseUrl = SITE_URL;
  
  // Default to Pollinations URL if we don't have local static images yet
  let ogImage = buildPollinationsImageUrl(post.title, 1200, 630);
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

function getThumbnailUrl(prompt: string): string {
  return buildPollinationsImageUrl(prompt, 1280, 720);
}

export default async function PostPage({ params }: Props) {
  const resolvedParams = await params;
  const post = getPostBySlug(resolvedParams.slug);

  if (!post) {
    notFound();
  }

  // Get related posts (exclude current post, take up to 3)
  const allPosts = getAllPosts();
  const relatedPosts = allPosts.filter(p => p.slug !== post.slug).slice(0, 3);

  return (
    <main className="detail-container">
      <Link href="/" className="back-link">
        ← Back to Archive
      </Link>
      
      <article>
        <header className="detail-header">
          <h1 className="detail-title">{post.title}</h1>
          <div className="detail-meta" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <time dateTime={post.created_at}>
                {new Date(post.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </time>
              <span style={{ color: 'var(--card-border)' }}>•</span>
              <span className="reading-time">📖 {getReadingTime(post.blog_html)}</span>
            </div>

          </div>
        </header>

        <div style={{ marginBottom: '3rem' }}>
          <ReelsPlayer 
            imagePrompts={post.image_prompts || []} 
            imageUrls={post.image_urls}
            audioUrl={post.audio_url}
            script={post.script}
            durationInSeconds={35}
          />
        </div>

        <div className="image-text-divider" aria-hidden="true">❦</div>

        <div 
          className="blog-content"
          dangerouslySetInnerHTML={{ __html: stripLeadingTitle(post.blog_html, post.title) }}
        />

        <div className="article-end-mark" aria-hidden="true">✦</div>

        <div className="tags" style={{ justifyContent: 'center' }}>
          {post.tags && post.tags.slice(0, 5).map((tag: string) => (
            <span key={tag} className="tag">{tag}</span>
          ))}
        </div>

        <ShareButtons title={post.title} slug={post.slug} />
        
        <CommentSection slug={post.slug} />
      </article>

      {relatedPosts.length > 0 && (
        <section style={{ marginTop: '4rem' }}>
          <h2 className="section-title">🔮 More Tona Totkas</h2>
          <div className="video-grid">
            {relatedPosts.map((relPost) => (
              <Link href={`/${relPost.slug}`} key={relPost.slug} className="video-card">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={relPost.image_urls?.[0] || getThumbnailUrl(relPost.image_prompts?.[0] || relPost.title)}
                  alt={relPost.title}
                  className="thumbnail-image"
                  loading="lazy"
                />
                <div className="card-content">
                  <h2 className="card-title">{relPost.title}</h2>
                  <div className="tags">
                    {relPost.tags && relPost.tags.slice(0, 3).map((tag: string) => (
                      <span key={tag} className="tag">{tag}</span>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <footer className="site-footer">
        <p>
          <svg width="16" height="16" viewBox="0 0 100 100" aria-hidden="true" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '6px' }}>
            <path d="M20 40 L50 20 L80 60" fill="none" stroke="var(--accent)" strokeWidth="1.5" />
            <circle cx="20" cy="40" r="1.5" fill="var(--accent)" />
            <circle cx="50" cy="20" r="2.5" fill="var(--accent)" />
            <circle cx="80" cy="60" r="1.5" fill="var(--accent)" />
          </svg>
          <strong style={{ color: 'var(--accent)', fontWeight: 'normal', fontFamily: 'var(--font-display)' }}>TONA TOTKA.COM</strong> — Indian folklore & superstitions.
        </p>
        <p>Uncovering the ancient mysteries, rituals, and folklore of India.</p>
        <p style={{ marginTop: '1rem', opacity: 0.5, fontSize: '0.75rem' }}>© {new Date().getFullYear()} VK Enterprises</p>
      </footer>
    </main>
  );
}
