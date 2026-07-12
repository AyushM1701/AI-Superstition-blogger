'use client';

import Reveal from './Reveal';

export default function ArchiveGrid({ children }: { children: React.ReactNode[] }) {
  return (
    <div className="video-grid">
      {children.map((child, index) => (
        <Reveal
          key={index}
          className="archive-card-wrapper is-visible"
          delay={(index % 3) * 80}
        >
          {child}
        </Reveal>
      ))}
    </div>
  );
}
