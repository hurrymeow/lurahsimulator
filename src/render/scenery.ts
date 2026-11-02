// The island round the kampung: a ring road, sawah, kebun, terraced hills, twin volcanoes on its
// back corner and a beach all round, set in an open sea dotted with islands. Decorative only.
import { isSeam } from '../sim/area';
import { GRID_H, GRID_W } from '../sim/types';
import { Painter, TH, TOP, TW, type Art } from './iso';
import { autoBlend, baseOf, blendOf, encodeControl, pickMaterial } from './terrain';

// Painterly ground (clumped grass, dirt with pebbles, fallen leaves) with coloured edges where land
// types meet, and a raised kampung that drops to the beach in a cliff. Everything is drawn in the
// one isometric projection: no horizon, no sky, so nothing breaks the diorama.
/** The open sea, also the fill past the world's edges. */
export const SEA = '#3f8f8c';

/** World extent in tiles, beyond the buildable grid. */
const XMIN = -16;
const YMIN = -16;
/** Sea above the world's top corner, for the volcano peaks and the islands behind the kampung. */
const HEAD = 230;

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
/** Trees on the sea islands with their depth (a + b), merged into worldTrees. */
let isleTrees: { tree: Tree; d: number }[] = [];

// ---------------------------------------------------------------- Kecamatan ring
// The Kecamatan keeps the Kelurahan's tile map. The three other Kelurahan are low-detail district blocks beside it:
// east, south and the corner between. They are drawn as one sprite each, and tapping one opens its panel.
let ringOn = false;
/** Tiles on a side of a district block, and the gap between the Kelurahan's ring road and a block. */
export const RING_SIDE = 14;
const RING_GAP = 3;
/** How far past the grid the blocks reach, with a margin of land round them. */
export const RING_EXT = RING_GAP + RING_SIDE + 4;
const ringExt = (): number => (ringOn ? RING_EXT : 0);
export const ringShown = (): boolean => ringOn;
/** Turns the ring on or off. The caller lays the world out again. */
export function setRing(on: boolean): void {
  ringOn = on;
}

export type DistrictId = 'mawar' | 'melati' | 'kenanga';
export interface RingBlock {
  id: DistrictId;
  /** Tile of the block's top corner. */
  x: number;
  y: number;
}

/** Where the three blocks stand for the current grid. Empty when the ring is off. */
export function ringBlocks(): RingBlock[] {
  if (!ringOn) return [];
  const mid = (n: number) => Math.floor((n - RING_SIDE) / 2);
  return [
    { id: 'mawar', x: GRID_W + RING_GAP, y: mid(GRID_H) },
    { id: 'melati', x: mid(GRID_W), y: GRID_H + RING_GAP },
    { id: 'kenanga', x: GRID_W + RING_GAP, y: GRID_H + RING_GAP },
  ];
}

const ringArts = new Map<DistrictId, Art>();

/** Sprite of a district block: grass, a crossroads, and small houses and shops. Same on every device. */
export function ringArt(id: DistrictId): Art {
  const hit = ringArts.get(id);
  if (hit) return hit;
  const seed = id.length * 97 + id.charCodeAt(0);
  const p = new Painter(1, RING_SIDE, RING_SIDE);
  const mid = RING_SIDE / 2;
  const road = (u: number, v: number) => u === mid || v === mid;
  p.ground((a, b, px) => {
    if (a < 2 * px || b < 2 * px || a > 1 - 2 * px || b > 1 - 2 * px) return 's';
    if (Math.floor(a * RING_SIDE) === mid || Math.floor(b * RING_SIDE) === mid) return 't';
    return (Math.floor(a * RING_SIDE) + Math.floor(b * RING_SIDE)) % 2 ? 'g' : 'G';
  });
  const WALL = ['w', 't', 'y', 'c', 'p', 'a'];
  const ROOF = ['r', 'o', 'S', 'b'];
  for (let d = 0; d < 2 * RING_SIDE - 1; d++)
    for (let u = 0; u < RING_SIDE; u++) {
      const v = d - u;
      if (v < 0 || v >= RING_SIDE || road(u, v) || u === 0 || v === 0) continue;
      const n = hash(u * 7 + seed, v * 13 + seed);
      if (n < 0.3) continue;
      const h = 5 + Math.floor(n * 5);
      p.at(u, v);
      p.box(2, h, WALL[Math.floor(n * 97) % WALL.length]);
      p.roof(2, h, 4, ROOF[Math.floor(n * 53) % ROOF.length]);
    }
  const art = p.finish();
  ringArts.set(id, art);
  return art;
}

/** Sizes the world for the current grid. Call after setGrid, then rebuild the cached canvas and trees. */
export function layoutWorld(): void {
  XMAX = GRID_W + 11 + ringExt();
  YMAX = GRID_H + 11 + ringExt();
  WORLD_W = (XMAX - XMIN + (YMAX - YMIN)) * (TW / 2);
  WORLD_H = HEAD + (XMAX - XMIN + (YMAX - YMIN)) * (TH / 2);
  WORLD_OX = (YMAX - XMIN) * (TW / 2);
  WORLD_OY = HEAD - (XMIN + YMIN) * (TH / 2);
  isleTrees = [];
  trees = null;
  shore = null;
  heights = null;
  controls = null;
  macros = null;
  cloudList = null;
  placeKnolls();
}

type Terrain = 'grass' | 'road' | 'sawah' | 'kebun' | 'hutan' | 'beach' | 'sea' | 'teh' | 'teras' | 'tanah' | 'abu' | 'batu';

/**
 * Twin volcanoes on the island's back corner, part of the same corner-height mesh as the hills, so they
 * take the same facet light, tile grid and materials. a, b: the summit tile; r: foot radius in tiles;
 * h: summit height in art pixels.
 */
const VOLCS = [
  { a: -6.5, b: -3.5, r: 6.5, h: 156 },
  { a: -3, b: -7.5, r: 5.5, h: 120 },
];
/**
 * Karst knolls round the kampung: steep, round-topped limestone hills like the ones that rise out of
 * the rice fields of Gunung Kidul. A ring of them stands a few tiles past the ring road on every
 * side, clear of the coast, the volcanoes, the neighbours' roofs and the Kecamatan's district blocks.
 * a, b: centre tile; r: foot radius in tiles; h: height in art pixels; s: squash and turn.
 */
let knolls: { a: number; b: number; r: number; h: number; sx: number; rot: number }[] = [];
/** Knolls that reach each tile, keyed by tile, so a pixel only tests the few near it. */
const knollsAt = new Map<number, number[]>();
const tileKey = (tx: number, ty: number) => (tx + 512) * 1024 + ty + 512;
function placeKnolls(): void {
  knolls = [];
  knollsAt.clear();
  const ext = ringExt();
  const blocked = (a: number, b: number, r: number) =>
    coastAt(a, b) > -(r * 0.6 + 0.4) ||
    volcano(a, b).h > 30 ||
    knolls.some((k) => Math.hypot(k.a - a, k.b - b) < k.r + r + 1) ||
    farRoofs().some((f) => Math.hypot(f.x + 0.5 - a, f.y + 0.5 - b) < r + 0.4) ||
    ringBlocks().some((k) => a > k.x - r - 1 && b > k.y - r - 1 && a < k.x + RING_SIDE + r + 1 && b < k.y + RING_SIDE + r + 1);
  // Walk round the ring road and drop knolls at hashed gaps and distances.
  const W = GRID_W + ext;
  const H = GRID_H + ext;
  const perim = 2 * (W + H) + 8;
  for (let i = 0, s = 0; s < perim && i < 200; i++) {
    s += 1.5 + hash(i, 701) * 2.5;
    // Smaller knolls on the front sides, where the sawah between the ring road and the sea is narrow.
    const front = s >= W + 2 && s < 2 * W + H + 6;
    const r = front ? 0.9 + hash(i, 702) * 0.6 : 1.2 + hash(i, 702) ** 1.5 * 1.6;
    const gap = front ? 1.2 + r + hash(i, 703) * 2 : 1.4 + r * 0.8 + hash(i, 703) * 3;
    // A point on the road loop, then out from it.
    let a: number;
    let b: number;
    if (s < W + 2) [a, b] = [s - 1, -1 - gap];
    else if (s < W + H + 4) [a, b] = [W + gap, s - W - 3];
    else if (s < 2 * W + H + 6) [a, b] = [2 * W + H + 5 - s, H + gap];
    else [a, b] = [-1 - gap, perim - s - 1];
    if (blocked(a, b, r)) continue;
    knolls.push({ a, b, r, h: Math.min(72, 10 + r * (16 + hash(i, 704) * 12)), sx: 0.7 + hash(i, 705) * 0.6, rot: hash(i, 706) * Math.PI });
  }
  // Index each knoll on every tile within its reach (the tree ring runs out to 2.4 radii, squashed up to 1.43x).
  knolls.forEach((k, i) => {
    const reach = Math.ceil(k.r * 2.4 * 1.45) + 1;
    for (let ty = Math.floor(k.b) - reach; ty <= Math.floor(k.b) + reach; ty++)
      for (let tx = Math.floor(k.a) - reach; tx <= Math.floor(k.a) + reach; tx++) {
        const key = tileKey(tx, ty);
        const list = knollsAt.get(key);
        if (list) list.push(i);
        else knollsAt.set(key, [i]);
      }
  });
}

/**
 * Knoll height at a tile-space point, how far out from its centre it is (0 at the top, 1 at the
 * foot), and whether the point is on the side facing the viewer (down the screen).
 */
function knoll(a: number, b: number): { h: number; d: number; front: boolean } {
  let best = { h: 0, d: 9, front: false };
  const near = knollsAt.get(tileKey(Math.floor(a), Math.floor(b)));
  if (!near) return best;
  for (const i of near) {
    const k = knolls[i];
    const da = a - k.a;
    const db = b - k.b;
    const u = (da * Math.cos(k.rot) + db * Math.sin(k.rot)) / k.sx;
    const v = (-da * Math.sin(k.rot) + db * Math.cos(k.rot)) * k.sx;
    const d = Math.hypot(u, v) / k.r + (vnoise(a * 3 + k.a, b * 3, 1) - 0.5) * 0.25;
    if (d < best.d) best = { h: d < 1 ? k.h * (1 - d ** 3.2) : 0, d, front: da + db > 0 };
  }
  return best;
}

/** Volcano height at a tile-space point, in art pixels, and how far up the cone it is, 0..1. */
function volcano(a: number, b: number): { h: number; f: number } {
  let best = { h: 0, f: 0 };
  for (const v of VOLCS) {
    // Long concave aprons: the cone's foot reaches out to the shore, so the land climbs from the
    // beach all the way to the crater with no flat ledge in between.
    const d = Math.hypot(a - v.a, b - v.b) / (v.r * 1.9);
    if (d >= 1) continue;
    const crater = 0.07;
    let p = (1 - Math.max(0, d - crater) / (1 - crater)) ** 2.8;
    if (d < crater * 0.8) p -= 0.06;
    // Ravines: shallow creases running down from the rim.
    p *= 1 - 0.07 * (1 - Math.abs(vnoise(Math.atan2(b - v.b, a - v.a) * 6 + 40, 3, 1) * 2 - 1)) * Math.min(1, d * 3);
    const h = v.h * p;
    if (h > best.h) best = { h, f: p };
  }
  return best;
}

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
  // Every side runs down to a beach and the sea along a wandering, round-cornered coast.
  const coast = coastAt(tx, ty) + (hash(tx, ty) - 0.5) * 0.6;
  if (coast > 0.7) return 'sea';
  if (coast > -0.3) return 'beach';
  // Forest on the volcanoes; rock and ash take over up the cone per pixel (see buildWorld).
  if (volcano(tx + 0.5, ty + 0.5).h > 9) return 'hutan';
  if (tx > GRID_W || ty > GRID_H) return 'sawah';
  // Toward the volcanoes the land rises into terraced hills: kebun teh on the left, sawah terasering
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

/**
 * How far a tile-space point lies past the island's coast, in tiles: above 0.7 is sea, above -0.3
 * beach. Each side's line wanders by a low noise, in bays and headlands of a few tiles, and a soft
 * maximum rounds the four corners, so the island is no diamond. The front sides only wander outward,
 * so the sawah, the ring road and the neighbours' roofs always stay on land.
 */
function coastAt(a: number, b: number): number {
  const ext = ringExt();
  const wander = (s: number, k: number) => vnoise(s + k * 7, k, 5) * 0.6 + vnoise(s * 1.7 + k, k + 9, 2.2) * 0.3 + vnoise(s * 3 + k, k + 3, 1) * 0.1;
  const e = [
    a - (GRID_W + 4 + ext) - 4.5 * wander(b, 11),
    b - (GRID_H + 5 + ext) - 4.5 * wander(a, 23),
    XMIN + 1.6 - a + 1.4 * wander(b, 37),
    YMIN + 1.6 - b + 1.4 * wander(a, 51),
  ];
  const K = 0.55;
  const m = Math.max(...e);
  return m + Math.log(e.reduce((sum, v) => sum + Math.exp(K * (v - m)), 0)) / K;
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
        const n = vnoise(x + 40, y + 40, 4) * 0.7 + vnoise(x + 7, y + 90, 2) * 0.3;
        // Both ease up from the beach over a few tiles, so every shore rises gradually.
        const inland = Math.max(0, -coastAt(x, y));
        const hill = HILL_MAX * rise * smooth(inland / 5) * (0.2 + 0.8 * n);
        const volc = volcano(x, y).h * smooth(inland / 3.5) * smooth(out / 2);
        // Karst knolls stand on the flat land round the kampung, never on its tiles or the ring road.
        const kh = exact(x, y) || exact(x - 1, y - 1) || exact(x - 1, y) || exact(x, y - 1) ? 0 : knoll(x, y).h;
        const m = Math.max(hill, volc, kh);
        if (kh > Math.max(hill, volc)) {
          heights[(y - YMIN) * w + x - XMIN] = Math.round(kh + Math.min(hill, 6));
          continue;
        }
        const K = 0.15;
        heights[(y - YMIN) * w + x - XMIN] = Math.round(m + Math.log(Math.exp(K * (hill - m)) + Math.exp(K * (volc - m))) / K - Math.log(2) / K * Math.min(1, Math.min(hill, volc) / 8));
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
const MATS: Terrain[] = ['grass', 'road', 'sawah', 'kebun', 'hutan', 'beach', 'sea', 'teh', 'teras', 'tanah', 'abu', 'batu'];
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
    case 'abu':
      return 0.3 + 0.6 * vnoise(x + 7, y * 2, 5);
    case 'batu':
      return 0.2 + 0.8 * vnoise(x + 53, y * 2, 3);
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
    case 'batu': {
      // Pale limestone on the karst knolls, in ledges every few pixels with dark cracks and the odd
      // tuft of green clinging on.
      if (speck < 0.025) return '#6f8a3c';
      if (speck > 0.975 || (x + Math.floor(y / 3) * 5) % 13 === 0) return '#7d756b';
      return Math.floor(y / 3) % 2 ? tone(n, ['#9c958a', '#aaa397', '#b7afa2']) : tone(n, ['#a8a094', '#b6aea1', '#c2baac']);
    }
    case 'abu':
      // Volcanic ash on the cap, pale and cool, with dark cinders.
      if (speck > 0.985) return '#8f8a86';
      return tone(n, ['#b4aea6', '#bfb9b0', '#cac4bb']);
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

function put(img: ImageData, x: number, y: number, c: string): void {
  const n = hex(c);
  img.data.set([(n >> 16) & 255, (n >> 8) & 255, n & 255, 255], (y * WORLD_W + x) * 4);
}

/** The open sea on every pixel no ground covers, so the corners of the world canvas are water too. */
function paintSea(img: ImageData, land: Uint8Array): void {
  const rgb = new Map<string, number[]>();
  for (let y = 0; y < WORLD_H; y++)
    for (let x = 0; x < WORLD_W; x++) {
      if (land[y * WORLD_W + x]) continue;
      const c = groundColour('sea', 0, 0, x, y, 0, 0);
      let v = rgb.get(c);
      if (!v) rgb.set(c, (v = [hex(c) >> 16, (hex(c) >> 8) & 255, hex(c) & 255, 255]));
      img.data.set(v, (y * WORLD_W + x) * 4);
    }
}

/** Renders the whole world at art resolution. Cached by the caller. */
export function buildWorld(): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = WORLD_W;
  c.height = WORLD_H;
  const ctx = c.getContext('2d')!;
  const img = ctx.createImageData(WORLD_W, WORLD_H);


  // Ground tiles. Each pixel remembers its terrain, so ink lines can follow every border.
  const land = new Uint8Array(WORLD_W * WORLD_H);
  // Tile depth (a + b) of each land pixel, so islands drawn later sit behind nearer ground.
  const depth = new Float32Array(WORLD_W * WORLD_H);
  // Kind numbers: 1-7 in this order, 8 is the cliff, 9 and 10 the terraced hills, 11 bare earth.
  const KINDS: Terrain[] = ['grass', 'road', 'sawah', 'kebun', 'hutan', 'beach', 'sea'];
  const kindOf = (t: Terrain) => (t === 'teh' ? 9 : t === 'teras' ? 10 : t === 'tanah' ? 11 : t === 'abu' ? 12 : t === 'batu' ? 14 : KINDS.indexOf(t) + 1);
  // Each tile is two flat-lit triangles over its corner heights, drawn back to front so nearer
  // hills cover farther ones. Texture is sampled at the tile's flat position, so it sticks to the
  // ground as it rises. Outside the kampung each pixel's material comes from the corner control
  // map (groundAt), so land types meet along organic borders instead of tile edges. Slopes facing
  // the light (top left) brighten and the rest darken in a few flat steps, and a soft grid line
  // runs along every tile edge, like an old city-builder map.
  const GRID_LINE = new Set<Terrain>(['grass', 'kebun', 'hutan', 'teh', 'teras', 'tanah', 'abu', 'batu']);
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
    // How upright the facet is: 0 flat, 1 a wall. Karst knolls show bare limestone where it is steep.
    const upright = 1 - Math.abs(n[2]) / nm;
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
        // Clamped into this tile, so a pixel on the shared edge never reads a kampung tile next door.
        let t = blended ? groundAt(Math.min(Math.max(a, tx), tx + 0.9999), Math.min(Math.max(b, ty), ty + 0.9999), fx, fy) : tile;
        // Up a volcano the material follows the pixel's height, and its texture is sampled on screen,
        // so the steep cone is not streaked by flat-world texture stretched up the slope.
        let sx = fx;
        let sy = fy;
        if (t !== 'beach' && t !== 'sea' && !exact(tx, ty)) {
          const kn = knoll(a, b);
          if (kn.h > 2) {
            // Bare limestone on the steep sides, a green cap of forest on the rounded top.
            t = upright + (bayer(x, y) - 0.5) * 0.1 > 0.22 ? 'batu' : kn.d < 0.55 ? 'hutan' : 'grass';
            sx = x;
            sy = y * 2;
          }
        }
        if (t !== 'beach' && t !== 'sea') {
          const vo = volcano(a, b);
          if (vo.h > 6) {
            const hh = w0 * v[0][2] + w1 * v[1][2] + w2 * v[2][2];
            const z = zone(hh / (vo.h / vo.f), x, y);
            if (z) {
              t = z;
              sx = x;
              sy = y * 2;
            }
          }
        }
        const edge = GRID_LINE.has(t) && (Math.floor(a - dax) !== Math.floor(a) || Math.floor(b - dbx) !== Math.floor(b) || Math.floor(a - day) !== Math.floor(a) || Math.floor(b - dby) !== Math.floor(b));
        land[y * WORLD_W + x] = kindOf(t);
        depth[y * WORLD_W + x] = a + b;
        const c = hex(groundColour(t, a - tx, b - ty, sx, sy, tx, ty));
        // Water lies level, so the sea never takes the facet light of a sloped tile it reaches into.
        const f = (t === 'sea' ? 1 : lit) * (edge ? (t === 'grass' ? 0.86 : 0.88) : 1);
        img.data.set([Math.min(255, Math.round(((c >> 16) & 255) * f)), Math.min(255, Math.round(((c >> 8) & 255) * f)), Math.min(255, Math.round((c & 255) * f)), 255], (y * WORLD_W + x) * 4);
      }
  };
  // Volcano materials by height: forest, bare rock, then the ash cap. The zone is picked per pixel
  // with an ordered dither across a band of height, so tiers blend in a few flat steps instead of
  // meeting along a hard line. Below the forest the hill's own ground carries on, dithered in too.
  const zone = (frac: number, x: number, y: number): Terrain | null => {
    const f = frac + (bayer(x, y) - 0.5) * 0.16;
    return f > 0.76 ? 'abu' : f > 0.5 ? 'tanah' : f > 0.12 ? 'hutan' : null;
  };
  for (let d = XMIN + YMIN; d < XMAX + YMAX - 1; d++)
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

  paintSea(img, land);

  // Borders between land types, coloured instead of inked. The higher ground (garden over grass
  // over road over cliff over beach over sea) takes a dark edge in its own colour. The lower side
  // gets a bright rim that eases back to its base colour over three pixels, so each transition
  // reads clearly without hard black lines. Sea meets sand with a line of foam.
  const RANK = [2, 7, 5, 6, 8, 9, 3, 2, 4, 8, 6, 5, 10, 2, 8];
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
        // Open sea behind a hilltop is no border: the hill's own silhouette shows against it.
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

  isoIslands(img, land, depth);
  ctx.putImageData(img, 0, 0);

  return c;
}

const rgbOf = (c: string) => {
  const v = hex(c);
  return [v >> 16, (v >> 8) & 255, v & 255];
};

interface Isle {
  /** Tile-space position of the patch's top corner, and its size in tiles. */
  a0: number;
  b0: number;
  n: number;
  /** Corner height in art pixels at local corner (i, j); negative is under water. */
  h: (i: number, j: number) => number;
  peak: number;
}

/** Island ground by height and slope: sand at the waterline, grass, forest, and rock on steep faces. */
function isleMat(I: Isle, hh: number, slope: number, x: number, y: number): Terrain {
  const n = clumps(x, y);
  if (hh < 1 + n * 1.4) return 'beach';
  if (slope > 8 && n > 0.58) return 'tanah';
  return hh > I.peak * 0.55 + (n - 0.5) * 4 ? 'hutan' : 'grass';
}

const ISLE_RANK: Partial<Record<Terrain, number>> = { beach: 3, grass: 7, hutan: 9, tanah: 5 };

/**
 * Islands in true isometric: each is a small patch of tile-corner heights, rasterised as two lit
 * triangles per tile with the hills' grid line, painted with the ground's own materials and borders,
 * ringed with foam and a wet-sand bank on the near side, and planted with the map's own trees. No
 * perspective shrink or haze: the projection has none, so a far island is drawn like a near one.
 */
function drawIsle(img: ImageData, land: Uint8Array, depth: Float32Array, I: Isle, rank: Uint8Array): void {
  const OX = WORLD_OX;
  const OY = WORLD_OY;
  const LIGHT = [-0.75, -0.3, 1].map((c) => c / Math.hypot(-0.75, -0.3, 1));
  // Rank of each island pixel (0 off the island), in a buffer shared by all islands and cleared after.
  const keys: number[] = [];
  const mine = { get: (k: number) => rank[k] || undefined, has: (k: number) => rank[k] > 0 };
  const SIDE = 20;
  const tri = (v: [number, number, number][], tile: [number, number]) => {
    const g = v.map(([, , h]) => Math.max(0, h));
    const P = v.map(([a, b], k) => [OX + ((a - b) * TW) / 2, OY + ((a + b) * TH) / 2 - g[k]]);
    const area = (P[1][0] - P[0][0]) * (P[2][1] - P[0][1]) - (P[2][0] - P[0][0]) * (P[1][1] - P[0][1]);
    if (Math.abs(area) < 1e-6) return;
    const e1 = [(v[1][0] - v[0][0]) * SIDE, (v[1][1] - v[0][1]) * SIDE, g[1] - g[0]];
    const e2 = [(v[2][0] - v[0][0]) * SIDE, (v[2][1] - v[0][1]) * SIDE, g[2] - g[0]];
    let nn = [e1[1] * e2[2] - e1[2] * e2[1], e1[2] * e2[0] - e1[0] * e2[2], e1[0] * e2[1] - e1[1] * e2[0]];
    if (nn[2] < 0) nn = nn.map((c) => -c);
    const dot = (nn[0] * LIGHT[0] + nn[1] * LIGHT[1] + nn[2] * LIGHT[2]) / Math.hypot(nn[0], nn[1], nn[2]);
    const lit = Math.max(0.7, Math.min(1.22, Math.round((1 + (dot - LIGHT[2]) * 1.9) / 0.06) * 0.06));
    const slope = Math.max(...g) - Math.min(...g);
    const x0 = Math.max(0, Math.floor(Math.min(P[0][0], P[1][0], P[2][0])));
    const x1 = Math.min(WORLD_W - 1, Math.ceil(Math.max(P[0][0], P[1][0], P[2][0])));
    const y0 = Math.max(0, Math.floor(Math.min(P[0][1], P[1][1], P[2][1])));
    const y1 = Math.min(WORLD_H - 1, Math.ceil(Math.max(P[0][1], P[1][1], P[2][1])));
    for (let y = y0; y <= y1; y++)
      for (let x = x0; x <= x1; x++) {
        const w1 = ((x + 0.5 - P[0][0]) * (P[2][1] - P[0][1]) - (P[2][0] - P[0][0]) * (y + 0.5 - P[0][1])) / area;
        const w2 = ((P[1][0] - P[0][0]) * (y + 0.5 - P[0][1]) - (x + 0.5 - P[0][0]) * (P[1][1] - P[0][1])) / area;
        const w0 = 1 - w1 - w2;
        if (w0 < -1e-7 || w1 < -1e-7 || w2 < -1e-7) continue;
        const hh = w0 * v[0][2] + w1 * v[1][2] + w2 * v[2][2];
        if (hh < 0) continue;
        const a = w0 * v[0][0] + w1 * v[1][0] + w2 * v[2][0];
        const b = w0 * v[0][1] + w1 * v[1][1] + w2 * v[2][1];
        const k = y * WORLD_W + x;
        // Painter's order against the main island: ground in front of this pixel keeps it.
        if (land[k] && land[k] !== 7 && land[k] !== 13 && depth[k] > a + b) continue;
        const fx = Math.floor(OX + ((a - b) * TW) / 2);
        const fy = Math.floor(OY + ((a + b) * TH) / 2);
        const t = isleMat(I, hh, slope, fx, fy);
        const edge = t !== 'beach' && (Math.floor(a - 0.04) !== Math.floor(a) || Math.floor(b - 0.04) !== Math.floor(b));
        const c = hex(groundColour(t, a - tile[0], b - tile[1], fx, fy, tile[0], tile[1]));
        const f = lit * (edge ? 0.88 : 1);
        img.data.set([Math.min(255, Math.round(((c >> 16) & 255) * f)), Math.min(255, Math.round(((c >> 8) & 255) * f)), Math.min(255, Math.round((c & 255) * f)), 255], k * 4);
        land[k] = 13;
        depth[k] = a + b;
        if (!rank[k]) keys.push(k);
        rank[k] = ISLE_RANK[t] ?? 7;
      }
  };
  // Half-tile facets, so the waterline wanders instead of cutting whole tiles; the grid line stays on whole tiles.
  const N = I.n * 2;
  for (let d = 0; d < 2 * N - 1; d++)
    for (let i = 0; i < N; i++) {
      const j = d - i;
      if (j < 0 || j >= N) continue;
      const H = [I.h(i / 2, j / 2), I.h((i + 1) / 2, j / 2), I.h((i + 1) / 2, (j + 1) / 2), I.h(i / 2, (j + 1) / 2)];
      if (Math.max(...H) <= 0) continue;
      const a = I.a0 + i / 2;
      const b = I.b0 + j / 2;
      const A: [number, number, number] = [a, b, H[0]];
      const B: [number, number, number] = [a + 0.5, b, H[1]];
      const C: [number, number, number] = [a + 0.5, b + 0.5, H[2]];
      const D: [number, number, number] = [a, b + 0.5, H[3]];
      tri([A, B, C], [Math.floor(a), Math.floor(b)]);
      tri([A, C, D], [Math.floor(a), Math.floor(b)]);
    }
  // Borders inside the island and round it, like the main coast: the higher ground takes a dark edge,
  // the lower a bright rim; the sea gets foam then shallows, and the near side drops a wet-sand bank.
  const edits: [number, number, number][] = [];
  const NEAR: [number, number, number][] = [[1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1], [2, 0, 2], [-2, 0, 2], [0, 2, 2], [0, -2, 2], [3, 0, 3], [-3, 0, 3]];
  let minX = WORLD_W, maxX = 0, minY = WORLD_H, maxY = 0;
  for (const k of keys) {
    const x = k % WORLD_W;
    const y = (k - x) / WORLD_W;
    minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y);
  }
  const BANK = 2;
  for (let y = Math.max(1, minY - 3); y <= Math.min(WORLD_H - 2, maxY + 3 + BANK); y++)
    for (let x = Math.max(1, minX - 3); x <= Math.min(WORLD_W - 2, maxX + 3); x++) {
      const k = y * WORLD_W + x;
      const r = mine.get(k) ?? 2;
      if (r === 2) {
        let bank = 0;
        for (let d = 1; d <= BANK && !bank; d++) if (mine.get(k - d * WORLD_W) === 3) bank = d;
        if (bank) {
          edits.push([x, y, -bank]);
          continue;
        }
        if (land[k] && land[k] !== 7) continue;
      }
      let dark = false;
      let rim = 0;
      for (const [dx, dy, d] of NEAR) {
        const o = mine.get((y + dy) * WORLD_W + x + dx) ?? 2;
        if (o === r) continue;
        if (d === 1 && o < r) dark = true;
        else if (o > r && (rim === 0 || d < rim)) rim = d;
      }
      if (dark) edits.push([x, y, 0]);
      else if (rim) edits.push([x, y, rim]);
    }
  for (const [x, y, d] of edits) {
    const k = y * WORLD_W + x;
    const i = k * 4;
    let rgb = [img.data[i], img.data[i + 1], img.data[i + 2]];
    if (d < 0) rgb = rgbOf(d === -BANK ? '#a8834e' : '#c9a56a');
    else if (!mine.has(k) && d > 0) rgb = d === 1 ? [236, 246, 238] : d === 2 ? [169, 220, 210] : [118, 190, 180];
    else {
      const f = d === 0 ? 0.6 : d === 1 ? 1.2 : d === 2 ? 1.11 : 1.05;
      rgb = rgb.map((c) => Math.min(255, Math.round(c * f)));
    }
    if (!mine.has(k)) land[k] = 13;
    img.data.set(rgb, i);
  }
  // The map's own trees, as thick as on the main island: shade trees crowd the forest, groves and
  // bushes cover most of the grass, the odd palm leans over the sand.
  for (let i = 0; i < I.n; i++)
    for (let j = 0; j < I.n; j++) {
      const H = [I.h(i, j), I.h(i + 1, j), I.h(i + 1, j + 1), I.h(i, j + 1)];
      const slope = Math.max(...H) - Math.min(...H);
      if (slope > 12) continue;
      SPOTS.forEach(([fa, fb], k) => {
        const hh = (H[0] * (1 - fa) + H[1] * fa) * (1 - fb) + (H[3] * (1 - fa) + H[2] * fa) * fb;
        if (hh < 1) return;
        const a = I.a0 + i + fa;
        const b = I.b0 + j + fb;
        const [fx, fy] = flatPixel(a, b);
        const t = isleMat(I, hh, slope, fx, fy);
        const r = hash(Math.floor(a * 7) + k * 13 + 3, Math.floor(b * 5) + k * 7 + 1);
        const kind = hash(Math.floor(a * 3) + k, Math.floor(b * 9) + k * 3);
        const name = t === 'beach' ? (r < 0.15 && k === 0 ? 'kelapa' : null) : t === 'hutan' ? (r < 0.85 ? (kind < 0.85 ? 'pohon' : 'kelapa') : null) : t === 'grass' ? (r < 0.55 ? (kind < 0.65 ? 'pohon' : 'bush') : null) : null;
        if (!name) return;
        // A tree whose crown would cross nearer ground (the volcano behind which an islet sits) is left out.
        const tx0 = OX + ((a - b) * TW) / 2 - TW / 2;
        const ty0 = OY + ((a + b) * TH) / 2 - TOP - Math.round(hh);
        for (let y = Math.max(0, Math.floor(ty0 + TOP / 4)); y < ty0 + TOP + TH / 2; y += 2)
          for (let x = Math.max(0, Math.floor(tx0 + 3)); x < Math.min(WORLD_W, tx0 + TW - 3); x += 2) {
            const kk = y * WORLD_W + x;
            if (land[kk] && land[kk] !== 7 && land[kk] !== 13 && depth[kk] > a + b) return;
          }
        isleTrees.push({ tree: { name, tx: Math.floor(a), ty: Math.floor(b), x: tx0, y: ty0, scale: treeScale(name, Math.floor(a * 97) + Math.floor(b * 31) + k) }, d: a + b });
      });
    }
  for (const k of keys) rank[k] = 0;
}

/** Scatters islands of many sizes on the open sea: rocks, sandbars, wooded islets and a few big hilly ones. */
function isoIslands(img: ImageData, land: Uint8Array, depth: Float32Array): void {
  const placed: [number, number, number, number][] = [];
  const rank = new Uint8Array(WORLD_W * WORLD_H);
  const toTile = (sx: number, sy: number) => {
    const u = (sx - WORLD_OX) / (TW / 2);
    const v = (sy - WORLD_OY) / (TH / 2);
    return [(u + v) / 2, (v - u) / 2];
  };
  const make = (seed: number, n: number, peak: number, ca: number, cb: number): Isle => {
    const stretch = 0.8 + hash(seed, 1) * 0.5;
    const lx = (hash(seed, 2) - 0.5) * 0.9;
    const ly = (hash(seed, 3) - 0.5) * 0.9;
    const lr = 0.35 + hash(seed, 4) * 0.3;
    const half = n / 2;
    return {
      a0: Math.round(ca - half),
      b0: Math.round(cb - half),
      n,
      peak,
      h: (i, j) => {
        const u = (i - half) / (half * stretch);
        const v = (j - half) / (half / stretch);
        const d = Math.hypot(u, v);
        const lobe = (lr - Math.hypot(u - lx, v - ly)) / lr;
        const s = Math.max(1 - d, lobe) + (vnoise(i * 2 + seed * 3, j * 2, 2) - 0.5) * 0.5;
        return s <= 0 ? -3 : peak * s ** 1.2 - 2;
      },
    };
  };
  const fits = (sx: number, sy: number, rw: number, rh: number, up: number) => {
    if (sx - rw < 4 || sx + rw > WORLD_W - 4 || sy - rh - up < 2 || sy + rh > WORLD_H - 4) return false;
    for (let y = Math.floor(sy - rh - 8); y <= sy + rh + 8; y += 3)
      for (let x = Math.floor(sx - rw - 10); x <= sx + rw + 10; x += 3) {
        if (x < 0 || y < 0 || x >= WORLD_W || y >= WORLD_H) continue;
        const k = land[y * WORLD_W + x];
        if (k && k !== 7) return false;
      }
    return placed.every(([px, py, pw, ph]) => Math.abs(px - sx) > pw + rw + 14 || Math.abs(py - sy) > ph + rh + 10);
  };
  const tryPlace = (seed: number, n: number, peak: number) => {
    for (let t = 0; t < 400; t++) {
      const sx = hash(seed + t, 11) * WORLD_W;
      const sy = hash(seed + t, 12) * WORLD_H;
      const rw = n * 0.75 * (TW / 2) + 4;
      const rh = n * 0.75 * (TH / 2) + 4;
      if (!fits(sx, sy, rw, rh, peak)) continue;
      const [ca, cb] = toTile(sx, sy);
      drawIsle(img, land, depth, make(seed, n, peak, ca, cb), rank);
      placed.push([sx, sy, rw, rh]);
      return true;
    }
    return false;
  };
  // Sizes from a skewed spread: many rocks and sandbars, some wooded islets, a few big hilly islands.
  // Capped, so a big Kecamatan map still reads as a few islands round one, not a carpet of them.
  const want = Math.min(18, Math.round((WORLD_W * WORLD_H) / 42000));
  const SIZES: [number, number, number, number][] = [
    [10, 13, 26, 38],
    [7, 9, 16, 26],
    [4, 6, 9, 15],
    [2, 3, 4, 7],
  ];
  const quota = [Math.max(1, Math.round(want * 0.12)), Math.round(want * 0.25), Math.round(want * 0.3), Math.round(want * 0.33)];
  let seed = 100;
  SIZES.forEach(([n0, n1, p0, p1], c) => {
    for (let q = 0; q < quota[c]; q++) {
      seed += 37;
      const n = n0 + Math.floor(hash(seed, 5) * (n1 - n0 + 1));
      tryPlace(seed, n, p0 + hash(seed, 6) * (p1 - p0));
    }
  });
}

export interface Tree {
  name: string;
  /** Tile, for a per-tree bounce phase. */
  tx: number;
  ty: number;
  /** Art position of the tree art's top-left corner inside the world canvas. */
  x: number;
  y: number;
  /** Drawn size against the full sprite. Palms keep one size; every other tree varies. */
  scale: number;
}

/** A scenery tree's size: palms stay at 70%, every other tree somewhere from 50% to 90%, in 5% steps. */
const treeScale = (name: string, seed: number): number => (name === 'kelapa' ? 0.7 : Math.round((0.5 + hash(seed, 811) * 0.4) * 20) / 20);


/** True on a tile under a district block, where no tree grows. */
const inRing = (tx: number, ty: number): boolean => ringBlocks().some((b) => tx >= b.x - 1 && ty >= b.y - 1 && tx < b.x + RING_SIDE + 1 && ty < b.y + RING_SIDE + 1);

/**
 * True when nearer ground rises over a point, as on the far side of a volcano. Trees draw after the
 * baked world, so one standing there would show through the slope in front of it.
 */
function hidden(a: number, b: number): boolean {
  const h = heightAt(a, b);
  // Walk toward the viewer down the screen: each half-tile step is TH / 2 pixels lower. Check the
  // trunk's column against the base, and the crown's two side columns against the crown.
  for (const [da, lift] of [[0, 2], [0.4, 14], [-0.4, 14]])
    for (let k = 1; k <= 24; k++) if (heightAt(a + da + k / 2, b - da + k / 2) - (k * TH) / 2 > h + lift) return true;
  return false;
}

/**
 * Spots for scenery trees inside one tile, in tile fractions. Scenery trees are drawn at TREE_SCALE,
 * so three fit on a tile and a dense stand reads as one canopy.
 */
const SPOTS: [number, number][] = [[0.3, 0.28], [0.72, 0.45], [0.38, 0.74]];

/**
 * Trees on the land round the kampung, back to front so nearer trees overlap farther ones. Drawn per
 * frame so they can bounce. Most of the green land is wooded: forest and the volcanoes' gentle
 * forest belt are thick with shade trees, the kebun is a mix of palms, pisang and shade trees, the
 * open grass beyond the ring road has groves and bushes, and the tea hills keep a scatter so their
 * rows still read. Sawah, terraces, bare earth and steep faces stay open, and the kampung's own tiles
 * and the ring road never get a scenery tree.
 */
export function worldTrees(): Tree[] {
  if (trees) return trees;
  const list: { tree: Tree; d: number }[] = [];
  for (let ty = YMIN; ty < YMAX; ty++)
    for (let tx = XMIN; tx < XMAX; tx++) {
      if (exact(tx, ty) || inRing(tx, ty)) continue;
      const corners = [cornerHeight(tx, ty), cornerHeight(tx + 1, ty), cornerHeight(tx + 1, ty + 1), cornerHeight(tx, ty + 1)];
      const slope = Math.max(...corners) - Math.min(...corners);
      // The volcanoes' forest belt is wooded up its slope; elsewhere steep faces stay open so the hills read.
      const onVolc = volcano(tx + 0.5, ty + 0.5).h > 9;
      const steep = slope > (onVolc ? 30 : 16);
      SPOTS.forEach(([fa, fb], k) => {
        const a = tx + fa;
        const b = ty + fb;
        const seed = tx * 977 + ty * 131 + k;
        const push = (name: string) =>
          list.push({ tree: { name, tx, ty, x: WORLD_OX + ((a - b) * TW) / 2 - TW / 2, y: WORLD_OY + ((a + b) * TH) / 2 - TOP - Math.round(heightAt(a, b)), scale: treeScale(name, seed) }, d: a + b });
        // A thick ring of trees round each knoll's foot, a few on its green cap, none on the rock. On
        // the side facing the viewer the ring thins to bushes and a few trees, so the limestone shows.
        const kn = knoll(a, b);
        if (kn.d < 2.4) {
          const r = hash(seed, 821);
          if (kn.d > 0.85 && !hidden(a, b)) {
            if (!kn.front && kn.d < 1.8 && r < 0.85) push(r < 0.7 ? 'pohon' : 'bush');
            else if (kn.front && r < 0.3) push(r < 0.12 ? 'pohon' : 'bush');
          } else if (kn.d < 0.45 && r < 0.6 && !hidden(a, b)) push('pohon');
          return;
        }
        if (steep) return;
        const [fx, fy] = flatPixel(a, b);
        const t = groundAt(a, b, fx, fy);
        const n = hash(tx * 5 + k * 31 + 1, ty * 3 + k * 17 + 2);
        const kind = hash(tx * 13 + k * 7, ty * 11 + k * 5);
        const vf = volcano(a, b);
        // Up a volcano only the forest belt is wooded; rock and ash stay bare. Same height fraction
        // as the ground's tiers in buildWorld, with a margin so no tree stands in the dithered band.
        if (vf.h > 9 && heightAt(a, b) / (vf.h / vf.f) > 0.42) return;
        const name =
          t === 'hutan' ? (n < 0.85 ? (kind < 0.85 ? 'pohon' : 'kelapa') : null)
          : t === 'kebun' ? (n < 0.75 ? (kind < 0.35 ? 'kelapa' : kind < 0.6 ? 'pisang' : 'pohon') : null)
          : t === 'grass' ? (n < 0.6 ? (kind < 0.7 ? 'pohon' : 'bush') : null)
          : t === 'teh' ? (n < 0.22 && slope < 10 ? 'pohon' : null)
          : t === 'beach' ? (n < 0.12 && k === 0 ? 'kelapa' : null)
          : null;
        if (!name || hidden(a, b)) return;
        push(name);
      });
    }
  for (const t of isleTrees) list.push(t);
  trees = list.sort((p, q) => p.d - q.d).map((e) => e.tree);
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

/**
 * Clouds drifting over the sea round the island's back corner, seen from above like everything else.
 * Two hug the volcanoes' flanks. Drawn per frame so they can drift.
 */
export function clouds(): Cloud[] {
  if (cloudList) return cloudList;
  // Clouds sit in the open sea above the island's top corner, where they hide no tile.
  const cx = WORLD_OX;
  const cy = HEAD + 20;
  const at = (dx: number, dy: number, w: number, i: number, sway = 18): Cloud => {
    const art = cloudArt(w, i * 13 + 5);
    return { art, x: Math.round(cx + dx - w / 2), y: Math.round(cy + dy - art.height), sway, period: 38000 + hash(i, 3) * 30000, phase: hash(i, 9) * Math.PI * 2 };
  };
  cloudList = [
    at(-230, 40, 110, 1),
    at(170, -40, 130, 2),
    at(-40, -150, 90, 3),
    at(300, 30, 120, 4),
    at(-360, -60, 140, 5),
    at(420, -110, 100, 6),
    at(-470, 110, 120, 7),
    // Wrapped round the volcanoes' middles, slower and shorter of travel.
    at(-150, 120, 150, 8, 8),
    at(150, 100, 140, 9, 8),
  ];
  return cloudList;
}

/** Roofs of the neighbouring RTs beyond the ring road, shown from 2 stars. The sawah thins out where they stand. */
export function farRoofs(): { x: number; y: number; name: string }[] {
  if (ringOn) return [];
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
