// Ground materials painted per tile corner, after Terrain3D's control map and index-map shader
// (github.com/TokisanGames/Terrain3D, docs/controlmap_format.md and docs/shader_design.md).
//
// Each corner (vertex) holds one 32-bit control word: a base material, an overlay material and an
// 8-bit blend between them, plus an autoshader flag. A pixel reads the four corners round it,
// weights them bilinearly, and adds each material's own height texture, so the taller detail
// (a grass clump, a pebble, a sand ridge) pushes through where two materials meet. Terrain3D then
// mixes the colours; pixel art keeps one winner per pixel instead, as if blend sharpness were at
// its maximum. Borders come out organic but stay crisp, in the palette, with no dither.

/** Bit layout, left to right, as in Terrain3D: base id 5 bits, overlay id 5, blend 8, ..., auto 1. */
export function encodeControl(base: number, overlay: number, blend: number, auto = false): number {
  return (((base & 0x1f) << 27) | ((overlay & 0x1f) << 22) | ((Math.round(blend) & 0xff) << 14) | (auto ? 1 : 0)) >>> 0;
}
export const baseOf = (c: number) => (c >>> 27) & 0x1f;
export const overlayOf = (c: number) => (c >>> 22) & 0x1f;
/** 0 shows only the base, 255 only the overlay. */
export const blendOf = (c: number) => (c >>> 14) & 0xff;
export const isAuto = (c: number) => (c & 1) === 1;

/**
 * Terrain3D's autoshader: the steeper the ground, the more of the slope material shows through the
 * corner's base. Slope is the corner's biggest height step to a neighbour, in art pixels.
 */
export function autoBlend(slope: number, from: number, full: number): number {
  return Math.max(0, Math.min(1, (slope - from) / (full - from)));
}

// Scratch weights per material id, reused so the per-pixel pick allocates nothing.
const weight = new Float32Array(32);
const seen: number[] = [];

/**
 * The material that shows at one pixel. c0..c3 are the corners at (0,0), (1,0), (1,1), (0,1) of
 * the cell, fa and fb the pixel's place in it (0..1). height(id) is that material's height texture
 * at this pixel (0..1); depth sets how far it may push a border.
 */
export function pickMaterial(c0: number, c1: number, c2: number, c3: number, fa: number, fb: number, height: (id: number) => number, depth: number): number {
  seen.length = 0;
  corner(c0, (1 - fa) * (1 - fb));
  corner(c1, fa * (1 - fb));
  corner(c2, fa * fb);
  corner(c3, (1 - fa) * fb);
  let best = seen[0];
  let top = -Infinity;
  for (const id of seen) {
    // A material needs some real weight here before its texture can lift it.
    const s = weight[id] + (weight[id] > 0.02 ? depth * height(id) : 0);
    if (s > top) {
      top = s;
      best = id;
    }
  }
  return best;
}

/** Adds one corner's base and overlay to the weights, split by its blend. */
function corner(c: number, w: number): void {
  const t = blendOf(c) / 255;
  add(baseOf(c), w * (1 - t));
  add(overlayOf(c), w * t);
}

function add(id: number, w: number): void {
  if (w <= 0) return;
  if (!seen.includes(id)) {
    seen.push(id);
    weight[id] = 0;
  }
  weight[id] += w;
}

/**
 * The same height-blended pick for materials laid out by a smooth field instead of corners, such
 * as altitude zones on a mountain: weights[i] is how much zone i belongs here, heights[i] its
 * height texture at this pixel. Returns the winning index.
 */
export function heightBlend(weights: readonly number[], heights: readonly number[], depth: number): number {
  let best = 0;
  let top = -Infinity;
  for (let i = 0; i < weights.length; i++) {
    if (weights[i] <= 0.02) continue;
    const s = weights[i] + depth * heights[i];
    if (s > top) {
      top = s;
      best = i;
    }
  }
  return best;
}
