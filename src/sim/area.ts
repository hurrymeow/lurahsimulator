// Who owns each tile of the growing map. The player's RT is always the top-left cell.
// RT cells are RT_W x RT_H and sit SEAM tiles apart; the bands between them are the seams.
import { CELL_H, CELL_W, RT_H, RT_W, SEAM, mapSpan } from './types';

/** rt: inside the player's RT, or an RT they took over. rw and kel: seam lots for RW and Kelurahan buildings. other: an AI-run RT. */
export type Lot = 'rt' | 'rw' | 'kel' | 'other';

/** The seam a coordinate sits on, as the index of the cell before it, or -1 inside a cell. */
function seam(v: number, pitch: number, size: number): number {
  return v % pitch >= size ? Math.floor(v / pitch) : -1;
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

/** The RT cell holding a tile, counted from the player's at (0,0). A seam tile counts with the cell before it. */
export const cellOf = (x: number, y: number) => ({ cx: Math.floor(x / CELL_W), cy: Math.floor(y / CELL_H) });

/** The top-left tile of an RT cell. */
export const cellOrigin = (cx: number, cy: number) => ({ x: cx * CELL_W, y: cy * CELL_H });

export function lotAt(x: number, y: number): Lot {
  const span = mapSpan();
  const sx = seam(x, CELL_W, RT_W);
  const sy = seam(y, CELL_H, RT_H);
  if (sx < 0 && sy < 0) {
    const c = cellOf(x, y);
    return (c.cx === 0 && c.cy === 0) || playerCells.has(`${c.cx},${c.cy}`) ? 'rt' : 'other';
  }
  // The middle boundary of a four-RT-wide map separates two RWs.
  if ((span === 4 && sx === 1) || (span === 4 && sy === 1)) return 'kel';
  // Other seams belong to the RW, but only inside the player's own.
  const own = span === 4 ? 2 : span;
  return x < own * CELL_W - SEAM && y < own * CELL_H - SEAM ? 'rw' : 'other';
}

/** Every RT cell on the map except the player's. */
export function neighbourCells(): { cx: number; cy: number }[] {
  const out: { cx: number; cy: number }[] = [];
  const span = mapSpan();
  for (let cy = 0; cy < span; cy++) for (let cx = 0; cx < span; cx++) if (cx || cy) out.push({ cx, cy });
  return out;
}

/** The RW a cell belongs to, as a cell of RWs. Only meaningful on a Kelurahan map. */
export const rwOf = (cx: number, cy: number) => ({ rx: Math.floor(cx / 2), ry: Math.floor(cy / 2) });

/** True on the two-tile bands between cells. */
export const isSeam = (x: number, y: number) => seam(x, CELL_W, RT_W) >= 0 || seam(y, CELL_H, RT_H) >= 0;

/**
 * Moves a tile from the old layout, where the seams took each cell's edge rows, to the gapped one.
 * Seam tiles stay on the seam band, and tiles inside a cell keep their place in it.
 */
export function ungapTile(v: number, size: number, span: number): number {
  const c = Math.floor(v / size);
  const r = v % size;
  if (r === size - 1 && c < span - 1) return c * (size + SEAM) + size;
  if (r === 0 && c > 0) return c * (size + SEAM) - 1;
  return c * (size + SEAM) + r;
}
