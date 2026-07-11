import Link from 'next/link';
import { getAllPosts } from '../lib/posts';
import { getReadingTime, stripLeadingTitle } from '../lib/reading-time';
import ReelsPlayer from '../components/ReelsPlayer';
import ShareButtons from '../components/ShareButtons';
import CommentSection from '../components/CommentSection';
import ArchiveGrid from '../components/ArchiveGrid';
import FallbackImage from '../components/FallbackImage';
import OrionMark from '../components/OrionMark';

export const revalidate = 3600; // 1 hour ISR

function getThumbnailUrl(prompt: string): string {
  const encodedPrompt = encodeURIComponent(prompt + ", hand-drawn vintage ink sketch, woodcut illustration, alchemical style, esoteric, highly detailed");
  return `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1280&height=720&nologo=true`;
}

export default async function Home() {
  const posts = getAllPosts();
  const featuredPost = posts[0];
  const archivePosts = posts.slice(1);

  return (
    <main className="container">
      <header className="header" style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 className="site-title" style={{ color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', margin: '0' }}>
          <OrionMark width={34} height={48} />
          TONA TOTKA.COM
        </h1>
        <p style={{ fontFamily: 'var(--font-head)', fontStyle: 'italic', color: 'var(--text-secondary)' }}>Uncover the truth behind Indian folklore, myths, and superstitions.</p>
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
                <h3 className="featured-title">
                  {featuredPost.title}
                </h3>
                <span className="reading-time">📖 {getReadingTime(featuredPost.blog_html)}</span>
                
                <div className="player-container" style={{ marginTop: '1.5rem' }}>
                  <ReelsPlayer 
                    imagePrompts={featuredPost.image_prompts || []} 
                    imageUrls={featuredPost.image_urls}
                    audioUrl={featuredPost.audio_url}
                    script={featuredPost.script}
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
                  dangerouslySetInnerHTML={{ __html: stripLeadingTitle(featuredPost.blog_html, featuredPost.title) }}
                />

                <ShareButtons title={featuredPost.title} slug={featuredPost.slug} />
                <div style={{ marginTop: '3rem', borderTop: '1px solid var(--card-border)', paddingTop: '2rem' }}>
                  <CommentSection slug={featuredPost.slug} />
                </div>
              </div>
            </div>
          </section>

          <div
            className="mystical-divider delay-draw"
            style={{ display: 'flex', justifyContent: 'center', margin: '3rem 0' }}
          >
            <OrionMark width={70} height={98} strokeOpacity={0.4} />
          </div>

          {archivePosts.length > 0 && (
            <section>
              <h2 className="section-title">📖 Smart Archive</h2>
              <ArchiveGrid>
                {archivePosts.map((post) => (
                  <Link href={`/${post.slug}`} key={post.slug} className="video-card">
                    <FallbackImage
                      src={post.image_urls?.[0] || getThumbnailUrl(post.image_prompts?.[0] || post.title)}
                      alt={post.title}
                      className="thumbnail-image"
                      loading="lazy"
                      fallbackSrc="https://image.pollinations.ai/prompt/dark%20starry%20night%20sky%20constellations%20astrology?width=1280&height=720&nologo=true"
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
              </ArchiveGrid>
            </section>
          )}
        </>
      )}

      <footer className="site-footer">
        <p>
          <svg width="16" height="16" viewBox="0 0 100 100" aria-hidden="true" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '6px' }}>
            <path d="M20 40 L50 20 L80 60" fill="none" stroke="var(--accent)" strokeWidth="1.5" />
            <circle cx="20" cy="40" r="1.5" fill="var(--accent)" />
            <circle cx="50" cy="20" r="2.5" fill="var(--accent)" />
            <circle cx="80" cy="60" r="1.5" fill="var(--accent)" />
          </svg>
          <strong style={{ color: 'var(--accent)', fontWeight: 'normal', fontFamily: 'var(--font-display)' }}>TONA TOTKA.COM</strong> — AI-powered Indian folklore & superstitions.
        </p>
        <p>New stories generated daily by artificial intelligence.</p>
      </footer>
    </main>
  );
}
