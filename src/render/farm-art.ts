import { dither, type Painter } from './iso';
import { at, unit } from './kampung-art';
import { prism, roofRect } from './massing';

// Kolam Lele by level, after the small detail of Kolam Pancing (2026-11-09): level 1 is one round terpal
// pond, the cheapest way a kampung keeps lele; level 2 a square terpal pond on a plank frame under a
// paranet; level 3 a concrete pond with a stone kerb, a water pipe, a jaga hut and sacks of pelet.
// The fish swim on the water in map.ts; LELE_WATER says how high the water stands at each level.

const within = (v: number, lo: number, hi: number) => v >= lo && v < hi;
type Art = (p: Painter, variant?: string, level?: number) => void;

/** How many art pixels above the ground the water stands, per level, so map.ts swims the lele on it. */
export const LELE_WATER = [3, 4, 4];

const WATER = '#7fae8e';
const WATER_LIGHT = '#9cc4a0';
const SCUM = '#6a9a72';

/** Murky green lele water with a few pale ripples and dark duckweed specks, in native pixels at (x, y). */
const water = (x: number, y: number): string => {
  const r = (x * 7 + y * 13) % 23;
  return r === 0 ? WATER_LIGHT : r === 11 ? SCUM : WATER;
};

/**
 * A round terpal pond: a low cylinder of blue tarpaulin on a ring of bamboo stakes, murky water on top.
 * (x, y) is the ground centre in native pixels, rx the half width, h the wall height.
 */
function terpalTub(p: Painter, x: number, y: number, rx: number, h: number): void {
  const ry = rx / 2;
  const inside = (dx: number, dy: number, r: number) => (dx * dx) / (r * r) + (dy * dy) / ((r / 2) * (r / 2)) <= 1;
  // The wall: lit blue on the left, shaded on the right, a pale fold every few columns.
  p.id++;
  // The bottom runs flat across the middle, so the tub stands on the ground instead of rocking on a curve.
  const flat = Math.round(ry * 0.7);
  for (let dx = -rx; dx <= rx; dx++) {
    const front = Math.min(flat, Math.round(ry * Math.sqrt(Math.max(0, 1 - (dx * dx) / (rx * rx)))));
    for (let k = 0; k <= h; k++) {
      const c = dx > rx * 0.35 ? '#27427c' : (dx + 40) % 5 === 0 ? '#5a8cc8' : '#3d72b4';
      p.px(x + dx, y + front - k, c);
    }
    // Packed soil banked against the foot of the wall.
    if (Math.abs(dx) < rx) p.px(x + dx, y + front + 1, '#7a5c3c');
  }
  // The rim: a fold of terpal over the stakes, then the water.
  p.id++;
  for (let dy = -Math.ceil(ry); dy <= Math.ceil(ry); dy++)
    for (let dx = -rx; dx <= rx; dx++) if (inside(dx, dy, rx + 0.5)) p.px(x + dx, y + dy - h, '#5a8cc8');
  p.id++;
  for (let dy = -Math.ceil(ry); dy <= Math.ceil(ry); dy++)
    for (let dx = -rx; dx <= rx; dx++) if (inside(dx, dy, rx - 1.5)) p.px(x + dx, y + dy - h, water(x + dx, y + dy));
}

/** A bucket of pelet: a small blue ember with the brown feed showing. */
function peletBucket(p: Painter, a: number, b: number): void {
  prism(p, a, a + 0.06, b, b + 0.06, 3, 'b', (face) => (face === 'T' ? 'n' : undefined));
}

/** A sack of pelet: a cream sack with a red band, slumped. */
function sack(p: Painter, a: number, b: number, z = 0): void {
  prism(p, a, a + 0.09, b, b + 0.07, 3, 'w', (face, _u, j) => (face === 'T' ? 't' : j === 1 ? 'r' : undefined), z);
}

/** A trodden earth patch under a pond, so it sits on its lot. */
function earth(p: Painter, r: number): void {
  p.ground((a, b) => {
    const d = Math.hypot(a - 0.5, b - 0.5);
    if (d > r) return null;
    return d > r - 0.05 ? '#a07a52' : (Math.floor(a * 40) + Math.floor(b * 40)) % 7 === 0 ? '#9a7048' : '#b08a5e';
  });
  p.overlay.push(dither);
}

/** Water inside a raised frame from a0 to a1 (square), h above the ground, with a divider wall across at b > split. */
function waterIn(p: Painter, a0: number, a1: number, h: number, split?: number): void {
  p.id++;
  const q = p;
  {
    const [cx, cy] = at(q, 0.5, 0.5, h);
    for (let y = 0; y < q.h; y++)
      for (let x = 0; x < q.w; x++) {
        const rx = (x + 0.5 - cx) / (16 * q.n);
        const ry = (y + 0.5 - cy) / (8 * q.n);
        const a = (rx + ry) / 2 + 0.5;
        const b = (ry - rx) / 2 + 0.5;
        if (a < a0 || a > a1 || b < a0 || b > a1) continue;
        const rim = a < a0 + 0.06 || a > a1 - 0.06 || b < a0 + 0.06 || b > a1 - 0.06;
        const wall = split !== undefined && Math.abs(a - split) < 0.03 && b > 0.5;
        q.px(x, y, rim ? (split !== undefined ? ((x + y) % 4 ? '#bdb4a3' : '#d8d0c0') : (x + y) % 3 ? '#a8652f' : '#c98a4e') : wall ? '#bdb4a3' : water(x, y));
      }
  }
}

export const kolamLele: Art = (p, _v, level = 1) => {
  const t = unit(p);
  if (level <= 1) {
    // One round terpal pond on a patch of earth, a bucket of pelet beside it. Small and plain.
    earth(p, 0.42);
    const [x, y] = at(p, 0.5, 0.5);
    // One pixel up, so the soil line at its foot stays inside the tile.
    terpalTub(p, Math.round(x), Math.round(y) - 1, 10, LELE_WATER[0]);
    peletBucket(p, 0.84, 0.7);
    return;
  }
  if (level === 2) {
    // A square terpal pond on a plank frame, a paranet over its back half on four bamboo poles, a sack
    // and a bucket of pelet at the front and a hose running into the water.
    earth(p, 0.5);
    const h = LELE_WATER[1];
    prism(p, 0.14, 0.86, 0.14, 0.86, h, 'b', (face, _u, j, i) => {
      if (face === 'T') return undefined;
      // Planks of the frame at the top and bottom, terpal between.
      if (j === 0 || j === h - 1) return 'n';
      return i % 4 === 0 ? 'N' : undefined;
    });
    waterIn(p, 0.14, 0.86, h);
    // The paranet: a black shade net stretched over the back half, on bamboo poles.
    for (const [a, b] of [[0.14, 0.14], [0.84, 0.14], [0.14, 0.44]] as [number, number][]) prism(p, a, a + t, b, b + t, 9, 'n');
    roofRect(p, 0.12, 0.88, 0.12, 0.46, 9, 0, 'flat', '#5b6b52', '#5b6b52', (x, y) => ((x + y) % 2 ? '#4a5843' : undefined), 0);
    sack(p, 0.84, 0.88);
    peletBucket(p, 0.06, 0.82);
    // A green hose over the front rim into the water.
    p.overlay.push((q) => {
      const [x0, y0] = at(q, 0.94, 0.6);
      const [x1, y1] = at(q, 0.78, 0.6, h + 1);
      const steps = Math.ceil(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)));
      for (let k = 0; k <= steps; k++) q.px(Math.round(x0 + ((x1 - x0) * k) / steps), Math.round(y0 + ((y1 - y0) * k) / steps), '#527f34');
      q.px(Math.round(x1) - 1, Math.round(y1) + 1, '#f6ecd4');
      q.px(Math.round(x1) - 1, Math.round(y1) + 2, '#f6ecd4');
    });
    return;
  }
  // Level 3: a raised concrete pond, whitewashed with a blue band and a painted LELE sign, split by a divider
  // wall. A low zinc roof on posts shades its back half, a pipe pours fresh water in, an aerator bubbles, and a
  // blue drum and sacks of pelet stand at the front corner.
  earth(p, 0.6);
  const h = LELE_WATER[2];
  prism(p, 0.08, 0.92, 0.08, 0.92, h, 'w', (face, u, j) => {
    if (face === 'T') return undefined;
    if (j === 0) return 'S';
    if (j === 1) return 'b';
    // The sign painted on the front wall: yellow with dark lettering.
    if (face === 'L' && within(u, 0.2, 0.6) && j >= 2) return Math.floor(u * 30) % 2 && j === 2 ? 'k' : 'y';
    return undefined;
  });
  waterIn(p, 0.12, 0.88, h, 0.5);
  // The roof over the back half: zinc on four posts, low.
  for (const [a, b] of [[0.1, 0.1], [0.88, 0.1], [0.1, 0.4], [0.88, 0.4]] as [number, number][]) prism(p, a, a + t, b, b + t, 4, 'N', undefined, h);
  roofRect(p, 0.06, 0.94, 0.06, 0.46, 4 + h, 2, 'gableA', '#a59f96', 'n', (x) => (x % 3 === 0 ? '#958f87' : undefined), 0.01);
  // The pipe on the right wall pouring fresh water, the aerator's bubbles at the front.
  prism(p, 0.88, 0.98, 0.56, 0.6, 1, 'S', undefined, h + 1);
  p.overlay.push((q) => {
    const [x, y] = at(q, 0.86, 0.58, h + 2);
    for (let k = 0; k < 4; k++) q.px(Math.round(x) - (k > 1 ? 1 : 0), Math.round(y) + k, k % 2 ? '#f6ecd4' : '#93d8cb');
    for (const [dx, dy] of [[-3, 4], [1, 4], [-2, 5], [0, 5]]) q.px(Math.round(x) + dx, Math.round(y) + dy, '#f6ecd4');
    const [bx, by] = at(q, 0.3, 0.74, h);
    for (const [dx, dy] of [[0, 0], [2, 0], [1, -1], [1, 1], [-1, 1], [3, 1]]) q.px(Math.round(bx) + dx, Math.round(by) + dy, '#f6ecd4');
  });
  prism(p, 0.92, 1, 0.82, 0.9, 5, 'b', (face, _u, j) => (face === 'T' ? 'B' : j === 1 || j === 3 ? 'B' : undefined));
  sack(p, 0.8, 0.94);
};
