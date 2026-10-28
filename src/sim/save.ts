import { layRoads } from './access';
import { allDefs, hasDef } from './content';
import { SAVE_VERSION, newStageState } from './state';
import { OLD_GRID_H, OLD_GRID_W, RT_H, RT_W, setGrid, type GameState, type ProblemId } from './types';

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
    migrateSelokan(s);
    mendPaths(s);
    if (!s.buildings.every((b) => hasDef(b.def))) return null;
    if (s.version === 1) migrateV1(s);
    // Saves from before stages: start at 0 stars. The first tick catches the stars up.
    s.stage ??= newStageState();
    s.neighbours ??= [];
    s.stempel ??= { stock: 0, backlog: 0, clear: 0 };
    s.debtFree ??= 0;
    // Saves from before the first-win celebrations: whatever they already reached stays quiet.
    s.firsts ??= [
      ...(s.buildings.some((b) => b.def === 'rumah' && b.status === 'active') ? (['house'] as const) : []),
      ...(s.stats.arrived > 0 ? (['resident'] as const) : []),
      ...(s.stage.stars.rt > 0 ? (['star'] as const) : []),
    ];
    // Saves from before problem unlocks: what the player could already build stays open.
    s.problems ??= problemsFromSave(s);
    s.rw ??= { kaderDecay: 0 };
    s.kel ??= { budget: 0, spentBase: 0, serapanRun: 0, cleanAudits: 0 };
    setGrid(s.stage.current);
    if (!s.roadsLaid) layRoads(s);
    return s;
  } catch {
    return null;
  }
}

/** Problems a save from before problem unlocks counts as met: those of every building it already had open or built. */
function problemsFromSave(s: GameState): ProblemId[] {
  const out = new Set<ProblemId>();
  for (const d of allDefs()) {
    const p = d.requires?.problem;
    if (p && (s.unlocked?.includes(d.id) || s.buildings.some((b) => b.def === d.id))) out.add(p);
  }
  return [...out];
}

/** Jalan Setapak no longer cracks. Saves from when it did get their broken paths back. */
function mendPaths(s: GameState): void {
  for (const b of [...s.buildings, ...(s.neighbours ?? []).flatMap((n) => n.buildings)]) {
    if (b.def === 'jalan' && b.status === 'damaged') b.status = 'active';
    delete (b as { crackedAt?: number }).crackedAt;
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

/** The selokan became the biopori, at the same level. Old saves swap it over, including unlocks and Kerja Bakti. */
function migrateSelokan(s: GameState): void {
  const swap = (id: string) => (id === 'selokan' ? 'biopori' : id);
  for (const b of s.buildings) b.def = swap(b.def);
  for (const n of s.neighbours ?? []) for (const b of n.buildings) b.def = swap(b.def);
  s.unlocked = [...new Set((s.unlocked ?? []).map(swap))];
  for (const m of s.modifiers ?? []) m.target = swap(m.target);
}
