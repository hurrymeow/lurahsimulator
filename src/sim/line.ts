// Laying a path between two tiles. Pure, so it is unit-tested without a canvas.
import { checkPlace, place } from './rules';
import { buildingAt } from './state';
import type { GameState } from './types';

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
  const rate = (tiles: { x: number; y: number }[]): LineTile[] =>
    tiles.map((p) => {
      const here = buildingAt(s, p.x, p.y);
      const have = here?.def === id;
      return { ...p, have, ok: have || checkPlace({ ...s, res: { ...s.res, rupiah: Infinity } }, id, p.x, p.y).ok };
    });
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
