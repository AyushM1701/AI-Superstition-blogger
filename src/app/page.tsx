import { getAllPosts } from '../lib/posts';
import { getReadingTime, stripLeadingTitle } from '../lib/reading-time';
import ShareButtons from '../components/ShareButtons';
import CommentSection from '../components/CommentSection';
import SmartArchive from '../components/SmartArchive';
import OrionMark from '../components/OrionMark';
import Reveal from '../components/Reveal';
import RevealBlogContent from '../components/RevealBlogContent';
import FeaturedHero from '../components/FeaturedHero';
import ReelsPlayer from '../components/ReelsPlayer';

export default async function Home() {
  const posts = getAllPosts();
  const featuredPost = posts[0];
  const archivePosts = posts.slice(1);

  if (!featuredPost) {
    return (
      <main className="container" style={{ paddingTop: '8rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-secondary)' }}>The spirits are quiet today. Check back tomorrow for a new Tona Totka!</p>
      </main>
    );
  }

  const readTimeStr = `📖 ${getReadingTime(featuredPost.blog_html)}`;

  return (
    <>
      <FeaturedHero post={featuredPost} readingTime={readTimeStr} />

      <main className="container" id="chronicle" style={{ paddingTop: '4rem' }}>
        <section className="single-layout featured-card">
          <div className="split-blog">
            <Reveal delay={50}>
              <ReelsPlayer 
                imagePrompts={featuredPost.image_prompts || []} 
                imageUrls={featuredPost.image_urls}
                audioUrl={featuredPost.audio_url}
                script={featuredPost.script}
                durationInSeconds={35}
              />
            </Reveal>

            <h2 className="section-title" style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.05em', marginBottom: '2.5rem' }}>
              THE CHRONICLE
            </h2>

            <Reveal delay={100}>
              <RevealBlogContent html={stripLeadingTitle(featuredPost.blog_html, featuredPost.title)} />
            </Reveal>

            <Reveal delay={150}>
              <div className="article-end-mark" aria-hidden="true">✦</div>
            </Reveal>

            <Reveal delay={200}>
              <div className="tags" style={{ justifyContent: 'center', marginBottom: '2rem' }}>
                {featuredPost.tags && featuredPost.tags.slice(0, 5).map(tag => (
                  <span key={tag} className="tag">{tag}</span>
                ))}
              </div>
            </Reveal>

            <Reveal delay={250}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '3rem' }}>
                <ShareButtons title={featuredPost.title} slug={featuredPost.slug} />
              </div>
            </Reveal>

            <Reveal delay={300}>
              <div id="comments" style={{ marginTop: '3rem', borderTop: '1px solid var(--card-border)', paddingTop: '2rem' }}>
                <CommentSection slug={featuredPost.slug} />
              </div>
            </Reveal>
          </div>
        </section>

        <Reveal delay={200}>
          <div
            className="mystical-divider delay-draw"
            style={{ display: 'flex', justifyContent: 'center', margin: '4rem 0' }}
          >
            <OrionMark width={70} height={98} strokeOpacity={0.4} />
          </div>
        </Reveal>

        {archivePosts.length > 0 && (
          <div id="archive" style={{ marginTop: '2rem' }}>
            <SmartArchive posts={archivePosts.map(p => ({
              slug: p.slug,
              title: p.title,
              tags: p.tags,
              image_urls: p.image_urls,
              image_prompts: p.image_prompts
            }))} />
          </div>
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
    </>
  );
}
