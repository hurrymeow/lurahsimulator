import { lotAt } from './area';
import { def, hasDef } from './content';
import { covers, footprintOf, tilesAt } from './footprint';
import { SAVE_VERSION, inBounds, newStageState } from './state';
import { OLD_GRID_H, OLD_GRID_W, RT_H, RT_W, setGrid, type Building, type GameState } from './types';

export function serialize(s: GameState): string {
  return JSON.stringify(s);
}

/** Returns null for anything that is not a usable save, so the caller can start fresh. */
export function deserialize(raw: string | null): GameState | null {
  if (!raw) return null;
  try {
    const s = JSON.parse(raw) as GameState;
    if (!s || !(s.version >= 1 && s.version <= SAVE_VERSION)) return null;
    if (!Array.isArray(s.buildings) || !Array.isArray(s.residents) || typeof s.res?.rupiah !== 'number') return null;
    if (!s.buildings.every((b) => hasDef(b.def))) return null;
    if (s.version === 1) migrateV1(s);
    // Saves from before stages: start at 0 stars. The first tick catches the stars up.
    s.stage ??= newStageState();
    s.neighbours ??= [];
    s.stempel ??= { stock: 0, backlog: 0, clear: 0 };
    s.debtFree ??= 0;
    s.rw ??= { kaderDecay: 0 };
    setGrid(s.stage.current);
    if (s.version < 3) migrateV2(s);
    s.version = SAVE_VERSION;
    return s;
  } catch {
    return null;
  }
}

/** v1 -> v2: the grid grew, so existing tiles move to the middle of it and keep their neighbours. */
function migrateV1(s: GameState): void {
  const dx = Math.floor((RT_W - OLD_GRID_W) / 2);
  const dy = Math.floor((RT_H - OLD_GRID_H) / 2);
  for (const b of s.buildings) {
    b.x += dx;
    b.y += dy;
  }
  s.version = 2;
}

/**
 * v2 -> v3: shops, towers and fields grew to 2x2. Each one grows into free ground on its own lot,
 * trying the four 2x2 squares that keep its tile. One with no room stays small (`size` 1) so nothing overlaps.
 */
function migrateV2(s: GameState): void {
  const groups: Building[][] = [s.buildings, ...s.neighbours.map((n) => n.buildings)];
  const everything = groups.flat();
  for (const list of groups)
    for (const b of list) {
      const n = footprintOf(def(b.def));
      if (n === 1 || b.size !== undefined) continue;
      const lot = lotAt(b.x, b.y);
      const fits = (x: number, y: number) =>
        tilesAt(x, y, n).every((t) => inBounds(t.x, t.y) && lotAt(t.x, t.y) === lot && (lot === 'rw' || lot === 'kel' || (Math.floor(t.x / RT_W) === Math.floor(b.x / RT_W) && Math.floor(t.y / RT_H) === Math.floor(b.y / RT_H))) && !everything.some((o) => o !== b && covers(o, t.x, t.y)));
      // Claim nothing while testing, so this building's own tile never blocks it.
      b.size = 1;
      const spot = [[0, 0], [-1, 0], [0, -1], [-1, -1]].map(([dx, dy]) => ({ x: b.x + dx, y: b.y + dy })).find((p) => fits(p.x, p.y));
      if (!spot) continue;
      b.x = spot.x;
      b.y = spot.y;
      delete b.size;
    }
}
