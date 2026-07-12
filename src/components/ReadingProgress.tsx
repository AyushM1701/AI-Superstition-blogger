'use client';

import { useEffect, useState } from 'react';

export default function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;

      // Calculate progress percentage
      const scrolled = (scrollTop / (documentHeight - windowHeight)) * 100;
      setProgress(Math.min(100, Math.max(0, scrolled)));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Initial check
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: `${progress}%`,
        height: '3px',
        backgroundColor: 'var(--accent)',
        zIndex: 9999,
        transition: 'width 100ms ease-out',
        boxShadow: '0 0 8px var(--accent)',
        pointerEvents: 'none',
      }}
    />
  );
}
