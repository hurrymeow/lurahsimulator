import { layRoads } from './access';
import { hasDef } from './content';
import { SAVE_VERSION, newStageState } from './state';
import { OLD_GRID_H, OLD_GRID_W, RT_H, RT_W, setGrid, type GameState } from './types';

export function serialize(s: GameState): string {
  return JSON.stringify(s);
}

/** Returns null for anything that is not a usable save, so the caller can start fresh. */
export function deserialize(raw: string | null): GameState | null {
  if (!raw) return null;
  try {
    const s = JSON.parse(raw) as GameState;
    if (!s || (s.version !== SAVE_VERSION && s.version !== 1)) return null;
    if (!Array.isArray(s.buildings) || !Array.isArray(s.residents) || typeof s.res?.rupiah !== 'number') return null;
    if (!s.buildings.every((b) => hasDef(b.def))) return null;
    if (s.version === 1) migrateV1(s);
    // Saves from before stages: start at 0 stars. The first tick catches the stars up.
    s.stage ??= newStageState();
    s.neighbours ??= [];
    s.stempel ??= { stock: 0, backlog: 0, clear: 0 };
    s.debtFree ??= 0;
    s.rw ??= { kaderDecay: 0 };
    s.kel ??= { budget: 0, spentBase: 0, serapanRun: 0, cleanAudits: 0 };
    setGrid(s.stage.current);
    if (!s.roadsLaid) layRoads(s);
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
  s.version = SAVE_VERSION;
}
