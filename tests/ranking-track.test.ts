import { describe, expect, it } from 'vitest';
import { promote } from '../src/sim/grow';
import { yearlyRanking } from '../src/sim/ranking';
import { newGame } from '../src/sim/state';
import type { GameState, RankingResult } from '../src/sim/types';

const rw = (seed: number): GameState => {
  const s = newGame(seed);
  promote(s, []);
  return s;
};

const rank = (s: GameState, year: number): RankingResult => {
  yearlyRanking(s, [], year);
  return s.ranking[s.ranking.length - 1];
};

describe('the rival follows the player from the RW on', () => {
  it('scores at least 900 against a previous RW score of 1000', () => {
    const s = rw(1);
    s.ranking.push({ tier: 'rw', year: 8, us: 1000, them: 1, won: true });
    expect(rank(s, 9).them).toBeGreaterThanOrEqual(900);
  });

  it('changes nothing at the RT', () => {
    const withEntry = newGame(1);
    withEntry.ranking.push({ year: 1, us: 1000, them: 1, won: true });
    const without = newGame(1);
    expect(rank(withEntry, 1).them).toBe(rank(without, 1).them);
  });

  it('changes nothing with no previous entry in the stage', () => {
    const plain = rw(1);
    const rtOnly = rw(1);
    rtOnly.ranking.push({ tier: 'rt', year: 8, us: 1000, them: 1, won: true });
    expect(rank(rtOnly, 9).them).toBe(rank(plain, 9).them);
  });
});
