// The land around the kampung: a ring road, sawah, kebun, a beach and sea in front, and the two
// mountains with the sun between them from every kid's "pemandangan" drawing. Decorative only.
import { GRID_H, GRID_W } from '../sim/types';
import { INK, TH, TOP, TW } from './iso';

// Painterly ground (clumped grass, dirt with pebbles, fallen leaves) with ink lines where land
// types meet, a raised kampung that drops to the beach in a cliff, a deep blue sunburst sky with
// soft clouds, and a grinning sun.
/** Top of the sky, also the fill past the world's top edge. */
export const SKY = '#3f6fae';
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

/** The sun sits in the valley between the two mountains, which stand on the horizon. */
const M1 = WORLD_OX + (-8 * TW) / 2;
const M2 = WORLD_OX + (4 * TW) / 2;
export const SUN_X = (M1 + M2) / 2;
export const SUN_Y = HORIZON - 70;
/** Sun art is this many art pixels square, centred on SUN_X, SUN_Y. */
export const SUN_SIZE = 44;

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

/** Smooth value noise, 0 to 1, on a grid of the given cell size. */
function vnoise(x: number, y: number, cell: number): number {
  const gx = x / cell;
  const gy = y / cell;
  const x0 = Math.floor(gx);
  const y0 = Math.floor(gy);
  const fx = gx - x0;
  const fy = gy - y0;
  const sx = fx * fx * (3 - 2 * fx);
  const sy = fy * fy * (3 - 2 * fy);
  const top = hash(x0, y0) + (hash(x0 + 1, y0) - hash(x0, y0)) * sx;
  const bot = hash(x0, y0 + 1) + (hash(x0 + 1, y0 + 1) - hash(x0, y0 + 1)) * sx;
  return top + (bot - top) * sy;
}

/** Clumpy texture, squashed 2:1 so clumps lie flat on the isometric ground. */
function clumps(x: number, y: number): number {
  return vnoise(x, y * 2, 9) * 0.65 + vnoise(x + 71, y * 2 + 13, 3.5) * 0.35;
}

/** Picks one of a few tones from a 0..1 value, so texture stays in flat painted steps. */
const tone = (v: number, tones: string[]) => tones[Math.max(0, Math.min(tones.length - 1, Math.floor(v * tones.length)))];

const GRASS = ['#6c8b3a', '#78993f', '#84a748', '#92b553'];
const KEBUN = ['#4f7733', '#5a843a', '#669142'];
const HUTAN = ['#3c6229', '#466e30', '#517a37'];
const DIRT = ['#b87444', '#c4804b', '#d08a52', '#d99a62'];
const SAND = ['#e6c486', '#edd093', '#f3daa2'];

function groundColour(t: Terrain, a: number, b: number, x: number, y: number, tx: number, ty: number): string {
  const n = clumps(x, y);
  const speck = hash(x * 7 + 3, y * 13 + 1);
  switch (t) {
    case 'grass':
      // Painted clumps with bright blade tips. A faint tile checker stays so plots still read.
      if (speck < 0.035) return '#a8c768';
      if (speck > 0.975) return '#5a7a30';
      return tone(n * 0.9 + ((tx + ty) % 2 ? 0 : 0.1), GRASS);
    case 'road':
      // Packed dirt in worn patches, with pebbles that catch the light on top.
      if (speck < 0.02) return '#efb878';
      if (speck > 0.985) return '#9a5e34';
      return tone(n, DIRT);
    case 'sawah':
      // Pematang bunds round each plot, then straight rows of rice. Some plots are ripe and gold.
      if (a < 0.07 || b < 0.07) return n > 0.5 ? '#8a5a32' : '#7d5130';
      if ((tx * 3 + ty) % 5 === 0) return Math.floor(a * 8) % 2 ? (n > 0.6 ? '#f0c050' : '#e8b440') : '#d39a32';
      return Math.floor(a * 8) % 2 ? (n > 0.6 ? '#a8cb5e' : '#9cc155') : n < 0.3 ? '#7a9e3f' : '#86ab45';
    case 'kebun':
      return speck < 0.03 ? '#7aa04a' : tone(n, KEBUN);
    case 'hutan':
      return speck < 0.03 ? '#628a40' : tone(n, HUTAN);
    case 'beach':
      // Sand with wind ripples along the shore.
      if ((x + 2 * y + Math.floor(n * 6)) % 11 === 0) return '#dcb778';
      return tone(n, SAND);
    case 'sea':
      // Shimmering bands and short straight wave dashes.
      if ((x + 2 * y) % 24 < 4 && y % 6 === 0) return '#8fd0c2';
      return n > 0.62 ? '#4a9b96' : n < 0.3 ? '#367f80' : SEA;
  }
}

/** One mountain: two flat-lit faces split by a straight ridge, a zigzag snow cap and an ink edge. */
function mountain(img: ImageData, cx: number, baseY: number, hw: number, h: number): void {
  const peak = baseY - h;
  // The mountains stand on the horizon: nothing of them is drawn over the land in front.
  for (let y = Math.max(0, Math.floor(peak)); y < Math.min(WORLD_H, baseY, HORIZON); y++) {
    const span = (hw * (y - peak)) / h;
    for (let x = Math.max(0, Math.floor(cx - span)); x < Math.min(WORLD_W, Math.ceil(cx + span)); x++) {
      const edge = x - (cx - span) < 2 || cx + span - x < 2 || Math.abs(x + 0.5 - cx) < 1;
      // Snow line: a straight-edged zigzag across the peak.
      const zig = Math.abs(((x - cx) % 16 + 16) % 16 - 8);
      const snow = y - peak < h * 0.2 + zig;
      const snowEdge = !snow && y - peak < h * 0.2 + zig + 2;
      // Rock strata run parallel to each slope, and forest darkens the lower flanks.
      const along = x < cx ? x + (y - peak) * (hw / h) : x - (y - peak) * (hw / h);
      const strata = Math.floor(along) % 12 === 0;
      const forest = y - peak > h * 0.62 + Math.abs(((x % 14) + 14) % 14 - 7);
      const lit = x < cx;
      // Aerial perspective: the far mountains fade toward the sky colour, ink included.
      const c = edge || snowEdge
        ? '#5a6a74'
        : snow
          ? lit ? '#f4f1ea' : '#cfd6dc'
          : forest
            ? lit ? '#6f9a7c' : '#577f69'
            : strata
              ? lit ? '#7f9fa0' : '#5f7d84'
              : lit ? '#93b0ac' : '#6f8d90';
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

  const base = HORIZON + 30;
  const sx = SUN_X;
  const sy = SUN_Y;

  // Deep blue sky that warms toward the horizon haze over the last 190 rows, the part the view
  // can reach, with lighter sunburst rays from the sun.
  const SKY_STOPS: [number, number[]][] = [[0, [63, 111, 174]], [0.55, [126, 176, 214]], [0.85, [214, 214, 196]], [1, [243, 217, 168]]];
  const skyAt = (k: number, ray: boolean): string => {
    let i = 0;
    while (i < SKY_STOPS.length - 2 && k > SKY_STOPS[i + 1][0]) i++;
    const [k0, c0] = SKY_STOPS[i];
    const [k1, c1] = SKY_STOPS[i + 1];
    const f = Math.min(1, Math.max(0, (k - k0) / (k1 - k0)));
    // Banded in eight steps per stop, so the gradient stays a painted, pixel-art ramp.
    const q = Math.round(f * 8) / 8;
    const ch = (j: number) => Math.round(c0[j] + (c1[j] - c0[j]) * q + (ray ? 14 : 0));
    return `#${[0, 1, 2].map((j) => Math.min(255, ch(j)).toString(16).padStart(2, '0')).join('')}`;
  };
  for (let y = 0; y < WORLD_H; y++)
    for (let x = 0; x < WORLD_W; x++) {
      if (y >= HORIZON) put(img, x, y, groundColour('sea', 0, 0, x, y, 0, 0));
      else put(img, x, y, skyAt(Math.max(0, 1 - (HORIZON - y) / 190), Math.floor(((Math.atan2(y - sy, x - sx) / Math.PI + 1) * 16)) % 2 === 1));
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
  // The kampung stands on raised land: where it meets the beach, or the world's front edge, a dirt
  // cliff drops in strata with a grassy lip, like a diorama block. Kind 8, so the ink pass outlines it.
  const LOW = new Set([6, 7]);
  const CLIFF = 7;
  for (let x = 0; x < WORLD_W; x++)
    for (let y = HORIZON; y < WORLD_H - 1; y++) {
      const k = y * WORLD_W + x;
      // Only real land casts a cliff, never cliff already drawn, so faces do not stack.
      if (!land[k] || land[k] === 8 || LOW.has(land[k]) || !(LOW.has(land[k + WORLD_W]) || !land[k + WORLD_W])) continue;
      for (let d = 1; d <= CLIFF && y + d < WORLD_H; d++) {
        const kk = k + d * WORLD_W;
        if (land[kk] !== 6 && land[kk] !== 7 && land[kk] !== 0) break;
        land[kk] = 8;
        const band = d === 1 ? '#5f8a3c' : d % 3 === 0 ? '#7a4c2a' : vnoise(x, y + d, 4) > 0.5 ? '#9a6236' : '#8a5a32';
        put(img, x, y + d, d === CLIFF ? '#5e3a22' : band);
      }
    }

  // Borders between land types, coloured instead of inked. The higher ground (garden over grass
  // over road over cliff over beach over sea) takes a dark edge in its own colour. The lower side
  // gets a bright rim that eases back to its base colour over three pixels, so each transition
  // reads clearly without hard black lines. Sea meets sand with a line of foam.
  const RANK = [2, 7, 5, 6, 8, 9, 3, 2, 4];
  const rank = (k: number) => RANK[land[k] || 7];
  const edits: [number, number, number][] = [];
  const NEAR: [number, number, number][] = [[1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1], [2, 0, 2], [-2, 0, 2], [0, 2, 2], [0, -2, 2], [3, 0, 3], [-3, 0, 3]];
  for (let y = HORIZON; y < WORLD_H - 1; y++)
    for (let x = 1; x < WORLD_W - 1; x++) {
      const k = y * WORLD_W + x;
      if (!land[k]) continue;
      const r = rank(k);
      // The horizon and the world's back edge get the dark edge too.
      let dark = y === HORIZON || (y > HORIZON && !land[k - WORLD_W] && land[k] !== 7);
      let rim = 0;
      for (const [dx, dy, d] of NEAR) {
        const yy = y + dy;
        const xx = x + dx;
        if (yy < HORIZON || yy >= WORLD_H || xx < 0 || xx >= WORLD_W) continue;
        const o = rank(yy * WORLD_W + xx);
        if (o === r) continue;
        if (d === 1 && o < r) dark = true;
        else if (o > r && (rim === 0 || d < rim)) rim = d;
      }
      if (dark) edits.push([x, y, 0]);
      else if (rim) edits.push([x, y, rim]);
    }
  for (const [x, y, d] of edits) {
    const i = (y * WORLD_W + x) * 4;
    const kind = land[y * WORLD_W + x];
    if (kind === 7 && d > 0) {
      // Surf: foam on the sand line, then lighter shallows.
      const foam = d === 1 ? [236, 246, 238] : d === 2 ? [169, 220, 210] : [118, 190, 180];
      img.data.set(foam, i);
      continue;
    }
    const f = d === 0 ? 0.6 : d === 1 ? 1.2 : d === 2 ? 1.11 : 1.05;
    for (let c = 0; c < 3; c++) img.data[i + c] = Math.min(255, Math.round(img.data[i + c] * f));
  }

  // Stepped clouds: three stacked bars, each outlined.
  for (const [cx, cy, w] of [[sx - 150, sy - 40, 30], [sx + 120, sy - 60, 22]]) {
    const bars = [[cx - w / 2, cy, w], [cx - w / 2 + 5, cy - 4, w - 12], [cx - w / 2 + 10, cy - 8, w - 22]];
    for (const [bx, by, bw] of bars)
      for (let x = Math.round(bx) - 1; x <= Math.round(bx + bw); x++) for (let y = by - 1; y <= by + 4; y++) put(img, x, y, INK);
    for (const [bx, by, bw] of bars)
      for (let x = Math.round(bx); x < Math.round(bx + bw); x++) for (let y = by; y < by + 4; y++) put(img, x, y, y === by + 3 ? '#e6d7bb' : '#fbf6ea');
  }
  mountain(img, M1, base, 130, 165);
  mountain(img, M2, base, 120, 150);

  // Soft blocky clouds drifting in front of the peaks: stacked slabs, lit on top and shaded lilac
  // underneath, no ink.
  for (const [cx, cy, w] of [[sx - 70, sy - 38, 44], [sx + 72, sy - 82, 48], [sx - 28, sy - 118, 34], [sx + 190, sy - 50, 52], [sx - 200, sy - 90, 56], [sx + 300, sy - 110, 44], [sx - 330, sy - 40, 48]]) {
    const slabs = [[-w / 2, 0, w, 7], [-w / 2 + w * 0.15, -6, w * 0.6, 7], [-w / 2 + w * 0.35, -11, w * 0.35, 6], [-w / 2 + w * 0.55, -3, w * 0.4, 6]];
    for (const [ox, oy, sw, sh] of slabs)
      for (let y = 0; y < sh; y++)
        for (let x = 0; x < sw; x++) {
          const px = Math.round(cx + ox + x);
          const py = Math.round(cy + oy + y);
          if (px < 0 || py < 0 || px >= WORLD_W || py >= HORIZON) continue;
          put(img, px, py, y >= sh - 2 ? '#c9c3dc' : y === 0 || x === 0 ? '#ffffff' : '#f3efe6');
        }
  }

  // A hazy pine tree line along the horizon, in front of the mountains' feet: straight-sided
  // triangles, lit on the left.
  for (let x0 = -4; x0 < WORLD_W; x0 += 5 + Math.floor(hash(x0, 7) * 4)) {
    const h = 8 + Math.floor(hash(x0, 3) * 9);
    const half = Math.ceil(h / 3);
    for (let y = 0; y < h; y++) {
      const span = Math.floor((half * y) / h);
      for (let dx = -span; dx <= span; dx++) {
        const px = x0 + dx;
        const py = HORIZON - h + y;
        if (px < 0 || px >= WORLD_W || py < 0) continue;
        put(img, px, py, dx < 0 ? '#6e9580' : '#57806c');
      }
    }
  }

  // Fallen leaves scattered over the grass, road and gardens, like an afternoon after a breeze.
  const LEAVES = ['#e57d2e', '#f4b935', '#df4a2c', '#c9a14a'];
  for (let y = HORIZON + 1; y < WORLD_H - 1; y++)
    for (let x = 0; x < WORLD_W - 2; x++) {
      const kind = land[y * WORLD_W + x];
      if (kind !== 1 && kind !== 2 && kind !== 4) continue;
      const r = hash(x * 31 + 7, y * 17 + 11);
      if (r > (kind === 4 ? 0.006 : 0.0035)) continue;
      const c = LEAVES[Math.floor(hash(x, y * 3) * LEAVES.length)];
      put(img, x, y, c);
      put(img, x + 1, y, c);
      if (r < 0.0012) put(img, x + 1, y - 1, c);
    }
  ctx.putImageData(img, 0, 0);

  return c;
}

export interface Tree {
  name: string;
  /** Tile, for a per-tree bounce phase. */
  tx: number;
  ty: number;
  /** Art position of the tree art's top-left corner inside the world canvas. */
  x: number;
  y: number;
}

let trees: Tree[] | null = null;

/** Trees on the land round the kampung, back to front so nearer trees overlap farther ones. Drawn per frame so they can bounce. */
export function worldTrees(): Tree[] {
  if (trees) return trees;
  trees = [];
  for (let d = FAR + 3; d < XMAX + YMAX; d++)
    for (let tx = XMIN; tx < XMAX; tx++) {
      const ty = d - tx;
      if (ty < YMIN || ty >= YMAX) continue;
      const t = terrain(tx, ty);
      const n = hash(tx * 5 + 1, ty * 3 + 2);
      const name = t === 'hutan' ? (n < 0.75 ? 'pohon' : 'kelapa') : t === 'kebun' ? (n < 0.35 ? 'kelapa' : n < 0.6 ? 'pisang' : n < 0.8 ? 'pohon' : null) : t === 'beach' && n < 0.25 ? 'kelapa' : null;
      if (name) trees.push({ name, tx, ty, x: WORLD_OX + ((tx - ty) * TW) / 2 - TW / 2, y: WORLD_OY + ((tx + ty) * TH) / 2 - TOP });
    }
  return trees;
}

const suns = new Map<boolean, HTMLCanvasElement>();

/** The sun's face: big shiny eyes (or happy closed arcs mid-blink), rosy cheeks and an open smile. */
export function sunArt(blink: boolean): HTMLCanvasElement {
  const hit = suns.get(blink);
  if (hit) return hit;
  const c = document.createElement('canvas');
  c.width = c.height = SUN_SIZE;
  const ctx = c.getContext('2d')!;
  const px = (x: number, y: number, col: string) => {
    ctx.fillStyle = col;
    ctx.fillRect(SUN_SIZE / 2 + x, SUN_SIZE / 2 + y, 1, 1);
  };
  const R = 18;
  for (let y = -R; y < R; y++)
    for (let x = -R; x < R; x++) {
      const d = (x + 0.5) ** 2 + (y + 0.5) ** 2;
      if (d > R * R) continue;
      const shine = (x + 10) ** 2 + (y + 10) ** 2 < 16;
      px(x, y, d > (R - 2) ** 2 ? INK : shine ? '#fbe08a' : '#f4b935');
    }
  for (const [x, y] of [[-12, -12], [-11, -12], [-12, -11]]) px(x, y, '#fffaf0');
  // Rosy cheeks.
  for (const cx of [-13, 9])
    for (let y = 1; y <= 3; y++) for (let x = cx; x < cx + 4; x++) if (!((y === 1 || y === 3) && (x === cx || x === cx + 3))) px(x, y, '#f07f86');
  for (const ex of [-8, 4]) {
    if (blink) {
      // Happy closed eyes: a little upside-down V.
      for (const [x, y] of [[-1, -2], [0, -3], [1, -4], [2, -4], [3, -3], [4, -2]]) px(ex + x, y, INK);
    } else {
      // Tall oval eyes with a sparkle.
      for (let y = -7; y <= -1; y++) for (let x = 0; x < 4; x++) if (!((y === -7 || y === -1) && (x === 0 || x === 3))) px(ex + x, y, INK);
      px(ex + 1, -6, '#fffaf0');
      px(ex + 1, -5, '#fffaf0');
      px(ex + 2, -2, '#5b4a6b');
    }
  }
  // An open smile with a pink tongue.
  for (let y = 2; y <= 7; y++)
    for (let x = -5; x <= 4; x++) {
      const d = (x + 0.5) ** 2 + (y - 1.5) ** 2;
      if (d > 30) continue;
      px(x, y, d > 18 || y === 2 ? INK : y >= 5 ? '#e57a9c' : '#8a2a1e');
    }
  suns.set(blink, c);
  return c;
}

/** Decoration for an empty buildable tile, or null for plain grass. Stable per tile. */
export function decoAt(x: number, y: number): string | null {
  const n = hash(x * 11 + 3, y * 17 + 5);
  return n < 0.12 ? 'flowers' : n < 0.22 ? 'bush' : n < 0.45 ? 'rumput' : null;
}

let shore: { x: number; y: number }[] | null = null;

/** Points along the beach where it meets the sea, in world art pixels, for breaking-wave splashes. */
export function shorePoints(): { x: number; y: number }[] {
  if (shore) return shore;
  shore = [];
  const at = (a: number, b: number) => ({ x: WORLD_OX + ((a - b) * TW) / 2, y: WORLD_OY + ((a + b) * TH) / 2 });
  for (let tx = XMIN; tx < XMAX; tx++)
    for (let ty = YMIN; ty < YMAX; ty++) {
      if (terrain(tx, ty) !== 'beach') continue;
      // The shared edge with a sea tile in front (screen down-right or down-left), sampled at three points.
      for (const t of [0.2, 0.5, 0.8]) {
        if (tx + 1 >= XMAX || terrain(tx + 1, ty) === 'sea') shore.push(at(tx + 1, ty + t));
        if (ty + 1 >= YMAX || terrain(tx, ty + 1) === 'sea') shore.push(at(tx + t, ty + 1));
      }
    }
  return shore;
}
