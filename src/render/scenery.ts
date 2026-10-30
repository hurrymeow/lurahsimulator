// The land around the kampung: a ring road, sawah, kebun, a beach and sea in front, and the two
// mountains with the sun between them from every kid's "pemandangan" drawing. Decorative only.
import { isSeam } from '../sim/area';
import { GRID_H, GRID_W } from '../sim/types';
import { INK, TH, TOP, TW } from './iso';
import { autoBlend, baseOf, blendOf, encodeControl, heightBlend, pickMaterial } from './terrain';

// Painterly ground (clumped grass, dirt with pebbles, fallen leaves) with ink lines where land
// types meet, a raised kampung that drops to the beach in a cliff, a deep blue sunburst sky with
// soft clouds, and a grinning sun.
/** Top of the sky, also the fill past the world's top edge. */
export const SKY = '#3f6fae';
export const SEA = '#3f8f8c';

/** World extent in tiles, beyond the buildable grid. */
const XMIN = -12;
const YMIN = -12;
/** Headroom above the world's top corner, for the mountains. */
const HEAD = 120;
/** Tiles further back than this are sky. Rows of equal depth are level on screen, so the horizon is flat. */
const FAR = -12;
/** Sun art is this many art pixels square, centred on SUN_X, SUN_Y. */
export const SUN_SIZE = 44;

let trees: Tree[] | null = null;
let shore: { x: number; y: number }[] | null = null;
let heights: Int16Array | null = null;
let controls: Uint32Array | null = null;
let macros: Float32Array | null = null;
let XMAX = 0;
let YMAX = 0;
// These follow the grid. layoutWorld sets them, and importers see the live values.
export let WORLD_W = 0;
export let WORLD_H = 0;
/** Art position of grid tile (0,0)'s top corner inside the world canvas. */
export let WORLD_OX = 0;
export let WORLD_OY = 0;
/** Art row of the horizon inside the world canvas. */
export let HORIZON = 0;
/** The sun sits in the valley between the two mountains, which stand on the horizon. */
let M1 = 0;
let M2 = 0;
export let SUN_X = 0;
export let SUN_Y = 0;

/** Sizes the world for the current grid. Call after setGrid, then rebuild the cached canvas and trees. */
export function layoutWorld(): void {
  XMAX = GRID_W + 8;
  YMAX = GRID_H + 8;
  WORLD_W = (XMAX - XMIN + (YMAX - YMIN)) * (TW / 2);
  WORLD_H = HEAD + (XMAX - XMIN + (YMAX - YMIN)) * (TH / 2);
  WORLD_OX = (YMAX - XMIN) * (TW / 2);
  WORLD_OY = HEAD - (XMIN + YMIN) * (TH / 2);
  HORIZON = WORLD_OY + (FAR * TH) / 2;
  M1 = WORLD_OX + (-8 * TW) / 2;
  M2 = WORLD_OX + (4 * TW) / 2;
  SUN_X = (M1 + M2) / 2;
  SUN_Y = HORIZON - 70;
  trees = null;
  shore = null;
  heights = null;
  controls = null;
  macros = null;
  cloudList = null;
}

type Terrain = 'grass' | 'road' | 'sawah' | 'kebun' | 'hutan' | 'beach' | 'sea' | 'teh' | 'teras' | 'tanah';

function hash(x: number, y: number): number {
  let h = (x * 374761393 + y * 668265263) ^ 0x5bd1e995;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

/** The kampung and its ring road keep exact tile edges, so plots and the road read. */
const exact = (tx: number, ty: number) => tx >= -1 && ty >= -1 && tx <= GRID_W && ty <= GRID_H;

function terrain(tx: number, ty: number): Terrain {
  // Seam lots between the RTs are packed dirt, so the bigger buildings have somewhere obvious to stand.
  if (tx >= 0 && ty >= 0 && tx < GRID_W && ty < GRID_H) return isSeam(tx, ty) ? 'road' : 'grass';
  if (tx >= -1 && ty >= -1 && tx <= GRID_W && ty <= GRID_H) return 'road';
  // The front two sides run down to a beach and the sea, with a ragged coastline.
  const coast = Math.max(tx - GRID_W - 3, ty - GRID_H - 5) + hash(tx, ty) * 1.2;
  if (coast > 0.7) return 'sea';
  if (coast > -0.3) return 'beach';
  if (tx > GRID_W || ty > GRID_H) return 'sawah';
  // Toward the mountains the land rises into terraced hills: kebun teh on the left, sawah terasering
  // on the right. Shade trees stand on them (see worldTrees), so no square patch of forest breaks the flow.
  if (tx + ty < -5 && (tx < -1 || ty < -1)) return tx <= ty ? 'teh' : 'teras';
  if (tx < -1 && ty < -1) return 'kebun';
  return tx < -1 ? 'kebun' : 'sawah';
}

/**
 * Hill height under a world pixel, 0..1 and rising toward the back, smooth enough for contour lines
 * to flow across tiles like the hills of an old city-builder map.
 */
function hill(x: number, y: number, tx: number, ty: number): number {
  return vnoise(x, y * 2, 80) * 0.3 + vnoise(x + 300, y * 2 + 90, 30) * 0.1 + Math.min(1, -(tx + ty + 5) / 7) * 0.15 + (heightAtPixel(x, y) / HILL_MAX) * 0.6;
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

/** Tallest hill, in art pixels above the kampung. */
const HILL_MAX = 44;
const smooth = (k: number) => {
  const c = Math.max(0, Math.min(1, k));
  return c * c * (3 - 2 * c);
};

/**
 * Ground height at a tile corner, in art pixels. The kampung, its ring road, the sawah in front and
 * the coast stay flat, so every plot and the beach cliff read as before. Behind the ring road the
 * land rolls up into hills like the terrain of an old train-and-city builder, highest a few tiles
 * back and easing down toward the world's edges so nothing floats.
 */
export function cornerHeight(vx: number, vy: number): number {
  const w = XMAX - XMIN + 1;
  if (!heights) {
    heights = new Int16Array(w * (YMAX - YMIN + 1));
    for (let y = YMIN; y <= YMAX; y++)
      for (let x = XMIN; x <= XMAX; x++) {
        // Tiles behind the ring road, on the back two sides.
        const out = Math.max(-1 - x, -1 - y);
        const front = Math.max(x - GRID_W - 1, y - GRID_H - 1);
        const rise = smooth(out / 5) * smooth(1 - front / 3);
        const edge = smooth(Math.min(x - XMIN, y - YMIN) / 3) * (0.55 + 0.45 * smooth((x + y - FAR) / 4));
        const n = vnoise(x + 40, y + 40, 4) * 0.7 + vnoise(x + 7, y + 90, 2) * 0.3;
        heights[(y - YMIN) * w + x - XMIN] = Math.round(HILL_MAX * rise * edge * (0.2 + 0.8 * n));
      }
  }
  if (vx < XMIN || vy < YMIN || vx > XMAX || vy > YMAX) return 0;
  return heights[(vy - YMIN) * w + vx - XMIN];
}

/** Ground height anywhere in tile space, blended between the four corners. */
export function heightAt(a: number, b: number): number {
  const x = Math.floor(a);
  const y = Math.floor(b);
  const fx = a - x;
  const fy = b - y;
  const top = cornerHeight(x, y) + (cornerHeight(x + 1, y) - cornerHeight(x, y)) * fx;
  const bot = cornerHeight(x, y + 1) + (cornerHeight(x + 1, y + 1) - cornerHeight(x, y + 1)) * fx;
  return top + (bot - top) * fy;
}

/** Height under a flat (unraised) world pixel, for texture that follows the hills. */
function heightAtPixel(x: number, y: number): number {
  const rx = (x + 0.5 - WORLD_OX) / (TW / 2);
  const ry = (y + 0.5 - WORLD_OY) / (TH / 2);
  return heightAt((rx + ry) / 2, (ry - rx) / 2);
}

/** Control-map material ids. 'tanah' is the bare earth the autoshader shows on steep hill faces. */
const MATS: Terrain[] = ['grass', 'road', 'sawah', 'kebun', 'hutan', 'beach', 'sea', 'teh', 'teras', 'tanah'];
const TANAH = MATS.indexOf('tanah');
/** Materials on hills, which the autoshader may wear down to bare earth. */
const SLOPED = new Set((['kebun', 'teh', 'teras'] as Terrain[]).map((t) => MATS.indexOf(t)));

/**
 * The control word at a tile corner (see terrain.ts). A corner takes the two commonest materials of
 * the tiles round it, leaving out the exact kampung tiles, and blends them by how many tiles each
 * has, with a little noise so borders wander off the tile grid like a hand-painted blend. On the
 * hills the autoshader then lets bare earth through on steep corners.
 */
function controlAt(vx: number, vy: number): number {
  const w = XMAX - XMIN + 1;
  if (!controls) {
    controls = new Uint32Array(w * (YMAX - YMIN + 1));
    for (let y = YMIN; y <= YMAX; y++)
      for (let x = XMIN; x <= XMAX; x++) {
        const count = new Map<number, number>();
        for (const [tx, ty] of [[x - 1, y - 1], [x, y - 1], [x, y], [x - 1, y]]) {
          if (exact(tx, ty)) continue;
          const id = MATS.indexOf(terrain(Math.max(XMIN, Math.min(XMAX - 1, tx)), Math.max(YMIN, Math.min(YMAX - 1, ty))));
          count.set(id, (count.get(id) ?? 0) + 1 + hash(id * 13 + x, y) * 0.01);
        }
        // Corners deep inside the kampung are never read.
        if (!count.size) continue;
        const [[base, nb], [over, no] = [base, 0]] = [...count].sort((p, q) => q[1] - p[1]);
        let c = encodeControl(base, over, no ? Math.min(255, (no / (nb + no)) * 255 + (vnoise(x * 3, y * 3, 2) - 0.5) * 90) : 0);
        const h = cornerHeight(x, y);
        const slope = Math.max(...[[1, 0], [-1, 0], [0, 1], [0, -1]].map(([dx, dy]) => Math.abs(cornerHeight(x + dx, y + dy) - h)));
        const auto = autoBlend(slope, 8, 14);
        if (auto > 0 && SLOPED.has(base)) c = encodeControl(base, TANAH, Math.max(auto * 255, base === over ? 0 : blendOf(c)), true);
        controls[(y - YMIN) * w + x - XMIN] = c;
      }
  }
  if (vx < XMIN || vy < YMIN || vx > XMAX || vy > YMAX) return encodeControl(MATS.indexOf('sea'), MATS.indexOf('sea'), 0);
  return controls[(vy - YMIN) * w + vx - XMIN];
}

/**
 * Low, broad patches of lighter and darker ground, like Terrain3D's macro variation: two noises
 * baked per tile corner and read back bilinearly, as the shader samples its noise texture. It
 * shifts which flat tone a pixel picks, so it never adds a colour.
 */
function macro(a: number, b: number): number {
  const w = XMAX - XMIN + 1;
  if (!macros) {
    macros = new Float32Array(w * (YMAX - YMIN + 1));
    for (let y = YMIN; y <= YMAX; y++)
      for (let x = XMIN; x <= XMAX; x++) macros[(y - YMIN) * w + x - XMIN] = (vnoise(x + 90, y + 90, 9) * 0.6 + vnoise(x + 500, y + 70, 3.5) * 0.4 - 0.5) * 0.35;
  }
  const x = Math.max(XMIN, Math.min(XMAX - 1, Math.floor(a)));
  const y = Math.max(YMIN, Math.min(YMAX - 1, Math.floor(b)));
  const fx = Math.max(0, Math.min(1, a - x));
  const fy = Math.max(0, Math.min(1, b - y));
  const k = (y - YMIN) * w + x - XMIN;
  const top = macros[k] + (macros[k + 1] - macros[k]) * fx;
  const bot = macros[k + w] + (macros[k + w + 1] - macros[k + w]) * fx;
  return top + (bot - top) * fy;
}

/**
 * Each material's height texture, 0..1, from the same clumps and specks that paint it. Where two
 * materials meet, the taller detail wins the pixel: clumps of kebun push into the sawah, sand
 * ridges into the sea, rock out of the terraces.
 */
function materialHeight(t: Terrain, x: number, y: number, n: number): number {
  switch (t) {
    case 'grass':
      return n;
    case 'road':
      return 0.3 * n + (hash(x * 7 + 3, y * 13 + 1) < 0.05 ? 0.5 : 0);
    case 'sawah':
      return 0.35 + 0.3 * n;
    case 'kebun':
    case 'hutan':
      return 0.3 + 0.7 * n;
    case 'beach':
      return 0.2 + 0.5 * n;
    case 'sea':
      return 0.1;
    case 'teh':
      return 0.35 + 0.5 * n;
    case 'teras':
      return 0.3 + 0.4 * n;
    case 'tanah':
      return 0.15 + 0.85 * vnoise(x + 31, y * 2, 4);
  }
}

/** How far a height texture may push a border off the blend line. */
const BLEND_DEPTH = 0.55;

/** The material that shows at tile-space point (a, b), whose flat-world pixel is (x, y). */
function groundAt(a: number, b: number, x: number, y: number): Terrain {
  const tx = Math.floor(a);
  const ty = Math.floor(b);
  if (exact(tx, ty)) return terrain(tx, ty);
  const c0 = controlAt(tx, ty);
  const c1 = controlAt(tx + 1, ty);
  const c2 = controlAt(tx + 1, ty + 1);
  const c3 = controlAt(tx, ty + 1);
  // Most tiles are one material at every corner, so there is nothing to pick.
  if (c0 === c1 && c0 === c2 && c0 === c3 && !blendOf(c0)) return MATS[baseOf(c0)];
  const n = clumps(x, y);
  const id = pickMaterial(c0, c1, c2, c3, a - tx, b - ty, (m) => materialHeight(MATS[m], x, y, n), BLEND_DEPTH);
  return MATS[id];
}

/** Flat-world pixel of a tile-space point. */
const flatPixel = (a: number, b: number) => [Math.floor(WORLD_OX + ((a - b) * TW) / 2), Math.floor(WORLD_OY + ((a + b) * TH) / 2)];

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
/** Tea rows on terraced hills, lit to shaded. */
const TEH = ['#7aa84a', '#679a3f', '#578a37', '#4a7a30'];
const TERAS = ['#a8cb5e', '#94bc53', '#86ab45'];

const TANAH_TONES = ['#7a4c2a', '#8a5a32', '#9a6236'];

function groundColour(t: Terrain, a: number, b: number, x: number, y: number, tx: number, ty: number): string {
  const n = clumps(x, y) + macro(tx + a, ty + b);
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
    case 'tanah':
      // Bare earth on steep faces, in the cliff's strata, with stones catching the light.
      if (speck < 0.015) return '#bdb4a3';
      if (speck > 0.99) return '#6d635a';
      return tone(n, TANAH_TONES);
    case 'kebun':
      return speck < 0.03 ? '#7aa04a' : tone(n, KEBUN);
    case 'hutan':
      return speck < 0.03 ? '#628a40' : tone(n, HUTAN);
    case 'beach':
      // Sand with wind ripples along the shore.
      if ((x + 2 * y + Math.floor(n * 6)) % 11 === 0) return '#dcb778';
      return tone(n, SAND);
    case 'teh':
    case 'teras': {
      // Terraces follow the hill's contours. Each step is a band; its riser is a lit rim over a dark
      // line, steps alternate light and dark, and slopes facing the light (top left) are brighter.
      const STEPS = 10;
      const h = hill(x, y, tx, ty);
      const band = Math.floor(h * STEPS);
      if (Math.floor(hill(x, y + 1, tx, ty) * STEPS) !== band) return t === 'teh' ? '#3a5f27' : '#6f472a';
      const rim = Math.floor(hill(x, y - 1, tx, ty) * STEPS) !== band;
      const lit = hill(x - 2, y - 1, tx, ty) - hill(x + 2, y + 1, tx, ty);
      const shadeK = Math.max(0, Math.min(2, (lit > 0.003 ? 0 : lit < -0.003 ? 2 : 1) + (band % 2)));
      if (t === 'teh') {
        if (rim) return '#a6cf63';
        // Tea bushes in clumps along the step, picked paths showing between them.
        return speck < 0.035 ? '#8a6a3e' : n > 0.62 ? TEH[Math.min(3, shadeK + 1)] : TEH[shadeK];
      }
      if (rim) return '#b9d97a';
      // Some steps are freshly flooded for planting: still water with a glint.
      if (band % 4 === 1) return (x + 2 * y) % 17 === 0 ? '#c9e6e2' : n > 0.55 ? '#9fd0cf' : '#8fc7c8';
      return Math.floor(x / 2 + band) % 4 === 0 ? '#7a9e3f' : TERAS[shadeK];
    }
    case 'sea':
      // Shimmering bands and short straight wave dashes.
      if ((x + 2 * y) % 24 < 4 && y % 6 === 0) return '#8fd0c2';
      return n > 0.62 ? '#4a9b96' : n < 0.3 ? '#367f80' : SEA;
  }
}

/** 4x4 ordered-dither thresholds, 0..1. Blends step through it so gradients stay in whole pixels. */
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16);
const bayer = (x: number, y: number) => BAYER[(y & 3) * 4 + (x & 3)];

/** Haze at the horizon, which the far land and the mountains' feet fade into. */
const HAZE = [206, 214, 196];

/** Ridged noise: sharp creases where smooth noise crosses its middle, for crags and gullies. */
const ridged = (x: number, y: number, cell: number) => 1 - Math.abs(vnoise(x, y, cell) * 2 - 1);

/**
 * One volcano, painted like an old landscape of a Javanese gunung: a broad cone with long concave
 * skirts and a blunt, notched crater top. Light comes from the left, so the cone turns from warm
 * white to cool blue across its face, with no hard ridge. Ravines run down from the summit as
 * thin light and dark streaks that fade out down the slope, and the foot melts into the haze.
 * Tones step through an ordered dither.
 *
 * Like the near ground, the cone is painted in materials: hazy forest on the lower slopes, bare
 * rock above it, the pale ash cap on top. Each zone fades in and out with altitude and the zones
 * meet through the same height-blended pick (heightBlend), so forest clumps climb the ravines and
 * rock pushes down the ridges instead of ringing the cone in straight bands. The forest feet run
 * into the far tree line, so the mountains stand on the land instead of floating behind it.
 */
function mountain(img: ImageData, land: Uint8Array, cx: number, baseY: number, hw: number, h: number, seed: number, lean: number): void {
  const topY = baseY - h;
  // Height across the cone, 0..1: concave skirts, a flat crater a few pixels wide, a small
  // shoulder cone on one flank, and a gently uneven rim.
  const profile = (x: number): number => {
    const u = (x - cx) / hw - lean;
    const crater = 0.07;
    const d = Math.max(0, Math.abs(u) - crater) / (1 - crater);
    if (d >= 1) return 0;
    let p = (1 - d) ** 2.1;
    // A notch in the crater rim.
    if (Math.abs(u) < crater) p -= 0.018 * (1 - Math.abs(u + crater * 0.3) / crater);
    const su = u + 0.5 * Math.sign(lean || 1);
    const shoulder = Math.abs(su) < 0.22 ? 0.3 * (1 - Math.abs(su) / 0.22) ** 1.6 : 0;
    return Math.max(0, Math.max(p, shoulder) + (vnoise(x + seed, seed, 10) - 0.5) * 0.012 * (1 - d));
  };
  const RAMP = ['#f1f0ec', '#d3dce8', '#b8c6db', '#9fb1cc', '#8a9dbe', '#7689ad'];
  // Rock and forest in the same lit-to-shade steps, already far in the blue air.
  const ROCK = ['#d8d4cc', '#c0bcb8', '#a8a7ab', '#94959f', '#808494', '#6d7387'];
  const FOREST = ['#a3bfa6', '#8fb096', '#7da087', '#6d917a', '#5e826e', '#517463'];
  const ZONES = [RAMP, ROCK, FOREST];
  const HAZE_RGB = [214, 222, 226];
  const x0 = Math.max(0, Math.floor(cx - hw));
  const x1 = Math.min(WORLD_W, Math.ceil(cx + hw));
  const peakX = cx + lean * hw;
  for (let x = x0; x < x1; x++) {
    const top = Math.round(baseY - profile(x) * h);
    for (let y = Math.max(0, top); y < Math.min(WORLD_H, HORIZON); y++) {
      if (land[y * WORLD_W + x]) continue;
      const dy = y - topY;
      const dith = bayer(x, y);
      // Across the face: lit on the left, cool on the right, with the turn drifting with height.
      const across = (x - peakX) / (hw * (0.25 + (0.75 * Math.max(0, dy)) / h));
      // Ravines radiate from the summit: ridged noise on the angle from the crater.
      const angle = (x - peakX) / (dy + 10);
      const ravine = ridged(angle * 9 + seed, dy * 0.02, 1) ** 3;
      const fade = Math.max(0, 1 - dy / (h * 0.9));
      let v = 0.42 + across * 0.38 + (dy / h) * 0.18 + (y - top < 2 ? -0.12 : 0);
      v += ravine * fade * (across < 0 ? -0.22 : 0.26) + (vnoise(x * 0.7 + seed, y, 3) - 0.5) * 0.08;
      const i = Math.max(0, Math.min(RAMP.length - 1, Math.floor(v * RAMP.length + dith - 0.5)));
      // Altitude zones: the ash cap on the top quarter, rock above the middle, forest up to about 0.6.
      const alt = 1 - dy / h;
      const clump = vnoise(x * 1.3 + seed, y * 2, 4);
      const zone = heightBlend(
        [smooth((alt - 0.74) / 0.15), smooth((alt - 0.42) / 0.18) * smooth((0.9 - alt) / 0.15), smooth((0.64 - alt) / 0.18)],
        [ravine * 0.6, 1 - ravine, clump * 0.5 + ravine * 0.7],
        0.6,
      );
      const c = hex(ZONES[zone][i]);
      let rgb = [c >> 16, (c >> 8) & 255, c & 255];
      // The lower half dissolves into haze, as in a painting of a far volcano.
      const mist = smooth((dy - h * 0.72) / (h * 0.35)) * 0.6;
      const m = Math.max(0, Math.min(1, Math.round((mist + (dith - 0.5) * 0.3) * 5) / 5));
      if (m) rgb = rgb.map((ch, k) => Math.round(ch + (HAZE_RGB[k] - ch) * m));
      img.data.set([rgb[0], rgb[1], rgb[2], 255], (y * WORLD_W + x) * 4);
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
  // Tile depth (a + b) of each land pixel, for the haze over the far land.
  const depth = new Float32Array(WORLD_W * WORLD_H);
  // Kind numbers: 1-7 in this order, 8 is the cliff, 9 and 10 the terraced hills, 11 bare earth.
  const KINDS: Terrain[] = ['grass', 'road', 'sawah', 'kebun', 'hutan', 'beach', 'sea'];
  const kindOf = (t: Terrain) => (t === 'teh' ? 9 : t === 'teras' ? 10 : t === 'tanah' ? 11 : KINDS.indexOf(t) + 1);
  // Each tile is two flat-lit triangles over its corner heights, drawn back to front so nearer
  // hills cover farther ones. Texture is sampled at the tile's flat position, so it sticks to the
  // ground as it rises. Outside the kampung each pixel's material comes from the corner control
  // map (groundAt), so land types meet along organic borders instead of tile edges. Slopes facing
  // the light (top left) brighten and the rest darken in a few flat steps, and a soft grid line
  // runs along every tile edge, like an old city-builder map.
  const GRID_LINE = new Set<Terrain>(['grass', 'kebun', 'hutan', 'teh', 'teras']);
  const LIGHT = (() => {
    const v = [-0.75, -0.3, 1];
    const m = Math.hypot(v[0], v[1], v[2]);
    return v.map((c) => c / m);
  })();
  /** World units of one tile side, against heights in art pixels. */
  const SIDE = 20;
  const OX = WORLD_OX;
  const OY = WORLD_OY;
  const tri = (tile: Terrain, tx: number, ty: number, v: [number, number, number][]) => {
    const blended = !exact(tx, ty);
    // Screen corners of the triangle; each v is [a, b, height].
    const P = v.map(([a, b, h]) => [OX + ((a - b) * TW) / 2, OY + ((a + b) * TH) / 2 - h]);
    const area = (P[1][0] - P[0][0]) * (P[2][1] - P[0][1]) - (P[2][0] - P[0][0]) * (P[1][1] - P[0][1]);
    if (Math.abs(area) < 1e-6) return;
    // Facet light from the triangle's normal, in flat steps.
    const e1 = [(v[1][0] - v[0][0]) * SIDE, (v[1][1] - v[0][1]) * SIDE, v[1][2] - v[0][2]];
    const e2 = [(v[2][0] - v[0][0]) * SIDE, (v[2][1] - v[0][1]) * SIDE, v[2][2] - v[0][2]];
    let n = [e1[1] * e2[2] - e1[2] * e2[1], e1[2] * e2[0] - e1[0] * e2[2], e1[0] * e2[1] - e1[1] * e2[0]];
    if (n[2] < 0) n = n.map((c) => -c);
    const nm = Math.hypot(n[0], n[1], n[2]);
    const dot = (n[0] * LIGHT[0] + n[1] * LIGHT[1] + n[2] * LIGHT[2]) / nm;
    const lit = Math.max(0.7, Math.min(1.22, Math.round((1 + (dot - LIGHT[2]) * 1.9) / 0.06) * 0.06));
    // Attribute gradients across the screen, for the grid-line test against the pixel up and left.
    const grad = (j: number) => {
      const d1 = v[1][j] - v[0][j];
      const d2 = v[2][j] - v[0][j];
      return [(d1 * (P[2][1] - P[0][1]) - d2 * (P[1][1] - P[0][1])) / area, (d2 * (P[1][0] - P[0][0]) - d1 * (P[2][0] - P[0][0])) / area];
    };
    const [dax, day] = grad(0);
    const [dbx, dby] = grad(1);
    const x0 = Math.max(0, Math.floor(Math.min(P[0][0], P[1][0], P[2][0])));
    const x1 = Math.min(WORLD_W - 1, Math.ceil(Math.max(P[0][0], P[1][0], P[2][0])));
    const y0 = Math.max(0, Math.floor(Math.min(P[0][1], P[1][1], P[2][1])));
    const y1 = Math.min(WORLD_H - 1, Math.ceil(Math.max(P[0][1], P[1][1], P[2][1])));
    for (let y = y0; y <= y1; y++)
      for (let x = x0; x <= x1; x++) {
        const px = x + 0.5;
        const py = y + 0.5;
        const w1 = ((px - P[0][0]) * (P[2][1] - P[0][1]) - (P[2][0] - P[0][0]) * (py - P[0][1])) / area;
        const w2 = ((P[1][0] - P[0][0]) * (py - P[0][1]) - (px - P[0][0]) * (P[1][1] - P[0][1])) / area;
        const w0 = 1 - w1 - w2;
        if (w0 < -1e-7 || w1 < -1e-7 || w2 < -1e-7) continue;
        const a = w0 * v[0][0] + w1 * v[1][0] + w2 * v[2][0];
        const b = w0 * v[0][1] + w1 * v[1][1] + w2 * v[2][1];
        // Flat-world pixel for texture, so clumps and rows stay put on the slope.
        const fx = Math.floor(OX + ((a - b) * TW) / 2);
        const fy = Math.floor(OY + ((a + b) * TH) / 2);
        const t = blended ? groundAt(a, b, fx, fy) : tile;
        const edge = GRID_LINE.has(t) && (Math.floor(a - dax) !== Math.floor(a) || Math.floor(b - dbx) !== Math.floor(b) || Math.floor(a - day) !== Math.floor(a) || Math.floor(b - dby) !== Math.floor(b));
        land[y * WORLD_W + x] = kindOf(t);
        depth[y * WORLD_W + x] = a + b;
        const c = hex(groundColour(t, a - tx, b - ty, fx, fy, tx, ty));
        const f = lit * (edge ? (t === 'grass' ? 0.86 : 0.88) : 1);
        img.data.set([Math.min(255, Math.round(((c >> 16) & 255) * f)), Math.min(255, Math.round(((c >> 8) & 255) * f)), Math.min(255, Math.round((c & 255) * f)), 255], (y * WORLD_W + x) * 4);
      }
  };
  for (let d = Math.max(FAR, XMIN + YMIN); d < XMAX + YMAX - 1; d++)
    for (let tx = XMIN; tx < XMAX; tx++) {
      const ty = d - tx;
      if (ty < YMIN || ty >= YMAX) continue;
      const t = terrain(tx, ty);
      const A: [number, number, number] = [tx, ty, cornerHeight(tx, ty)];
      const B: [number, number, number] = [tx + 1, ty, cornerHeight(tx + 1, ty)];
      const C: [number, number, number] = [tx + 1, ty + 1, cornerHeight(tx + 1, ty + 1)];
      const D: [number, number, number] = [tx, ty + 1, cornerHeight(tx, ty + 1)];
      tri(t, tx, ty, [A, B, C]);
      tri(t, tx, ty, [A, C, D]);
    }
  // The kampung stands on raised land: where it meets the beach, or the world's front edge, a dirt
  // cliff drops in strata with a grassy lip, like a diorama block. Kind 8, so the ink pass outlines it.
  const LOW = new Set([6, 7]);
  const CLIFF = 7;
  for (let x = 0; x < WORLD_W; x++)
    for (let y = 0; y < WORLD_H - 1; y++) {
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
  const RANK = [2, 7, 5, 6, 8, 9, 3, 2, 4, 8, 6, 5];
  const rank = (k: number) => RANK[land[k] || 7];
  const edits: [number, number, number][] = [];
  const NEAR: [number, number, number][] = [[1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1], [2, 0, 2], [-2, 0, 2], [0, 2, 2], [0, -2, 2], [3, 0, 3], [-3, 0, 3]];
  for (let y = 1; y < WORLD_H - 1; y++)
    for (let x = 1; x < WORLD_W - 1; x++) {
      const k = y * WORLD_W + x;
      if (!land[k]) continue;
      const r = rank(k);
      // The horizon and the world's back edge get the dark edge too.
      let dark = false;
      let rim = 0;
      for (const [dx, dy, d] of NEAR) {
        const yy = y + dy;
        const xx = x + dx;
        if (yy < 0 || yy >= WORLD_H || xx < 0 || xx >= WORLD_W) continue;
        // Sky above a hilltop is no border: the haze pass softens that edge instead.
        if (dy < 0 && !land[yy * WORLD_W + xx]) continue;
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

  mountain(img, land, M1, base, 235, 122, 17, -0.06);
  mountain(img, land, M2, base, 220, 106, 83, 0.08);

  // A soft, distant tree line along the horizon in front of the mountains' feet: rounded canopy
  // tops from smooth noise, deep in the haze, its top edge breaking up through the dither. Past the
  // mountains the mainland ends: the line breaks into far islands of different sizes with open sea
  // between them, so the horizon is never one straight rule.
  const MAIN0 = M1 - 260;
  const MAIN1 = M2 + 250;
  for (let x = 0; x < WORLD_W; x++) {
    const main = x >= MAIN0 && x < MAIN1 ? 1 : smooth(1 - Math.min(Math.abs(x - MAIN0), Math.abs(x - MAIN1)) / 40);
    const rise = Math.max(main * (4 + vnoise(x, 5, 11) * 7 + vnoise(x + 50, 9, 4) * 2.5), farIsland(x));
    if (rise < 1) continue;
    const top = HORIZON - rise;
    // A pale strip of sand along the island's foot at the waterline.
    if (main < 0.5) put(img, x, HORIZON - 1, bayer(x, 0) > 0.5 ? '#d9d6bf' : '#c9d0c0');
    for (let y = Math.max(0, Math.floor(top) - 1); y < HORIZON; y++) {
      if (land[y * WORLD_W + x]) continue;
      const dith = bayer(x, y);
      if (y - top < 1.5 && dith > y - top + 0.4) continue;
      const lit = vnoise(x * 1.7, y * 1.7, 3) > 0.55;
      const base = hex(lit ? '#88a894' : '#71927f');
      const m = Math.round((0.5 + (y - top) * 0.02 + (dith - 0.5) * 0.25) * 4) / 4;
      const rgb = [base >> 16, (base >> 8) & 255, base & 255].map((ch, i) => Math.round(ch + (HAZE[i] - ch) * m));
      img.data.set([rgb[0], rgb[1], rgb[2], 255], (y * WORLD_W + x) * 4);
    }
  }

  // Fallen leaves scattered over the grass, road and gardens, like an afternoon after a breeze.
  const LEAVES = ['#e57d2e', '#f4b935', '#df4a2c', '#c9a14a'];
  for (let y = 1; y < WORLD_H - 1; y++)
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

  // Small far details along the hilltops: round tree clumps and a few hamlet roofs, painted before
  // the haze so they sink into the same air.
  const skyline = new Int32Array(WORLD_W).fill(-1);
  for (let x = 0; x < WORLD_W; x++) {
    let y = 0;
    while (y < WORLD_H && !land[y * WORLD_W + x]) y++;
    if (y < WORLD_H) skyline[x] = y;
  }
  const farLand = (x: number, y: number) => x >= 0 && x < WORLD_W && y >= 0 && y < WORLD_H && land[y * WORLD_W + x] && land[y * WORLD_W + x] !== 2 && depth[y * WORLD_W + x] < -7;
  const CLUMP = ['#5d8a4a', '#4c7a3f', '#3d6834'];
  for (let x0 = 2; x0 < WORLD_W - 2; x0 += 2 + Math.floor(hash(x0, 21) * 5)) {
    if (skyline[x0] < 0) continue;
    const y0 = skyline[x0] + 2 + Math.floor(hash(x0, 22) ** 2 * 26);
    if (!farLand(x0, y0) || hash(x0, 23) < 0.25) continue;
    const r = 1.5 + hash(x0, 24) * 1.8;
    put(img, x0, y0, '#5a3d26');
    put(img, x0, y0 + 1, '#5a3d26');
    for (let dy = -Math.ceil(r * 2); dy <= 0; dy++)
      for (let dx = -Math.ceil(r); dx <= Math.ceil(r); dx++) {
        const ex = dx / r;
        const ey = (dy + r) / r;
        if (ex * ex + ey * ey > 1 || !farLand(x0 + dx, y0 + dy - 1) && !(y0 + dy - 1 < skyline[x0 + dx])) continue;
        put(img, x0 + dx, y0 + dy - 1, CLUMP[ex < -0.3 && ey < 0.2 ? 0 : ex > 0.3 ? 2 : 1]);
        if (y0 + dy - 1 < skyline[x0 + dx]) land[(y0 + dy - 1) * WORLD_W + x0 + dx] = 4;
      }
  }
  for (const fx of [0.3, 0.55, 0.72]) {
    const x0 = Math.floor(WORLD_W * fx);
    if (skyline[x0] < 0) continue;
    const y0 = skyline[x0] + 10;
    for (let k = 0; k < 3; k++) {
      const hx = x0 + k * 7 - 7;
      const hy = y0 + (k % 2) * 3;
      if (!farLand(hx, hy) || !farLand(hx + 5, hy)) continue;
      for (let dx = 0; dx < 6; dx++) {
        put(img, hx + dx, hy - 3, dx === 0 || dx === 5 ? '#8a4a2c' : '#b0603a');
        put(img, hx + dx, hy - 2, dx === 0 ? '#8a4a2c' : '#c46e42');
        if (dx > 0 && dx < 5) put(img, hx + dx, hy - 1, dx === 2 ? '#7a6250' : '#eadfc8');
      }
    }
  }

  // Aerial perspective over the far land: the back hills fade toward the horizon haze in dithered
  // steps, so they sit in the same air as the mountains instead of cutting a hard line across them.
  const NEAR_HAZE = -6;
  for (let y = 0; y < WORLD_H; y++)
    for (let x = 0; x < WORLD_W; x++) {
      const k = y * WORLD_W + x;
      if (!land[k] || depth[k] > NEAR_HAZE) continue;
      const f = smooth((NEAR_HAZE - depth[k]) / (NEAR_HAZE - FAR)) * 0.6;
      const m = Math.max(0, Math.round((f + (bayer(x, y) - 0.5) * 0.3) * 6) / 6);
      if (!m) continue;
      const i = k * 4;
      for (let c = 0; c < 3; c++) img.data[i + c] = Math.round(img.data[i + c] + (HAZE[c] - img.data[i + c]) * m);
    }
  // The hill silhouette frays into the sky and mountains behind it: a few dithered pixels of the
  // hilltop's own colour above the edge, thinning out, so no clean stair-stepped line is left.
  for (let x = 0; x < WORLD_W; x++) {
    let y = 0;
    while (y < WORLD_H && !land[y * WORLD_W + x]) y++;
    if (y >= WORLD_H || y === 0) continue;
    const src = (y * WORLD_W + x) * 4;
    for (let d = 1; d <= 3 && y - d >= 0; d++) {
      if (bayer(x, y - d) > 0.62 - d * 0.18) continue;
      const i = ((y - d) * WORLD_W + x) * 4;
      for (let c = 0; c < 3; c++) img.data[i + c] = Math.round((img.data[src + c] * 2 + img.data[i + c]) / 3);
    }
  }
  seaIslands(img, land);
  ctx.putImageData(img, 0, 0);

  return c;
}

/**
 * Height above the horizon of the far islands at column x, 0 where the sea runs to the sky. A
 * fixed scatter of low humps, some long and flat, a few with a small cone, spaced by hash so
 * there are always gaps.
 */
function farIsland(x: number): number {
  let top = 0;
  for (let i = 0; i < Math.ceil(WORLD_W / 110); i++) {
    const cx = hash(i, 301) * WORLD_W;
    const hw = 14 + hash(i, 302) ** 2 * 90;
    const d = Math.abs(x - cx) / hw;
    if (d >= 1) continue;
    const hh = 3 + hash(i, 303) * 8;
    // A soft hump with a lumpy canopy; one in four carries a far cone.
    let r = hh * Math.sqrt(1 - d * d) * (0.75 + vnoise(x + i * 40, 7, 5) * 0.5);
    if (hash(i, 304) < 0.25) r = Math.max(r, hh * 2.2 * Math.max(0, 1 - Math.abs(x - cx) / (hw * 0.4)) ** 1.4);
    top = Math.max(top, r);
  }
  return top;
}

const ISLAND_SAND = ['#e6c486', '#edd093', '#f3daa2'];
const ISLAND_GREEN = ['#5f8a3c', '#6f9a44', '#84a748'];
const ISLAND_FOREST = ['#3c6229', '#466e30', '#517a37'];

/**
 * A few small islands out on the open sea: a lumpy 2:1 oval with a foam ring, a sand rim and green
 * inside, painted with the ground's height-blended pick (sand, grass, forest by height, clumps
 * pushing through). The far side is lit, the near side shaded, and the near edge drops a
 * pixel or two of wet sand. The further away, the smaller and hazier, through the same dithered
 * haze steps as the far land. Islands only go where every pixel round them is open sea.
 */
function seaIslands(img: ImageData, land: Uint8Array): void {
  const placed: [number, number, number][] = [];
  for (let i = 0; i < 30 && placed.length < 7; i++) {
    const cy = HORIZON + 12 + hash(i, 401) ** 1.3 * (WORLD_H - HORIZON - 40);
    const cx = 20 + hash(i, 402) * (WORLD_W - 40);
    // Nearer islands (lower on screen) are bigger.
    const near = (cy - HORIZON) / (WORLD_H - HORIZON);
    const rx = Math.round(6 + near * 26 + hash(i, 403) * near * 22);
    const ry = rx / 2;
    // Shape: a main oval and a second lobe off to one side, so no two islands share an outline.
    const stretch = 0.7 + hash(i, 404) * 0.8;
    const lx = (hash(i, 405) - 0.5) * 1.4;
    const ly = (hash(i, 406) - 0.5) * 0.8;
    const lr = 0.35 + hash(i, 407) * 0.35;
    const span = rx * Math.max(stretch, 1) * 1.8;
    const free = () => {
      for (let y = Math.floor(cy - ry * 1.6 - 6); y <= cy + ry * 1.6 + 8; y += 2)
        for (let x = Math.floor(cx - span - 6); x <= cx + span + 6; x += 2) {
          if (x < 0 || y <= HORIZON + 2 || x >= WORLD_W || y >= WORLD_H) return false;
          const k = land[y * WORLD_W + x];
          if (k && k !== 7) return false;
        }
      return placed.every(([px, py, pr]) => Math.abs(px - cx) > pr + span + 12 || Math.abs(py - cy) > (pr + span) / 2 + 8);
    };
    if (!free()) continue;
    placed.push([cx, cy, span]);
    const haze = (1 - near) * 0.55;
    const height = (x: number, y: number) => {
      const dx = (x - cx) / (rx * stretch);
      const dy = (y - cy) / ry;
      const lobe = lr - Math.hypot(dx - lx, dy - ly);
      return Math.max(1 - Math.hypot(dx, dy), lobe / lr) + (vnoise(x + i * 70, y * 2, 6) - 0.5) * 0.35;
    };
    const BANK = Math.max(1, Math.round(1 + near * 2));
    const paint = (x: number, y: number, col: string) => {
      if (x < 0 || y < 0 || x >= WORLD_W || y >= WORLD_H) return;
      const v = hex(col);
      let rgb = [v >> 16, (v >> 8) & 255, v & 255];
      const m = Math.max(0, Math.round((haze + (bayer(x, y) - 0.5) * 0.3) * 6) / 6);
      if (m) rgb = rgb.map((ch, k) => Math.round(ch + (HAZE[k] - ch) * m));
      img.data.set([rgb[0], rgb[1], rgb[2], 255], (y * WORLD_W + x) * 4);
    };
    const tops: [number, number][] = [];
    for (let y = Math.floor(cy - ry * 1.6); y <= Math.ceil(cy + ry * 1.6 + BANK); y++)
      for (let x = Math.floor(cx - span); x <= Math.ceil(cx + span); x++) {
        const e = height(x, y);
        if (e >= 0) {
          // Above water: sand, grass and forest by height, clumps pushing through, lit on the far side.
          const n = clumps(x, y);
          const step = heightBlend([smooth((0.3 - e) / 0.15), smooth((e - 0.15) / 0.15) * smooth((0.75 - e) / 0.2), smooth((e - 0.45) / 0.2)], [0.3 * n, n, 0.4 + 0.6 * n], 0.4);
          const lit = height(x - 2, y - 1) > height(x + 2, y + 1) + 0.02 ? 2 : height(x - 2, y - 1) < height(x + 2, y + 1) - 0.02 ? 0 : 1;
          const ramp = step === 0 ? ISLAND_SAND : step === 1 ? ISLAND_GREEN : ISLAND_FOREST;
          paint(x, y, ramp[lit]);
          if (step === 2 && hash(x * 3 + i, y * 5) < 0.012) tops.push([x, y]);
          continue;
        }
        // Below the near edge a short bank of wet sand, like the kampung's cliff in small.
        let bank = 0;
        for (let d = 1; d <= BANK && !bank; d++) if (height(x, y - d) >= 0) bank = d;
        if (bank) paint(x, y, bank === BANK ? '#a8834e' : '#c9a56a');
        else if (e > -0.12) paint(x, y, e > -0.05 ? '#d8eee6' : '#8fd0c2');
      }
    // A few round tree clumps on the forest, like the far clumps on the hills.
    const CLUMP = ['#5d8a4a', '#4c7a3f', '#3d6834'];
    const r = 1.5 + near * 1.5;
    for (const [tx, ty] of tops.slice(0, 2 + Math.round(near * 4))) {
      paint(tx, ty, '#5a3d26');
      for (let dy = -Math.ceil(r * 2); dy <= 0; dy++)
        for (let dx = -Math.ceil(r); dx <= Math.ceil(r); dx++) {
          const ex = dx / r;
          const ey = (dy + r) / r;
          if (ex * ex + ey * ey <= 1) paint(tx + dx, ty + dy - 1, CLUMP[ex < -0.3 && ey < 0.2 ? 0 : ex > 0.3 ? 2 : 1]);
        }
    }
  }
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


/** Trees on the land round the kampung, back to front so nearer trees overlap farther ones. Drawn per frame so they can bounce. */
export function worldTrees(): Tree[] {
  if (trees) return trees;
  trees = [];
  for (let d = FAR + 3; d < XMAX + YMAX; d++)
    for (let tx = XMIN; tx < XMAX; tx++) {
      const ty = d - tx;
      if (ty < YMIN || ty >= YMAX) continue;
      // The tree stands on whatever material shows at the tile's centre, so none grows on sea or bare earth.
      const [fx, fy] = flatPixel(tx + 0.5, ty + 0.5);
      const t = groundAt(tx + 0.5, ty + 0.5, fx, fy);
      const n = hash(tx * 5 + 1, ty * 3 + 2);
      // The hills stay open so their shape reads. Palms and pisang keep to the low kebun by the
      // ring road; shade trees gather in small groves on the hilltops; steep faces stay bare.
      const h = heightAt(tx + 0.5, ty + 0.5);
      const corners = [cornerHeight(tx, ty), cornerHeight(tx + 1, ty), cornerHeight(tx + 1, ty + 1), cornerHeight(tx, ty + 1)];
      const steep = Math.max(...corners) - Math.min(...corners) > 9;
      const grove = h > 26 && vnoise(tx + 11, ty + 5, 3) > 0.55;
      const kebun = steep ? null : h < 6 ? (n < 0.3 ? 'kelapa' : n < 0.5 ? 'pisang' : n < 0.58 ? 'pohon' : null) : grove && n < 0.6 ? 'pohon' : n < 0.05 ? 'kelapa' : null;
      // Far back, toward the horizon, more trees stand among the terraces so the edge is not bare.
      const far = tx + ty < -7 && !steep && t !== 'tanah' && (n < 0.16 ? 'pohon' : n < 0.21 ? 'bush' : n < 0.24 ? 'kelapa' : null);
      const name = far ? far : t === 'hutan' ? (n < 0.75 ? 'pohon' : 'kelapa') : t === 'teh' && (grove ? n < 0.4 : n < 0.03) && !steep ? 'pohon' : t === 'teras' && n < 0.03 && !steep ? 'kelapa' : t === 'kebun' ? kebun : t === 'beach' && n < 0.25 ? 'kelapa' : null;
      if (name) trees.push({ name, tx, ty, x: WORLD_OX + ((tx - ty) * TW) / 2 - TW / 2, y: WORLD_OY + ((tx + ty) * TH) / 2 - TOP - Math.round(heightAt(tx + 0.5, ty + 0.5)) });
    }
  return trees;
}

export interface Cloud {
  art: HTMLCanvasElement;
  /** Resting top-left corner in the world canvas. */
  x: number;
  y: number;
  /** How far it slides either way, in art pixels, and how long one slide takes, in ms. */
  sway: number;
  period: number;
  phase: number;
}

let cloudList: Cloud[] | null = null;

/**
 * A long, thin cloud: two or three drawn-out streaks that taper at both ends, the top edge gently
 * lifted and the base nearly flat, lit along the top and cooling to lilac underneath. The ends
 * thin out through the dither, so the cloud fades into the sky instead of stopping at a line.
 */
function cloudArt(w: number, seed: number): HTMLCanvasElement {
  const H = Math.round(7 + hash(seed, 2) * 5);
  const streaks = 2 + Math.floor(hash(seed, 1) * 2);
  const c = document.createElement('canvas');
  c.width = Math.ceil(w);
  c.height = H + streaks * 2;
  const ctx = c.getContext('2d')!;
  const TONES = ['#fbf8f2', '#efebe6', '#dcd7e2', '#c9c2d8'];
  for (let k = 0; k < streaks; k++) {
    // Each streak is shorter and sits a little lower and to one side of the one above it.
    const len = w * (1 - k * 0.22) * (0.85 + hash(seed, k + 3) * 0.15);
    const x0 = (w - len) * (0.2 + hash(seed, k + 5) * 0.6);
    const base = H + k * 2;
    const thick = H * (1 - k * 0.3);
    // Where the streak swells, off centre so it reads as drawn by the wind.
    const peak = 0.3 + hash(seed, k + 9) * 0.4;
    for (let x = 0; x < len; x++) {
      const u = x / len;
      const env = u < peak ? u / peak : (1 - u) / (1 - peak);
      const t = Math.round(thick * env ** 0.8 * (0.8 + 0.2 * vnoise(x + seed * 7, k, 9)));
      for (let dy = 0; dy < t; dy++) {
        const px = Math.round(x0 + x);
        const py = base - 1 - dy;
        if (py < 0) continue;
        // Thin ends and the top fringe fall away through the dither.
        const edge = Math.min(env * 3, 1);
        if (bayer(px, py) > edge) continue;
        const v = 1 - dy / Math.max(1, t);
        const i = Math.min(TONES.length - 1, Math.max(0, Math.floor(v * TONES.length + bayer(px + 1, py) - 0.5)));
        ctx.fillStyle = TONES[TONES.length - 1 - i];
        ctx.fillRect(px, py, 1, 1);
      }
    }
  }
  return c;
}

/** Clouds round the sun and the twin volcanoes, two of them hugging the flanks. Drawn per frame so they can drift. */
export function clouds(): Cloud[] {
  if (cloudList) return cloudList;
  const at = (dx: number, y: number, w: number, i: number, sway = 18): Cloud => {
    const art = cloudArt(w, i * 13 + 5);
    return { art, x: Math.round(SUN_X + dx - w / 2), y: Math.round(y - art.height), sway, period: 38000 + hash(i, 3) * 30000, phase: hash(i, 9) * Math.PI * 2 };
  };
  cloudList = [
    at(-150, SUN_Y + 12, 110, 1),
    at(130, SUN_Y - 48, 130, 2),
    at(-20, SUN_Y - 96, 90, 3),
    at(260, SUN_Y - 8, 120, 4),
    at(-290, SUN_Y - 60, 140, 5),
    at(380, SUN_Y - 85, 100, 6),
    at(-440, SUN_Y + 2, 120, 7),
    // Banks wrapped round the volcanoes' middles, slower and shorter of travel.
    at(M1 - SUN_X - 80, HORIZON - 34, 150, 8, 8),
    at(M2 - SUN_X + 85, HORIZON - 30, 140, 9, 8),
  ];
  return cloudList;
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
      // Rimmed in a deep amber, matching the coloured outlines everywhere else.
      px(x, y, d > (R - 2) ** 2 ? '#8a4f12' : shine ? '#fbe08a' : '#f4b935');
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

/** Roofs of the neighbouring RTs beyond the ring road, shown from 2 stars. The sawah thins out where they stand. */
export function farRoofs(): { x: number; y: number; name: string }[] {
  const out: { x: number; y: number; name: string }[] = [];
  for (const y of [2, 6, 10]) out.push({ x: GRID_W + 3, y: Math.min(y, GRID_H - 1), name: 'rumah' });
  for (const x of [1, 4, 7]) out.push({ x: Math.min(x, GRID_W - 1), y: GRID_H + 3, name: 'rumah' });
  out.push({ x: GRID_W + 4, y: GRID_H + 4, name: 'rumah' });
  return out;
}

/** Decoration for an empty buildable tile, or null for plain grass. Stable per tile. */
export function decoAt(x: number, y: number): string | null {
  if (isSeam(x, y)) return null;
  const n = hash(x * 11 + 3, y * 17 + 5);
  return n < 0.12 ? 'flowers' : n < 0.22 ? 'bush' : n < 0.45 ? 'rumput' : null;
}

/** Points along the beach where it meets the sea, in world art pixels, for breaking-wave splashes. */
export function shorePoints(): { x: number; y: number }[] {
  if (shore) return shore;
  shore = [];
  const at = (a: number, b: number) => ({ x: WORLD_OX + ((a - b) * TW) / 2, y: WORLD_OY + ((a + b) * TH) / 2 });
  const ground = (a: number, b: number) => {
    const [x, y] = flatPixel(a, b);
    return groundAt(a, b, x, y);
  };
  // The coast no longer follows tile edges, so walk three lines across each tile toward the front
  // (screen down-right and down-left) and mark where sand gives way to sea.
  const STEP = 1 / 16;
  for (let tx = XMIN; tx < XMAX; tx++)
    for (let ty = YMIN; ty < YMAX; ty++) {
      if (exact(tx, ty)) continue;
      for (const t of [0.2, 0.5, 0.8])
        for (let s = 0; s < 1; s += STEP) {
          if (ground(tx + s, ty + t) === 'beach' && ground(tx + s + STEP, ty + t) === 'sea') shore.push(at(tx + s + STEP, ty + t));
          if (ground(tx + t, ty + s) === 'beach' && ground(tx + t, ty + s + STEP) === 'sea') shore.push(at(tx + t, ty + s + STEP));
        }
    }
  return shore;
}

layoutWorld();
