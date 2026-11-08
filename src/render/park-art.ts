import { dither, type Painter } from './iso';
import { at, canopyTree, pole, unit } from './kampung-art';
import { prism, roofRect } from './massing';
import { flowers } from './sign-art';

// Open-air RT lots, drawn in native pixels on their 2x2 so they carry more detail than a scaled-up 1x1:
// the playground, the senam stage and the fishing pond. All low (ART.md: big buildings read wide, not tall).
// Registered in art-content.ts.

const within = (v: number, lo: number, hi: number) => v >= lo && v < hi;
type Art = (p: Painter, variant?: string, level?: number) => void;

/**
 * Taman Bermain: a playground set on a rubber mat, as in a kampung RPTRA. A play tower on red posts under a
 * yellow pyramid roof, a blue slide down its front, a ladder up its side, monkey bars, a small seesaw and a
 * shade tree with a bench in the back corner.
 */
export const tamanBermain: Art = (p) => {
  p.low();
  p.ground((a, b, px) => {
    const e = Math.min(a, b, 1 - a, 1 - b);
    if (e < px) return null;
    if (e < 3 * px) return 'S';
    if (e < 6 * px) return 'R';
    return Math.floor((a + b) * 5) % 2 ? '#4f8a5a' : '#467f50';
  });
  p.overlay.push(dither);
  // The play tower stands in the back corner, so nothing on the lot hides behind it.
  const t = unit(p);
  const [a0, a1, b0, b1] = [0.1, 0.34, 0.1, 0.34];
  for (const [a, b] of [[a0, b0], [a1 - t, b0], [a0, b1 - t], [a1 - t, b1 - t]]) prism(p, a, a + t * 1.4, b, b + t * 1.4, 12, 'r', (face) => (face === 'R' ? 'R' : undefined));
  prism(p, a0, a1, b0, b1, 1, 'y', (face) => (face === 'T' ? 'a' : undefined), 5);
  prism(p, a0, a1, b0, b0 + t, 3, 'y', (_f, _u, j, i) => (j === 2 ? 'y' : i % 2 ? null : 'e'), 6);
  roofRect(p, a0 - 0.03, a1 + 0.03, b0 - 0.03, b1 + 0.03, 12, 5, 'hip', 'y', 'y', (x) => (x % 4 === 0 ? 'a' : undefined), 0.01);
  // The slide: a blue chute from the deck down towards the left corner.
  for (let k = 0; k < 8; k++) {
    const b = b1 + k * 0.04;
    prism(p, a0 + 0.04, a0 + 0.16, b, b + 0.045, 1, 'b', (face) => (face === 'T' ? (k % 2 ? 'l' : 'b') : undefined), Math.max(0, 5 - k * 0.7));
  }
  // A climbing wall up the right side: a blue panel with bright holds.
  prism(p, a1, a1 + 0.05, b0 + 0.04, b1 - 0.04, 5, 'b', (face, _u, j, i) => (face === 'R' && (i + j * 2) % 4 === 0 ? ['r', 'y', 'g'][(i + j) % 3] : face === 'T' ? 'B' : undefined));
  // The shade tree in the right corner, clear of the play set, with a bench in its shade.
  canopyTree(p, 0.8, 0.2, 0.8, 2);
  prism(p, 0.86, 0.91, 0.42, 0.62, 2, 'n', (face) => (face === 'T' ? 't' : undefined));
  // Monkey bars across the middle, running front to back: four blue posts, yellow side rails and grey rungs.
  const [m0, m1, n0, n1] = [0.5, 0.6, 0.4, 0.66];
  for (const a of [m0, m1]) for (const b of [n0, n1]) pole(p, a, b, 8, 'b');
  p.overlay.push((q) => {
    for (let k = 0; k <= 24; k++) {
      const b = n0 + ((n1 - n0) * k) / 24;
      for (const a of [m0, m1]) {
        const [x, y] = at(q, a, b, 8);
        q.px(Math.round(x), Math.round(y), '#f4b935');
      }
      if (k % 3 === 0)
        for (let m = 1; m < 5 * q.n; m++) {
          const [x, y] = at(q, m0 + ((m1 - m0) * m) / (5 * q.n), b, 8);
          q.px(Math.round(x), Math.round(y), '#bdb4a3');
        }
    }
  });
  // A seesaw along the front edge:: a red plank on a grey pivot, one end down, yellow handles.
  prism(p, 0.6, 0.64, 0.84, 0.88, 2, 'S');
  prism(p, 0.48, 0.62, 0.85, 0.87, 1, 'r', (face) => (face === 'T' ? 'r' : undefined), 1);
  prism(p, 0.62, 0.76, 0.85, 0.87, 1, 'r', (face) => (face === 'T' ? 'r' : undefined), 2);
  prism(p, 0.49, 0.51, 0.84, 0.88, 1, 'y', undefined, 2);
  prism(p, 0.74, 0.76, 0.84, 0.88, 1, 'y', undefined, 3);
};

/**
 * Panggung Senam, the senam pagi stage: a plank stage with steps at the front under a striped tenda on poles,
 * a spanduk on the back of the stage, a speaker stack at each front corner and a row of umbul-umbul whose
 * pennants hang from bent tips and sway as they fall.
 */
export const panggungSenam: Art = (p) => {
  p.low();
  p.shadow(2);
  const t = unit(p);
  // Umbul-umbul along the back edges, drawn first so the stage stands in front of them, and inked like any shape.
  const cols = ['#df4a2c', '#f4b935', '#3d72b4', '#86b84c', '#e57a9c'];
  [[0.04, 0.1], [0.04, 0.4], [0.1, 0.04], [0.4, 0.04], [0.7, 0.04]].forEach(([a, b], k) => {
    const [x, y] = at(p, a, b);
    const X = Math.round(x), Y = Math.round(y);
    const H = 14 * p.zs;
    p.id++;
    for (let d = 0; d < H; d++) p.px(X, Y - d, d % 4 === 0 ? '#a8652f' : '#f2b43a');
    p.px(X + 1, Y - H, '#f2b43a');
    p.px(X + 2, Y - H + 1, '#f2b43a');
    p.id++;
    for (let d = 0; d < 10 * p.zs; d++) {
      const sway = Math.round(Math.sin(d / (3 * p.zs)) * 1.5);
      p.px(X + 2 + sway, Y - H + 2 + d, cols[k % cols.length]);
      if (d < 8 * p.zs) p.px(X + 3 + sway, Y - H + 2 + d, cols[(k + 2) % cols.length]);
    }
  });
  const [a0, a1, b0, b1] = [0.18, 0.86, 0.16, 0.7];
  prism(p, a0, a1, b0, b1, 3, 'n', (face, _u, j, i) => (face === 'T' ? (i % 3 ? 't' : 'n') : j === 2 ? 't' : undefined));
  // Steps down the front of the stage.
  for (let k = 0; k < 3; k++) prism(p, 0.42, 0.62, b1 + k * 0.045, b1 + (k + 1) * 0.045, 3 - k, 'n', (face) => (face === 'T' ? 't' : undefined));
  // The spanduk on a steel frame at the back of the stage: blue, a white band of lettering, a red-and-white trim.
  for (const a of [a0 + 0.06, a1 - 0.06 - t]) prism(p, a, a + t, b0 + 0.02, b0 + 0.02 + t, 10, 'S', undefined, 3);
  prism(p, a0 + 0.06, a1 - 0.06, b0 + 0.02, b0 + 0.02 + t, 7, 'b', (_f, _u, j, i) => (j === 6 ? (i % 2 ? 'r' : 'e') : j === 0 ? 'B' : within(j, 2, 5) ? (i % 3 ? 'w' : 'b') : 'b'), 5);
  // The instructor, mid-jump on the front of the stage: arms up.
  prism(p, 0.5, 0.54, 0.5, 0.54, 3, 'p', (face) => (face === 'T' ? 't' : undefined), 3);
  prism(p, 0.505, 0.535, 0.505, 0.535, 1, 't', undefined, 6);
  // Speaker stacks at two corners of the stage.
  for (const [a, b] of [[a0 + 0.02, b1 - 0.12], [a1 - 0.12, b0 + 0.08]] as [number, number][])
    prism(p, a, a + 0.1, b, b + 0.08, 5, '#3b3430', (face, _u, j) => (face === 'L' && (j === 1 || j === 3) ? 'S' : undefined), 3);
};

/**
 * Kolam Pancing: a green pond in a stone kerb with lily pads and fish rising, a saung on stilts over the back
 * corner, a plank jetty with two anglers on stools and their rods out, and a striped payung with a cool box.
 */
export const kolamPancing: Art = (p) => {
  p.low();
  p.ground((a, b, px) => {
    const e = Math.min(a, b, 1 - a, 1 - b);
    if (e < 2 * px) return 'S';
    if (e < 4 * px) return Math.floor((a + b) * 30) % 3 ? 's' : 'S';
    if (e < 8 * px && (a > 0.8 || b > 0.8)) return 'g';
    const r = (a * 7 + b * 3) % 1;
    return r < 0.06 ? 'w' : r < 0.5 ? 'c' : '#6fc2b4';
  });
  p.overlay.push(dither);
  // Lily pads, a lotus, fish and their rings on the water, in native pixels.
  p.overlay.push((q) => {
    const pads: [number, number][] = [[0.3, 0.55], [0.34, 0.6], [0.66, 0.3], [0.7, 0.36], [0.62, 0.72]];
    for (const [a, b] of pads) {
      const [x, y] = at(q, a, b);
      for (const [dx, dy] of [[0, 0], [1, 0], [-1, 0], [0, -1], [1, -1]]) q.px(Math.round(x) + dx, Math.round(y) + dy, '#527f34');
      q.px(Math.round(x), Math.round(y) - 1, '#86b84c');
    }
    const [lx, ly] = at(q, 0.34, 0.6);
    q.px(Math.round(lx) + 1, Math.round(ly) - 2, '#e57a9c');
    for (const [a, b] of [[0.52, 0.42], [0.66, 0.55]] as [number, number][]) {
      const [x, y] = at(q, a, b);
      q.px(Math.round(x), Math.round(y), '#e57d2e');
      q.px(Math.round(x) + 1, Math.round(y), '#e57d2e');
      for (const [dx, dy] of [[-2, 0], [3, 0], [-1, -1], [2, -1], [-1, 1], [2, 1], [0, -1], [1, 1]]) q.px(Math.round(x) + dx, Math.round(y) + dy, '#f6ecd4');
    }
  });
  const t = unit(p);
  // The saung on stilts over the back corner: a plank deck, four posts and a thatched hip.
  prism(p, 0.08, 0.34, 0.08, 0.34, 1, 'n', (face) => (face === 'T' ? 't' : undefined), 2);
  for (const [a, b] of [[0.09, 0.09], [0.32, 0.09], [0.09, 0.32], [0.32, 0.32]]) prism(p, a, a + t, b, b + t, 9, 'N');
  roofRect(p, 0.04, 0.38, 0.04, 0.38, 9, 5, 'hip', 'a', 'n', (x, y) => ((x + y) % 4 === 0 ? 'n' : undefined), 0.01);
  // The jetty: planks from the front bank out over the water.
  for (let k = 0; k < 6; k++) prism(p, 0.44, 0.58, 0.62 + k * 0.05, 0.67 + k * 0.05, 1, 'n', (face) => (face === 'T' ? (k % 2 ? 't' : 'a') : 'N'), 1);
  // Two anglers on stools at the jetty's end: the stool, a shirt, a straw hat.
  for (const [a, b, shirt] of [[0.45, 0.64, 'b'], [0.53, 0.68, 'r']] as [number, number, string][]) {
    prism(p, a, a + 0.04, b, b + 0.04, 1, 'S', undefined, 2);
    prism(p, a, a + 0.04, b, b + 0.04, 3, shirt, (face) => (face === 'T' ? 't' : undefined), 3);
    prism(p, a - 0.008, a + 0.048, b - 0.008, b + 0.048, 1, 'a', undefined, 6);
  }
  // Their rods out over the water, sagging a little, and the red-and-white floats.
  p.overlay.push((q) => {
    for (const [a, b, ta, tb] of [[0.46, 0.64, 0.42, 0.4], [0.55, 0.68, 0.72, 0.5]]) {
      const [x0, y0] = at(q, a, b, 7);
      const [x1, y1] = at(q, ta, tb, 12);
      const steps = Math.ceil(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)));
      for (let k = 0; k <= steps; k++) q.px(Math.round(x0 + ((x1 - x0) * k) / steps), Math.round(y0 + ((y1 - y0) * k) / steps - Math.sin((k / steps) * Math.PI) * 2), '#603620');
      const [fx, fy] = at(q, ta, tb);
      for (let d = 1; d < fy - y1 - 1; d += 2) q.px(Math.round(x1), Math.round(y1) + d, '#f6ecd4');
      q.px(Math.round(fx), Math.round(fy) - 1, '#df4a2c');
      q.px(Math.round(fx), Math.round(fy), '#f6ecd4');
    }
  });
  // A striped payung on the bank with a cool box under it.
  pole(p, 0.86, 0.82, 9, 'S');
  roofRect(p, 0.78, 0.94, 0.74, 0.9, 8, 3, 'hip', 'b', 'w', (x) => (Math.floor(x / 2) % 2 ? 'w' : undefined), 0.01);
  prism(p, 0.86, 0.94, 0.84, 0.9, 2, 'b', (face) => (face === 'T' ? 'w' : undefined));
  flowers(p, 0.86, 0.96, 0.08, 0.5, 6);
};
