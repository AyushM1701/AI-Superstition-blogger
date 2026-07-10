'use client';

import { useMemo } from 'react';

// Deterministic pseudo-random so SSR and client render identically (avoids hydration mismatch)
function seededRandom(seed: number) {
  let value = seed;
  return () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
}

interface Star {
  cx: number;
  cy: number;
  r: number;
  delay: number;
  twinkleClass: string;
}

interface Constellation {
  points: { x: number; y: number }[];
  closed?: boolean;
  color: 'accent' | 'secondary';
  opacity: number;
}

const CONSTELLATIONS: Constellation[] = [
  { points: [{ x: 80, y: 180 }, { x: 150, y: 120 }, { x: 250, y: 160 }, { x: 220, y: 260 }], color: 'accent', opacity: 0.12 },
  { points: [{ x: 400, y: 100 }, { x: 480, y: 150 }, { x: 450, y: 250 }], color: 'secondary', opacity: 0.08 },
  { points: [{ x: 320, y: 400 }, { x: 420, y: 380 }, { x: 500, y: 480 }, { x: 400, y: 520 }], color: 'accent', opacity: 0.1, closed: true },
  { points: [{ x: 120, y: 380 }, { x: 180, y: 320 }, { x: 260, y: 400 }, { x: 160, y: 460 }], color: 'secondary', opacity: 0.08 },
];

function generateStars(count: number, seed: number): Star[] {
  const rand = seededRandom(seed);
  const twinkleClasses = ['star-twinkle', 'star-twinkle-2', 'star-twinkle-3', ''];

  return Array.from({ length: count }, () => ({
    cx: Math.round(rand() * 600),
    cy: Math.round(rand() * 600),
    r: Math.round((0.6 + rand() * 1.2) * 10) / 10,
    delay: Math.round(rand() * 6 * 10) / 10,
    twinkleClass: twinkleClasses[Math.floor(rand() * twinkleClasses.length)],
  }));
}

function pathFromPoints(points: { x: number; y: number }[], closed?: boolean) {
  const d = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  return closed ? `${d} Z` : d;
}

export default function StarfieldBackground() {
  const stars = useMemo(() => generateStars(24, 42), []);

  return (
    <svg
      className="site-starfield"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <pattern id="global-stars" width="600" height="600" patternUnits="userSpaceOnUse">
          <g opacity="0.15">
            {stars.map((star, i) => (
              <circle
                key={i}
                cx={star.cx}
                cy={star.cy}
                r={star.r}
                fill="var(--text-primary)"
                className={star.twinkleClass || undefined}
                style={star.twinkleClass ? { animationDelay: `${star.delay}s` } : undefined}
              />
            ))}
          </g>

          {CONSTELLATIONS.map((c, i) => (
            <g key={i} opacity={c.opacity}>
              <path
                d={pathFromPoints(c.points, c.closed)}
                fill="none"
                stroke={`var(--${c.color === 'accent' ? 'accent' : 'text-secondary'})`}
                strokeWidth="0.5"
              />
              {c.points.map((p, j) => (
                <circle
                  key={j}
                  cx={p.x}
                  cy={p.y}
                  r={j % 2 === 0 ? 1.5 : 2}
                  fill={`var(--${c.color === 'accent' ? 'accent' : 'text-secondary'})`}
                  className={j % 3 === 0 ? `star-twinkle-${(j % 3) + 1}` : undefined}
                />
              ))}
            </g>
          ))}
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#global-stars)" />
    </svg>
  );
}
