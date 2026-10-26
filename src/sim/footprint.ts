// How much ground a building takes. A building stands on its (x, y) tile and spreads
// `size` tiles toward +x and +y, so a 2x2 shop covers (x..x+1, y..y+1).
import { def } from './content';
import type { Building, BuildingDef } from './types';

export interface Pt {
  x: number;
  y: number;
}

/** Enough of a building to know its ground. */
type Lot = Pick<Building, 'def' | 'x' | 'y' | 'size'>;

/** Tiles on each side a def takes. covers() assumes 2 at most. */
export const footprintOf = (d: BuildingDef): number => d.footprint ?? 1;

const sizes = new Map<string, number>();

/** Tiles on each side a building takes. Old saves that had no room to grow keep `size` 1. Cached per def: it runs in every tile lookup. */
export function sizeOf(b: Pick<Building, 'def' | 'size'>): number {
  if (b.size !== undefined) return b.size;
  let n = sizes.get(b.def);
  if (n === undefined) sizes.set(b.def, (n = footprintOf(def(b.def))));
  return n;
}

/** Every tile a building at (x, y) of this size covers. */
export function tilesAt(x: number, y: number, size: number): Pt[] {
  const out: Pt[] = [];
  for (let dy = 0; dy < size; dy++) for (let dx = 0; dx < size; dx++) out.push({ x: x + dx, y: y + dy });
  return out;
}

export const tilesOf = (b: Building): Pt[] => tilesAt(b.x, b.y, sizeOf(b));

export function covers(b: Building, x: number, y: number): boolean {
  // Most buildings miss on the first comparison, so the size lookup only runs near a hit.
  if (x < b.x || y < b.y || x > b.x + 1 || y > b.y + 1) return false;
  const n = sizeOf(b);
  return x < b.x + n && y < b.y + n;
}

/** King-move distance between the nearest tiles of two footprints. 1 means they touch, even at a corner. */
export function gap(a: Lot, b: Lot): number {
  const ax = Math.max(0, b.x - (a.x + sizeOf(a) - 1), a.x - (b.x + sizeOf(b) - 1));
  const ay = Math.max(0, b.y - (a.y + sizeOf(a) - 1), a.y - (b.y + sizeOf(b) - 1));
  return Math.max(ax, ay);
}

/** True when b sits within r tiles of a's footprint. r = 1 means touching, as it did for one-tile buildings. */
export const within = (a: Building, b: Building, r: number): boolean => gap(a, b) <= r;

/** King-move distance from a tile to the nearest tile of a footprint. 0 on it, 1 beside it. */
export function tileGap(b: Building, p: Pt): number {
  const n = sizeOf(b);
  return Math.max(Math.max(0, b.x - p.x, p.x - (b.x + n - 1)), Math.max(0, b.y - p.y, p.y - (b.y + n - 1)));
}

/** The 4-way ring of tiles around a footprint, where a door or a path can touch it. */
export function edgeTiles(b: Building): Pt[] {
  const n = sizeOf(b);
  const out: Pt[] = [];
  for (let i = 0; i < n; i++) out.push({ x: b.x + i, y: b.y - 1 }, { x: b.x + i, y: b.y + n }, { x: b.x - 1, y: b.y + i }, { x: b.x + n, y: b.y + i });
  return out;
}

/** Ground centre of a footprint in tile space, where (x + 0.5, y + 0.5) is a tile's centre. */
export const centreOf = (b: Building): Pt => ({ x: b.x + sizeOf(b) / 2, y: b.y + sizeOf(b) / 2 });
