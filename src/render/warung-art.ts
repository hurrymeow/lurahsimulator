import type { Painter } from './iso';

// Warung Sembako art, one look per level: makeshift at level 1, built to last at level 3 (ART.md,
// Building levels). Level 1 is a warung tenda under a red-and-white striped terpal, level 2 a
// gerobak parked under a zinc lean-to, level 3 a brick toko kelontong. Each leans on what says
// "warung" at a glance in Indonesia: rentengan sachet strips hanging along the front, a yellow sign,
// a blue galon, a green LPG melon, crates and a bench. Only `import type` from iso.ts.

const TW = 32;
const TH = 16;
const TOP = 40;
const within = (v: number, lo: number, hi: number) => v >= lo && v < hi;

/** Ground centre in one-tile art pixels; stroke and set offsets below are from here, y down. */
const GX = TW / 2;
const GY = TOP + TH / 2;

/** Rentengan: strips of coffee and shampoo sachets hanging from an eave, 1px wide, alternating colours. */
function sachets(p: Painter, x0: number, y0: number, n: number, step: [number, number], len = 4): void {
  const COLS = ['y', 'p', 'r', 'c', 'o', 'a'];
  p.id++;
  for (let k = 0; k < n; k++) {
    const x = x0 + k * step[0];
    const y = y0 + k * step[1];
    const c = COLS[(k * 5 + 1) % COLS.length];
    for (let d = 0; d < len - (k % 2); d++) p.set(GX + x, GY + y + d, d % 2 ? 'w' : c);
  }
}

/** A blue galon water jug, 3 wide and 5 tall, standing at ground offset (x, y). */
function galon(p: Painter, x: number, y: number): void {
  p.id++;
  for (let d = 0; d < 5; d++) for (let e = 0; e < 3; e++) p.set(GX + x + e, GY + y - d, d === 4 ? (e === 1 ? 'B' : null) : e === 2 ? 'b' : 'l');
}

/** A green 3 kg LPG "melon" with its valve. */
function lpg(p: Painter, x: number, y: number): void {
  p.id++;
  for (let d = 0; d < 3; d++) for (let e = 0; e < 3; e++) p.set(GX + x + e, GY + y - d, e === 2 ? 'G' : 'g');
  p.set(GX + x + 1, GY + y - 3, 'S');
}

/** A red plastic stool. */
function stool(p: Painter, x: number, y: number): void {
  p.id++;
  for (let e = 0; e < 3; e++) p.set(GX + x + e, GY + y - 2, 'r');
  p.set(GX + x, GY + y - 1, 'R');
  p.set(GX + x + 2, GY + y - 1, 'R');
}

/** A wooden bench along the front left, 1px seat on two legs. */
function bench(p: Painter, x: number, y: number, len: number): void {
  p.id++;
  for (let k = 0; k < len; k++) p.set(GX + x + k, GY + y + Math.floor(k / 2) - 2, 'n');
  p.set(GX + x, GY + y - 1, 'N');
  p.set(GX + x + len - 1, GY + y + Math.floor((len - 1) / 2) - 1, 'N');
}

/** A yellow sign plate with a red stripe, w wide, at offset (x, y) top-left. Reads as WARUNG from afar. */
function sign(p: Painter, x: number, y: number, w: number, slope = 0): void {
  p.id++;
  for (let k = 0; k < w; k++)
    for (let d = 0; d < 3; d++) p.set(GX + x + k, GY + y + d + Math.floor(k * slope), d === 1 ? (k % 2 ? 'r' : 'y') : 'y');
}

/** A wooden push cart on two spoked wheels, a glass case of snacks on top, lifted z off the ground. */
function cart(p: Painter, z: number, wood: string): void {
  p.id++;
  for (const [x, y] of [[-6, 1], [2, 5]]) {
    for (const [e, d] of [[1, 0], [0, 1], [2, 1], [1, 2]]) p.set(GX + x + e, GY + y - d, 'S');
    p.set(GX + x + 1, GY + y - 1, 'n');
  }
  p.box(5, 5, wood, (face, u, j) => (face === 'L' && j === 2 && within(u, 0.1, 0.9) ? 'y' : undefined), z);
  p.box(6, 3, 'l', (face, _u, j, i) => {
    if (face === 'T') return 'c';
    if (j === 0) return 'S';
    return (i + j) % 3 === 0 ? 'o' : (i + j) % 3 === 1 ? 'y' : undefined;
  }, z + 5);
}

/**
 * Level 1, the warung tenda: a red-and-white striped terpal pitched as a gable over bamboo poles, a
 * plank counter of crates inside with packets on top, sachets along the eave and a red stool.
 */
function tenda(p: Painter): void {
  p.shadow(3);
  for (const [x, y] of [[-10, 0], [10, 0], [0, 5], [0, -5]]) p.stroke(x, y, x, y - 13, 1, 'a');
  p.box(6, 5, 'n', (face, _u, j, i) => (face !== 'T' && j === 2 ? 'N' : face !== 'T' && i % 4 === 0 ? 'N' : undefined));
  p.box(7, 2, 'y', (face, _u, _j, i) => (face === 'T' ? (i % 2 ? 'p' : 'c') : undefined), 5);
  p.roofShape('gable', 3, 13, 5, 'r', 't', (x) => (Math.floor(x / 2) % 2 ? 'w' : undefined));
  sachets(p, -11, -12, 6, [2, 1]);
  stool(p, 5, 3);
}

/**
 * Level 2, the gerobak: the cart parked under a corrugated zinc lean-to with a plank back wall, a
 * bench, a galon and an LPG melon.
 */
function gerobak(p: Painter): void {
  // Smaller and lower than the level 3 toko: a short plank back wall and a low zinc lean-to over the cart.
  p.shadow(3);
  p.box(3, 9, 'n', (face, u) => (face === 'L' && u > 0.08 ? null : face === 'R' && u < 0.92 ? null : undefined));
  cart(p, 1, 'n');
  p.roofShape('shed', 3, 10, 3, 's', 't', (x) => (x % 2 ? 'S' : undefined));
  sachets(p, -10, -9, 6, [2, 1], 3);
  galon(p, 6, 2);
  lpg(p, 10, 0);
  bench(p, -8, 1, 5);
}

/**
 * Level 3, the toko kelontong: whitewashed brick under a flat dak with a big yellow nameboard on the
 * parapet, a blue rolling door half up over shelves of goods, a side window, crates and an LPG melon
 * out front and a bench.
 */
function kelontong(p: Painter): void {
  p.shadow(2);
  p.box(2, 13, 'w', (face, u, j, i) => {
    if (face === 'T') return undefined;
    if (j >= 10) return 'y';
    if (face === 'L' && within(u, 0.1, 0.9) && j < 9) {
      if (j >= 5) return i % 2 ? 'b' : 'B';
      return j === 0 ? 'k' : (i + j) % 3 === 0 ? 'y' : (i + j) % 3 === 1 ? 'r' : 'c';
    }
    if (face === 'R' && within(u, 0.3, 0.7) && within(j, 3, 8)) return j === 3 ? 'n' : 'l';
    return j === 0 ? 'S' : undefined;
  });
  p.roofShape('flat', 2, 13, 0, 's', 'w');
  sign(p, -13, -18, 12, 0.5);
  sachets(p, -13, -5, 7, [2, 1], 3);
  p.box(9, 3, 'n', (face, _u, j) => (face !== 'T' && j === 1 ? 'N' : undefined));
  lpg(p, 9, 1);
  bench(p, 1, 4, 5);
}

/** The Warung Sembako at a level, 1 to 3. */
export function warungArt(p: Painter, level: number): void {
  if (level <= 1) tenda(p);
  else if (level === 2) gerobak(p);
  else kelontong(p);
}
