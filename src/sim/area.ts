// Who owns each tile of the growing map. The player's RT is always the top-left cell.
import { GRID_H, GRID_W, RT_H, RT_W } from './types';

/** rt: inside the player's RT, or an RT they took over. rw and kel: seam lots for RW and Kelurahan buildings. other: an AI-run RT. */
export type Lot = 'rt' | 'rw' | 'kel' | 'other';

/** The seam a coordinate sits on, as the boundary index between two cells, or -1. A seam is the two tiles either side of the boundary. */
function seam(v: number, size: number, span: number): number {
  for (let b = 0; b < span - 1; b++) if (v === (b + 1) * size - 1 || v === (b + 1) * size) return b;
  return -1;
}

/** RT cells the player has taken over, as "cx,cy". Their lots are the player's to build on. */
let playerCells = new Set<string>();
/** Bumps whenever the player's cells change, so caches of the lot map know to rebuild. */
export let areaVersion = 0;

/** Sets which RT cells the player runs, besides their own at (0,0). Call after loading, promotion, takeover and hand-back. */
export function setPlayerCells(cells: { cx: number; cy: number }[]): void {
  playerCells = new Set(cells.map((c) => `${c.cx},${c.cy}`));
  areaVersion++;
}

export function lotAt(x: number, y: number): Lot {
  const span = GRID_W / RT_W;
  const sx = seam(x, RT_W, span);
  const sy = seam(y, RT_H, span);
  if (sx < 0 && sy < 0) return (x < RT_W && y < RT_H) || playerCells.has(`${Math.floor(x / RT_W)},${Math.floor(y / RT_H)}`) ? 'rt' : 'other';
  // The middle boundary of a four-RT-wide map separates two RWs.
  if ((span === 4 && sx === 1) || (span === 4 && sy === 1)) return 'kel';
  // Other seams belong to the RW, but only inside the player's own.
  const own = span === 4 ? 2 : span;
  return x < own * RT_W && y < own * RT_H ? 'rw' : 'other';
}

/** The RT cell holding a tile, counted from the player's at (0,0). */
export const cellOf = (x: number, y: number) => ({ cx: Math.floor(x / RT_W), cy: Math.floor(y / RT_H) });

/** Every RT cell on the map except the player's. */
export function neighbourCells(): { cx: number; cy: number }[] {
  const out: { cx: number; cy: number }[] = [];
  for (let cy = 0; cy < GRID_H / RT_H; cy++) for (let cx = 0; cx < GRID_W / RT_W; cx++) if (cx || cy) out.push({ cx, cy });
  return out;
}

/** The RW a cell belongs to, as a cell of RWs. Only meaningful on a Kelurahan map. */
export const rwOf = (cx: number, cy: number) => ({ rx: Math.floor(cx / 2), ry: Math.floor(cy / 2) });

/** True on the two-tile bands between cells. */
export const isSeam = (x: number, y: number) => seam(x, RT_W, GRID_W / RT_W) >= 0 || seam(y, RT_H, GRID_H / RT_H) >= 0;
