// Electric poles and messy cables along the ring road, the most Indonesian thing on any kampung
// street: wires sagging at different depths, loose loops, a drop line to the nearest house, a kite
// caught on a wire, a single sandal, a row of birds. The kit grows with the stage: leaning wooden
// poles at RT, grey concrete PLN poles from RW, and black fibre bundles from Kelurahan.
// Each span and pole is a small cached sprite, so a frame only blits what is on screen.
import { GRID_H, GRID_W, type StageId } from '../sim/types';
import { TH, TW } from './iso';
import { WORLD_OX, WORLD_OY } from './scenery';

/** Poles stand every POLE_STEP tiles along the outer edge of the ring road. */
const POLE_STEP = 3;
/** Pole height in art pixels, ground to the top of the crossarm. */
const POLE_H = 26;
/** Where the wires leave a pole, against its foot: four insulators on the crossarm, low ones for drops. */
const ATTACH: [number, number][] = [[-3, -POLE_H + 2], [-1, -POLE_H + 1], [1, -POLE_H + 1], [3, -POLE_H + 2]];

function hash(x: number, y: number): number {
  let h = (x * 374761393 + y * 668265263) ^ 0x51ed270b;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

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

let cachedKey = '';
let sprites: Sprite[] = [];

/** Poles round the ring road, walking the loop so neighbours connect. */
function poles(): Pole[] {
  const out: Pole[] = [];
  const at = (a: number, b: number, front: boolean, i: number) =>
    out.push({ a, b, x: Math.round(WORLD_OX + ((a - b) * TW) / 2), y: Math.round(WORLD_OY + ((a + b) * TH) / 2), front, lean: hash(i, 3) < 0.25 ? (hash(i, 4) < 0.5 ? -1 : 1) : 0 });
  const E = 0.85;
  let i = 0;
  // Back edge (b = -1 side), left to right along a.
  for (let a = -1; a <= GRID_W; a += POLE_STEP) at(a + 0.5, -E, a + 0.5 > GRID_W, i++);
  // Right-front edge (a = GRID_W side), down along b.
  for (let b = POLE_STEP - 1; b <= GRID_H; b += POLE_STEP) at(GRID_W + E, b + 0.5, true, i++);
  // Front edge (b = GRID_H side), back along a.
  for (let a = GRID_W - POLE_STEP; a >= -1; a -= POLE_STEP) at(a + 0.5, GRID_H + E, true, i++);
  // Left edge (a = -1 side), back up along b.
  for (let b = GRID_H - POLE_STEP; b >= 0; b -= POLE_STEP) at(-E, b + 0.5, b + 0.5 > GRID_H, i++);
  return out;
}

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

/** Rebuilds the sprites when the grid or the stage changes. */
function build(stage: StageId): Sprite[] {
  const key = `${GRID_W}x${GRID_H}:${kitOf(stage)}:${WORLD_OX},${WORLD_OY}`;
  if (key === cachedKey) return sprites;
  cachedKey = key;
  const kit = kitOf(stage);
  const ps = poles();
  sprites = [];
  ps.forEach((p, i) => {
    const q = ps[(i + 1) % ps.length];
    sprites.push(spanSprite(p, q, kit, i));
  });
  ps.forEach((p, i) => sprites.push(poleSprite(p, kit, i)));
  return sprites;
}

/**
 * Draws the poles and cables on one side of the kampung: the back side before the buildings, the
 * front side after them, so a pole never stands in front of a house it is behind.
 */
export function drawCables(ctx: CanvasRenderingContext2D, stage: StageId, front: boolean, wx: number, wy: number, s: number, viewW: number, viewH: number, now: number, motion: boolean): void {
  for (const sp of build(stage)) {
    if (sp.front !== front) continue;
    const left = wx + sp.x * s;
    const top = wy + sp.y * s;
    const w = sp.canvas.width * s;
    const h = sp.canvas.height * s;
    if (left > viewW || top > viewH || left + w < 0 || top + h < 0) continue;
    const dy = sp.sway && motion ? Math.round((Math.sin(now / 1300 + sp.phase) + 1) / 2) : 0;
    ctx.drawImage(sp.canvas, left, top + dy * s, w, h);
  }
}
