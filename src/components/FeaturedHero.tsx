'use client';

import { useState, useEffect } from 'react';
import ReelsPlayer from './ReelsPlayer';

interface ArchivePost {
  slug: string;
  title: string;
  tags?: string[];
  image_urls?: string[];
  image_prompts?: string[];
  script: string;
  audio_url?: string;
  blog_html: string;
}

export default function FeaturedHero({ post, readingTime }: { post: ArchivePost; readingTime: string }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShareUrl(window.location.href);
  }, []);

  const handleReadClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const chronicleElement = document.getElementById('chronicle');
    if (chronicleElement) {
      chronicleElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const severityLevel = post.tags?.includes('spooky') || post.tags?.includes('death') ? 'HIGH' : 'MODERATE';
  const categoryTag = post.tags?.[0] || 'FOLKLORE';

  return (
    <>
      <section className="hp-hero-wrapper" id="hero">
        <div className="hp-hero-bg" />
        
        {/* Left Column (Metadata) */}
        <div className="hp-meta-col left">
          <div className="hp-meta-item">
            <span className="hp-meta-label">Region</span>
            <span className="hp-meta-val">INDIA</span>
          </div>
          <div className="hp-meta-item">
            <span className="hp-meta-label">Severity</span>
            <span className="hp-meta-val">{severityLevel}</span>
          </div>
        </div>

        {/* Right Column (Metadata) */}
        <div className="hp-meta-col right">
          <div className="hp-meta-item">
            <span className="hp-meta-label">Category</span>
            <span className="hp-meta-val">{categoryTag}</span>
          </div>
          <div className="hp-meta-item">
            <span className="hp-meta-label">Read Time</span>
            <span className="hp-meta-val">{readingTime}</span>
          </div>
        </div>

        {/* Floating Social Icons */}
        <div className="hp-float-socials">
          <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}`} target="_blank" rel="noopener noreferrer" className="hp-social-icon" aria-label="Share on Twitter">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
            </svg>
          </a>
          <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer" className="hp-social-icon" aria-label="Share on Facebook">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
            </svg>
          </a>
          <a href={`https://api.whatsapp.com/send?text=${encodeURIComponent(post.title)}`} target="_blank" rel="noopener noreferrer" className="hp-social-icon" aria-label="Share on WhatsApp">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
            </svg>
          </a>
        </div>

        {/* Center Hero Content */}
        <div className="hp-hero-content">
          <span className="hp-featured-eyebrow">Tona Totka of the Day</span>
          <h1 className="hp-featured-title">{post.title}</h1>
          <p className="hp-featured-desc">{post.script}</p>

          <div className="hp-btn-container">
            <button onClick={handleReadClick} className="hp-theatrical-btn">
              Read Story
            </button>
            
            <button onClick={() => setIsModalOpen(true)} className="hp-play-circle-btn">
              <span className="hp-play-icon-glow">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ transform: 'translateX(1px)' }}>
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </span>
              Listen Narration
            </button>
          </div>
        </div>
      </section>

      {/* Lightbox Reels Modal */}
      {isModalOpen && (
        <div className="reels-modal" onClick={() => setIsModalOpen(false)}>
          <div className="reels-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="reels-modal-close" onClick={() => setIsModalOpen(false)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
              Close
            </button>
            <ReelsPlayer 
              imagePrompts={post.image_prompts || []} 
              imageUrls={post.image_urls}
              audioUrl={post.audio_url}
              script={post.script}
              durationInSeconds={35}
            />
          </div>
        </div>
      )}
    </>
  );
}
