// Laying a path, or a row of Decor, between two tiles. Pure, so it is unit-tested without a canvas.
import { checkPlace, place } from './rules';
import { def } from './content';
import { buildCost, buildingAt, sizeOf } from './state';
import { categoryOf } from '../data/categories';
import type { BuildingDef, GameState } from './types';

export interface LineTile {
  x: number;
  y: number;
  /** A path of this kind is already here, so nothing needs placing. */
  have: boolean;
  /** Free to place on. False when something else is in the way. */
  ok: boolean;
}

/** Straight run from a to b, along x then y. */
const corner = (a: { x: number; y: number }, b: { x: number; y: number }, xFirst: boolean) => {
  const out: { x: number; y: number }[] = [];
  const sx = Math.sign(b.x - a.x);
  const sy = Math.sign(b.y - a.y);
  let { x, y } = a;
  out.push({ x, y });
  const walkX = () => { while (x !== b.x) { x += sx; out.push({ x, y }); } };
  const walkY = () => { while (y !== b.y) { y += sy; out.push({ x, y }); } };
  if (xFirst) { walkX(); walkY(); } else { walkY(); walkX(); }
  return out;
};

/** The tiles of an L-shaped path from a to b, taking whichever bend has fewer blocked tiles. */
export function linePath(s: GameState, id: string, a: { x: number; y: number }, b: { x: number; y: number }): LineTile[] {
  const d = def(id);
  const { w, h } = sizeOf({ def: id, rot: 0 });
  // A cap (Patung Ikon, Taman) leaves room for only so many more; the tiles past it are blocked.
  const capRoom = d.maxCount === undefined ? Infinity : Math.max(0, d.maxCount - s.buildings.filter((x) => x.def === id).length);
  // And only as many as the kas and Orang Inside pay for: the preview shows what Yes will really build.
  const cost = buildCost(s, d);
  const od = d.orangDalamCost ?? 0;
  const room = Math.min(capRoom, cost ? Math.floor(s.res.rupiah / cost) : Infinity, od ? Math.floor(s.res.orangDalam / od) : Infinity);
  const rate = (tiles: { x: number; y: number }[]): LineTile[] => {
    const kept: { x: number; y: number }[] = [];
    let fresh = 0;
    return tiles.map((p) => {
      const here = buildingAt(s, p.x, p.y);
      const have = here?.def === id;
      // A bigger footprint takes the next spot only once it clears the one before, so a row never overlaps itself.
      const clear = kept.every((k) => Math.abs(k.x - p.x) >= w || Math.abs(k.y - p.y) >= h);
      let ok = have || (clear && fresh < room && checkPlace({ ...s, res: { ...s.res, rupiah: Infinity } }, id, p.x, p.y).ok);
      if (ok && !have) { kept.push(p); fresh++; }
      return { ...p, have, ok };
    });
  };
  const xFirst = rate(corner(a, b, true));
  const yFirst = rate(corner(a, b, false));
  const blocked = (l: LineTile[]) => l.filter((p) => !p.ok).length;
  return blocked(yFirst) < blocked(xFirst) ? yFirst : xFirst;
}

/** Places every free tile of the path. Returns how many were laid. */
export function placeLine(s: GameState, id: string, tiles: LineTile[]): number {
  let n = 0;
  for (const p of tiles) if (!p.have && p.ok && place(s, id, p.x, p.y).ok) n++;
  return n;
}

/** Builds that go down as a row from a start tile to an end tile: paths, and everything on the Decor tab. */
export const buildsInLine = (d: BuildingDef): boolean => !!d.pathIncome || categoryOf(d) === 'decoration';
