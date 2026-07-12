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
      <h2 className="section-title">📖 Smart Archive</h2>
      <ArchiveGrid>
        {visiblePosts.map((post) => (
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

      {hasMore && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '3rem' }}>
          <button 
            onClick={handleShowMore}
            className="show-more-button"
            style={{
              background: 'transparent',
              border: '1px solid var(--accent)',
              color: 'var(--accent)',
              padding: '0.75rem 2rem',
              borderRadius: '999px',
              fontFamily: 'var(--font-head)',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(212, 175, 100, 0.1)';
              e.currentTarget.style.boxShadow = '0 0 15px rgba(212, 175, 100, 0.2)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'transparent';
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
