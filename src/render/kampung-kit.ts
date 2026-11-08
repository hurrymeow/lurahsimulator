import type { Painter } from './iso';
import { at } from './kampung-art';

// The kampung kit: what makes a kampung lot look lived in and built up over the years, after the
// reference sheet of 2026-11-08 (decisions/kampung-vibe.md). Patched zinc next to clay tile, a paved
// yard with a kerb, a TV antenna behind the roof, and the clutter of daily life: pot plants, an ember,
// a jemuran, a tandon on its frame, a motor. Offsets are art pixels from the ground centre (y down),
// in native pixels, so a prop on a 2x2 lot is the same size as on a rumah. Only `import type` from iso.ts, so there is no import cycle.

/** One native pixel at (x, y) from the lot's ground centre: props stay crisp and small on a big lot too. */
const dot = (p: Painter, x: number, y: number, c: string) => p.px(p.gx + x, p.gy + y, c);

/** Seng: weathered corrugated zinc, warm grey, so a patched roof stays in the storybook palette. */
export const ZINC = '#b1a89b';
export const ZINC_RIB = '#8e8579';
export const RUST = '#a8652f';

/** A roof paint for corrugated zinc: a darker rib every second column, a rust streak now and then. */
export const zinc = (x: number, y: number): string => ((x * 7 + y * 3) % 23 === 0 ? RUST : x % 2 ? ZINC : ZINC_RIB);

/**
 * A roof paint that patches a clay roof with zinc: sheets of seng over the part that leaked, the rest
 * left to the roof's own colour. The patch is a band of columns, so it reads as a sheet laid down the slope.
 */
export const patched = (x0: number, x1: number, y0: number, y1: number) => (x: number, y: number): string | undefined => (x >= x0 && x < x1 && y >= y0 && y < y1 ? zinc(x, y) : undefined);

/** The paved yard: worn concrete slabs, a darker kerb on the lot's rim, and a grass verge at the back. */
export function pavedLot(p: Painter, verge = true): void {
  // A long footprint (2x1) paints its whole lot at once; a square one paints its own diamond.
  (p.long ? p.groundLong.bind(p) : p.ground.bind(p))((a, b, px) => {
    const e = Math.min(a, b, 1 - a, 1 - b);
    // The outer ring stays bare, so the ink pass's outline lands on the lot's own rim, not the next tile.
    if (e < px) return null;
    if (e < 2 * px) return '#8e8579';
    if (verge && (a < 4 * px || b < 4 * px)) return (Math.floor(a / px) + Math.floor(b / px)) % 3 ? '#78993f' : '#84a748';
    const slab = (Math.floor(a * 6) + Math.floor(b * 6)) % 2;
    const joint = (a * 6) % 1 < px * 6 || (b * 6) % 1 < px * 6;
    return joint ? '#b0a592' : slab ? '#cfc4b0' : '#c6baa5';
  });
}

/** A pot plant on the ground at (x, y): a terracotta pot and a leafy crown. big is a taller palm-like crown. */
export function pot(p: Painter, x: number, y: number, big = false): void {
  p.id++;
  for (const [e, d] of [[0, 0], [1, 0], [0, 1], [1, 1]]) dot(p, x + e, y - d, e ? 'R' : 'o');
  p.id++;
  const crown: [number, number, string][] = big
    ? [[0, 2, 'G'], [1, 2, 'g'], [-1, 3, 'G'], [0, 3, 'g'], [1, 3, 'g'], [2, 3, 'G'], [-1, 4, 'g'], [0, 4, 'G'], [1, 4, 'g'], [2, 4, 'g'], [0, 5, 'g'], [1, 5, 'G'], [-2, 5, 'g'], [3, 4, 'G']]
    : [[0, 2, 'G'], [1, 2, 'g'], [-1, 3, 'g'], [0, 3, 'g'], [1, 3, 'G'], [2, 3, 'g'], [0, 4, 'g']];
  for (const [e, d, c] of crown) dot(p, x + e, y - d, c);
}

/** A plastic ember or drum, 3 wide: blue by default. */
export function ember(p: Painter, x: number, y: number, c = 'b', shade = 'B'): void {
  p.id++;
  for (let d = 0; d < 3; d++) for (let e = 0; e < 3; e++) dot(p, x + e, y - d, d === 2 ? (e === 1 ? shade : c) : e === 2 ? shade : c);
}

/** A tandon air on a steel frame: an orange tank with a light lid, lifted z off the ground. */
export function tandon(p: Painter, x: number, y: number, z: number): void {
  p.id++;
  for (let d = 0; d < z; d++) for (const e of [0, 3]) dot(p, x + e, y - d, 'S');
  p.id++;
  for (let d = 0; d < 4; d++) for (let e = 0; e < 4; e++) dot(p, x + e, y - z - d, d === 3 ? (e === 0 || e === 3 ? 'o' : 'h') : e === 3 ? 'R' : e === 0 ? 'm' : 'o');
}

/** A motor parked side-on: two dark wheels, a red body and a seat. */
export function motor(p: Painter, x: number, y: number, body = 'r'): void {
  p.id++;
  for (const e of [0, 4]) {
    dot(p, x + e, y, 'k');
    dot(p, x + e, y - 1, 'k');
  }
  p.id++;
  for (let e = 0; e < 5; e++) dot(p, x + e, y - 2, e === 4 ? 'S' : body);
  for (const e of [1, 2]) dot(p, x + e, y - 3, 'k');
  dot(p, x + 4, y - 3, 'S');
}

const CLOTHES = ['#e57a9c', '#3d72b4', '#f6ecd4', '#f4b935', '#df4a2c', '#82bfdc'];

/**
 * A jemuran: a line strung between two posts from lot point (a0, b) to (a1, b), up art pixels high,
 * with clothes hanging off it. Drawn after the ink pass, so the line stays one pixel thin.
 */
export function jemuran(p: Painter, a0: number, a1: number, b: number, up: number, along: 'a' | 'b' = 'a'): void {
  p.overlay.push((q) => {
    const pt = (t: number, h: number) => (along === 'a' ? at(q, a0 + (a1 - a0) * t, b, h) : at(q, b, a0 + (a1 - a0) * t, h));
    for (const t of [0, 1]) for (let h = 0; h <= up; h++) {
      const [x, y] = pt(t, h);
      q.px(Math.round(x), Math.round(y), '#6d635a');
    }
    const steps = 24;
    for (let k = 0; k <= steps; k++) {
      const t = k / steps;
      const sag = Math.round(Math.sin(t * Math.PI));
      const [x, y] = pt(t, up);
      const X = Math.round(x), Y = Math.round(y) + sag;
      q.px(X, Y, '#6d635a');
      if (k > 1 && k < steps - 1 && k % 3 !== 0) {
        const c = CLOTHES[Math.floor(k / 3) % CLOTHES.length];
        for (let d = 1; d <= 2 + (Math.floor(k / 3) % 2); d++) q.px(X, Y + d, c);
      }
    }
  });
}

/**
 * A TV antenna on its mast, standing at (x, y) art pixels from the ground centre, len tall, drawn
 * after the ink pass and only where nothing else is drawn, so it rises from behind the roof.
 */
export function antenna(p: Painter, x: number, y: number, len: number): void {
  p.overlay.push((q) => {
    const X = Math.round(q.gx + x * q.n);
    const Y = Math.round(q.gy + y * q.zs);
    const free = (px: number, py: number) => px >= 0 && py >= 0 && px < q.w && py < q.h && q.data[(py * q.w + px) * 4 + 3] === 0;
    const put = (px: number, py: number, c: string) => free(px, py) && q.px(px, py, c);
    for (let k = 0; k < len; k++) {
      if (!free(X, Y - len + k)) break;
      q.px(X, Y - len + k, '#5c544c');
    }
    for (const [d, w] of [[1, 3], [3, 2], [5, 1]]) for (let e = -w; e <= w; e++) put(X + e, Y - len + d, '#5c544c');
  });
}
