// The land around the kampung: a ring road, sawah, kebun, a beach and sea in front, and the two
// mountains with the sun between them from every kid's "pemandangan" drawing. Decorative only.
import { GRID_H, GRID_W } from '../sim/types';
import { iso, TH, TOP, TW } from './iso';

export const SKY = '#9fd3ee';
export const SEA = '#2f6fae';

/** World extent in tiles, beyond the buildable grid. */
const XMIN = -12;
const YMIN = -12;
const XMAX = GRID_W + 8;
const YMAX = GRID_H + 8;
/** Headroom above the world's top corner, for the mountains. */
const HEAD = 120;

export const WORLD_W = (XMAX - XMIN + (YMAX - YMIN)) * (TW / 2);
export const WORLD_H = HEAD + (XMAX - XMIN + (YMAX - YMIN)) * (TH / 2);
/** Art position of grid tile (0,0)'s top corner inside the world canvas. */
export const WORLD_OX = (YMAX - XMIN) * (TW / 2);
export const WORLD_OY = HEAD - (XMIN + YMIN) * (TH / 2);
/** Tiles further back than this are sky. Rows of equal depth are level on screen, so the horizon is flat. */
const FAR = -12;
/** Art row of the horizon inside the world canvas. */
export const HORIZON = WORLD_OY + (FAR * TH) / 2;

type Terrain = 'grass' | 'road' | 'sawah' | 'kebun' | 'hutan' | 'beach' | 'sea';

function hash(x: number, y: number): number {
  let h = (x * 374761393 + y * 668265263) ^ 0x5bd1e995;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

function terrain(tx: number, ty: number): Terrain {
  if (tx >= 0 && ty >= 0 && tx < GRID_W && ty < GRID_H) return 'grass';
  if (tx >= -1 && ty >= -1 && tx <= GRID_W && ty <= GRID_H) return 'road';
  // The front two sides run down to a beach and the sea, with a ragged coastline.
  const coast = Math.max(tx - GRID_W - 3, ty - GRID_H - 5) + hash(tx, ty) * 1.2;
  if (coast > 0.7) return 'sea';
  if (coast > -0.3) return 'beach';
  if (tx > GRID_W || ty > GRID_H) return 'sawah';
  if (tx < -1 && ty < -1) return tx + ty < -9 ? 'hutan' : 'kebun';
  return tx < -1 ? 'kebun' : 'sawah';
}

const hex = (c: string) => parseInt(c.slice(1), 16);

function groundColour(t: Terrain, a: number, b: number, x: number, y: number, tx: number, ty: number): string {
  const n = hash(x, y);
  switch (t) {
    case 'grass':
      return n < 0.03 ? '#577a3c' : (tx + ty) % 2 ? '#3d5f2b' : '#43672f';
    case 'road':
      return n < 0.08 ? '#9a7348' : '#b48c5c';
    case 'sawah':
      // Pematang bunds round each plot, then rows of rice with water glinting between them.
      if (a < 0.07 || b < 0.07) return '#7a6a3a';
      // Some plots are ripe and turn gold.
      if (Math.floor(a * 8) % 2) return (tx * 3 + ty) % 5 === 0 ? '#c9b94a' : '#6fae2e';
      return n < 0.03 ? '#a5d8f0' : (tx * 3 + ty) % 5 === 0 ? '#a89a3c' : '#5a9128';
    case 'kebun':
      return n < 0.05 ? '#2f4a22' : '#3a5a2a';
    case 'hutan':
      return n < 0.1 ? '#22381b' : '#2a4421';
    case 'beach':
      return n < 0.06 ? '#cdb57a' : '#e8d39a';
    case 'sea':
      return (Math.floor(x / 3) + y) % 9 === 0 && n < 0.5 ? '#5b9bd5' : SEA;
  }
}

/** One mountain: a ridge down the middle, lit on the left, with a pale peak. */
function mountain(img: ImageData, cx: number, baseY: number, hw: number, h: number): void {
  const peak = baseY - h;
  for (let y = Math.max(0, Math.floor(peak)); y < Math.min(WORLD_H, baseY); y++) {
    const span = (hw * (y - peak)) / h;
    for (let x = Math.max(0, Math.floor(cx - span)); x < Math.min(WORLD_W, Math.ceil(cx + span)); x++) {
      const n = hash(x, y);
      const ridge = cx + Math.sin((y - peak) / 9) * 3;
      const top = y - peak < h * 0.18 + n * 4;
      const c = top ? (x < ridge ? '#d8e6ec' : '#aac2cc') : x < ridge ? (n < 0.08 ? '#4f8a76' : '#5c9a82') : n < 0.08 ? '#3a6b5c' : '#447a68';
      put(img, x, y, c);
    }
  }
}

function put(img: ImageData, x: number, y: number, c: string): void {
  const n = hex(c);
  img.data.set([(n >> 16) & 255, (n >> 8) & 255, n & 255, 255], (y * WORLD_W + x) * 4);
}

/** Renders the whole world at art resolution. Cached by the caller. */
export function buildWorld(): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = WORLD_W;
  c.height = WORLD_H;
  const ctx = c.getContext('2d')!;
  const img = ctx.createImageData(WORLD_W, WORLD_H);

  // Sky above the horizon, sea everywhere else the land does not reach.
  for (let y = 0; y < WORLD_H; y++) for (let x = 0; x < WORLD_W; x++) put(img, x, y, y < HORIZON ? SKY : SEA);

  // Ground tiles.
  for (let y = HORIZON; y < WORLD_H; y++)
    for (let x = 0; x < WORLD_W; x++) {
      const rx = (x + 0.5 - WORLD_OX) / (TW / 2);
      const ry = (y + 0.5 - WORLD_OY) / (TH / 2);
      const a = (rx + ry) / 2;
      const b = (ry - rx) / 2;
      const tx = Math.floor(a);
      const ty = Math.floor(b);
      if (tx < XMIN || ty < YMIN || tx >= XMAX || ty >= YMAX || tx + ty < FAR) continue;
      put(img, x, y, groundColour(terrain(tx, ty), a - tx, b - ty, x, y, tx, ty));
    }

  // The sun sits in the valley between the two mountains, which stand on the horizon.
  const m1 = WORLD_OX + (-8 * TW) / 2;
  const m2 = WORLD_OX + (4 * TW) / 2;
  const base = HORIZON + 30;
  const sx = (m1 + m2) / 2;
  const sy = HORIZON - 70;
  for (let y = sy - 16; y <= sy + 16; y++)
    for (let x = sx - 16; x <= sx + 16; x++) if ((x - sx) ** 2 + (y - sy) ** 2 <= 256) put(img, x, y, (x - sx + 5) ** 2 + (y - sy + 5) ** 2 < 40 ? '#fde68a' : '#facc15');
  for (const [cx, cy, w] of [[sx - 150, sy - 40, 22], [sx + 120, sy - 60, 16]])
    for (let k = 0; k < 3; k++)
      for (let x = cx + k * 5 - w / 2; x < cx + w / 2 - k * 5; x++) for (let y = cy - k * 3; y < cy - k * 3 + 3; y++) put(img, Math.round(x), Math.round(y), '#f4f4f5');
  mountain(img, m1, base, 130, 165);
  mountain(img, m2, base, 120, 150);
  ctx.putImageData(img, 0, 0);

  // Trees in front of the foothills, drawn in depth order so nearer trees overlap farther ones.
  for (let d = FAR + 3; d < XMAX + YMAX; d++)
    for (let tx = XMIN; tx < XMAX; tx++) {
      const ty = d - tx;
      if (ty < YMIN || ty >= YMAX) continue;
      const t = terrain(tx, ty);
      const n = hash(tx * 5 + 1, ty * 3 + 2);
      const tree = t === 'hutan' ? (n < 0.75 ? 'pohon' : 'kelapa') : t === 'kebun' ? (n < 0.35 ? 'kelapa' : n < 0.6 ? 'pisang' : n < 0.8 ? 'pohon' : null) : t === 'beach' && n < 0.25 ? 'kelapa' : null;
      if (!tree) continue;
      const art = iso(tree);
      ctx.drawImage(art.canvas, WORLD_OX + ((tx - ty) * TW) / 2 - TW / 2, WORLD_OY + ((tx + ty) * TH) / 2 - TOP);
    }
  return c;
}

/** Decoration for an empty buildable tile, or null for plain grass. Stable per tile. */
export function decoAt(x: number, y: number): string | null {
  const n = hash(x * 11 + 3, y * 17 + 5);
  return n < 0.12 ? 'flowers' : n < 0.22 ? 'bush' : n < 0.45 ? 'rumput' : null;
}
