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
    <div className="parallax-stars-wrapper" aria-hidden="true">
      <style>{`
        .parallax-stars-wrapper {
          position: fixed;
          inset: 0;
          overflow: hidden;
          z-index: -2;
        }
        
        .stars-1 {
          width: 1px;
          height: 1px;
          background: transparent;
          box-shadow: ${shadowSmall};
          animation: animStar 150s linear infinite;
        }
        
        .stars-1:after {
          content: " ";
          position: absolute;
          top: 3000px;
          width: 1px;
          height: 1px;
          background: transparent;
          box-shadow: ${shadowSmall};
        }
        
        .stars-2 {
          width: 2px;
          height: 2px;
          background: transparent;
          box-shadow: ${shadowMedium};
          animation: animStar 200s linear infinite;
        }
        
        .stars-2:after {
          content: " ";
          position: absolute;
          top: 3000px;
          width: 2px;
          height: 2px;
          background: transparent;
          box-shadow: ${shadowMedium};
        }
        
        .stars-3 {
          width: 3px;
          height: 3px;
          background: transparent;
          box-shadow: ${shadowBig};
          animation: animStar 250s linear infinite;
        }
        
        .stars-3:after {
          content: " ";
          position: absolute;
          top: 3000px;
          width: 3px;
          height: 3px;
          background: transparent;
          box-shadow: ${shadowBig};
        }
        
        @keyframes animStar {
          from {
            transform: translateY(0px);
          }
          to {
            transform: translateY(-3000px);
          }
        }
      `}</style>
      <div className="stars-1"></div>
      <div className="stars-2"></div>
      <div className="stars-3"></div>
    </div>
  );
}
