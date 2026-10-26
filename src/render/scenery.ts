// The land around the kampung: a ring road, sawah, kebun, a beach and sea in front, and the two
// mountains with the sun between them from every kid's "pemandangan" drawing. Decorative only.
import { GRID_H, GRID_W } from '../sim/types';
import { INK, iso, TH, TOP, TW } from './iso';

// Flat colour fields with ink lines where land types meet, a sunburst sky and a grinning sun.
export const SKY = '#f3d9a8';
/** The second band of the sunburst. */
const RAY = '#f7e5bd';
export const SEA = '#3f8f8c';

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
  switch (t) {
    case 'grass':
      return (tx + ty) % 2 ? '#7a9a45' : '#82a34b';
    case 'road':
      return '#d08a52';
    case 'sawah':
      // Pematang bunds round each plot, then straight rows of rice. Some plots are ripe and gold.
      if (a < 0.07 || b < 0.07) return '#8a5a32';
      if ((tx * 3 + ty) % 5 === 0) return Math.floor(a * 8) % 2 ? '#e8b440' : '#d39a32';
      return Math.floor(a * 8) % 2 ? '#9cc155' : '#86ab45';
    case 'kebun':
      return '#5f8a3c';
    case 'hutan':
      return '#4a7334';
    case 'beach':
      return '#efd49a';
    case 'sea':
      // Short straight wave dashes.
      return (x + 2 * y) % 24 < 4 && y % 6 === 0 ? '#7fc4b8' : SEA;
  }
}

/** One mountain: two flat-lit faces split by a straight ridge, a zigzag snow cap and an ink edge. */
function mountain(img: ImageData, cx: number, baseY: number, hw: number, h: number): void {
  const peak = baseY - h;
  for (let y = Math.max(0, Math.floor(peak)); y < Math.min(WORLD_H, baseY); y++) {
    const span = (hw * (y - peak)) / h;
    for (let x = Math.max(0, Math.floor(cx - span)); x < Math.min(WORLD_W, Math.ceil(cx + span)); x++) {
      const edge = x - (cx - span) < 2 || cx + span - x < 2 || Math.abs(x + 0.5 - cx) < 1;
      // Snow line: a straight-edged zigzag across the peak.
      const zig = Math.abs(((x - cx) % 16 + 16) % 16 - 8);
      const snow = y - peak < h * 0.2 + zig;
      const snowEdge = !snow && y - peak < h * 0.2 + zig + 2;
      const c = edge || snowEdge ? INK : snow ? (x < cx ? '#fbf3e0' : '#d9cdb8') : x < cx ? '#5c9a86' : '#3f7468';
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

  // The sun sits in the valley between the two mountains, which stand on the horizon.
  const m1 = WORLD_OX + (-8 * TW) / 2;
  const m2 = WORLD_OX + (4 * TW) / 2;
  const base = HORIZON + 30;
  const sx = (m1 + m2) / 2;
  const sy = HORIZON - 70;

  // Sunburst sky above the horizon: straight rays fanning out from the sun. Sea elsewhere.
  for (let y = 0; y < WORLD_H; y++)
    for (let x = 0; x < WORLD_W; x++) {
      if (y >= HORIZON) put(img, x, y, SEA);
      else put(img, x, y, Math.floor(((Math.atan2(y - sy, x - sx) / Math.PI + 1) * 16)) % 2 ? RAY : SKY);
    }

  // Ground tiles. Each pixel remembers its terrain, so ink lines can follow every border.
  const land = new Uint8Array(WORLD_W * WORLD_H);
  const KINDS: Terrain[] = ['grass', 'road', 'sawah', 'kebun', 'hutan', 'beach', 'sea'];
  for (let y = HORIZON; y < WORLD_H; y++)
    for (let x = 0; x < WORLD_W; x++) {
      const rx = (x + 0.5 - WORLD_OX) / (TW / 2);
      const ry = (y + 0.5 - WORLD_OY) / (TH / 2);
      const a = (rx + ry) / 2;
      const b = (ry - rx) / 2;
      const tx = Math.floor(a);
      const ty = Math.floor(b);
      if (tx < XMIN || ty < YMIN || tx >= XMAX || ty >= YMAX || tx + ty < FAR) continue;
      const t = terrain(tx, ty);
      land[y * WORLD_W + x] = KINDS.indexOf(t) + 1;
      put(img, x, y, groundColour(t, a - tx, b - ty, x, y, tx, ty));
    }
  // Ink where two land types meet, and along the horizon. Sea meeting the open sea stays clean.
  for (let y = HORIZON; y < WORLD_H - 1; y++)
    for (let x = 0; x < WORLD_W - 1; x++) {
      const k = y * WORLD_W + x;
      const here = land[k] || 7;
      const right = land[k + 1] || 7;
      const down = land[k + WORLD_W] || 7;
      const up = y > 0 ? land[k - WORLD_W] : 0;
      if (here !== right || here !== down || (land[k] && y === HORIZON) || (land[k] && !up && y > HORIZON)) put(img, x, y, INK);
    }

  // A grinning sun with an ink rim.
  for (let y = sy - 18; y <= sy + 18; y++)
    for (let x = sx - 18; x <= sx + 18; x++) {
      const d = (x - sx) ** 2 + (y - sy) ** 2;
      if (d > 18 * 18) continue;
      const eye = (Math.abs(x - sx + 6) < 2 || Math.abs(x - sx - 6) < 2) && y >= sy - 7 && y <= sy - 3;
      const smile = Math.abs(Math.sqrt((x - sx) ** 2 + (y - sy + 4) ** 2) - 10) < 1.2 && y > sy + 2;
      const cheek = ((x - sx + 10) ** 2 + (y - sy - 3) ** 2 < 6 || (x - sx - 10) ** 2 + (y - sy - 3) ** 2 < 6);
      put(img, x, y, d > 16 * 16 || eye || smile ? INK : cheek ? '#e8846a' : d < 70 && x < sx && y < sy ? '#fbe08a' : '#f4b935');
    }
  // Stepped clouds: three stacked bars, each outlined.
  for (const [cx, cy, w] of [[sx - 150, sy - 40, 30], [sx + 120, sy - 60, 22]]) {
    const bars = [[cx - w / 2, cy, w], [cx - w / 2 + 5, cy - 4, w - 12], [cx - w / 2 + 10, cy - 8, w - 22]];
    for (const [bx, by, bw] of bars)
      for (let x = Math.round(bx) - 1; x <= Math.round(bx + bw); x++) for (let y = by - 1; y <= by + 4; y++) put(img, x, y, INK);
    for (const [bx, by, bw] of bars)
      for (let x = Math.round(bx); x < Math.round(bx + bw); x++) for (let y = by; y < by + 4; y++) put(img, x, y, y === by + 3 ? '#e6d7bb' : '#fbf6ea');
  }
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
