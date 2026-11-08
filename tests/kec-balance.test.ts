import { afterEach, describe, expect, it } from 'vitest';
import { EXPECT_KEC } from '../src/sim/balance';
import { newGame } from '../src/sim/state';
import { goalProgress } from '../src/sim/stages';
import { expectations } from '../src/sim/tick';
import { setGrid } from '../src/sim/types';

afterEach(() => setGrid('rt'));

describe('Kecamatan balance', () => {
  it('counts every ranking won in the stage for a tier-win goal, and no loss', () => {
    const s = newGame(1);
    // Every quarterly ranking counts, as at the RT; a loss does not, nor a win in another stage.
    s.ranking = [1, 2, 3, 4, 5, 6, 7, 8].map((year) => ({ year, us: 2, them: 1, won: year !== 3, tier: 'kecamatan' as const }));
    s.ranking.push({ year: 12, us: 2, them: 1, won: true, tier: 'kelurahan' });
    expect(goalProgress(s, { kind: 'tierWins', n: 12, tier: 'kecamatan' }).have).toBe(7);
    expect(goalProgress(s, { kind: 'tierWins', n: 8, tier: 'kelurahan' }).have).toBe(1);
  });

  it('a resident drains less Popularitas in the Kecamatan', () => {
    const s = newGame(1);
    s.res.sabar = 80;
    expectations(s, []);
    const rt = 80 - s.res.sabar;
    s.stage.current = 'kecamatan';
    s.res.sabar = 80;
    expectations(s, []);
    expect(80 - s.res.sabar).toBeCloseTo(rt * EXPECT_KEC.share, 5);
  });
});
