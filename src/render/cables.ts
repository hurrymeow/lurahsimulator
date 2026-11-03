// Electric poles and messy cables beside the kampung's jalan setapak, the most Indonesian thing on
// any kampung street: wires sagging at different depths, loose loops, a kite caught on a wire, a
// single sandal, a row of birds. The ring road has none. The kit grows with the stage: leaning wooden
// poles at RT, grey concrete PLN poles from RW, and black fibre bundles from Kelurahan.
// Each span and pole is a small cached sprite, so a frame only blits what is on screen.
import { GRID_H, GRID_W, type Building, type StageId } from '../sim/types';
import { TH, TW } from './iso';
import { layoutPoles, poleHash } from './poles';
import { WORLD_OX, WORLD_OY } from './scenery';

/** Pole height in art pixels, ground to the top of the crossarm. */
const POLE_H = 26;
/** Where the wires leave a pole, against its foot: four insulators on the crossarm, low ones for drops. */
const ATTACH: [number, number][] = [[-3, -POLE_H + 2], [-1, -POLE_H + 1], [1, -POLE_H + 1], [3, -POLE_H + 2]];

const hash = poleHash;

interface Pole {
  /** Tile-space position of the foot. */
  a: number;
  b: number;
  /** World art pixel of the foot. */
  x: number;
  y: number;
  /** In front of the kampung's buildings (front two sides and the side corners). */
  front: boolean;
  lean: number;
}

interface Sprite {
  canvas: HTMLCanvasElement;
  /** World art position of the canvas's top-left. */
  x: number;
  y: number;
  front: boolean;
  /** Sways a pixel with the breeze. */
  sway: boolean;
  phase: number;
}

type Kit = 'kayu' | 'beton' | 'fiber';
const kitOf = (stage: StageId): Kit => (stage === 'rt' ? 'kayu' : stage === 'rw' ? 'beton' : 'fiber');

/** Rebuild key for the grid, the stage's kit and the world origin. */
let cachedKey = '';

const hex = (c: string) => parseInt(c.slice(1), 16);

/** A tiny pixel canvas helper. */
function canvas(w: number, h: number): [HTMLCanvasElement, (x: number, y: number, c: string) => void] {
  const cv = document.createElement('canvas');
  cv.width = Math.max(1, w);
  cv.height = Math.max(1, h);
  const ctx = cv.getContext('2d')!;
  const img = ctx.createImageData(cv.width, cv.height);
  const put = (x: number, y: number, c: string) => {
    x = Math.round(x);
    y = Math.round(y);
    if (x < 0 || y < 0 || x >= cv.width || y >= cv.height) return;
    const n = hex(c);
    img.data.set([(n >> 16) & 255, (n >> 8) & 255, n & 255, 255], (y * cv.width + x) * 4);
  };
  const flush = cv as HTMLCanvasElement & { flush?: () => void };
  flush.flush = () => ctx.putImageData(img, 0, 0);
  return [cv, put];
}
const flush = (cv: HTMLCanvasElement) => (cv as HTMLCanvasElement & { flush?: () => void }).flush?.();

/** A pole sprite: wood or concrete, a crossarm with white insulators, a coloured outline. */
function poleSprite(p: Pole, kit: Kit, i: number): Sprite {
  const W = 11;
  const H = POLE_H + 4;
  const [cv, put] = canvas(W, H);
  const cx = 5;
  const foot = H - 2;
  const body = kit === 'kayu' ? ['#8a5a32', '#6a4226'] : ['#bdb4a3', '#8f877a'];
  const edge = kit === 'kayu' ? '#3e2716' : '#55504a';
  for (let y = 0; y < POLE_H; y++) {
    const x = cx + Math.round((p.lean * y) / POLE_H);
    put(x, foot - y, body[0]);
    put(x + 1, foot - y, body[1]);
    put(x - 1, foot - y, edge);
    put(x + 2, foot - y, edge);
    // Concrete poles carry the PLN number plate and step bolts.
    if (kit !== 'kayu' && y === 9) put(x, foot - y, '#3d72b4');
    if (kit !== 'kayu' && y > 12 && y % 4 === 0) put(x + 2, foot - y, '#6d635a');
  }
  const tx = cx + p.lean;
  const ty = foot - POLE_H + 1;
  for (let x = -4; x <= 5; x++) {
    put(tx + x, ty + 2, kit === 'kayu' ? '#6a4226' : '#6d635a');
    put(tx + x, ty + 3, edge);
  }
  for (const [ax, ay] of ATTACH) put(tx + ax, foot + ay, '#f6ecd4');
  // Odd extras: a junction box, or a coil of spare cable.
  if (hash(i, 9) < 0.3) for (let y = 12; y < 15; y++) for (let x = 1; x < 4; x++) put(cx + x, foot - y, x === 3 || y === 14 ? '#55504a' : '#93a0a8');
  else if (hash(i, 9) < 0.5) for (const [x, y] of [[2, 15], [3, 16], [3, 17], [2, 18], [1, 17], [1, 16]]) put(cx + x, foot - y, '#2f2a26');
  flush(cv);
  return { canvas: cv, x: p.x - cx, y: p.y - foot, front: p.front, sway: false, phase: 0 };
}

/** Points of a sagging wire from (x0, y0) to (x1, y1), one per pixel step along x. */
function sagLine(x0: number, y0: number, x1: number, y1: number, sag: number): [number, number][] {
  const n = Math.max(2, Math.ceil(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0))));
  const pts: [number, number][] = [];
  for (let k = 0; k <= n; k++) {
    const u = k / n;
    pts.push([Math.round(x0 + (x1 - x0) * u), Math.round(y0 + (y1 - y0) * u + sag * 4 * u * (1 - u))]);
  }
  return pts;
}

/** A span of wires between two poles, with whatever got caught on it. */
function spanSprite(p: Pole, q: Pole, kit: Kit, i: number): Sprite {
  const pad = 4;
  const maxSag = 16;
  const x0 = Math.min(p.x, q.x) - pad;
  const y0 = Math.min(p.y, q.y) - POLE_H - pad;
  const w = Math.abs(p.x - q.x) + pad * 2 + 1;
  const h = Math.abs(p.y - q.y) + POLE_H + maxSag + pad * 2;
  const [cv, put] = canvas(w, h);
  const WIRE = ['#2f2a26', '#3a3430', '#2a2420', '#453c34'];
  const tops: [number, number][][] = [];
  ATTACH.forEach(([ax, ay], k) => {
    // Each wire sags by its own amount, so they never run parallel.
    const sag = 2 + hash(i * 4 + k, 11) * 6;
    const pts = sagLine(p.x + p.lean + ax - x0, p.y + ay - y0, q.x + q.lean + ax - x0, q.y + ay - y0, sag);
    for (const [x, y] of pts) put(x, y, WIRE[k]);
    tops.push(pts);
  });
  // A loose loop hanging low on some spans, and a fat black fibre bundle from Kelurahan on.
  if (hash(i, 12) < 0.4) for (const [x, y] of sagLine(p.x + p.lean - x0, p.y - POLE_H + 6 - y0, q.x + q.lean - x0, q.y - POLE_H + 6 - y0, 9 + hash(i, 13) * 5)) put(x, y, '#2a2420');
  if (kit === 'fiber')
    for (const [x, y] of sagLine(p.x + p.lean - 2 - x0, p.y - POLE_H + 8 - y0, q.x + q.lean - 2 - x0, q.y - POLE_H + 8 - y0, 5 + hash(i, 14) * 3)) {
      put(x, y, '#1f1c1a');
      put(x, y + 1, '#34302c');
    }
  const mid = tops[1][Math.floor(tops[1].length * (0.35 + hash(i, 15) * 0.3))];
  const r = hash(i, 16);
  if (r < 0.1) {
    // A layangan caught on the wire, its tail hanging down.
    const [mx, my] = mid;
    for (let d = 0; d <= 3; d++) for (let e = -d; e <= d; e++) put(mx + e, my - 3 + d, d < 2 ? '#df4a2c' : '#f6ecd4');
    for (let d = 2; d >= 0; d--) for (let e = -d; e <= d; e++) put(mx + e, my + 3 - d + 1, '#df4a2c');
    for (let t = 0; t < 6; t++) put(mx + Math.round(Math.sin(t) * 1), my + 5 + t, t % 2 ? '#f4b935' : '#e57d2e');
  } else if (r < 0.16) {
    // One sandal, hung by its strap.
    const [mx, my] = mid;
    put(mx, my + 1, '#3d72b4');
    for (let y = 2; y < 6; y++) for (let x = -1; x <= 1; x++) put(mx + x, my + y, y === 5 || x === 1 ? '#27427c' : '#3d72b4');
  } else if (r < 0.32) {
    // A row of birds on the top wire.
    const row = tops[0];
    const n = 3 + Math.floor(hash(i, 17) * 3);
    for (let b = 0; b < n; b++) {
      const [bx, by] = row[Math.floor(row.length * (0.25 + b * 0.09))];
      put(bx, by - 1, '#4a3c34');
      put(bx + 1, by - 1, '#5a4a40');
      put(bx, by - 2, '#5a4a40');
    }
  }
  flush(cv);
  return { canvas: cv, x: x0, y: y0, front: p.front || q.front, sway: true, phase: hash(i, 18) * Math.PI * 2 };
}

/** Notes the grid, the stage's kit and the world origin, so the path poles rebuild when one changes. */
function build(stage: StageId): void {
  cachedKey = `${GRID_W}x${GRID_H}:${kitOf(stage)}:${WORLD_OX},${WORLD_OY}`;
}

// ---------------------------------------------------------------- Poles by the jalan setapak
// Inside the kampung a pole goes up beside the jalan setapak every four to ten path tiles, counted in
// the order the paths were built. Wires run only along a straight path between two poles (`poles.ts`),
// and each span is cut into one slice per path tile, so it sorts with the buildings: a house in front
// of the path hides the wire, and no wire crosses a house or an empty lot (UI.md rule 17).

export interface PathPole {
  /** The path tile it stands on, for the draw order. */
  x: number;
  y: number;
  sprite: Sprite;
}

let pathKey = '';
let pathPoles: PathPole[] = [];

/** Poles beside the paths and the wire slices between them, rebuilt when the paths or the stage change. */
function buildPath(buildings: readonly Building[], stage: StageId): void {
  build(stage);
  const paths = buildings.filter((b) => b.def === 'jalan');
  const key = `${cachedKey}|${paths.map((b) => `${b.uid}:${b.x},${b.y}`).join(';')}`;
  if (key === pathKey) return;
  pathKey = key;
  const kit = kitOf(stage);
  const layout = layoutPoles(paths);
  const poles: Pole[] = layout.poles.map((p) => ({
    a: p.a,
    b: p.b,
    x: Math.round(WORLD_OX + ((p.a - p.b) * TW) / 2),
    y: Math.round(WORLD_OY + ((p.a + p.b) * TH) / 2),
    front: true,
    lean: hash(p.seed, 3) < 0.2 ? (hash(p.seed, 4) < 0.5 ? -1 : 1) : 0,
  }));
  pathPoles = layout.poles.map((p, i) => ({ x: p.x, y: p.y, sprite: poleSprite(poles[i], kit, p.seed) }));
  for (const sp of layout.spans) {
    const p = poles[sp.from];
    const q = poles[sp.to];
    const whole = spanSprite(p, q, kit, layout.poles[sp.to].seed);
    // Each path tile under the wire owns the columns of the span above it on screen.
    const across = sp.axis === 'x' ? (p.b + q.b) / 2 : (p.a + q.a) / 2;
    const edge = (t: number) => WORLD_OX + ((sp.axis === 'x' ? t - across : across - t) * TW) / 2;
    const cols = sp.tiles.map((t) => {
      const along = sp.axis === 'x' ? t.x : t.y;
      const [l, r] = [edge(along), edge(along + 1)].sort((m, n) => m - n);
      return { t, lo: Math.round(l), hi: Math.round(r) };
    });
    // The slices at the screen's left and right ends also take the pad round each pole.
    cols.sort((m, n) => m.lo - n.lo);
    cols[0].lo = whole.x;
    cols[cols.length - 1].hi = whole.x + whole.canvas.width;
    for (const { t, lo, hi } of cols) {
      if (hi <= lo) continue;
      const cv = document.createElement('canvas');
      cv.width = hi - lo;
      cv.height = whole.canvas.height;
      cv.getContext('2d')!.drawImage(whole.canvas, lo - whole.x, 0, hi - lo, cv.height, 0, 0, hi - lo, cv.height);
      pathPoles.push({ x: t.x, y: t.y, sprite: { ...whole, canvas: cv, x: lo } });
    }
  }
}

/** The poles beside the paths and the slices of wire over each path tile, for the map's back-to-front pass. */
export function polesByPaths(buildings: readonly Building[], stage: StageId): PathPole[] {
  buildPath(buildings, stage);
  return pathPoles;
}

/** Draws one sprite of this module at its world position. */
export function drawSprite(ctx: CanvasRenderingContext2D, sp: Sprite, wx: number, wy: number, s: number, now: number, motion: boolean): void {
  const dy = sp.sway && motion ? Math.round((Math.sin(now / 1300 + sp.phase) + 1) / 2) : 0;
  ctx.drawImage(sp.canvas, wx + sp.x * s, wy + sp.y * s + dy * s, sp.canvas.width * s, sp.canvas.height * s);
}
