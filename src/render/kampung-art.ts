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
function at(p: Painter, a: number, b: number, up = 0): [number, number] {
  const n = p.n;
  return [(TW / 2) * n + p.ox + (a - b) * (TW / 2) * n, TOP * n + p.oy + (a + b) * (TH / 2) * n - up * p.zs];
}

/** A vertical 1px pole from the ground at (a, b), h art pixels tall. Drawn in native pixels. */
function pole(p: Painter, a: number, b: number, h: number, colour: string, z = 0): void {
  p.id++;
  const [x, y] = at(p, a, b, z);
  for (let k = 0; k < h * p.zs; k++) p.px(x, y - k, colour);
}

/** Footprint units per one-tile art pixel along a or b, so a post can be a fixed number of pixels wide on any lot. */
const unit = (p: Painter) => 1 / (TH * p.n);

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
function canopyTree(p: Painter, a: number, b: number, size = 1, tiers = 3): void {
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

/** Taman: paths in a cross, a bench, a flower bed and three canopy trees of different sizes. */
const taman: Art = (p) => {
  p.low();
  p.shadow(2);
  p.ground((a, b) => {
    if (within(a, 0.46, 0.54) || within(b, 0.46, 0.54)) return 't';
    if (within(a, 0.62, 0.86) && within(b, 0.62, 0.86)) return (Math.floor(a * 40) + Math.floor(b * 40)) % 3 === 0 ? 'r' : (Math.floor(a * 40) + Math.floor(b * 40)) % 3 === 1 ? 'y' : 'G';
    return (Math.floor(a * 4) + Math.floor(b * 4)) % 2 ? 'g' : 'G';
  });
  canopyTree(p, 0.24, 0.24, 0.95, 3);
  canopyTree(p, 0.76, 0.26, 0.8, 2);
  prism(p, 0.3, 0.42, 0.62, 0.68, 2, 'n', (face) => (face === 'T' ? 't' : undefined));
  canopyTree(p, 0.26, 0.8, 0.85, 2);
};

/** Taman Kota: a fountain pool in the middle, paths, and a ring of canopy trees. */
const tamanKota: Art = (p) => {
  p.low();
  p.shadow(2);
  p.ground((a, b) => {
    const d = Math.max(Math.abs(a - 0.5), Math.abs(b - 0.5));
    if (d < 0.14) return Math.floor((a + b) * 12) % 3 === 0 ? 'c' : 'l';
    if (d < 0.2) return 's';
    if (within(a, 0.46, 0.54) || within(b, 0.46, 0.54)) return 't';
    return (Math.floor(a * 4) + Math.floor(b * 4)) % 2 ? 'g' : 'G';
  });
  canopyTree(p, 0.2, 0.2, 1, 3);
  canopyTree(p, 0.8, 0.22, 0.8, 2);
  canopyTree(p, 0.22, 0.8, 0.8, 2);
  // The fountain's jet over the pool.
  pole(p, 0.5, 0.5, 6, 'c');
  canopyTree(p, 0.8, 0.8, 0.9, 3);
};

// ---------------------------------------------------------------- Gapura

/**
 * Gapura: two pillars and a beam across the lane. Level 1 is a painted merah putih gate with a banner.
 * Level 2 stands the pillars on stepped plinths, crowns each with a capital and a finial, and puts a
 * small roof with a gold ridge over the beam.
 */
const gapura: Art = (p, _v, level = 1) => {
  p.shadow(3);
  const big = level >= 2;
  const L: [number, number] = [0.06, 0.24];
  const R: [number, number] = [0.76, 0.94];
  const b0 = 0.42;
  const b1 = 0.6;
  const z0 = big ? 3 : 0;
  const ph = big ? 11 : 14;
  for (const [a0, a1] of [L, R]) {
    if (big) {
      prism(p, a0 - 0.04, a1 + 0.04, b0 - 0.04, b1 + 0.04, 2, 'S', (face) => (face === 'T' ? 's' : undefined));
      prism(p, a0 - 0.02, a1 + 0.02, b0 - 0.02, b1 + 0.02, 1, 's', undefined, 2);
    }
    prism(p, a0, a1, b0, b1, ph, 'w', (face, _u, j) => (face === 'T' ? undefined : big ? (j % 4 === 3 ? 'y' : 'R') : Math.floor(j / 3) % 2 ? 'r' : 'w'), z0);
    if (big) prism(p, a0 - 0.03, a1 + 0.03, b0 - 0.03, b1 + 0.03, 2, 'y', (face) => (face === 'T' ? 'a' : undefined), z0 + ph);
  }
  const zb = z0 + ph + (big ? 2 : 0);
  // The beam: a banner of red and white with a yellow lettering band.
  prism(p, 0.02, 0.98, b0 + 0.02, b1 - 0.02, 3, 'r', (face, _u, j, i) => (face === 'T' ? 'w' : j === 1 ? (i % 3 ? 'y' : 'r') : j === 2 ? 'w' : undefined), zb);
  if (!big) return;
  roofRect(p, 0.0, 1.0, b0, b1, zb + 3, 2, 'gableA', 'R', 'y', undefined, 0.02);
  for (const a of [(L[0] + L[1]) / 2, (R[0] + R[1]) / 2]) pole(p, a, (b0 + b1) / 2, 2, 'y', zb + 5);
};

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

// ---------------------------------------------------------------- Gudang Material

const ZINC = '#b9c2c6';
const ZINC_RIB = '#8f999e';
const ZINC_SHINE = '#e2e8ea';

/**
 * Gudang Material: an open builder's yard shed. Galvanised zinc on a light steel frame, a low wall along
 * the front and the sides open above it, so the stock shows: a stack of bata merah, sacks of semen,
 * a heap of sand and a rack of pipes. The back walls have wide open window bays.
 */
const gudangMaterial: Art = (p) => {
  p.low();
  p.shadow(2);
  prism(p, 0.04, 0.96, 0.04, 0.96, 1, 's', (face) => (face === 'T' ? 's' : 'S'));
  const t = 1.6 * unit(p);
  // Back walls: their inner faces show, with wide open bays.
  const bay = (_f: string, u: number, j: number) => (j >= 4 && j <= 7 && Math.floor(u * 6) % 2 === 1 ? 'k' : undefined);
  prism(p, 0.06, 0.94, 0.06, 0.06 + t, 10, 'w', (face, u, j) => (face === 'T' ? 'S' : bay(face, u, j)), 1);
  prism(p, 0.06, 0.06 + t, 0.06, 0.94, 10, 'w', (face, u, j) => (face === 'T' ? 'S' : bay(face, u, j)), 1);
  // The stock.
  prism(p, 0.14, 0.42, 0.14, 0.36, 5, 'r', (face, _u, j, i) => (face === 'T' ? 'R' : (j + (i % 4 < 2 ? 0 : 1)) % 2 ? 'R' : undefined), 1);
  prism(p, 0.5, 0.86, 0.14, 0.34, 3, 'w', (face, _u, _j, i) => (face === 'T' ? 'w' : i % 3 === 0 ? 's' : undefined), 1);
  roofRect(p, 0.14, 0.44, 0.48, 0.82, 1, 3, 'hip', 't', 't', undefined, 0);
  prism(p, 0.56, 0.88, 0.56, 0.64, 2, 'S', (face, _u, _j, i) => (face === 'L' && i % 2 ? 'k' : undefined), 1);
  // Steel posts at the open front corners, and a low front wall.
  for (const [a, b] of [[0.94 - t, 0.94 - t], [0.94 - t, 0.06], [0.06, 0.94 - t], [0.5, 0.94 - t], [0.94 - t, 0.5]] as [number, number][])
    prism(p, a, a + t, b, b + t, 10, 'S', undefined, 1);
  prism(p, 0.06, 0.94, 0.94 - t, 0.94, 3, 'w', (face, u) => (face === 'L' && within(u, 0.42, 0.58) ? null : undefined), 1);
  prism(p, 0.94 - t, 0.94, 0.06, 0.94, 3, 'w', undefined, 1);
  roofRect(p, 0.04, 0.96, 0.04, 0.96, 11, 5, 'gableA', ZINC, 'w', (x) => (x % 3 === 0 ? ZINC_RIB : x % 3 === 1 ? ZINC_SHINE : undefined), 0.03);
};

// ---------------------------------------------------------------- Halls broken into parts

/** Window bays every few columns between rows j0 and j1, as on the other buildings. */
const win = (u: number, j: number, i: number, j0: number, j1: number, c = 'l') => (within(j, j0, j1) && i % 5 >= 2 && within(u, 0.1, 0.9) ? c : undefined);

/** Kontrakan: three rumah petak in a row, each with its own pelana and door, a yard in front with a jemuran. */
const kontrakan: Art = (p) => {
  p.low();
  p.shadow(1);
  const walls = ['a', 't', 'w'];
  const roofs = ['R', 'r', 'R'];
  [[0.04, 0.34], [0.35, 0.65], [0.66, 0.96]].forEach(([a0, a1], k) => {
    prism(p, a0, a1, 0.1, 0.58, 7, walls[k], (face, u, j, i) => {
      if (face === 'T') return undefined;
      if (j === 0) return 'S';
      if (face === 'L' && within(u, 0.55, 0.8) && j < 5) return 'N';
      if (face === 'L' && within(u, 0.15, 0.42) && within(j, 2, 5)) return 'l';
      return face === 'R' ? win(u, j, i, 2, 5) : undefined;
    });
    roofRect(p, a0, a1, 0.1, 0.58, 7, 4, 'gableB', roofs[k], walls[k]);
  });
  // The yard: a jemuran on two poles, and a low pagar along the front.
  pole(p, 0.2, 0.78, 6, 'S');
  pole(p, 0.5, 0.78, 6, 'S');
  p.overlay.push((q) => {
    const cols = ['#e57a9c', '#f4b935', '#f6ecd4', '#3d72b4', '#df4a2c'];
    for (let k = 0; k < 10; k++) {
      const [x, y] = at(q, 0.2 + k * 0.03, 0.78, 6);
      q.px(Math.round(x), Math.round(y), '#6d635a');
      if (k % 2) for (let d = 1; d <= 2; d++) q.px(Math.round(x), Math.round(y) + d, cols[k % cols.length]);
    }
  });
};

/** Balai RW: a hall under a hipped roof, a lower office wing beside it, a short teras on posts over the door, and the flag. */
const balaiRW: Art = (p) => {
  p.low();
  p.shadow(1);
  // The office wing at the back right.
  prism(p, 0.6, 0.94, 0.08, 0.5, 7, 't', (face, u, j, i) => (face === 'T' ? undefined : j === 0 ? 'S' : win(u, j, i, 2, 5)));
  roofRect(p, 0.6, 0.94, 0.08, 0.5, 7, 3, 'gableA', 'R', 't');
  // The hall.
  prism(p, 0.06, 0.62, 0.08, 0.7, 9, 'w', (face, u, j, i) => {
    if (face === 'T') return undefined;
    if (j === 0) return 'S';
    if (j === 8) return 'o';
    if (face === 'L' && within(u, 0.42, 0.6) && j < 6) return 'k';
    return win(u, j, i, 3, 7);
  });
  roofRect(p, 0.06, 0.62, 0.08, 0.7, 9, 6, 'hip', 'o', 'w');
  // The teras over the door only, on two posts.
  for (const a of [0.24, 0.46]) pole(p, a, 0.84, 6, 'n');
  roofRect(p, 0.22, 0.48, 0.7, 0.84, 6, 2, 'shed', 'R', 'w', undefined, 0.01);
  // The flag on a pole by the front-right corner.
  pole(p, 0.86, 0.8, 13, 'S');
  prism(p, 0.86, 0.94, 0.79, 0.81, 2, 'r', (face, _u, j) => (face === 'T' ? 'r' : j === 0 ? 'w' : 'r'), 10);
};

/** Balai Warga: an open pendopo on a plinth under a two-tier roof, with a small kitchen annex on the back right. */
const balaiWarga: Art = (p) => {
  p.low();
  p.shadow(1);
  prism(p, 0.74, 0.96, 0.08, 0.44, 6, 't', (face, u, j) => (face === 'L' && within(u, 0.3, 0.6) && j < 5 ? 'N' : undefined));
  roofRect(p, 0.74, 0.96, 0.08, 0.44, 6, 2, 'shed', 's', 't', (x) => (x % 2 ? 'S' : undefined));
  prism(p, 0.06, 0.74, 0.1, 0.9, 2, 's', (face) => (face === 'T' ? 'w' : 'S'));
  // Teak posts, and benches along the open floor.
  for (const a of [0.1, 0.4, 0.7]) for (const b of [0.14, 0.5, 0.86]) pole(p, a, b, 7, 'N', 2);
  prism(p, 0.2, 0.6, 0.6, 0.66, 2, 'n', undefined, 2);
  roofRect(p, 0.02, 0.78, 0.06, 0.94, 9, 3, 'hip', 'R', 't', undefined, 0.02);
  roofRect(p, 0.24, 0.56, 0.28, 0.72, 12, 4, 'hip', 'R', 't', (x, y) => ((x + y) % 5 === 0 ? 'r' : undefined), 0.01);
};

/** Koperasi: a zinc warehouse at the back and a lower shopfront in front of it under a blue hip with a yellow board, sacks by the door. */
const koperasi: Art = (p) => {
  p.low();
  p.shadow(1);
  prism(p, 0.06, 0.94, 0.06, 0.44, 8, 's', (face, u, j) => (face === 'L' && within(u, 0.66, 0.9) && j < 6 ? (j % 2 ? 'S' : 's') : undefined));
  roofRect(p, 0.06, 0.94, 0.06, 0.44, 8, 3, 'gableA', ZINC, 's', (x) => (x % 3 === 0 ? ZINC_RIB : undefined));
  prism(p, 0.06, 0.6, 0.44, 0.92, 7, 'w', (face, u, j, i) => {
    if (face === 'T') return undefined;
    if (j === 0) return 'S';
    if (j === 6) return 'y';
    if (face === 'L' && within(u, 0.4, 0.58) && j < 5) return 'k';
    return win(u, j, i, 2, 5);
  });
  roofRect(p, 0.06, 0.6, 0.44, 0.92, 7, 4, 'hip', 'b', 'w');
  for (const [a, b] of [[0.68, 0.6], [0.78, 0.66], [0.72, 0.76]] as [number, number][]) prism(p, a, a + 0.1, b, b + 0.08, 2, 'w', (face) => (face === 'T' ? 't' : undefined));
};

// ---------------------------------------------------------------- Posyandu

/** Posyandu on its own tile, by level: a tarp over a table and the dacin scale, then the clinic, then a bigger clinic with a sign. */
const posyanduMain: Art = (p, _v, level = 1) => {
  if (level <= 1) {
    p.shadow(4);
    for (const [a, b] of [[0.2, 0.2], [0.8, 0.2], [0.2, 0.8], [0.8, 0.8]]) pole(p, a, b, 8, 'a');
    prism(p, 0.3, 0.62, 0.42, 0.62, 3, 'w', (face) => (face === 'T' ? 'w' : 'p'));
    // The dacin: a hanging scale on a wooden tripod, the sarung sling for the baby under it.
    pole(p, 0.7, 0.5, 7, 'n');
    p.overlay.push((q) => {
      const [x, y] = at(q, 0.7, 0.5, 7);
      for (let k = 1; k <= 4; k++) q.px(Math.round(x) + k, Math.round(y) + k, '#a8652f');
      for (let d = 0; d < 3; d++) q.px(Math.round(x) + 4, Math.round(y) + 5 + d, '#6d635a');
      q.px(Math.round(x) + 3, Math.round(y) + 8, '#e57a9c');
      q.px(Math.round(x) + 4, Math.round(y) + 8, '#e57a9c');
      q.px(Math.round(x) + 5, Math.round(y) + 8, '#e57a9c');
    });
    roofRect(p, 0.18, 0.82, 0.18, 0.82, 8, 2, 'shed', 'p', 'p', (x) => (Math.floor(x / 2) % 2 ? 'w' : undefined), 0.02);
    return;
  }
  const big = level >= 3;
  const [a0, a1, b0, b1] = big ? [0.1, 0.9, 0.1, 0.9] : [0.18, 0.82, 0.18, 0.82];
  p.shadow(big ? 2 : 3);
  prism(p, a0, a1, b0, b1, 8, big ? 'w' : 't', (face, u, j, i) => {
    if (face === 'T') return undefined;
    if (j === 0) return big ? 'p' : 'S';
    if (face === 'L' && within(u, 0.4, 0.6) && within(j, 2, 7)) return within(u, 0.46, 0.54) || within(j, 4, 5) ? 'r' : 'w';
    if (face === 'R') return win(u, j, i, 3, 6, big ? 'c' : 'l');
    return big && j === 7 ? 'p' : undefined;
  });
  roofRect(p, a0, a1, b0, b1, 8, big ? 5 : 6, big ? 'hip' : 'hip', big ? 'p' : 'p', 'w', big ? (x) => (x % 4 === 0 ? 'w' : undefined) : undefined);
};

/** The second tile of a posyandu: mats and stools at level 1, a porch with a bench at 2, a porch with a bench, a sign and a play corner at 3. */
const posyanduYard: Art = (p, _v, level = 1) => {
  if (level <= 1) {
    p.ground((a, b) => (within(a, 0.2, 0.8) && within(b, 0.25, 0.75) ? (Math.floor(a * 20) % 2 ? 'y' : 'o') : null));
    for (const [a, b] of [[0.3, 0.86], [0.5, 0.86]]) prism(p, a, a + 0.08, b - 0.08, b, 2, 'r', (face) => (face === 'T' ? 'r' : 'R'));
    pole(p, 0.86, 0.3, 6, 'n');
    prism(p, 0.8, 0.92, 0.24, 0.3, 3, 'w', (face) => (face === 'L' ? 'g' : undefined), 4);
    return;
  }
  p.shadow(3);
  prism(p, 0.2, 0.8, 0.3, 0.42, 2, 'n', (face) => (face === 'T' ? 'N' : undefined));
  for (const [a, b] of [[0.18, 0.82], [0.82, 0.82], [0.18, 0.18], [0.82, 0.18]]) pole(p, a, b, 8, 'n');
  roofRect(p, 0.16, 0.84, 0.16, 0.84, 8, 3, 'shed', 'p', 't', undefined, 0.02);
  if (level < 3) return;
  // A sign pole by the front, and a small slide in the play corner.
  pole(p, 0.92, 0.92, 10, 'S');
  prism(p, 0.86, 0.98, 0.9, 0.95, 3, 'w', (face) => (face === 'L' ? 'p' : undefined), 9);
  p.ground((a, b) => (within(a, 0.5, 0.8) && within(b, 0.6, 0.9) ? 'c' : null));
};

export const KAMPUNG_ART: Record<string, Art> = {
  pohon,
  taman,
  tamanKota,
  gapura,
  portal2,
  mural,
  sawah,
  kebunSayur,
  gudangMaterial,
  kontrakan,
  balaiRW,
  balaiWarga,
  koperasi,
  posyandu: posyanduMain,
};

/** The 2x1 posyandu: the main tile and its yard, back to front. */
export const posyanduLong: Art = (p, v, level = 1) => {
  p.at(0, 0);
  posyanduMain(p, v, level);
  p.at(1, 0);
  posyanduYard(p, v, level);
};

