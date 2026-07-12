import Link from 'next/link';
import { getAllPosts } from '../lib/posts';
import { getReadingTime, stripLeadingTitle } from '../lib/reading-time';
import { buildPollinationsImageUrl } from '../lib/image-style';
import ReelsPlayer from '../components/ReelsPlayer';
import ShareButtons from '../components/ShareButtons';
import CommentSection from '../components/CommentSection';
import ArchiveGrid from '../components/ArchiveGrid';
import FallbackImage from '../components/FallbackImage';
import OrionMark from '../components/OrionMark';
import CountdownTimer from '../components/CountdownTimer';
import Reveal from '../components/Reveal';
import RevealBlogContent from '../components/RevealBlogContent';
import ReadingProgress from '../components/ReadingProgress';

export const revalidate = 3600; // 1 hour ISR

function getThumbnailUrl(prompt: string): string {
  return buildPollinationsImageUrl(prompt, 1280, 720);
}

function SparkMark({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className="star-twinkle-2">
      <path
        d="M12 2 L13.5 9.5 L21 11 L13.5 12.5 L12 20 L10.5 12.5 L3 11 L10.5 9.5 Z"
        fill="var(--accent)"
      />
    </svg>
  );
}

export default async function Home() {
  const posts = getAllPosts();
  const featuredPost = posts[0];
  const archivePosts = posts.slice(1);

  return (
    <main className="container">
      <ReadingProgress />
      <Reveal as="header" className="header header-glow" style={{ textAlign: 'center', marginBottom: '1.5rem', position: 'relative' }}>
        <div className="header-glow-bg"></div>
        <h1 className="site-title" style={{ color: 'var(--accent)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', margin: '0' }}>
          <OrionMark width={44} height={62} />
          TONA TOTKA.COM
        </h1>
        <p style={{ fontFamily: 'var(--font-head)', fontStyle: 'italic', color: 'var(--text-secondary)', marginTop: '1.5rem' }}>Uncover the truth behind Indian folklore, myths, and superstitions.</p>
      </Reveal>

      <Reveal delay={100}>
        <div className="mystical-divider-horizontal delay-draw" style={{ margin: '0 auto 4rem', width: '60%', height: '1px', background: 'linear-gradient(90deg, transparent, var(--accent), transparent)', opacity: 0.3 }}></div>
      </Reveal>

      {(!featuredPost) ? (
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
          <p>The spirits are quiet today. Check back tomorrow for a new Tona Totka!</p>
        </div>
      ) : (
        <>
          <section>
            <Reveal delay={150}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', marginBottom: '0.5rem', lineHeight: 1 }}>
                  <div style={{ display: 'flex', transform: 'translateY(-1px)' }}>
                    <SparkMark />
                  </div>
                  TONA TOTKA OF THE DAY
                </h2>
                <CountdownTimer />
              </div>
            </Reveal>
            <div className="single-layout featured-card">
              <div className="split-blog">
                <h3 className="featured-title">
                  {featuredPost.title}
                </h3>
                <span className="reading-time reading-time-badge">📖 {getReadingTime(featuredPost.blog_html)}</span>
                
                <Reveal delay={200} className="player-container">
                  <ReelsPlayer 
                    imagePrompts={featuredPost.image_prompts || []} 
                    imageUrls={featuredPost.image_urls}
                    audioUrl={featuredPost.audio_url}
                    script={featuredPost.script}
                    durationInSeconds={35}
                  />
                </Reveal>

                <Reveal delay={250}>
                  <div className="image-text-divider" aria-hidden="true">❦</div>
                </Reveal>

                <RevealBlogContent html={stripLeadingTitle(featuredPost.blog_html, featuredPost.title)} />

                <Reveal delay={50}>
                  <div className="article-end-mark" aria-hidden="true">✦</div>
                </Reveal>

                <Reveal delay={100}>
                  <div className="tags">
                    {featuredPost.tags && featuredPost.tags.slice(0, 5).map(tag => (
                      <span key={tag} className="tag">{tag}</span>
                    ))}
                  </div>
                </Reveal>

                <Reveal delay={150}>
                  <ShareButtons title={featuredPost.title} slug={featuredPost.slug} />
                </Reveal>
                <Reveal delay={250}>
                  <div style={{ marginTop: '3rem', borderTop: '1px solid var(--card-border)', paddingTop: '2rem' }}>
                    <CommentSection slug={featuredPost.slug} />
                  </div>
                </Reveal>
              </div>
            </div>
          </section>

          <Reveal delay={200}>
            <div
              className="mystical-divider delay-draw"
              style={{ display: 'flex', justifyContent: 'center', margin: '3rem 0' }}
            >
              <OrionMark width={70} height={98} strokeOpacity={0.4} />
            </div>
          </Reveal>

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
                      fallbackSrc={buildPollinationsImageUrl('dark starry night sky constellations astrology', 1280, 720)}
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
