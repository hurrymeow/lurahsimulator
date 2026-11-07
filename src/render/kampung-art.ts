import type { Painter } from './iso';
import { prism, roofRect } from './massing';

// Kampung art, second silhouette pass (playtest 2026-11-07): canopy trees instead of round blobs, a
// two-pillar gapura, a portal and posyandu that grow by level, a mural that is a wall, growing paddy and
// vegetables, a galvanised open gudang, and the big halls broken into smaller masses so they no longer
// read as one house scaled up. Built from massing.ts, so every part sits on its own rectangle of the lot
// and keeps 1px edges on any footprint. Only `import type` from iso.ts, so there is no import cycle.

const TW = 32;
const TH = 16;
const TOP = 40;
const within = (v: number, lo: number, hi: number) => v >= lo && v < hi;

type Art = (p: Painter, variant?: string, level?: number) => void;

/** Screen point of ground (a, b) raised up art pixels, in native pixels. */
export function at(p: Painter, a: number, b: number, up = 0): [number, number] {
  const n = p.n;
  return [(TW / 2) * n + p.ox + (a - b) * (TW / 2) * n, TOP * n + p.oy + (a + b) * (TH / 2) * n - up * p.zs];
}

/** A vertical 1px pole from the ground at (a, b), h art pixels tall. Drawn in native pixels. */
export function pole(p: Painter, a: number, b: number, h: number, colour: string, z = 0): void {
  p.id++;
  const [x, y] = at(p, a, b, z);
  for (let k = 0; k < h * p.zs; k++) p.px(x, y - k, colour);
}

/** Footprint units per one-tile art pixel along a or b, so a post can be a fixed number of pixels wide on any lot. */
export const unit = (p: Painter) => 1 / (TH * p.n);

// ---------------------------------------------------------------- Canopy trees

const LEAF = { top: ['#a6d264', '#8cc051'], base: '#6aa443', shade: '#4f8a36', side: ['#3f7430', '#2f5c26'] };

function speck(x: number, y: number): number {
  let h = Math.imul((x * 73856093) ^ (y * 19349663), 0x5bd1e995);
  h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}

/**
 * One tier of a canopy: a disc of foliage seen from the map's angle, its top a 2:1 ellipse lit from the
 * top left, with a band of shade under its rim like the side of a box (ART.md, the shade tree). Centred
 * over ground (a, b) at up art pixels, radius r and band in art pixels.
 */
function tier(p: Painter, a: number, b: number, up: number, r: number, band: number): void {
  p.id++;
  const [cx, cy] = at(p, a, b, up);
  const R = r * p.zs;
  const B = Math.max(1, Math.round(band * p.zs));
  const inside = (x: number, y: number) => {
    const dx = (x + 0.5 - cx) / R;
    const dy = (y + 0.5 - cy) / (R * 0.5);
    return dx * dx + dy * dy <= 1 - (speck(x * 7 + 3, y * 3) - 0.5) * 0.3;
  };
  const side: [number, number, string][] = [];
  for (let y = Math.floor(cy - R * 0.5 - 1); y <= Math.ceil(cy + R * 0.5 + B + 1); y++)
    for (let x = Math.floor(cx - R - 1); x <= Math.ceil(cx + R + 1); x++) {
      if (inside(x, y)) {
        const dx = (x + 0.5 - cx) / R;
        const dy = (y + 0.5 - cy) / (R * 0.5);
        const l = -dx * 0.7 - dy * 0.7;
        p.px(x, y, l > 0.45 ? LEAF.top[speck(x, y) < 0.35 ? 0 : 1] : l > -0.35 ? LEAF.base : LEAF.shade);
      } else
        for (let k = 1; k <= B; k++)
          if (inside(x, y - k)) {
            side.push([x, y, (x + 0.5 - cx) / R > 0.15 || k === B ? LEAF.side[1] : LEAF.side[0]]);
            break;
          }
    }
  for (const [x, y, c] of side) p.px(x, y, c);
}

/** A shade tree at ground (a, b): a sturdy trunk and two or three stacked tiers, upper ones smaller. size scales it. */
export function canopyTree(p: Painter, a: number, b: number, size = 1, tiers = 3): void {
  const w = 2.4 * unit(p);
  prism(p, a - w, a + w, b - w, b + w, Math.round(9 * size), '#7a4a2a', (face) => (face === 'R' ? '#5a3420' : undefined));
  const r0 = 10 * size;
  for (let k = 0; k < tiers; k++) {
    const r = r0 * (1 - k * (tiers === 3 ? 0.27 : 0.35));
    tier(p, a - k * 0.01, b - k * 0.01, Math.round((10 + k * 5) * size), r, Math.max(2, r * 0.32));
  }
}

const pohon: Art = (p) => {
  p.shadow(3);
  canopyTree(p, 0.5, 0.5, 1, 3);
};

// ---------------------------------------------------------------- Gapura

// ---------------------------------------------------------------- Portal

/** Portal level 2: striped concrete pillars, a booth for the hansip with a lamp, a proper boom with its counterweight, and a speed bump. */
const portal2: Art = (p) => {
  p.shadow(4);
  // The speed bump across the lane, yellow and black.
  p.ground((a, b) => (within(b, 0.66, 0.72) && within(a, 0.08, 0.92) ? (Math.floor(a * 10) % 2 ? 'y' : 'k') : null));
  // The booth on the back-right, shed roof and a window.
  prism(p, 0.62, 0.92, 0.1, 0.38, 8, 'b', (face, u, j) => (face === 'L' && within(u, 0.2, 0.8) && within(j, 3, 6) ? 'l' : face === 'R' && within(u, 0.3, 0.7) && j < 6 ? 'k' : undefined));
  roofRect(p, 0.62, 0.92, 0.1, 0.38, 8, 2, 'shed', 'B', 'b');
  pole(p, 0.9, 0.38, 3, 'y', 8);
  // Pillars, striped red and white.
  for (const [a0, a1] of [[0.08, 0.2], [0.8, 0.92]] as [number, number][])
    prism(p, a0, a1, 0.46, 0.58, 10, 'w', (face, _u, j) => (face === 'T' ? 's' : Math.floor(j / 2) % 2 ? 'r' : 'w'));
  // The boom, low across the lane, with a counterweight past the far pillar.
  prism(p, 0.14, 0.86, 0.5, 0.54, 1, 'w', (face, u) => (face === 'T' ? undefined : Math.floor(u * 8) % 2 ? 'r' : 'w'), 7);
  prism(p, 0.86, 0.96, 0.49, 0.55, 2, 'S', undefined, 6);
};

// ---------------------------------------------------------------- Mural

/** Mural Kampung: a long, thin wall, not a cube, painted with a kampung scene, a coping on top and paint cans at its foot. */
const mural: Art = (p) => {
  p.shadow(5);
  prism(p, 0.06, 0.94, 0.45, 0.57, 11, 'w', (face, u, j) => {
    if (face === 'T') return 'S';
    if (j === 0) return 'S';
    if (face === 'R') return 's';
    // Sky, a sun, green hills, two houses and a red-white band along the bottom.
    if (j <= 1) return Math.floor(u * 16) % 2 ? 'r' : 'w';
    const hill = 4 + Math.round(2 * Math.sin(u * 9));
    if (within(u, 0.62, 0.74) && within(j, 7, 10)) return 'y';
    if (j < hill) {
      if (within(u, 0.18, 0.3) && j < 6) return j === 5 ? 'R' : 'o';
      if (within(u, 0.4, 0.5) && j < 5) return j === 4 ? 'b' : 'p';
      return 'g';
    }
    return j >= 9 ? 'c' : 'l';
  });
  prism(p, 0.04, 0.96, 0.43, 0.59, 1, 's', undefined, 11);
  for (const [a, c] of [[0.3, 'r'], [0.38, 'b'], [0.7, 'y']] as [number, string][]) prism(p, a, a + 0.05, 0.68, 0.73, 2, c, (face) => (face === 'T' ? 'S' : undefined));
};

// ---------------------------------------------------------------- Farm plots that grow

/**
 * Plants standing in rows on a flat plot, drawn after the ink pass in native pixels so the blades stay
 * 1px: each a short vertical stroke, dark at the root and light at the tip. rows are b centres; step is
 * the gap along a in one-tile pixels; draw is called per plant with its foot.
 */
function rowsOf(p: Painter, rows: number[], step: number, draw: (x: number, y: number, k: number) => void): void {
  p.overlay.push((q) => {
    const pts: [number, number, number][] = [];
    const s = step / (TW / 2) / q.n;
    let k = 0;
    for (const b of rows)
      for (let a = 0.08 + (k % 2) * s * 0.5; a < 0.93; a += s) {
        const [x, y] = at(q, a, b);
        pts.push([Math.round(x), Math.round(y), k++]);
      }
    pts.sort((m, n) => m[1] - n[1]);
    for (const [x, y, k2] of pts) draw(x, y, k2);
  });
}

/** Sawah: water and bunds as before, now with rice standing in its rows. Seedlings at level 1, taller green rice at 2, tall golden rice heads at 3. */
const sawah: Art = (p, _v, level = 1) => {
  p.bare = true;
  p.ground((a, b, px) => {
    const e = Math.min(a, b, 1 - a, 1 - b);
    if (e < 1.2 * px) return 'n';
    if (e < 2.4 * px) return 't';
    return Math.floor(b * 6) % 2 === 0 ? 'G' : 'l';
  });
  const h = level >= 3 ? 6 : level === 2 ? 4 : 2;
  const rows = [0, 2, 4].map((r) => (r + 0.5) / 6);
  rowsOf(p, rows, level >= 2 ? 2 : 3, (x, y, k) => {
    for (let d = 0; d < h; d++) {
      const tip = d === h - 1;
      const c = level >= 3 && d >= h - 2 ? (k % 3 ? '#e8b440' : '#d39a32') : tip ? '#9cc155' : d === 0 ? '#527f34' : '#78a840';
      p.px(x, y - d, c);
      // A second blade leaning out on taller rice, so the tufts read as clumps.
      if (d >= 2 && level >= 2 && d === h - 2) p.px(x + (k % 2 ? 1 : -1), y - d - 1, c);
    }
  });
};

/** Kebun Sayur: tilled rows, with sprouts at level 1, leafy plants at 2 and fruiting chilli and tomato at 3. */
const kebunSayur: Art = (p, _v, level = 1) => {
  p.bare = true;
  p.ground((a, b, px) => {
    if (Math.min(a, b, 1 - a, 1 - b) < 1.2 * px) return 'n';
    return Math.floor(b * 5) % 2 === 0 ? 'N' : 'n';
  });
  const rows = [1, 3].map((r) => (r + 0.5) / 5);
  rowsOf(p, rows, 3, (x, y, k) => {
    if (level <= 1) {
      p.px(x, y - 1, '#78a840');
      p.px(x - 1, y - 2, '#9cc155');
      p.px(x + 1, y - 2, '#9cc155');
      return;
    }
    const h = level >= 3 ? 4 : 3;
    for (let d = 0; d < h; d++) for (let e = -1; e <= 1; e++) if (d > 0 || e === 0) p.px(x + e, y - d, d === h - 1 ? '#9cc155' : e > 0 ? '#527f34' : '#6aa443');
    if (level >= 3) p.px(x + (k % 2 ? 1 : -1), y - 2, k % 3 ? '#df4a2c' : '#e57d2e');
  });
};

// ---------------------------------------------------------------- Shared

/** Window bays every few columns between rows j0 and j1, as on the other buildings. */
export const win = (u: number, j: number, i: number, j0: number, j1: number, c = 'l') => (within(j, j0, j1) && i % 5 >= 2 && within(u, 0.1, 0.9) ? c : undefined);

// ---------------------------------------------------------------- Posyandu

/** A dacin: the hanging baby scale on a wooden tripod, with its sarung sling. Native pixels, after the ink pass. */
function dacin(p: Painter, a: number, b: number): void {
  pole(p, a, b, 7, 'n');
  p.overlay.push((q) => {
    const [x, y] = at(q, a, b, 7);
    for (let k = 1; k <= 4; k++) q.px(Math.round(x) + k, Math.round(y) + k, '#a8652f');
    for (let d = 0; d < 3; d++) q.px(Math.round(x) + 4, Math.round(y) + 5 + d, '#6d635a');
    for (const dx of [3, 4, 5]) q.px(Math.round(x) + dx, Math.round(y) + 8, '#e57a9c');
  });
}

/**
 * Posyandu on one tile, by level. Level 1 is held on a warga's teras: no walls, a pink-striped tarp on
 * bamboo poles over a table and the dacin. Level 2 is its own small hut under a pink pelana, a KMS board
 * on the wall. Level 3 is a proper clinic under a pink hip with an entrance canopy and the cross.
 */
const posyanduMain: Art = (p, _v, level = 1) => {
  if (level <= 1) {
    p.shadow(5);
    for (const [a, b] of [[0.26, 0.26], [0.74, 0.26], [0.26, 0.74], [0.74, 0.74]]) pole(p, a, b, 7, 'a');
    prism(p, 0.32, 0.6, 0.44, 0.62, 3, 'w', (face) => (face === 'T' ? 'w' : 'p'));
    dacin(p, 0.68, 0.5);
    roofRect(p, 0.24, 0.76, 0.24, 0.76, 7, 2, 'shed', 'p', 'p', (x) => (Math.floor(x / 2) % 2 ? 'w' : undefined), 0.02);
    return;
  }
  if (level === 2) {
    p.shadow(4);
    prism(p, 0.24, 0.76, 0.26, 0.72, 7, 't', (face, u, j) => {
      if (face === 'T') return undefined;
      if (j === 0) return 'S';
      if (face === 'L' && within(u, 0.56, 0.76) && j < 5) return 'N';
      if (face === 'L' && within(u, 0.14, 0.44) && within(j, 2, 6)) return within(u, 0.27, 0.31) || j === 4 ? 'r' : 'w';
      if (face === 'R' && within(u, 0.3, 0.7) && within(j, 2, 5)) return 'l';
      return undefined;
    });
    roofRect(p, 0.24, 0.76, 0.26, 0.72, 7, 5, 'gableB', 'p', 't');
    return;
  }
  p.shadow(2);
  prism(p, 0.08, 0.92, 0.08, 0.7, 8, 'w', (face, u, j, i) => {
    if (face === 'T') return undefined;
    if (j === 0) return 'p';
    if (j === 7) return 'p';
    if (face === 'L' && within(u, 0.42, 0.58) && j < 6) return 'c';
    if (face === 'R' && within(u, 0.35, 0.65) && within(j, 2, 7)) return within(u, 0.47, 0.53) || within(j, 4, 5) ? 'r' : 'w';
    return win(u, j, i, 2, 6, 'c');
  });
  roofRect(p, 0.08, 0.92, 0.08, 0.7, 8, 5, 'hip', 'p', 'w');
  for (const a of [0.36, 0.64]) pole(p, a, 0.88, 6, 'S');
  roofRect(p, 0.34, 0.66, 0.7, 0.9, 6, 0, 'flat', 'p', 'w', undefined, 0);
};

/** The second tile at levels 1 and 2: mats and stools by the tarp, then an open waiting shed with a bench and the queue. */
const posyanduYard: Art = (p, _v, level = 1) => {
  if (level <= 1) {
    p.ground((a, b) => (within(a, 0.24, 0.76) && within(b, 0.3, 0.7) ? (Math.floor(a * 20) % 2 ? 'y' : 'o') : null));
    for (const [a, b] of [[0.3, 0.86], [0.5, 0.86]]) prism(p, a, a + 0.08, b - 0.08, b, 2, 'r', (face) => (face === 'T' ? 'r' : 'R'));
    return;
  }
  p.shadow(4);
  prism(p, 0.28, 0.72, 0.36, 0.46, 2, 'n', (face) => (face === 'T' ? 'N' : undefined));
  for (const [a, b] of [[0.24, 0.24], [0.76, 0.24], [0.24, 0.76], [0.76, 0.76]]) pole(p, a, b, 7, 'n');
  roofRect(p, 0.22, 0.78, 0.22, 0.78, 7, 2, 'shed', 's', 't', (x) => (x % 2 ? 'S' : undefined), 0.02);
};

/**
 * The 2x1 posyandu. Levels 1 and 2 are a tile of posyandu and a tile of yard. Level 3 is one long clinic
 * across both tiles, under a pink hip, with a covered entrance, the sign on a pole and a slide in the corner.
 */
export const posyanduLong: Art = (p, v, level = 1) => {
  if (level < 3) {
    p.at(0, 0);
    posyanduMain(p, v, level);
    p.at(1, 0);
    posyanduYard(p, v, level);
    return;
  }
  p.at(0, 0);
  p.shadow(2);
  p.at(1, 0);
  p.shadow(2);
  p.at(0, 0);
  // a runs 0..2 along the long side here: one mass across both tiles.
  prism(p, 0.1, 1.9, 0.12, 0.66, 8, 'w', (face, u, j, i) => {
    if (face === 'T') return undefined;
    if (j === 0 || j === 7) return 'p';
    if (face === 'L' && within(u, 0.46, 0.54) && j < 6) return 'c';
    if (face === 'L' && within(u, 0.2, 0.3) && within(j, 2, 6)) return within(u, 0.24, 0.26) || j === 4 ? 'r' : 'w';
    return win(u, j, i, 2, 6, 'c');
  });
  roofRect(p, 0.1, 1.9, 0.12, 0.66, 8, 5, 'hip', 'p', 'w');
  for (const a of [0.84, 1.16]) pole(p, a, 0.86, 6, 'S');
  roofRect(p, 0.8, 1.2, 0.66, 0.88, 6, 0, 'flat', 'p', 'w', undefined, 0);
  pole(p, 1.86, 0.9, 10, 'S');
  prism(p, 1.8, 1.94, 0.88, 0.92, 3, 'w', (face) => (face === 'L' ? 'p' : undefined), 9);
  prism(p, 0.14, 0.2, 0.78, 0.84, 4, 'b');
  prism(p, 0.2, 0.36, 0.79, 0.83, 1, 'r', (face) => (face === 'T' ? 'y' : undefined), 1);
};

export const KAMPUNG_ART: Record<string, Art> = {
  pohon,
  portal2,
  mural,
  sawah,
  kebunSayur,
  posyandu: posyanduMain,
};
