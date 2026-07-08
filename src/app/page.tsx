import Link from 'next/link';
import { getAllPosts } from '../lib/posts';
import { getReadingTime } from '../lib/reading-time';
import ReelsPlayer from '../components/ReelsPlayer';
import ShareButtons from '../components/ShareButtons';

export const revalidate = 3600; // 1 hour ISR

function getThumbnailUrl(prompt: string): string {
  const encodedPrompt = encodeURIComponent(prompt + ", cinematic, highly detailed, professional photography");
  return `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1280&height=720&nologo=true`;
}

export default async function Home() {
  const posts = getAllPosts();
  const featuredPost = posts[0];
  const archivePosts = posts.slice(1);

  return (
    <main className="container">
      <header className="header">
        <h1><span className="emoji">🔮</span> TONA TOTKA.COM</h1>
        <p>Uncover the truth behind Indian folklore, myths, and superstitions.</p>
      </header>

      {(!featuredPost) ? (
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
          <p>The spirits are quiet today. Check back tomorrow for a new Tona Totka!</p>
        </div>
      ) : (
        <>
          <section>
            <h2 className="section-title">✨ Tona Totka of the Day</h2>
            <div className="single-layout">
              <div className="split-blog">
                <h3 style={{ fontSize: '2.5rem', marginBottom: '0.75rem', color: 'var(--text-primary)', fontFamily: "'Outfit', sans-serif" }}>
                  {featuredPost.title}
                </h3>
                <span className="reading-time">📖 {getReadingTime(featuredPost.blog_html)}</span>
                
                <div className="player-container" style={{ marginTop: '1.5rem' }}>
                  <ReelsPlayer 
                    imagePrompts={featuredPost.image_prompts || []} 
                    imageUrls={featuredPost.image_urls}
                    audioUrl={featuredPost.audio_url}
                    durationInSeconds={35}
                  />
                </div>

                <div className="tags" style={{ marginBottom: '2rem' }}>
                  {featuredPost.tags && featuredPost.tags.map(tag => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                </div>
                
                <div 
                  className="blog-content"
                  dangerouslySetInnerHTML={{ __html: featuredPost.blog_html }}
                />

                <ShareButtons title={featuredPost.title} slug={featuredPost.slug} />
              </div>
            </div>
          </section>

          {archivePosts.length > 0 && (
            <section>
              <h2 className="section-title" style={{ marginTop: '4rem' }}>📖 Smart Archive</h2>
              <div className="video-grid">
                {archivePosts.map((post) => (
                  <Link href={`/${post.slug}`} key={post.slug} className="video-card">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={post.image_urls?.[0] || getThumbnailUrl(post.image_prompts?.[0] || post.title)}
                      alt={post.title}
                      className="thumbnail-image"
                      loading="lazy"
                    />
                    <div className="card-content">
                      <h2 className="card-title">{post.title}</h2>
                      <div className="tags">
                        {post.tags && post.tags.slice(0, 3).map((tag: string) => (
                          <span key={tag} className="tag">{tag}</span>
                        ))}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      <footer className="site-footer">
        <p>🔮 <strong>TONA TOTKA.COM</strong> — AI-powered Indian folklore & superstitions.</p>
        <p>New stories generated daily by artificial intelligence.</p>
      </footer>
    </main>
  );
}
