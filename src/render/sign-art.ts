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

// A 3x5 pixel font for name plates (N and M are wider). Rows top to bottom, '#' is ink.
const GLYPHS: Record<string, string[]> = {
  A: ['.#.', '#.#', '###', '#.#', '#.#'],
  B: ['##.', '#.#', '##.', '#.#', '##.'],
  C: ['.##', '#..', '#..', '#..', '.##'],
  D: ['##.', '#.#', '#.#', '#.#', '##.'],
  E: ['###', '#..', '##.', '#..', '###'],
  G: ['.##', '#..', '#.#', '#.#', '.##'],
  H: ['#.#', '#.#', '###', '#.#', '#.#'],
  I: ['###', '.#.', '.#.', '.#.', '###'],
  J: ['..#', '..#', '..#', '#.#', '.#.'],
  K: ['#.#', '#.#', '##.', '#.#', '#.#'],
  L: ['#..', '#..', '#..', '#..', '###'],
  M: ['#...#', '##.##', '#.#.#', '#...#', '#...#'],
  N: ['#..#', '##.#', '#.##', '#..#', '#..#'],
  O: ['.#.', '#.#', '#.#', '#.#', '.#.'],
  P: ['##.', '#.#', '##.', '#..', '#..'],
  R: ['##.', '#.#', '##.', '#.#', '#.#'],
  S: ['###', '#..', '###', '..#', '###'],
  T: ['###', '.#.', '.#.', '.#.', '.#.'],
  U: ['#.#', '#.#', '#.#', '#.#', '.#.'],
  W: ['#...#', '#...#', '#.#.#', '##.##', '#...#'],
  ' ': ['.', '.', '.', '.', '.'],
};

/** The ink of a word in the plate font: columns of 5 booleans, a blank column between letters. */
function letters(text: string): boolean[][] {
  const cols: boolean[][] = [];
  [...text].forEach((ch, k) => {
    const g = GLYPHS[ch] ?? GLYPHS[' '];
    if (k) cols.push([false, false, false, false, false]);
    for (let c = 0; c < g[0].length; c++) cols.push(g.map((row) => row[c] === '#'));
  });
  return cols;
}

/**
 * A name plate on the front-left of a building: a framed board along a (from a0 to a1) at b, its bottom z
 * art pixels up, with the name lettered in the plate font, centred and slanted with the wall like paint.
 * Drawn after the ink pass in native pixels so the letters stay crisp on any lot. legs stands it on two
 * thin posts from the ground (a papan nama in the front yard); otherwise it rides where z puts it. style
 * 'raised' lifts it on two posts above z (a sign on the roof); 'emblem' draws the building's 5x5 pictogram
 * instead of the word, for sprites where lettering made the front too busy.
 */
export function namePlate(p: Painter, text: string, a0: number, a1: number, b: number, z: number, opts: { bg?: string; fg?: string; frame?: string; legs?: boolean; style?: 'text' | 'raised' | 'emblem'; lift?: number; icon?: boolean } = {}): void {
  const { bg = '#f6ecd4', fg = '#2a1810', frame = '#27427c', legs = false, style = 'text' } = opts;
  if (p.site) return;
  p.overlay.push((q) => {
    // An icon, not a word (review 2026-11-09): a raised board can carry the pictogram too.
    const ink = style === 'emblem' || opts.icon ? emblem(text) : letters(text).map((col) => col.map((on) => (on ? fg : null)));
    // A raised plate stands on two posts well clear of the roof it rides on, so it reads as a sign on top.
    const lift = style === 'raised' ? (opts.lift ?? 8) : 0;
    const pad = 2;
    const w = ink.length + 2 * pad;
    const rows = ink[0]?.length ?? 5;
    const h = rows + 2;
    const [xm, ym] = spot(q, (a0 + a1) / 2, b, z + lift);
    const X0 = Math.round(xm - w / 2);
    // A pictogram faces the street flat, so its shape reads; only a word is slanted with the wall like paint.
    const pict = style === 'emblem' || !!opts.icon;
    const Y0 = pict ? ym : ym - w / 4;
    // The posts stand where the span a0..a1 is, so they land on the roof or wall below, never in the air
    // past the building's edge when the plate is wider than its front.
    const inset = Math.min(0.04, (a1 - a0) / 4);
    const postCols = [a0 + inset, a1 - inset].map((a) => Math.max(1, Math.min(w - 2, Math.round(spot(q, a, b, z + lift)[0]) - X0)));
    for (let c = 0; c < w; c++) {
      const base = Math.round(pict ? Y0 : Y0 + c / 2);
      for (let r = 0; r < h; r++) {
        const edge = r === 0 || r === h - 1 || c === 0 || c === w - 1;
        const col = ink[c - pad];
        const tr = r - 1;
        const on = !edge && col && tr >= 0 && tr < rows ? col[tr] : null;
        q.px(X0 + c, base - h + 1 + r, edge ? frame : on ?? bg);
      }
      // Posts: down to the ground for a yard plate, down to the roof for a raised one.
      const post = (legs ? z + lift : lift) * q.zs;
      if ((legs || lift) && postCols.includes(c)) for (let d = 1; d <= post; d++) q.px(X0 + c, base + d, '#6d635a');
    }
  });
}

// Pictograms for the emblem plate style, one per building, keyed by the plate's name. Most are 5x5; the
// Pasar basket and the RSUD cross are bigger so they read from across the map (review 2026-11-09: an icon,
// never a word, unless the name is as short as RT or RW).
const EMBLEMS: Record<string, string[]> = {
  LURAH: ['..y..', '.yyy.', 'yyyyy', '.y.y.', 'y...y'],
  // A basket of produce: a banana, a chili, an orange and a cabbage leaf over a woven rim.
  PASAR: ['..g..y.', '.rrg.yy', 'rrooggy', 'nnnnnnn', '.nanan.'],
  // The red cross of a hospital, bigger than the Apotek's green plus.
  RSUD: ['..rrr..', '..rrr..', 'rrrrrrr', 'rrrrrrr', 'rrrrrrr', '..rrr..', '..rrr..'],
  TERMINAL: ['bbbbbbb', 'bcbcbcb', 'bbbbbbb', 'byybbbb', '.k...k.'],
  TAMAN: ['.ggg.', 'ggggg', '.ggg.', '..n..', '..n..'],
  CAMAT: ['..y..', 'yyyyy', '.yyy.', '.y.y.', 'y...y'],
  SATPOL: ['bbbbb', 'byyyb', 'byyyb', '.byb.', '..b..'],
  'POL PP': ['bbbbb', 'byyyb', 'byyyb', '.byb.', '..b..'],
  KSP: ['.yyy.', 'yaaay', 'yayay', 'yaaay', '.yyy.'],
  BLK: ['.S.S.', 'SSSSS', 'SS.SS', 'SSSSS', '.S.S.'],
};
const EMBLEM_C: Record<string, string> = { y: '#f4b935', R: '#df4a2c', a: '#c98a2e', r: '#df4a2c', n: '#a8652f', g: '#6aa443', o: '#e57d2e', b: '#3d72b4', c: '#82bfdc', k: '#2a1810', S: '#6d635a' };

/** The emblem for a plate name as columns of colours (null is the plate's background). */
function emblem(text: string): (string | null)[][] {
  const g = EMBLEMS[text] ?? EMBLEMS.LURAH;
  const cols: (string | null)[][] = [];
  for (let c = 0; c < g[0].length; c++) cols.push(g.map((row) => (row[c] === '.' ? null : EMBLEM_C[row[c]])));
  return cols;
}

/**
 * A light the map blinks over the sprite at lot point (a, b), up art pixels high: it steps through cycle
 * (null shows the sprite under it) every period ms. Native 1px, so it stays a dot on any lot.
 */
export function beacon(p: Painter, a: number, b: number, up: number, cycle: (string | null)[], period = 400, dx = 0): void {
  if (p.site) return;
  const [x, y] = spot(p, a, b, up);
  p.blink.push({ x: Math.round(x) + dx, y: Math.round(y), cycle, period });
}

/**
 * A rotator light bar on a roof at lot point (a, b), z up: a dark base with a red lamp on the left and a
 * blue one on the right, drawn dim on the sprite; the map flashes them in turn (beacon).
 */
export function sirenBar(p: Painter, a: number, b: number, z: number): void {
  if (p.site) return;
  // Two lamp rows each side of a pale centre, on a dark base: red on the left, blue on the right.
  const lamps: [number, number, string][] = [];
  for (const d of [1, 2]) for (let e = -4; e <= 4; e++) if (e) lamps.push([e, d, e < 0 ? (d === 2 ? '#a8321f' : '#8a2a20') : d === 2 ? '#27427c' : '#1d3260']);
  p.overlay.push((q) => {
    const [x, y] = spot(q, a, b, z);
    const X = Math.round(x), Y = Math.round(y);
    for (let e = -5; e <= 5; e++) q.px(X + e, Y, '#2a1810');
    for (const [e, d, c] of lamps) q.px(X + e, Y - d, c);
    for (const d of [1, 2, 3]) q.px(X, Y - d, '#d8d0c0');
  });
  const RED = '#ff5a40', BLUE = '#5aa8ff';
  // The lamps sweep: red lit, then blue, a beat apart, like a rotator seen from the street.
  for (const [e, d] of lamps) beacon(p, a, b, z + d, e < 0 ? [RED, null] : [null, BLUE], 260, e);
}

/** A motor parked side-on at ground (a, b), in native pixels: two wheels, a body in its colour, a seat. */
export function motorAt(p: Painter, a: number, b: number, body = '#df4a2c'): void {
  if (p.site) return;
  p.overlay.push((q) => {
    const [x, y] = spot(q, a, b);
    const X = Math.round(x), Y = Math.round(y);
    for (const e of [0, 4]) for (const d of [0, 1]) q.px(X + e, Y - d, '#2a1810');
    for (let e = 0; e < 5; e++) q.px(X + e, Y - 2, e === 4 ? '#6d635a' : body);
    q.px(X + 1, Y - 3, '#2a1810');
    q.px(X + 2, Y - 3, '#2a1810');
    q.px(X + 4, Y - 3, '#bdb4a3');
    q.px(X + 4, Y - 4, '#6d635a');
  });
}

/** A split AC unit on a wall face: a small cream box with a dark grille, at ground (a, b), z up. */
export function acUnit(p: Painter, a: number, b: number, z: number): void {
  prism(p, a, a + 0.05, b, b + 0.03, 2, 'w', (face, _u, j, i) => (face !== 'T' && j === 0 && i % 2 ? 'S' : undefined), z);
}

/** A bench along a at b: a plank seat on two legs. */
export function bench(p: Painter, a0: number, a1: number, b: number): void {
  prism(p, a0, a1, b, b + 0.03, 2, 'n', (face) => (face === 'T' ? 't' : undefined));
}

/** A lamp post at ground (a, b), h tall, with a warm lamp head. Native 1px. */
export function lampPost(p: Painter, a: number, b: number, h: number): void {
  p.overlay.push((q) => {
    const [x, y] = spot(q, a, b);
    const X = Math.round(x), Y = Math.round(y);
    for (let d = 0; d < h * q.zs; d++) q.px(X, Y - d, '#3b3430');
    q.px(X - 1, Y - h * q.zs, '#3b3430');
    q.px(X + 1, Y - h * q.zs, '#3b3430');
    q.px(X, Y - h * q.zs - 1, '#f4b935');
    q.px(X - 1, Y - h * q.zs + 1, '#f4b935');
    q.px(X + 1, Y - h * q.zs + 1, '#f4b935');
  });
}
