'use client';

import { useMemo } from 'react';
import { REAL_CONSTELLATIONS, ConstellationDef, edgesToPath } from '../lib/constellations';

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

// Valid twinkle animation classes actually defined in globals.css.
// (Do NOT compute names like `star-twinkle-${n}` on the fly — there is no
// "star-twinkle-1" class; the base, undecorated class is just "star-twinkle".)
const TWINKLE_VARIANTS = ['star-twinkle', 'star-twinkle-2', 'star-twinkle-3'];

const TILE_SIZE = 950;

function generateStars(count: number, seed: number): Star[] {
  const rand = seededRandom(seed);
  const twinkleClasses = ['star-twinkle', 'star-twinkle-2', 'star-twinkle-3', ''];

  return Array.from({ length: count }, () => ({
    cx: Math.round(rand() * TILE_SIZE),
    cy: Math.round(rand() * TILE_SIZE),
    r: Math.round((1.0 + rand() * 1.5) * 10) / 10,
    delay: Math.round(rand() * 6 * 10) / 10,
    twinkleClass: twinkleClasses[Math.floor(rand() * twinkleClasses.length)],
  }));
}

interface PlacedConstellation {
  def: ConstellationDef;
  x: number;
  y: number;
  rotationDeg: number;
  scale: number;
  color: 'accent' | 'secondary';
  opacity: number;
}

/**
 * Picks a subset of the real constellations and places each at a random
 * position/rotation/scale within the tile, with basic collision avoidance
 * so instances don't overlap. Rotating/rescaling real shapes (rather than
 * only varying which ones appear) is what keeps a small, fixed library
 * from looking identical every time the pattern repeats.
 */
function placeConstellations(count: number, seed: number, tileSize: number): PlacedConstellation[] {
  const rand = seededRandom(seed);

  // Deterministic shuffle so we don't always draw the same first N shapes.
  const pool = [...REAL_CONSTELLATIONS];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  const placed: PlacedConstellation[] = [];
  const n = Math.min(count, pool.length);

  let attempts = 0;
  let poolIndex = 0;
  while (placed.length < n && attempts < n * 80) {
    attempts++;
    const def = pool[poolIndex % pool.length];
    const scale = 0.75 + rand() * 0.5; // 0.75x–1.25x
    const clearance = def.boundRadius * scale;

    const x = clearance + rand() * (tileSize - clearance * 2);
    const y = clearance + rand() * (tileSize - clearance * 2);

    const tooClose = placed.some((p) => {
      const otherClearance = p.def.boundRadius * p.scale;
      // Require real whitespace between shapes, not just non-overlapping
      // bounding circles — boundRadius is a rough estimate, so shapes still
      // read as touching/crowded right at 1.0x combined radius.
      return Math.hypot(p.x - x, p.y - y) < (clearance + otherClearance) * 1.3;
    });

    if (tooClose) {
      poolIndex++;
      continue;
    }

    placed.push({
      def,
      x,
      y,
      rotationDeg: Math.round(rand() * 360),
      scale,
      color: rand() > 0.5 ? 'accent' : 'secondary',
      opacity: 0.16 + rand() * 0.14, // 0.16–0.30
    });
    poolIndex++;
  }

  return placed;
}

export default function StarfieldBackground() {
  const stars = useMemo(() => generateStars(70, 42), []);
  const constellations = useMemo(() => placeConstellations(5, 137, TILE_SIZE), []);

  return (
    <svg
      className="site-starfield"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <pattern id="global-stars" width={TILE_SIZE} height={TILE_SIZE} patternUnits="userSpaceOnUse">
          <g opacity="0.35">
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

          {constellations.map((c, i) => {
            const colorVar = `var(--${c.color === 'accent' ? 'accent' : 'text-secondary'})`;
            return (
              <g
                key={i}
                opacity={c.opacity}
                transform={`translate(${c.x} ${c.y}) rotate(${c.rotationDeg}) scale(${c.scale})`}
              >
                <path d={edgesToPath(c.def.points, c.def.edges)} fill="none" stroke={colorVar} strokeWidth="0.5" />
                {c.def.points.map((p, j) => (
                  <circle
                    key={j}
                    cx={p[0]}
                    cy={p[1]}
                    r={j % 2 === 0 ? 1.5 : 2}
                    fill={colorVar}
                    className={j % 3 === 0 ? TWINKLE_VARIANTS[i % TWINKLE_VARIANTS.length] : undefined}
                  />
                ))}
              </g>
            );
          })}
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#global-stars)" />
    </svg>
  );
}
