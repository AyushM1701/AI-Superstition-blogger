'use client';

import { useEffect, useRef, useState } from 'react';

export default function ArchiveGrid({ children }: { children: React.ReactNode[] }) {
  const [visibleIndexes, setVisibleIndexes] = useState<Set<number>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setVisibleIndexes(new Set(children.map((_, i) => i)));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute('data-index'));
            setVisibleIndexes((prev) => {
              const next = new Set(prev);
              next.add(index);
              return next;
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '50px', threshold: 0.1 }
    );

    const elements = containerRef.current?.querySelectorAll('[data-index]');
    elements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [children.length]);

  return (
    <div className="video-grid" ref={containerRef}>
      {children.map((child, index) => {
        const isVisible = visibleIndexes.has(index);
        return (
          <div
            key={index}
            data-index={index}
            className="archive-card-wrapper"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateY(0)' : 'translateY(16px)',
              transition: `opacity 500ms ease-out, transform 500ms ease-out`,
              transitionDelay: `${(index % 3) * 80}ms`,
              display: 'flex',
              height: '100%',
              width: '100%'
            }}
          >
            {child}
          </div>
        );
      })}
    </div>
  );
}
