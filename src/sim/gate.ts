import type { GameState } from './types';

const ORDER = ['rt', 'rw', 'kelurahan', 'kecamatan'] as const;

/** A later stage's content opens once the player stands in that stage with enough stars. A path is picked at the Kelurahan promotion. */
export function gateOpen(s: GameState, g: { stage: 'rw' | 'kelurahan' | 'kecamatan'; stars: number; path?: string }): boolean {
  if (ORDER.indexOf(s.stage.current) < ORDER.indexOf(g.stage)) return false;
  if (g.path && s.stage.path !== g.path) return false;
  return s.stage.stars[g.stage] >= g.stars;
}
