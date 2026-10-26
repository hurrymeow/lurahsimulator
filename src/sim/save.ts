import { hasDef } from './content';
import { SAVE_VERSION } from './state';
import type { GameState } from './types';

export function serialize(s: GameState): string {
  return JSON.stringify(s);
}

/** Returns null for anything that is not a usable save, so the caller can start fresh. */
export function deserialize(raw: string | null): GameState | null {
  if (!raw) return null;
  try {
    const s = JSON.parse(raw) as GameState;
    if (!s || s.version !== SAVE_VERSION) return null;
    if (!Array.isArray(s.buildings) || !Array.isArray(s.residents) || typeof s.res?.rupiah !== 'number') return null;
    if (!s.buildings.every((b) => hasDef(b.def))) return null;
    return s;
  } catch {
    return null;
  }
}
