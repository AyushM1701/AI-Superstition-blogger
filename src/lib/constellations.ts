export interface ConstellationDef {
  name: string;
  points: [number, number][];
  edges: [number, number][];
  boundRadius: number; // rough radius for placement clearance in the background pattern
}

// All shapes are simplified stick-figure simplifications of the traditional
// line-figures — recognizable, not a precise star atlas — defined in local
// coordinates centered on (0,0).

export const URSA_MAJOR: ConstellationDef = {
  name: 'Ursa Major (Big Dipper)',
  points: [[50, -30], [30, -20], [10, -12], [-5, -5], [-25, -25], [-25, 10], [-5, 15]],
  edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 3]],
  boundRadius: 55,
};

// Point order: 0 Betelgeuse (left shoulder), 1 Bellatrix (right shoulder),
// 2 Mintaka (left belt star), 3 Alnilam (center belt star), 4 Alnitak
// (right belt star), 5 Rigel (left foot), 6 Saiph (right foot).
//
// Left column (0-2-5) and right column (1-4-6) each run straight down
// their own side, joined only by the horizontal belt line (2-3-4) in the
// middle. Connecting a shoulder/foot to the belt star on the OPPOSITE side
// instead (as an earlier version did) makes the two shoulder-lines cross
// through the center and piles 3 lines onto each belt-end star, which
// reads as a tangled X rather than the classic hourglass silhouette.
export const ORION: ConstellationDef = {
  name: 'Orion',
  points: [[-28, -40], [28, -42], [-10, -3], [0, 3], [10, 9], [-26, 46], [26, 44]],
  edges: [[0, 2], [2, 3], [3, 4], [1, 4], [2, 5], [4, 6]],
  boundRadius: 50,
};

export const CASSIOPEIA: ConstellationDef = {
  name: 'Cassiopeia',
  points: [[-40, 10], [-20, -15], [0, 10], [20, -15], [40, 10]],
  edges: [[0, 1], [1, 2], [2, 3], [3, 4]],
  boundRadius: 42,
};

export const CYGNUS: ConstellationDef = {
  name: 'Cygnus (Northern Cross)',
  points: [[0, -40], [0, 0], [0, 40], [-35, 10], [35, -10]],
  edges: [[0, 1], [1, 2], [1, 3], [1, 4]],
  boundRadius: 42,
};

export const LYRA: ConstellationDef = {
  name: 'Lyra',
  points: [[0, -35], [-15, 10], [15, 5], [10, 35], [-10, 30]],
  edges: [[0, 1], [0, 2], [1, 4], [4, 3], [3, 2], [2, 1]],
  boundRadius: 40,
};

export const SCORPIUS: ConstellationDef = {
  name: 'Scorpius',
  points: [[-40, -20], [-25, -25], [-10, -15], [5, 0], [15, 20], [10, 40], [-5, 45]],
  edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6]],
  boundRadius: 50,
};

export const CRUX: ConstellationDef = {
  name: 'Crux (Southern Cross)',
  points: [[0, -35], [0, 35], [-25, 5], [25, -5]],
  edges: [[0, 1], [2, 3]],
  boundRadius: 38,
};

export const LEO: ConstellationDef = {
  name: 'Leo',
  points: [[-30, 30], [-25, 0], [-10, -25], [15, -30], [30, -10], [50, 35]],
  edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5]],
  boundRadius: 52,
};

export const SAGITTARIUS: ConstellationDef = {
  name: 'Sagittarius (Teapot)',
  points: [[-20, -25], [15, -25], [35, -10], [20, 15], [0, 30], [-25, 15], [-40, -5]],
  edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 0]],
  boundRadius: 48,
};

export const URSA_MINOR: ConstellationDef = {
  name: 'Ursa Minor (Little Dipper)',
  points: [[0, -40], [10, -25], [15, -10], [5, 5], [-15, 10], [-25, -5], [-10, -15]],
  edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 3]],
  boundRadius: 45,
};

export const REAL_CONSTELLATIONS: ConstellationDef[] = [
  URSA_MAJOR, ORION, CASSIOPEIA, CYGNUS, LYRA, SCORPIUS, CRUX, LEO, SAGITTARIUS, URSA_MINOR,
];

export function edgesToPath(points: [number, number][], edges: [number, number][]) {
  return edges
    .map(([a, b]) => `M ${points[a][0]} ${points[a][1]} L ${points[b][0]} ${points[b][1]}`)
    .join(' ');
}
