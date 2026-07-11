'use client';

import { useEffect, useRef } from 'react';

export default function RevealBlogContent({ html }: { html: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const children = Array.from(container.children) as HTMLElement[];
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reducedMotion) {
      children.forEach((el) => el.classList.add('reveal-visible'));
      return;
    }

    children.forEach((el, i) => {
      el.classList.add('reveal-item');
      el.style.transitionDelay = `${(i % 4) * 90}ms`; // cap the stagger so long posts don't queue forever
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -60px 0px', threshold: 0.1 }
    );

    children.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [html]);

  return <div ref={containerRef} className="blog-content" dangerouslySetInnerHTML={{ __html: html }} />;
}
