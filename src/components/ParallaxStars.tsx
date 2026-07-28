'use client';

import React, { useMemo } from 'react';

// Deterministic pseudo-random to avoid SSR hydration mismatch
function seededRandom(seed: number) {
  let value = seed;
  return () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
}

const generateBoxShadow = (n: number, seed: number) => {
  const rand = seededRandom(seed);
  const color = '#FFF';
  let value = `${Math.floor(rand() * 3000)}px ${Math.floor(rand() * 3000)}px ${color}`;
  for (let i = 2; i <= n; i++) {
    value += `, ${Math.floor(rand() * 3000)}px ${Math.floor(rand() * 3000)}px ${color}`;
  }
  return value;
};

export default function ParallaxStars() {
  const shadowSmall = useMemo(() => generateBoxShadow(700, 1), []);
  const shadowMedium = useMemo(() => generateBoxShadow(200, 2), []);
  const shadowBig = useMemo(() => generateBoxShadow(100, 3), []);

  return (
    <div 
      className="parallax-stars-wrapper" 
      aria-hidden="true"
      style={{
        '--shadow-small': shadowSmall,
        '--shadow-medium': shadowMedium,
        '--shadow-big': shadowBig
      } as React.CSSProperties}
    >
      <div className="stars-1"></div>
      <div className="stars-2"></div>
      <div className="stars-3"></div>
    </div>
  );
}
