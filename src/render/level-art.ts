import type { Painter } from './iso';
import { at, canopyTree, pole, unit, win } from './kampung-art';
import { prism, roofRect, type MassPaint } from './massing';
import { flagAt, flowers, frontFence, garuda, gateway, noticeBoard } from './sign-art';
import { antenna, motor, pavedLot, pot, rustyPatch } from './kampung-kit';

// Level art, third silhouette pass (playtest 2026-11-07): every building here changes shape by level,
// not just colour. Level 1 is the smallest and plainest, level 3 the biggest and busiest: it adds a wing,
// a porch, a second roof tier, a sign or a yard. References scouted for the pass: semi-open los sheds
// under truncated limasan and two-tier joglo roofs with zinc and sawtooth vents for the pasar; a gapura
// and wide tritisan eaves for the kantor; a pustu as a small house with a waiting room; a type C
// terminal as platform canopies with angkot and buses; a baliho as a steel frame on legs by the road.
// Only `import type` from iso.ts, so there is no import cycle.

const within = (v: number, lo: number, hi: number) => v >= lo && v < hi;
type Art = (p: Painter, variant?: string, level?: number) => void;

const ZINC = '#b9c2c6';
const ZINC_RIB = '#8f999e';
const ZINC_SHINE = '#e2e8ea';
const zinc = (x: number) => (x % 3 === 0 ? ZINC_RIB : x % 3 === 1 ? ZINC_SHINE : undefined);

/** A plain wall: a plinth course at the bottom, a door on the front-left between u0 and u1, windows between rows j0 and j1. */
const wall = (door: [number, number] | null, j0: number, j1: number, opts: { plinth?: string; band?: [number, string]; glass?: string; doorC?: string } = {}): MassPaint => (face, u, j, i) => {
  if (face === 'T') return undefined;
  if (j === 0) return opts.plinth ?? 'S';
  if (opts.band && j === opts.band[0]) return opts.band[1];
  if (door && face === 'L' && within(u, door[0], door[1]) && j < j1) return opts.doorC ?? 'k';
  return win(u, j, i, j0, j1, opts.glass);
};

/** A flag on a pole at ground (a, b): merah putih. */
function flag(p: Painter, a: number, b: number, h: number): void {
  pole(p, a, b, h, 'S');
  prism(p, a, a + 0.06, b - 0.01, b + 0.01, 1, 'r', (face) => (face === 'T' ? 'r' : undefined), h - 2);
  prism(p, a, a + 0.06, b - 0.01, b + 0.01, 1, 'w', (face) => (face === 'T' ? 'w' : undefined), h - 3);
}

/** A row of umbul-umbul: tall bamboo poles with long coloured pennants, along b at a. */
function umbul(p: Painter, pts: [number, number][], h: number): void {
  const cols = ['r', 'y', 'b', 'g', 'p'];
  pts.forEach(([a, b], k) => {
    pole(p, a, b, h, 'a');
    prism(p, a, a + 0.015, b - 0.015, b + 0.015, 5, cols[k % cols.length], undefined, h - 6);
  });
}

/** A bus along a: a long box with a window band, a white roof and dark wheel arches. */
function bus(p: Painter, a0: number, a1: number, b0: number, b1: number, body: string, stripe = 'w'): void {
  prism(p, a0, a1, b0, b1, 5, body, (face, u, j, i) => {
    if (face === 'T') return 'w';
    if (j === 0) return (face === 'L' && (within(u, 0.12, 0.22) || within(u, 0.76, 0.86))) ? 'k' : 'S';
    if (j === 1) return stripe;
    if (within(j, 3, 5)) return face === 'R' ? 'c' : i % 4 === 0 ? body : 'c';
    return undefined;
  }, 1);
}

/** An angkot along a: a short minibus in its route colour. */
const angkot = (p: Painter, a0: number, b0: number, body: string) => bus(p, a0, a0 + 0.14, b0, b0 + 0.06, body, 'y');

/** An open-sided shed: posts at its corners and along its long sides, a roof over them. */
function shed(p: Painter, a0: number, a1: number, b0: number, b1: number, h: number, rise: number, kind: 'hip' | 'gableA' | 'gableB' | 'shed' | 'flat', roof: string, paint?: (x: number, y: number) => string | undefined, postC = 'S'): void {
  const t = 1.2 * unit(p);
  for (const a of [a0, (a0 + a1) / 2, a1 - t]) for (const b of [b0, b1 - t]) prism(p, a, a + t, b, b + t, h, postC);
  roofRect(p, a0, a1, b0, b1, h, rise, kind, roof, 'w', paint, 0.03);
}

/** Market stalls under a shed: low counters with goods in bright heaps. */
function stalls(p: Painter, a0: number, a1: number, b0: number, b1: number): void {
  const goods = ['o', 'r', 'g', 'y', 'p'];
  const n = Math.max(2, Math.round((a1 - a0) * 8));
  for (let k = 0; k < n; k++) {
    const a = a0 + ((a1 - a0) * k) / n;
    prism(p, a + 0.01, a + (a1 - a0) / n - 0.01, b0, b1, 2, 'n', (face) => (face === 'T' ? goods[k % goods.length] : undefined));
  }
}

// ---------------------------------------------------------------- RT

/** Rumah Makan level 1: a warung makan, a small plank stall with an open counter of pots, a printed spanduk and a bench. */
export const warungMakan: Art = (p) => {
  p.shadow(5);
  prism(p, 0.3, 0.72, 0.3, 0.7, 7, 'n', (face, u, j, i) => {
    if (face === 'T') return undefined;
    if (face === 'L' && within(u, 0.06, 0.94)) {
      if (j < 3) return i % 3 === 0 ? 'N' : 'n';
      if (j === 3) return i % 3 === 0 ? 's' : i % 3 === 1 ? 'S' : 'o';
      return 'k';
    }
    return i % 3 === 0 ? 'N' : undefined;
  });
  roofRect(p, 0.26, 0.76, 0.26, 0.82, 7, 3, 'shed', 'o', 'n', (x) => (x % 3 === 0 ? 'y' : undefined), 0);
  // The spanduk under the eave: white with red and blue lettering, the menu painted on it.
  prism(p, 0.3, 0.72, 0.78, 0.8, 2, 'w', (face, _u, j, i) => (face === 'T' ? 'w' : j === 1 ? (i % 3 ? 'r' : 'w') : i % 4 < 2 ? 'b' : 'w'), 5);
  prism(p, 0.34, 0.66, 0.84, 0.9, 2, 'n', (face) => (face === 'T' ? 't' : undefined));
};

/** Pos Satpam: a wooden booth, then a blue booth with a barrier, then a concrete post with a flat roof, a canopy over the lane, a lamp and a camera. */
export const posSatpam: Art = (p, _v, level = 1) => {
  if (level <= 1) {
    p.shadow(6);
    prism(p, 0.34, 0.66, 0.34, 0.66, 7, 'n', (face, u, j) => (face === 'L' && within(u, 0.2, 0.8) && within(j, 3, 6) ? 'l' : undefined));
    roofRect(p, 0.34, 0.66, 0.34, 0.66, 7, 2, 'shed', 's', 'n', (x) => (x % 2 ? 'S' : undefined));
    return;
  }
  if (level === 2) {
    p.shadow(5);
    prism(p, 0.3, 0.7, 0.3, 0.7, 8, 'b', (face, u, j) => (face === 'L' && within(u, 0.15, 0.85) && within(j, 3, 6) ? 'l' : face === 'R' && within(u, 0.3, 0.7) && j < 6 ? 'k' : undefined));
    roofRect(p, 0.3, 0.7, 0.3, 0.7, 8, 3, 'hip', 'B', 'b');
    prism(p, 0.08, 0.3, 0.8, 0.84, 1, 'w', (face, u) => (face === 'T' ? undefined : Math.floor(u * 6) % 2 ? 'r' : 'w'), 4);
    pole(p, 0.3, 0.82, 5, 'S');
    return;
  }
  p.shadow(3);
  prism(p, 0.4, 0.82, 0.14, 0.6, 9, 'w', (face, u, j) => {
    if (face === 'T') return undefined;
    if (j < 2) return 'b';
    if (face === 'L' && within(u, 0.1, 0.9) && within(j, 4, 8)) return 'l';
    if (face === 'R' && within(u, 0.3, 0.7) && j < 7) return 'k';
    return undefined;
  });
  roofRect(p, 0.38, 0.84, 0.12, 0.62, 9, 0, 'flat', 's', 'w', undefined, 0.02);
  // The canopy over the lane on two posts, the barrier under it.
  pole(p, 0.12, 0.84, 7, 'S');
  pole(p, 0.4, 0.84, 7, 'S');
  roofRect(p, 0.1, 0.44, 0.6, 0.88, 7, 0, 'flat', 'B', 'b', undefined, 0);
  prism(p, 0.1, 0.4, 0.74, 0.77, 1, 'w', (face, u) => (face === 'T' ? undefined : Math.floor(u * 6) % 2 ? 'r' : 'w'), 3);
  // A lamp and a camera on a pole by the front.
  pole(p, 0.88, 0.7, 12, 'S');
  prism(p, 0.86, 0.92, 0.68, 0.72, 1, 'y', undefined, 11);
};

/** Gudang Material: a small zinc shed, then a long shed with an open bay in its roof, then the full yard with two open bays and a lean-to. */
export const gudangMaterial: Art = (p, _v, level = 1) => {
  p.low();
  const [a0, a1, b0, b1] = level <= 1 ? [0.22, 0.78, 0.22, 0.78] : level === 2 ? [0.1, 0.9, 0.12, 0.88] : [0.04, 0.96, 0.04, 0.96];
  p.shadow(level <= 1 ? 4 : 2);
  prism(p, a0, a1, b0, b1, 1, 's', (face) => (face === 'T' ? 's' : 'S'));
  const t = 1.6 * unit(p);
  const bay = (u: number, j: number) => (j >= 4 && j <= 7 && Math.floor(u * 6) % 2 === 1 ? 'k' : undefined);
  prism(p, a0 + 0.02, a1 - 0.02, b0 + 0.02, b0 + 0.02 + t, 10, 'w', (face, u, j) => (face === 'T' ? 'S' : bay(u, j)), 1);
  prism(p, a0 + 0.02, a0 + 0.02 + t, b0 + 0.02, b1 - 0.02, 10, 'w', (face, u, j) => (face === 'T' ? 'S' : bay(u, j)), 1);
  const A = (f: number) => a0 + (a1 - a0) * f;
  const B = (f: number) => b0 + (b1 - b0) * f;
  // The stock: bricks, semen, a sand heap, pipes. More of it as the yard grows.
  prism(p, A(0.12), A(0.42), B(0.12), B(0.36), 5, 'r', (face, _u, j, i) => (face === 'T' ? 'R' : (j + (i % 4 < 2 ? 0 : 1)) % 2 ? 'R' : undefined), 1);
  prism(p, A(0.5), A(0.86), B(0.12), B(0.34), 3, 'w', (face, _u, _j, i) => (face === 'T' ? 'w' : i % 3 === 0 ? 's' : undefined), 1);
  if (level >= 2) roofRect(p, A(0.12), A(0.44), B(0.48), B(0.82), 1, 3, 'hip', 't', 't', undefined, 0);
  if (level >= 3) prism(p, A(0.56), A(0.88), B(0.56), B(0.64), 2, 'S', (face, _u, _j, i) => (face === 'L' && i % 2 ? 'k' : undefined), 1);
  for (const [a, b] of [[a1 - 0.02 - t, b1 - 0.02 - t], [a1 - 0.02 - t, b0 + 0.02], [a0 + 0.02, b1 - 0.02 - t], [(a0 + a1) / 2, b1 - 0.02 - t]] as [number, number][])
    prism(p, a, a + t, b, b + t, 10, 'S', undefined, 1);
  prism(p, a0 + 0.02, a1 - 0.02, b1 - 0.02 - t, b1 - 0.02, 3, 'w', (face, u) => (face === 'L' && within(u, 0.42, 0.58) ? null : undefined), 1);
  // The roof: whole at level 1. From level 2 a bay is left open to the sky, its purlins showing.
  const gaps = level <= 1 ? [] : level === 2 ? [[0.44, 0.56]] : [[0.3, 0.4], [0.62, 0.72]];
  let from = 0;
  for (const [g0, g1] of [...gaps, [1, 1]]) {
    roofRect(p, A(from), A(g0), b0, b1, 11, 5, 'gableA', ZINC, 'w', zinc, from === 0 || g0 === 1 ? 0.03 : 0);
    if (g0 < 1) {
      // Open bay: the ridge beam and two purlins run across it.
      for (const f of [0.2, 0.5, 0.8]) prism(p, A(g0), A(g1), B(f) - 0.006, B(f) + 0.006, 1, 'N', undefined, 11 + 5 * (1 - Math.abs(f - 0.5) * 2) - 1);
    }
    from = g1;
  }
  if (level >= 3) {
    // A lean-to on the right for the pick-up, and the pick-up under it.
    roofRect(p, 0.82, 0.98, 0.3, 0.9, 7, 2, 'shed', ZINC, 'w', zinc, 0);
  }
};

/** PAUD: a front room in a pink house with a slide, then a classroom and a play yard, then an L-shaped school with swings, a seesaw and a painted fence. */
export const paud: Art = (p, _v, level = 1) => {
  p.low();
  p.shadow(2);
  const roofs = ['y', 'r', 'b'];
  const slide = (a: number, b: number) => {
    prism(p, a, a + 0.06, b, b + 0.06, 4, 'b');
    prism(p, a + 0.06, a + 0.22, b + 0.01, b + 0.05, 1, 'r', (face) => (face === 'T' ? 'y' : undefined), 1);
  };
  const swing = (a: number, b: number) => {
    pole(p, a, b, 7, 'r');
    pole(p, a + 0.2, b, 7, 'r');
    prism(p, a, a + 0.2, b - 0.01, b + 0.01, 1, 'r', undefined, 7);
    pole(p, a + 0.1, b, 3, 'S', 3);
  };
  // From level 1 a PAUD is a children's place: a rainbow fence, flower beds, a painted band of colour
  // round the walls and the school mascot, a smiling yellow bear on a plinth by the gate.
  const rainbow = (_j: number, i: number) => ['r', 'o', 'y', 'g', 'b'][Math.floor(i / 2) % 5];
  const mascot = (a: number, b: number) => {
    const t = unit(p);
    prism(p, a, a + 4 * t, b, b + 3 * t, 1, 'e');
    prism(p, a + 0.5 * t, a + 3.5 * t, b + 0.5 * t, b + 2.5 * t, 3, 'y', (face, _u, j) => (j === 1 && face === 'L' ? 'w' : undefined), 1);
    prism(p, a + 0.5 * t, a + 3.5 * t, b + 0.5 * t, b + 2.5 * t, 3, 'y', (face, u, j) => (face === 'L' && j === 1 && (u < 0.3 || u > 0.7) ? 'k' : face === 'L' && j === 0 && within(u, 0.3, 0.7) ? 'r' : undefined), 4);
    prism(p, a + 0.5 * t, a + 1.3 * t, b + 1 * t, b + 1.8 * t, 1, 'o', undefined, 7);
    prism(p, a + 2.7 * t, a + 3.5 * t, b + 1 * t, b + 1.8 * t, 1, 'o', undefined, 7);
  };
  frontFence(p, ['#df4a2c', '#f4b935', '#3d72b4', '#86b84c'], [0.38, 0.52], 3);
  flowers(p, 0.06, 0.4, 0.82, 0.94, 14);
  flowers(p, 0.82, 0.94, 0.1, 0.6, 10);
  if (level <= 1) {
    prism(p, 0.2, 0.62, 0.2, 0.62, 7, 'p', (face, u, j, i) => (face !== 'T' && j === 5 ? rainbow(j, i) : wall([0.55, 0.75], 2, 5, { doorC: 'c' })(face, u, j, i)));
    roofRect(p, 0.2, 0.62, 0.2, 0.62, 7, 5, 'gableB', 'y', 'p');
    slide(0.62, 0.72);
    mascot(0.26, 0.74);
    return;
  }
  // The main classroom.
  prism(p, 0.08, 0.62, 0.1, 0.56, 8, 'p', (face, u, j, i) => (face !== 'T' && j === 7 ? rainbow(j, i) : wall([0.4, 0.55], 2, 6, { doorC: 'c' })(face, u, j, i)));
  mascot(0.2, 0.7);
  roofRect(p, 0.08, 0.62, 0.1, 0.56, 8, 5, 'gableB', 'y', 'p', (x) => (Math.floor(x / 4) % 2 ? 'o' : undefined));
  if (level >= 3) {
    // A second classroom along the right, in its own colour, making an L.
    prism(p, 0.62, 0.92, 0.1, 0.62, 8, 'c', wall([0.3, 0.5], 2, 6, { band: [7, 'r'] }));
    roofRect(p, 0.62, 0.92, 0.1, 0.62, 8, 4, 'gableA', roofs[2], 'c');
    swing(0.66, 0.78);
    // A seesaw.
    prism(p, 0.2, 0.42, 0.8, 0.83, 1, 'y', undefined, 1);
    prism(p, 0.3, 0.32, 0.8, 0.83, 1, 'S');
  }
  slide(level >= 3 ? 0.5 : 0.66, level >= 3 ? 0.66 : 0.66);
};

/** Koperasi (RT): a shopfront, then a zinc warehouse behind it, then a loading canopy, a pick-up and a sign pylon. */
export const koperasi: Art = (p, _v, level = 1) => {
  p.low();
  p.shadow(2);
  if (level >= 2) {
    prism(p, 0.06, 0.94, 0.06, 0.44, 8, 's', (face, u, j) => (face === 'L' && within(u, 0.66, 0.9) && j < 6 ? (j % 2 ? 'S' : 's') : undefined));
    roofRect(p, 0.06, 0.94, 0.06, 0.44, 8, 3, 'gableA', ZINC, 's', zinc);
  }
  const [a0, a1, b0, b1] = level <= 1 ? [0.2, 0.7, 0.36, 0.86] : [0.06, 0.6, 0.44, 0.92];
  prism(p, a0, a1, b0, b1, 7, 'w', wall([0.4, 0.58], 2, 5, { band: [6, 'y'] }));
  roofRect(p, a0, a1, b0, b1, 7, 4, 'hip', 'b', 'w');
  if (level >= 2) for (const [a, b] of [[0.68, 0.6], [0.78, 0.66]] as [number, number][]) prism(p, a, a + 0.1, b, b + 0.08, 2, 'w', (face) => (face === 'T' ? 't' : undefined));
  if (level < 3) return;
  // The loading canopy and a pick-up under it, and the koperasi pylon at the corner.
  pole(p, 0.66, 0.9, 6, 'S');
  pole(p, 0.92, 0.9, 6, 'S');
  roofRect(p, 0.64, 0.94, 0.48, 0.92, 6, 0, 'flat', 'b', 'w', undefined, 0);
  bus(p, 0.7, 0.88, 0.74, 0.84, 'w', 'b');
  pole(p, 0.96, 0.98, 10, 'S');
  prism(p, 0.9, 0.99, 0.96, 0.99, 3, 'y', (face) => (face === 'L' ? 'g' : undefined), 8);
};

/**
 * Kontrakan: level 1 is the one-storey L, an orange wing and a white row of petak under red shed roofs.
 * Level 2 is a two-storey kontrakan in an L: units below, an upper floor with a walkway
 * and railing along its front, a steel stair, a tandon on the roof, a jemuran and motorbikes in the yard.
 */
export const kontrakan: Art = (p, _v, level = 1) => {
  p.low();
  // A paved yard, red tile throughout with one narrow sheet of rusty seng on the back wing, the antenna, pots.
  pavedLot(p);
  p.shadow(level <= 1 ? 3 : 1);
  // The back wing along b, then the main block along a, two floors each.
  const unit = (face: string, u: number, j: number, i: number, wallC: string) => {
    if (face === 'T') return undefined;
    if (j === 0 || j === 6) return 'S';
    const f = j < 6 ? j : j - 6;
    // Each petak's own door colour: blue, green, brown, red.
    if (face === 'L' && Math.floor(u * 4) % 2 === 0 && within((u * 4) % 1, 0.3, 0.7) && f < 5 && f > 0) return ['b', 'G', 'N', 'r'][(Math.floor(u * 8) + (j >= 6 ? 1 : 0)) % 4];
    if (within(f, 2, 4) && i % 5 >= 3) return 'l';
    return wallC === 'w' ? undefined : undefined;
  };
  if (level <= 1) {
    // The same L as level 2, one storey: an orange back wing and a white row of petak under red shed roofs,
    // a terrace slab along the doors, a jemuran and a motor in the yard. Level 2 builds the floor above.
    prism(p, 0.1, 0.34, 0.12, 0.6, 6, 'o', (face, u, j, i) => unit(face, u, j, i, 'o'));
    roofRect(p, 0.1, 0.34, 0.12, 0.6, 6, 2, 'shed', 'R', 'o', rustyPatch(12, 15), 0.02);
    prism(p, 0.34, 0.9, 0.12, 0.46, 6, 'w', (face, u, j, i) => unit(face, u, j, i, 'w'));
    roofRect(p, 0.34, 0.9, 0.12, 0.46, 6, 2, 'shed', 'R', 'w', undefined, 0.02);
    antenna(p, 4, -10, 14);
    prism(p, 0.34, 0.9, 0.46, 0.52, 1, 's');
    pole(p, 0.2, 0.84, 5, 'S');
    pole(p, 0.5, 0.84, 5, 'S');
    p.overlay.push((q) => {
      const cl = ['#e57a9c', '#f4b935', '#f6ecd4', '#3d72b4', '#df4a2c'];
      for (let k = 0; k < 10; k++) {
        const [x, y] = at(q, 0.2 + k * 0.03, 0.84, 5);
        q.px(Math.round(x), Math.round(y), '#6d635a');
        if (k % 2) for (let d = 1; d <= 2; d++) q.px(Math.round(x), Math.round(y) + d, cl[k % cl.length]);
      }
    });
    motor(p, 8, 8);
    for (const x of [-6, 2, 10]) pot(p, x, 2 + Math.round(x / 2));
    return;
  }
  prism(p, 0.06, 0.34, 0.06, 0.62, 11, 'o', (face, u, j, i) => unit(face, u, j, i, 'o'));
  roofRect(p, 0.06, 0.34, 0.06, 0.62, 11, 2, 'shed', 'R', 'o', rustyPatch(11, 14), 0.02);
  prism(p, 0.34, 0.96, 0.06, 0.46, 11, 'w', (face, u, j, i) => unit(face, u, j, i, 'w'));
  roofRect(p, 0.34, 0.96, 0.06, 0.46, 11, 2, 'shed', 'R', 'w', undefined, 0.02);
  antenna(p, 6, -14, 11);
  // The upper walkway: a slab and a railing along the front of the main block.
  prism(p, 0.34, 0.96, 0.46, 0.54, 1, 's', undefined, 6);
  p.overlay.push((q) => {
    for (let k = 0; k <= 30; k++) {
      const [x, y] = at(q, 0.34 + k * 0.02, 0.54, 9);
      q.px(Math.round(x), Math.round(y), '#6d635a');
      if (k % 3 === 0) for (let d = 1; d <= 2; d++) q.px(Math.round(x), Math.round(y) + d, '#6d635a');
    }
  });
  // The steel stair up the right end, a tandon on the roof.
  for (let k = 0; k < 6; k++) prism(p, 0.9, 0.96, 0.56 + k * 0.03, 0.59 + k * 0.03, 1, 'S', undefined, 6 - k);
  prism(p, 0.08, 0.18, 0.12, 0.22, 3, 'b', (face) => (face === 'T' ? 'w' : undefined), 13);
  // The yard: a jemuran and two motorbikes.
  pole(p, 0.2, 0.84, 6, 'S');
  pole(p, 0.5, 0.84, 6, 'S');
  p.overlay.push((q) => {
    const cols = ['#e57a9c', '#f4b935', '#f6ecd4', '#3d72b4', '#df4a2c'];
    for (let k = 0; k < 10; k++) {
      const [x, y] = at(q, 0.2 + k * 0.03, 0.84, 6);
      q.px(Math.round(x), Math.round(y), '#6d635a');
      if (k % 2) for (let d = 1; d <= 2; d++) q.px(Math.round(x), Math.round(y) + d, cols[k % cols.length]);
    }
  });
  motor(p, -5, 12, 'k');
  motor(p, 2, 11);
  for (const x of [-8, -2]) pot(p, x, 5 + Math.round(x / 2), true);
};

/** Balai Warga: a small pendopo, then a big two-tier pendopo, then the pendopo with a kitchen annex, a stage and umbul-umbul. */
export const balaiWarga: Art = (p, _v, level = 1) => {
  p.low();
  p.shadow(1);
  if (level >= 3) {
    prism(p, 0.74, 0.96, 0.08, 0.44, 6, 't', (face, u, j) => (face === 'L' && within(u, 0.3, 0.6) && j < 5 ? 'N' : undefined));
    roofRect(p, 0.74, 0.96, 0.08, 0.44, 6, 2, 'shed', 's', 't', (x) => (x % 2 ? 'S' : undefined));
  }
  // From level 1 the balai has its own yard: a low white pagar round the front with a red gapura over the
  // gate, and the papan nama by it.
  frontFence(p, ['#f6ecd4', '#f6ecd4', '#bdb4a3'], [0.38, 0.56], 3);
  const [a0, a1, b0, b1] = level <= 1 ? [0.22, 0.74, 0.18, 0.72] : [0.06, 0.74, 0.1, 0.86];
  prism(p, a0, a1, b0, b1, 2, 's', (face) => (face === 'T' ? 'w' : 'S'));
  const cols = level <= 1 ? 2 : 3;
  for (let x = 0; x < cols; x++) for (let y = 0; y < cols; y++) pole(p, a0 + 0.04 + ((a1 - a0 - 0.08) * x) / (cols - 1), b0 + 0.04 + ((b1 - b0 - 0.08) * y) / (cols - 1), 7, 'N', 2);
  if (level >= 2) prism(p, a0 + 0.14, a1 - 0.14, b1 - 0.3, b1 - 0.24, 2, 'n', undefined, 2);
  roofRect(p, a0 - 0.04, a1 + 0.04, b0 - 0.04, b1 + 0.04, 9, 3, 'hip', 'R', 't', undefined, 0.02);
  if (level >= 2) {
    const ma = (a0 + a1) / 2;
    const mb = (b0 + b1) / 2;
    roofRect(p, ma - 0.16, ma + 0.16, mb - 0.2, mb + 0.2, 12, 4, 'hip', 'R', 't', (x, y) => ((x + y) % 5 === 0 ? 'r' : undefined), 0.01);
  }
  gateway(p, 0.38, 0.56, 0.96, 7);
  if (level >= 3) umbul(p, [[0.8, 0.6], [0.86, 0.72], [0.92, 0.84]], 14);
};

// ---------------------------------------------------------------- RW

/** Balai RW: a simple hall, then the hall and an office wing, then a teras, a flag and the notice board. */
export const balaiRW: Art = (p, _v, level = 1) => {
  p.low();
  p.shadow(1);
  frontFence(p, ['#f6ecd4', '#bdb4a3'], [0.3, 0.48], 3);
  // The hall first and the office wing after it: the wing stands further along a, so where they meet it is
  // the nearer of the two and must be drawn over the hall, not under it.
  const [a0, a1, b0, b1] = level <= 1 ? [0.16, 0.66, 0.2, 0.74] : [0.06, 0.6, 0.08, 0.7];
  const rise = level <= 1 ? 5 : 6;
  prism(p, a0, a1, b0, b1, 9, 'w', wall([0.42, 0.6], 3, 7, { band: [8, 'o'] }));
  roofRect(p, a0, a1, b0, b1, 9, rise, 'hip', 'o', 'w');
  // The sign of office from level 1: the merah putih on the ridge of the hall, taller as the balai grows.
  flagAt(p, (a0 + a1) / 2, (b0 + b1) / 2, 9 + rise, level <= 1 ? 10 : 11);
  if (level >= 2) {
    prism(p, 0.6, 0.94, 0.08, 0.52, 7, 't', wall([0.5, 0.7], 2, 5));
    roofRect(p, 0.6, 0.94, 0.08, 0.52, 7, 3, 'gableA', 'R', 't');
    // The Garuda over the hall door, in gold on the orange band.
    garuda(p, 0.33, b1, 8);
  }
  noticeBoard(p, 4, 0, 6, 4, 'N');
  if (level < 3) return;
  // A teras on posts before the hall door.
  for (const a of [0.24, 0.46]) pole(p, a, 0.84, 6, 'n');
  roofRect(p, 0.22, 0.48, 0.7, 0.84, 6, 2, 'shed', 'R', 'w', undefined, 0.01);
};

/** Pasar Kaget, 2x1: two lapak under umbrellas, then a row of stalls under one long striped tarp with lamps. */
export const pasarKaget: Art = (p, _v, level = 1) => {
  for (const u of [0, 1]) {
    p.at(u, 0);
    p.shadow(3);
    if (level <= 1) {
      // A lapak: a low table of goods under a payung on a pole.
      prism(p, 0.3, 0.7, 0.36, 0.64, 2, 'n', (face) => (face === 'T' ? (u ? 'g' : 'o') : undefined));
      pole(p, 0.5, 0.5, 9, 'S');
      roofRect(p, 0.26, 0.74, 0.26, 0.74, 9, 3, 'hip', u ? 'b' : 'r', 'w', (x) => (Math.floor(x / 2) % 2 ? 'w' : undefined), 0);
      continue;
    }
    stalls(p, 0.12, 0.88, 0.3, 0.7);
    for (const [a, b] of [[0.1, 0.2], [0.1, 0.8], [0.9, 0.2], [0.9, 0.8]]) pole(p, a, b, 9, 'a');
    roofRect(p, 0.04, 0.96, 0.14, 0.86, 9, 4, 'gableA', 'r', 'w', (x) => (Math.floor(x / 3) % 2 ? 'w' : undefined), 0.02);
    prism(p, 0.46, 0.5, 0.86, 0.88, 1, 'y', undefined, 8);
  }
};

/** Portal level 1: two short posts and a red-and-white boom. */
export const portal1: Art = (p) => {
  p.shadow(6);
  for (const [a0, a1] of [[0.14, 0.24], [0.76, 0.86]] as [number, number][]) prism(p, a0, a1, 0.46, 0.56, 7, 'S', (face) => (face === 'T' ? 's' : undefined));
  prism(p, 0.2, 0.8, 0.49, 0.53, 1, 'w', (face, u) => (face === 'T' ? undefined : Math.floor(u * 8) % 2 ? 'r' : 'w'), 5);
};

/** Gapura level 1: two slim painted posts and a banner, smaller than level 2's plinths, capitals and roof. */
export const gapura: Art = (p, _v, level = 1) => {
  p.shadow(3);
  const big = level >= 2;
  const L: [number, number] = big ? [0.06, 0.24] : [0.12, 0.26];
  const R: [number, number] = big ? [0.76, 0.94] : [0.74, 0.88];
  const b0 = big ? 0.42 : 0.44;
  const b1 = big ? 0.6 : 0.58;
  const z0 = big ? 2 : 0;
  const ph = 10;
  for (const [a0, a1] of [L, R]) {
    if (big) {
      prism(p, a0 - 0.04, a1 + 0.04, b0 - 0.04, b1 + 0.04, 1, 'S', (face) => (face === 'T' ? 's' : undefined));
      prism(p, a0 - 0.02, a1 + 0.02, b0 - 0.02, b1 + 0.02, 1, 's', undefined, 1);
    }
    prism(p, a0, a1, b0, b1, ph, 'w', (face, _u, j) => (face === 'T' ? undefined : big ? (j % 4 === 3 ? 'y' : 'R') : Math.floor(j / 3) % 2 ? 'r' : 'w'), z0);
    if (big) prism(p, a0 - 0.03, a1 + 0.03, b0 - 0.03, b1 + 0.03, 2, 'y', (face) => (face === 'T' ? 'a' : undefined), z0 + ph);
  }
  const zb = z0 + ph + (big ? 2 : 0);
  prism(p, L[0] - (big ? 0.04 : 0), R[1] + (big ? 0.04 : 0), b0 + 0.02, b1 - 0.02, big ? 3 : 2, 'r', (face, _u, j, i) => (face === 'T' ? 'w' : j === 1 ? (i % 3 ? 'y' : 'r') : j === 2 ? 'w' : undefined), zb);
  if (!big) return;
  roofRect(p, 0.0, 1.0, b0, b1, zb + 3, 2, 'gableA', 'R', 'y', undefined, 0.02);
  for (const a of [(L[0] + L[1]) / 2, (R[0] + R[1]) / 2]) pole(p, a, (b0 + b1) / 2, 1, 'y', zb + 5);
};

// ---------------------------------------------------------------- Kelurahan

/** Kantor Kelurahan: a plain office and a flagpole, then a gapura porch on the front, then a two-tier limasan block with wings, tritisan and a fence. */
export const kantorKel: Art = (p, _v, level = 1) => {
  p.low();
  p.shadow(1);
  if (level <= 1) {
    prism(p, 0.16, 0.76, 0.2, 0.72, 8, 'w', wall([0.42, 0.58], 3, 6));
    roofRect(p, 0.16, 0.76, 0.2, 0.72, 8, 5, 'hip', 'b', 'w');
    flag(p, 0.84, 0.86, 13);
    return;
  }
  if (level >= 3) {
    // Wings either side, under lower hips.
    prism(p, 0.04, 0.3, 0.12, 0.74, 7, 'w', wall(null, 2, 5));
    roofRect(p, 0.04, 0.3, 0.12, 0.74, 7, 3, 'hip', 'b', 'w');
    prism(p, 0.7, 0.96, 0.12, 0.74, 7, 'w', wall(null, 2, 5));
    roofRect(p, 0.7, 0.96, 0.12, 0.74, 7, 3, 'hip', 'b', 'w');
  }
  const [a0, a1] = level >= 3 ? [0.28, 0.72] : [0.12, 0.8];
  prism(p, a0, a1, 0.12, 0.7, 9, 'w', wall([0.4, 0.6], 3, 7, { band: [8, 't'] }));
  roofRect(p, a0, a1, 0.12, 0.7, 9, 4, 'hip', 'b', 'w', undefined, level >= 3 ? 0.06 : 0.03);
  if (level >= 3) roofRect(p, a0 + 0.1, a1 - 0.1, 0.24, 0.58, 13, 4, 'hip', 'b', 'w', undefined, 0.01);
  // The gapura porch: two pillars and a small pelana over the door.
  const pa = (a0 + a1) / 2;
  prism(p, pa - 0.12, pa - 0.08, 0.74, 0.86, 7, 'w');
  prism(p, pa + 0.08, pa + 0.12, 0.74, 0.86, 7, 'w');
  roofRect(p, pa - 0.14, pa + 0.14, 0.7, 0.88, 7, 3, 'gableB', 'R', 'w', undefined, 0);
  flag(p, 0.9, 0.88, 14);
  if (level >= 3) {
    p.overlay.push((q) => {
      for (let k = 0; k < 44; k++) {
        const [x, y] = at(q, 0.02 + k * 0.022, 0.97);
        if (Math.abs(0.02 + k * 0.022 - pa) < 0.08) continue;
        q.px(Math.round(x), Math.round(y) - 1, k % 3 ? '#f6ecd4' : '#6d635a');
        q.px(Math.round(x), Math.round(y) - 2, k % 3 ? '#f6ecd4' : '#6d635a');
      }
    });
  }
};

/** Puskesmas Pembantu: a pustu like a small house with the cross, then a waiting porch, then an exam wing, a drop-off canopy and an ambulance. */
export const puskesmasPembantu: Art = (p, _v, level = 1) => {
  p.low();
  p.shadow(2);
  const cross = (face: string, u: number, j: number) => face === 'R' && within(u, 0.4, 0.6) && within(j, 3, 8) ? (within(u, 0.47, 0.53) || within(j, 5, 6) ? 'r' : 'w') : undefined;
  if (level >= 3) {
    prism(p, 0.64, 0.94, 0.06, 0.5, 7, 'w', wall(null, 2, 5, { glass: 'c', plinth: 'c' }));
    roofRect(p, 0.64, 0.94, 0.06, 0.5, 7, 3, 'gableA', 'c', 'w');
  }
  const [a0, a1, b0, b1] = level <= 1 ? [0.2, 0.7, 0.2, 0.7] : [0.08, 0.64, 0.1, 0.66];
  prism(p, a0, a1, b0, b1, 9, 'w', (face, u, j, i) => cross(face, u, j) ?? wall([0.44, 0.58], 3, 7, { glass: 'c', plinth: 'c' })(face, u, j, i));
  roofRect(p, a0, a1, b0, b1, 9, 5, 'hip', 'c', 'w');
  if (level >= 2) {
    // The waiting porch with a bench.
    for (const a of [0.12, 0.4]) pole(p, a, 0.84, 6, 'S');
    roofRect(p, 0.1, 0.44, 0.66, 0.84, 6, 2, 'shed', 'c', 'w', undefined, 0.01);
    prism(p, 0.16, 0.36, 0.72, 0.76, 2, 'n');
  }
  if (level >= 3) {
    // Drop-off canopy and an ambulance under it.
    pole(p, 0.66, 0.92, 6, 'S');
    pole(p, 0.92, 0.92, 6, 'S');
    roofRect(p, 0.62, 0.96, 0.52, 0.94, 6, 0, 'flat', 'w', 'w', undefined, 0);
    bus(p, 0.68, 0.88, 0.7, 0.8, 'w', 'r');
  }
};

/** Pasar: an open los under one zinc limasan, then two los and a row of kios, then a big two-tier market hall with sawtooth vents, kios and gerobak. */
export const pasar: Art = (p, _v, level = 1) => {
  p.low();
  p.shadow(1);
  if (level <= 1) {
    stalls(p, 0.24, 0.76, 0.3, 0.7);
    shed(p, 0.2, 0.8, 0.22, 0.78, 8, 5, 'hip', ZINC, zinc);
    return;
  }
  // A row of kios along the back, rolling doors half up.
  prism(p, 0.06, 0.94, 0.06, 0.26, 8, 'w', (face, _u, j, i) => (face === 'T' ? undefined : j === 0 ? 'S' : face === 'L' && j < 6 ? (i % 6 === 0 ? 'w' : j >= 4 ? 's' : ['o', 'g', 'y', 'r'][Math.floor(i / 6) % 4]) : undefined));
  roofRect(p, 0.06, 0.94, 0.06, 0.26, 8, 3, 'shed', 'R', 'w', undefined, 0.01);
  if (level === 2) {
    for (const [a0, a1] of [[0.08, 0.46], [0.54, 0.92]] as [number, number][]) {
      stalls(p, a0 + 0.04, a1 - 0.04, 0.4, 0.82);
      shed(p, a0, a1, 0.34, 0.9, 8, 5, 'hip', ZINC, zinc);
    }
    return;
  }
  // The market hall: a truncated limasan, a raised crown with sawtooth vents, gerobak out front.
  stalls(p, 0.12, 0.88, 0.4, 0.82);
  shed(p, 0.06, 0.94, 0.32, 0.92, 8, 4, 'hip', 'R', (x) => (Math.floor(x / 3) % 2 ? 'r' : undefined));
  roofRect(p, 0.3, 0.7, 0.48, 0.76, 12, 0, 'flat', 'w', 'w', undefined, 0);
  for (const k of [0, 1, 2, 3]) roofRect(p, 0.3 + k * 0.1, 0.4 + k * 0.1, 0.48, 0.76, 12, 2, 'shed', ZINC, 'w', zinc, 0);
  umbul(p, [[0.06, 0.96], [0.94, 0.96]], 14);
};

/** Terminal, 3x3: one platform canopy, an office and a bus, then two platforms, a bigger office with a sign and a row of buses and angkot. */
export const terminal: Art = (p, _v, level = 1) => {
  p.low();
  p.shadow(1);
  p.ground((a, b, px) => (Math.min(a, b, 1 - a, 1 - b) < px ? 'S' : within(b, 0.5, 0.52) || within(b, 0.8, 0.82) ? 'w' : 's'));
  const big = level >= 2;
  // The office along the back.
  prism(p, 0.06, big ? 0.6 : 0.4, 0.06, 0.3, 8, 'w', wall([0.4, 0.55], 3, 6, { band: [7, 'y'] }));
  roofRect(p, 0.06, big ? 0.6 : 0.4, 0.06, 0.3, 8, 4, 'hip', 'b', 'w');
  if (big) {
    // The terminal's name on a frame over the office.
    pole(p, 0.66, 0.2, 14, 'S');
    pole(p, 0.92, 0.2, 14, 'S');
    prism(p, 0.66, 0.92, 0.19, 0.21, 3, 'b', (face, _u, j, i) => (face === 'L' && j === 1 ? (i % 2 ? 'w' : 'b') : undefined), 11);
  }
  // Platform canopies, long and low, with buses and angkot pulled in alongside.
  const peron = (b: number) => {
    for (const a of [0.08, 0.36, 0.64, 0.9]) pole(p, a, b, 7, 'S');
    roofRect(p, 0.06, 0.94, b - 0.05, b + 0.05, 7, 1, 'gableA', 'b', 'w', (x) => (x % 4 === 0 ? 'B' : undefined), 0.01);
  };
  peron(0.42);
  bus(p, 0.12, 0.42, 0.52, 0.6, 'g', 'w');
  angkot(p, 0.5, 0.53, 'b');
  if (!big) return;
  bus(p, 0.62, 0.92, 0.52, 0.6, 'r', 'y');
  peron(0.72);
  bus(p, 0.1, 0.4, 0.82, 0.9, 'o', 'w');
  angkot(p, 0.46, 0.84, 'g');
  angkot(p, 0.64, 0.84, 'b');
};

/** Taman: a lawn with one tree and a bench, then paths, a flower bed and more trees, then a gazebo, lamps and a ring of trees. */
export const taman: Art = (p, _v, level = 1) => {
  p.low();
  p.shadow(2);
  p.ground((a, b) => {
    if (level >= 2 && (within(a, 0.46, 0.54) || within(b, 0.46, 0.54))) return 't';
    if (level >= 2 && within(a, 0.62, 0.86) && within(b, 0.62, 0.86)) return (Math.floor(a * 40) + Math.floor(b * 40)) % 3 === 0 ? 'r' : (Math.floor(a * 40) + Math.floor(b * 40)) % 3 === 1 ? 'y' : 'G';
    return (Math.floor(a * 4) + Math.floor(b * 4)) % 2 ? 'g' : 'G';
  });
  canopyTree(p, 0.26, 0.26, level <= 1 ? 0.75 : 0.95, level <= 1 ? 2 : 3);
  if (level >= 2) canopyTree(p, 0.76, 0.26, 0.8, 2);
  if (level >= 3) {
    // A gazebo on the back-left lawn, and lamps along the path.
    for (const [a, b] of [[0.1, 0.62], [0.36, 0.62], [0.1, 0.88], [0.36, 0.88]]) pole(p, a, b, 6, 'N');
    roofRect(p, 0.08, 0.38, 0.6, 0.9, 6, 4, 'hip', 'R', 'w', undefined, 0.02);
    for (const a of [0.56, 0.9]) pole(p, a, 0.44, 8, 'S');
  }
  prism(p, 0.3, 0.42, 0.66, 0.7, 2, 'n', (face) => (face === 'T' ? 't' : undefined));
  if (level >= 2) canopyTree(p, level >= 3 ? 0.84 : 0.26, level >= 3 ? 0.62 : 0.8, 0.85, 2);
};

// ---------------------------------------------------------------- Kecamatan

/** Kantor Kecamatan: a long flat block, then a clock tower on the corner, then a pendopo portico in front and a row of flagpoles. */
export const kantorKec: Art = (p, _v, level = 1) => {
  p.low();
  p.shadow(1);
  const [a0, a1, b0, b1] = level <= 1 ? [0.14, 0.86, 0.14, 0.62] : [0.04, 0.96, 0.06, 0.66];
  prism(p, a0, a1, b0, b1, 9, 'w', wall([0.44, 0.56], 2, 6, { band: [8, 'o'] }));
  roofRect(p, a0, a1, b0, b1, 9, 0, 'flat', 's', 'w', undefined, 0.01);
  if (level >= 2) {
    prism(p, 0.78, 0.94, 0.1, 0.26, 10, 'w', (face, u, j) => (face !== 'T' && j === 6 && within(u, 0.3, 0.7) ? 'y' : face !== 'T' && within(j, 2, 5) && within(u, 0.35, 0.65) ? 'l' : undefined), 9);
    roofRect(p, 0.78, 0.94, 0.1, 0.26, 19, 4, 'hip', 'R', 'w', undefined, 0.02);
  }
  if (level >= 3) {
    // A pendopo portico on four pillars in front of the door, under a joglo-like roof.
    for (const [a, b] of [[0.38, 0.7], [0.62, 0.7], [0.38, 0.9], [0.62, 0.9]]) prism(p, a, a + 0.02, b, b + 0.02, 7, 'w');
    roofRect(p, 0.34, 0.66, 0.66, 0.94, 7, 3, 'hip', 'R', 'w', undefined, 0.02);
    roofRect(p, 0.44, 0.56, 0.74, 0.86, 10, 2, 'hip', 'R', 'w', undefined, 0);
    for (const a of [0.1, 0.18, 0.26]) flag(p, a, 0.86, 13);
  } else flag(p, 0.9, 0.86, 13);
};

/** Pos Satpol PP: a small post, then a lookout on the roof and a mast, then a garage with the patrol pick-up and a barrier. */
export const posSatpol: Art = (p, _v, level = 1) => {
  p.low();
  p.shadow(3);
  if (level >= 3) {
    prism(p, 0.62, 0.94, 0.12, 0.56, 7, 'y', (face, u, j) => (face === 'L' && within(u, 0.1, 0.9) && j < 6 ? (j % 2 ? 'S' : 's') : undefined));
    roofRect(p, 0.62, 0.94, 0.12, 0.56, 7, 0, 'flat', 's', 'y', undefined, 0.01);
    bus(p, 0.64, 0.86, 0.66, 0.76, 'w', 'b');
    prism(p, 0.1, 0.5, 0.86, 0.89, 1, 'w', (face, u) => (face === 'T' ? undefined : Math.floor(u * 8) % 2 ? 'r' : 'w'), 4);
    pole(p, 0.1, 0.88, 5, 'S');
  }
  const [a0, a1, b0, b1] = level <= 1 ? [0.26, 0.66, 0.26, 0.7] : [0.14, 0.62, 0.14, 0.7];
  prism(p, a0, a1, b0, b1, 8, 'y', wall([0.4, 0.6], 3, 6, { band: [6, 'b'], plinth: 'N' }));
  roofRect(p, a0, a1, b0, b1, 8, 0, 'flat', 's', 'y', undefined, 0.01);
  if (level >= 2) {
    const ma = (a0 + a1) / 2;
    const mb = (b0 + b1) / 2;
    prism(p, ma - 0.1, ma + 0.1, mb - 0.12, mb + 0.12, 4, 'y', (face, _u, j, i) => (face !== 'T' && within(j, 1, 3) && i % 3 ? 'l' : undefined), 9);
    roofRect(p, ma - 0.1, ma + 0.1, mb - 0.12, mb + 0.12, 13, 2, 'hip', 'b', 'y');
    pole(p, a1 - 0.04, b1 - 0.04, 16, 'S');
  }
};

/** Koperasi Simpan Pinjam: a small office, then a long hall under a low pelana, then a front canopy with an ATM and a second wing. */
export const koperasiSP: Art = (p, _v, level = 1) => {
  p.low();
  p.shadow(2);
  if (level >= 3) {
    prism(p, 0.66, 0.94, 0.06, 0.5, 7, 'g', wall(null, 2, 5, { plinth: 'N' }));
    roofRect(p, 0.66, 0.94, 0.06, 0.5, 7, 3, 'gableB', 'o', 'g');
  }
  const [a0, a1, b0, b1] = level <= 1 ? [0.22, 0.72, 0.24, 0.74] : [0.06, 0.66, 0.08, 0.7];
  prism(p, a0, a1, b0, b1, 8, 'g', wall([0.42, 0.58], 2, 6, { band: [7, 'y'], plinth: 'N' }));
  roofRect(p, a0, a1, b0, b1, 8, level <= 1 ? 4 : 6, level <= 1 ? 'hip' : 'gableA', 'o', 'g');
  if (level >= 3) {
    for (const a of [0.12, 0.6]) pole(p, a, 0.88, 6, 'S');
    roofRect(p, 0.1, 0.62, 0.7, 0.9, 6, 0, 'flat', 'y', 'g', undefined, 0);
    prism(p, 0.78, 0.86, 0.72, 0.78, 6, 'b', (face, _u, j) => (face === 'L' && within(j, 3, 5) ? 'c' : undefined));
  }
};

/** Balai Latihan Kerja: a workshop shed, then a hall with a raised monitor roof, then a second hall under sawtooth roofs and a yard with machines. */
export const balaiLatihanKerja: Art = (p, _v, level = 1) => {
  p.low();
  p.shadow(2);
  if (level >= 3) {
    prism(p, 0.62, 0.96, 0.06, 0.56, 8, 'c', wall([0.2, 0.6], 3, 6));
    for (const k of [0, 1, 2]) roofRect(p, 0.62, 0.96, 0.06 + k * 0.167, 0.06 + (k + 1) * 0.167, 8, 3, 'shed', ZINC, 'c', zinc, 0);
    prism(p, 0.7, 0.8, 0.66, 0.76, 3, 'o', (face) => (face === 'T' ? 'S' : undefined));
    prism(p, 0.84, 0.92, 0.7, 0.8, 4, 'b', (face) => (face === 'T' ? 'S' : undefined));
  }
  if (level <= 1) {
    prism(p, 0.24, 0.72, 0.24, 0.72, 7, 'c', wall([0.3, 0.7], 3, 6));
    roofRect(p, 0.24, 0.72, 0.24, 0.72, 7, 4, 'gableB', ZINC, 'c', zinc);
    return;
  }
  prism(p, 0.06, 0.6, 0.08, 0.88, 9, 'c', (face, u, j, i) => (face === 'L' && within(u, 0.3, 0.7) && j < 7 ? (j >= 5 ? (i % 2 ? 's' : 'S') : 'k') : wall(null, 3, 7)(face, u, j, i)));
  roofRect(p, 0.06, 0.6, 0.08, 0.88, 9, 5, 'gableB', ZINC, 'c', zinc);
  prism(p, 0.24, 0.42, 0.08, 0.88, 2, 'c', (face, _u, j, i) => (face !== 'T' && j === 1 && i % 2 ? 'l' : undefined), 12);
  roofRect(p, 0.24, 0.42, 0.08, 0.88, 14, 2, 'gableB', 'S', 'c', (x) => (Math.floor(x / 3) % 2 ? 'y' : undefined));
};

/**
 * Baliho: level 1 is a cloth spanduk between two bamboo poles; level 2 a steel billboard on legs with a
 * campaign poster (a generic, grinning figure in a black peci and a white shirt, a big number and lines of
 * slogan), lit by a lamp; level 3 a bigger board on a catwalk with two lamps and a second, smaller board.
 * The board faces the front left, square to the grid, so it sits in the same perspective as the buildings.
 */
export const baliho: Art = (p, _v, level = 1) => {
  p.low();
  p.shadow(3);
  if (level <= 1) {
    for (const a of [0.14, 0.86]) pole(p, a, 0.52, 14, 'a');
    prism(p, 0.14, 0.86, 0.51, 0.53, 5, 'w', (face, u, j, i) => (face !== 'L' ? undefined : j === 0 || j === 4 ? 'r' : j === 2 ? (i % 3 ? 'k' : 'w') : within(u, 0.04, 0.2) ? 'y' : 'w'), 8);
    return;
  }
  const big = level >= 3;
  const [a0, a1] = big ? [0.04, 0.96] : [0.12, 0.88];
  const H = big ? 11 : 10;
  const z = big ? 9 : 8;
  // Legs and bracing.
  for (const a of [a0 + 0.12, a1 - 0.12]) prism(p, a, a + 0.03, 0.5, 0.53, z, 'S');
  prism(p, a0 + 0.12, a1 - 0.09, 0.5, 0.53, 1, 'S', undefined, Math.round(z / 2));
  if (big) prism(p, a0, a1, 0.53, 0.62, 1, 'S', (face, _u, _j, i) => (face === 'L' && i % 2 ? null : undefined), z - 1);
  const jc = Math.round(H * 0.5);
  prism(p, a0, a1, 0.5, 0.53, H, 'w', (face, u, j) => {
    if (face !== 'L') return 'S';
    if (j === 0 || j === H - 1) return 'S';
    // The figure on the left: peci, face, grin, white shirt and a red tie.
    const fu = (u - 0.18) / 0.09;
    const fj = (j - jc) / (H * 0.24);
    if (fu * fu + fj * fj < 1) {
      if (j >= jc + H * 0.14) return 'k';
      if (j === jc - 1 && Math.abs(fu) < 0.5) return 'k';
      if (j === jc + 1 && (Math.abs(fu - 0.4) < 0.15 || Math.abs(fu + 0.4) < 0.15)) return 'k';
      return 't';
    }
    if (within(u, 0.08, 0.28) && j < jc - H * 0.2) return within(u, 0.16, 0.2) ? 'r' : 'w';
    // A big number in a yellow box, and lines of slogan.
    if (within(u, 0.34, 0.46) && within(j, 2, H - 2)) return within(u, 0.39, 0.42) && within(j, 3, H - 3) ? 'k' : 'y';
    if (within(u, 0.5, 0.96)) {
      if (j === H - 3) return Math.floor(u * 40) % 3 ? 'w' : 'r';
      if (j === jc) return Math.floor(u * 30) % 4 ? 'y' : 'r';
      if (j === 3) return Math.floor(u * 50) % 2 ? 'w' : 'r';
      return 'r';
    }
    return j < 3 ? 'r' : 'b';
  }, z);
  // Lamps over the board.
  const lamps = big ? [0.3, 0.7] : [0.5];
  for (const a of lamps) {
    prism(p, a - 0.01, a + 0.01, 0.53, 0.6, 1, 'S', undefined, z + H);
    prism(p, a - 0.03, a + 0.03, 0.58, 0.62, 1, 'y', undefined, z + H - 1);
  }
};

/** Taman Kota: a fountain pool and two trees, then paths, benches and four trees, then a stage, lamps and a statue. */
export const tamanKota: Art = (p, _v, level = 1) => {
  p.low();
  p.shadow(2);
  p.ground((a, b) => {
    const d = Math.max(Math.abs(a - 0.5), Math.abs(b - 0.5));
    if (d < 0.14) return Math.floor((a + b) * 12) % 3 === 0 ? 'c' : 'l';
    if (d < 0.2) return 's';
    if (level >= 2 && (within(a, 0.46, 0.54) || within(b, 0.46, 0.54))) return 't';
    return (Math.floor(a * 4) + Math.floor(b * 4)) % 2 ? 'g' : 'G';
  });
  canopyTree(p, 0.2, 0.2, level <= 1 ? 0.8 : 1, level <= 1 ? 2 : 3);
  if (level >= 2) canopyTree(p, 0.8, 0.22, 0.8, 2);
  if (level >= 3) {
    // A stage at the back right, under a shed roof.
    prism(p, 0.66, 0.92, 0.04, 0.14, 2, 'n');
    roofRect(p, 0.66, 0.92, 0.04, 0.14, 7, 2, 'shed', 'R', 'w', undefined, 0.01);
    for (const a of [0.66, 0.9]) pole(p, a, 0.14, 7, 'S');
  }
  canopyTree(p, 0.22, 0.8, 0.8, 2);
  pole(p, 0.5, 0.5, level >= 3 ? 8 : 5, 'c');
  if (level >= 3) {
    prism(p, 0.46, 0.54, 0.46, 0.54, 3, 's');
    for (const [a, b] of [[0.3, 0.42], [0.7, 0.58]]) pole(p, a, b, 8, 'S');
  }
  if (level >= 2) canopyTree(p, 0.8, 0.8, 0.9, 3);
};

export const LEVEL_ART: Record<string, Art> = {
  posSatpam,
  gudangMaterial,
  paud,
  koperasi,
  kontrakan,
  balaiWarga,
  balaiRW,
  pasarKaget,
  gapura,
  kantorKel,
  puskesmasPembantu,
  pasar,
  terminal,
  taman,
  kantorKec,
  posSatpol,
  koperasiSP,
  balaiLatihanKerja,
  baliho,
  tamanKota,
};
