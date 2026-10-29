import { NEIGHBOUR } from './balance';
import { isSeam } from './area';
import { housing, population } from './state';
import { RT_H, RT_W, type Building, type GameState, type Neighbour, type Resident } from './types';

const SOCIAL = new Set(['posRonda', 'wifi', 'biopori']);

/** True for a building inside this RT's cell, not on the seams around it. */
export const inCell = (n: Pick<Neighbour, 'cx' | 'cy'>, b: Pick<Building, 'x' | 'y'>): boolean =>
  Math.floor(b.x / RT_W) === n.cx && Math.floor(b.y / RT_H) === n.cy && !isSeam(b.x, b.y);

/** The best combo count among all RTs, which every RT's combos goal uses. */
const comboShare = (s: GameState): number => Math.max(s.discovered.length, ...s.neighbours.map((o) => o.discovered.length));

/**
 * An RT the player runs, as a state of its own: the player's buildings in its cell, the player's Sabar, and a share of
 * the player's residents in proportion to the beds the cell holds.
 */
function playerCellView(s: GameState, n: Neighbour): GameState {
  const buildings = s.buildings.filter((b) => inCell(n, b));
  const beds = housing({ ...s, buildings });
  const pop = Math.min(beds, Math.round((population(s) * beds) / Math.max(1, housing(s))));
  return { ...s, buildings, residents: s.residents.slice(0, pop), discovered: n.discovered, comboShare: comboShare(s), ranking: n.ranking, emas: 0 };
}

/** The AI RT as a state of its own, so the player's scoring, combo and star code can read it unchanged. */
export function viewOf(s: GameState, n: Neighbour): GameState {
  if (n.run === 'player') return playerCellView(s, n);
  const social = n.buildings.filter((b) => SOCIAL.has(b.def)).length;
  const posyandu = s.buildings.reduce((sum, b) => sum + (b.def === 'posyandu' && b.status === 'active' ? b.level : 0), 0);
  return {
    ...s,
    buildings: n.buildings,
    // A head count, not people: each stands in as a resident with no job, so code that reads residents never meets a hole.
    residents: Array.from({ length: n.pop }, (_, i) => ({ id: -1 - i, name: '', job: 'none', pensiun: 0, fake: 0, arrived: 0 })) as Resident[],
    discovered: n.discovered,
    // Combos count across RTs: every RT's combos goal uses the best count among all of them, the player's included.
    comboShare: comboShare(s),
    ranking: n.ranking,
    emas: 0,
    res: { ...s.res, sabar: Math.min(NEIGHBOUR.sabarMax, NEIGHBOUR.sabarBase + NEIGHBOUR.sabarPerSocial * social + NEIGHBOUR.sabarPerPosyandu * posyandu) },
  };
}
