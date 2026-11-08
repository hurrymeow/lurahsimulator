import type { Painter } from './iso';
import { at } from './kampung-art';
import { prism, roofRect } from './massing';

// Signs and small props that tell a building's trade by silhouette: the merah putih on its pole, the
// barber's spiral pole, the apotek's plus-shaped lightbox, striped awnings and a pedimented portico.
// Rumah is the most common building on the map, so anything that is not a house carries one of these.
// Offsets are art pixels from the ground centre (up is negative), as in Painter.stroke.
// Only `import type` from iso.ts, so there is no import cycle.

const TW = 32;
const TH = 16;
const TOP = 40;
const GX = TW / 2;
const GY = TOP + TH / 2;

/**
 * A flagpole standing at (x, y) with the merah putih flying from its top, len tall. Drawn after the ink pass
 * in native pixels, so the pole stays one pixel thin at any footprint; the tail of the flag dips a pixel, so
 * it reads as cloth, not a board.
 */
export function flag(p: Painter, x: number, y: number, len: number): void {
  p.overlay.push((q) => {
    const X = q.gx + x * q.n;
    const Y = q.gy + y * q.n;
    // A small concrete foot, so the pole stands on the ground rather than hanging in the air.
    for (let d = -1; d <= 2; d++) q.px(X + d, Y, 'S');
    for (let k = 0; k < len; k++) {
      q.px(X, Y - k, k === 0 ? 'S' : 's');
      q.px(X + 1, Y - k, k === 0 ? 'S' : 'S');
    }
    q.px(X, Y - len, 'y');
    q.px(X + 1, Y - len, 'h');
    for (let k = 2; k <= 7; k++) {
      const dip = k >= 5 ? 1 : 0;
      q.px(X + k, Y - len + 1 + dip, k === 7 ? 'R' : 'j');
      q.px(X + k, Y - len + 2 + dip, 'w');
      q.px(X + k, Y - len + 3 + dip, k === 7 ? 's' : 'w');
    }
  });
}

/** The flag on a lot point (a, b), its foot `up` art pixels above the ground (a roof ridge, say): same pole and cloth as flag. */
export function flagAt(p: Painter, a: number, b: number, up: number, len: number): void {
  p.overlay.push((q) => {
    const [x, y] = at(q, a, b, up);
    const X = Math.round(x);
    const Y = Math.round(y);
    for (let k = 0; k < len; k++) {
      q.px(X, Y - k, k === 0 ? 'S' : 's');
      q.px(X + 1, Y - k, k === 0 ? 'S' : 'S');
    }
    q.px(X, Y - len, 'y');
    q.px(X + 1, Y - len, 'h');
    for (let k = 2; k <= 7; k++) {
      const dip = k >= 5 ? 1 : 0;
      q.px(X + k, Y - len + 1 + dip, k === 7 ? 'R' : 'j');
      q.px(X + k, Y - len + 2 + dip, 'w');
      q.px(X + k, Y - len + 3 + dip, k === 7 ? 's' : 'w');
    }
  });
}

/** A gold Garuda emblem, 9 by 7 native pixels, centred on lot point (a, b) at height up: spread wings, a head, a shield on the chest. */
export function garuda(p: Painter, a: number, b: number, up: number): void {
  const art = [
    '....h....',
    'y..yhy..y',
    'yy.yyy.yy',
    '.yyyryyy.',
    '..yyeyy..',
    '...y.y...',
    '..yy.yy..',
  ];
  p.overlay.push((q) => {
    const [x, y] = at(q, a, b, up);
    const X = Math.round(x) - 4;
    const Y = Math.round(y) - 3;
    art.forEach((row, j) => [...row].forEach((c, i) => {
      if (c === '.') return;
      q.px(X + i, Y + j, c === 'y' ? (j > 3 ? 'a' : 'y') : c);
    }));
  });
}

/** A barber's pole, 2px wide with diagonal red, white and blue bands, len tall, capped top and bottom. lit adds a glowing globe. */
export function barberPole(p: Painter, x: number, y: number, len: number, lit = false): void {
  p.id++;
  for (let k = 0; k < len; k++) for (let d = 0; d < 2; d++) p.set(GX + x + d, GY + y - 1 - k, ['r', 'w', 'b', 'w'][(k + d * 3) % 4]);
  p.id++;
  for (let d = -1; d < 3; d++) {
    p.set(GX + x + d, GY + y, 'S');
    p.set(GX + x + d, GY + y - len - 1, 'S');
  }
  if (lit) {
    p.id++;
    p.set(GX + x, GY + y - len - 2, 'y');
    p.set(GX + x + 1, GY + y - len - 2, 'y');
  }
}

/** The apotek's plus-shaped lightbox, 7 pixels across with arms 3 wide, centred at (x, y): green with a white heart and a light rim. */
export function plusSign(p: Painter, x: number, y: number, rim = 'w'): void {
  p.id++;
  for (let dx = -3; dx <= 3; dx++)
    for (let dy = -3; dy <= 3; dy++) {
      if (Math.abs(dx) > 1 && Math.abs(dy) > 1) continue;
      const edge = Math.abs(dx) === 3 || Math.abs(dy) === 3 || (Math.abs(dx) === 1 && Math.abs(dy) >= 2) || (Math.abs(dy) === 1 && Math.abs(dx) >= 2);
      p.set(GX + x + dx, GY + y + dy, dx === 0 && dy === 0 ? 'e' : edge ? rim : 'g');
    }
}

/** A plus sign on a steel post from the ground at (x, y), its centre top pixels up. */
export function plusPylon(p: Painter, x: number, y: number, top: number, rim = 'w'): void {
  p.stroke(x, y, x, y - top + 3, 1, 'S');
  plusSign(p, x, y - top, rim);
}

/** Stripe colours for an awning or tarp by its one-tile column: red, white and blue for the barber, green and white for the apotek. */
export const stripes = (cols: string[], w = 2) => (x: number) => cols[Math.floor(x / w) % cols.length];

/**
 * An awning in front of the front-left wall (the face at b = b1) of the rectangle a0..a1, sloping down and out
 * from h at the wall by depth footprint units. paint colours it by one-tile column, for stripes.
 */
export function awning(p: Painter, a0: number, a1: number, b1: number, depth: number, h: number, colour: string, paint: (x: number, y: number) => string | undefined = () => undefined): void {
  roofRect(p, a0, a1, b1, b1 + depth, h - 2, 2, 'shed', colour, colour, paint, 0.01);
}

/**
 * A pedimented portico in front of the front-left wall: two white columns and a small front gable over the
 * door, its triangle facing the lane. The thing a kantor has and a rumah does not.
 */
export function portico(p: Painter, a0: number, a1: number, b0: number, b1: number, h: number, rise: number, roof: string, col = 'e'): void {
  const n = p.n;
  // Columns at the two front corners, drawn as thin prisms so they get their own outline.
  const w = 1.5 / (TH * n);
  prism(p, a0 + 0.02, a0 + 0.02 + w, b1 - w - 0.02, b1 - 0.02, h, col);
  prism(p, a1 - 0.02 - w, a1 - 0.02, b1 - w - 0.02, b1 - 0.02, h, col);
  roofRect(p, a0, a1, b0, b1, h, rise, 'gableB', roof, 'e', () => undefined, 0.02);
}

/** A notice board on two legs, w wide and rows tall, standing at (x, y): a framed board of pinned papers. */
export function noticeBoard(p: Painter, x: number, y: number, w: number, rows: number, frame = 'N'): void {
  p.stroke(x, y, x, y - rows - 2, 1, frame);
  p.stroke(x + w - 1, y + Math.floor((w - 1) / 2), x + w - 1, y + Math.floor((w - 1) / 2) - rows - 2, 1, frame);
  p.id++;
  for (let k = 0; k < w; k++)
    for (let r = 0; r < rows; r++) {
      const yy = GY + y + Math.floor(k / 2) - rows - 2 + r;
      const edge = r === 0 || r === rows - 1 || k === 0 || k === w - 1;
      p.set(GX + x + k, yy, edge ? frame : (k + r) % 3 === 0 ? 'e' : (k * 7 + r) % 5 === 0 ? 'y' : 'w');
    }
}

/** Where the ground point (a, b) lands on the canvas, up art pixels above it: native pixels, as Painter.ground. */
function spot(p: Painter, a: number, b: number, up = 0): [number, number] {
  const n = p.n;
  return [(TW / 2) * n + p.ox + (a - b) * (TW / 2) * n, TOP * n + p.oy + (a + b) * (TH / 2) * n - up * p.zs];
}

/**
 * A low fence just inside a lot's two front edges, drawn after the ink pass in native pixels so it stays fine
 * on any lot. cols cycles along it (one colour per picket pair); gate leaves an opening on the front-left edge
 * between those a values. Pickets every second pixel, a rail along the top.
 */
export function frontFence(p: Painter, cols: string[], gate: [number, number] | null = null, tall = 2): void {
  p.overlay.push((q) => {
    const step = 1 / (TW * q.n);
    let k = 0;
    const put = (a: number, b: number) => {
      const [x, y] = spot(q, a, b);
      const X = Math.round(x), Y = Math.round(y) - 1;
      const c = cols[Math.floor(k / 4) % cols.length];
      for (let d = 1; d <= tall; d++) if (k % 2 === 0 || d === tall) q.px(X, Y - d, c);
      k++;
    };
    for (let a = 0.03; a <= 0.97; a += step) if (!gate || a < gate[0] || a > gate[1]) put(a, 0.97);
    k = 0;
    for (let b = 0.03; b < 0.97; b += step) put(0.97, b);
  });
}

/** A gapura over a gate on the front-left edge: two brick pillars with white caps between a0 and a1 at b, and a little roof bridging them. */
export function gateway(p: Painter, a0: number, a1: number, b: number, h: number, roof = 'R'): void {
  const t = 1.6 / (TH * p.n);
  for (const a of [a0, a1 - t]) {
    prism(p, a, a + t, b - t, b, h, 'r', (_face, _u, j) => (j === h - 1 ? 'e' : j % 2 ? 'R' : undefined));
  }
  roofRect(p, a0 - 0.01, a1 + 0.01, b - t - 0.01, b + 0.01, h, 2, 'gableB', roof, 'e', undefined, 0.01);
}

/** Small bright dots on the ground for flower beds, in native pixels: count dots scattered over a0..a1 by b0..b1. */
export function flowers(p: Painter, a0: number, a1: number, b0: number, b1: number, count: number, cols = ['#e57a9c', '#f4b935', '#df4a2c', '#f6ecd4']): void {
  p.overlay.push((q) => {
    for (let k = 0; k < count; k++) {
      const h1 = ((k * 2654435761) >>> 0) / 4294967296;
      const h2 = ((k * 40503 + 977) % 1000) / 1000;
      const [x, y] = spot(q, a0 + (a1 - a0) * h1, b0 + (b1 - b0) * h2);
      q.px(Math.round(x), Math.round(y) - 1, '#527f34');
      q.px(Math.round(x), Math.round(y) - 2, cols[k % cols.length]);
    }
  });
}
