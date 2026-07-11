import { ORION, edgesToPath } from '../lib/constellations';

interface OrionMarkProps {
  width?: number;
  height?: number;
  className?: string;
  /** Color Betelgeuse (red supergiant) and Rigel (blue supergiant) like their real spectral types. */
  highlightStarColors?: boolean;
  /** Apply the site's twinkle keyframes to each star. */
  animate?: boolean;
  strokeOpacity?: number;
}

// Orion's local coordinates span roughly x:[-28,28], y:[-42,48].
// Point order (see constellations.ts): 0 Betelgeuse, 1 Bellatrix,
// 2 Mintaka, 3 Alnilam, 4 Alnitak (belt, 2–4), 5 Rigel, 6 Saiph.
const VIEWBOX = '-38 -52 76 106';

export default function OrionMark({
  width = 60,
  height = 84,
  className = '',
  highlightStarColors = true,
  animate = true,
  strokeOpacity = 0.55,
}: OrionMarkProps) {
  const { points, edges } = ORION;

  return (
    <svg
      width={width}
      height={height}
      viewBox={VIEWBOX}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      <path
        d={edgesToPath(points, edges)}
        fill="none"
        stroke="var(--accent)"
        strokeWidth="1.1"
        strokeOpacity={strokeOpacity}
        strokeLinecap="round"
      />
      {points.map((p, i) => {
        const isBetelgeuse = i === 0;
        const isRigel = i === 5;
        const isBeltStar = i >= 2 && i <= 4;

        const fill = highlightStarColors
          ? isBetelgeuse
            ? '#e8836a' // red supergiant
            : isRigel
            ? '#9db8f0' // blue-white supergiant
            : 'var(--accent)'
          : 'var(--accent)';

        const r = isBetelgeuse || isRigel ? 3 : isBeltStar ? 1.8 : 2.4;

        return (
          <circle
            key={i}
            cx={p[0]}
            cy={p[1]}
            r={r}
            fill={fill}
            className={animate ? ['star-twinkle', 'star-twinkle-2', 'star-twinkle-3'][i % 3] : undefined}
            style={animate ? { animationDelay: `${i * 0.35}s` } : undefined}
          />
        );
      })}
    </svg>
  );
}
