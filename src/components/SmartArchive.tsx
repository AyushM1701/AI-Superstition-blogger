'use client';

import { useState } from 'react';
import Link from 'next/link';
import ArchiveGrid from './ArchiveGrid';
import FallbackImage from './FallbackImage';
import { buildPollinationsImageUrl } from '../lib/image-style';

interface ArchivePost {
  slug: string;
  title: string;
  tags?: string[];
  image_urls?: string[];
  image_prompts?: string[];
}

function getThumbnailUrl(prompt: string): string {
  return buildPollinationsImageUrl(prompt, 1280, 720);
}

export default function SmartArchive({ posts }: { posts: ArchivePost[] }) {
  const [visibleCount, setVisibleCount] = useState(6);

  const visiblePosts = posts.slice(0, visibleCount);
  const hasMore = visibleCount < posts.length;

  const handleShowMore = () => {
    setVisibleCount(prev => prev + 6);
  };

  if (posts.length === 0) return null;

  return (
    <section>
      <h2 className="section-title" style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.05em' }}>EXPLORE THE LORE</h2>
      <ArchiveGrid>
        {visiblePosts.map((post) => {
          const ratingStars = (post.title.length % 3) + 3; // 3 to 5 stars
          const starsStr = '✦'.repeat(ratingStars) + '✧'.repeat(5 - ratingStars);
          return (
            <Link href={`/${post.slug}`} key={post.slug} className="video-card">
              <FallbackImage
                src={post.image_urls?.[0] || getThumbnailUrl(post.image_prompts?.[0] || post.title)}
                alt={post.title}
                className="thumbnail-image"
                loading="lazy"
                fallbackSrc={buildPollinationsImageUrl('dark starry night sky constellations astrology', 1280, 720)}
              />
              <div className="card-content">
                <div className="hp-card-rating">
                  <span>{starsStr}</span>
                  <span style={{ opacity: 0.3 }}>•</span>
                  <span>LORE INDEX</span>
                </div>
                <h2 className="card-title" style={{ fontFamily: 'var(--font-head)', fontSize: '1.2rem', fontWeight: 'bold' }}>{post.title}</h2>
                <div className="tags">
                  {post.tags && post.tags.slice(0, 3).map((tag: string) => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                </div>
              </div>
            </Link>
          );
        })}
      </ArchiveGrid>

      {hasMore && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '3rem' }}>
          <button 
            onClick={handleShowMore}
            className="show-more-button"
            style={{
              background: 'transparent',
              border: '1.5px solid var(--accent)',
              color: 'var(--accent)',
              padding: '0.75rem 2.2rem',
              borderRadius: '3px',
              fontFamily: 'var(--font-body)',
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              fontSize: '0.8rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'var(--accent)';
              e.currentTarget.style.color = 'var(--bg)';
              e.currentTarget.style.boxShadow = '0 0 15px rgba(223, 177, 91, 0.35)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--accent)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            Show More
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m6 9 6 6 6-6"/>
            </svg>
          </button>
        </div>
      )}
    </section>
  );
}
