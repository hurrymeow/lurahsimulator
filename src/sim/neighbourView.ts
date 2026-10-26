import { NEIGHBOUR } from './balance';
import type { GameState, Neighbour, Resident } from './types';

const SOCIAL = new Set(['posRonda', 'wifi', 'biopori']);

/** The AI RT as a state of its own, so the player's scoring, combo and star code can read it unchanged. */
export function viewOf(s: GameState, n: Neighbour): GameState {
  const social = n.buildings.filter((b) => SOCIAL.has(b.def)).length;
  const posyandu = s.buildings.reduce((sum, b) => sum + (b.def === 'posyandu' && b.status === 'active' ? b.level : 0), 0);
  return {
    ...s,
    buildings: n.buildings,
    residents: Array.from({ length: n.pop }) as Resident[],
    discovered: n.discovered,
    ranking: n.ranking,
    emas: 0,
    res: { ...s.res, sabar: Math.min(NEIGHBOUR.sabarMax, NEIGHBOUR.sabarBase + NEIGHBOUR.sabarPerSocial * social + NEIGHBOUR.sabarPerPosyandu * posyandu) },
  };
}
