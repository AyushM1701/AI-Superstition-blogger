'use client';

import React from 'react';
import Reveal from './Reveal';

export default function ArchiveGrid({ children }: { children: React.ReactNode }) {
  // React.Children.toArray handles single child, multiple children, and fragments safely
  const childArray = React.Children.toArray(children);

  return (
    <div className="video-grid">
      {childArray.map((child, index) => (
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
