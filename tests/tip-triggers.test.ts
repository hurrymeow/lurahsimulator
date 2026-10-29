import { describe, expect, it } from 'vitest';
import { addBuilding, newGame } from '../src/sim/state';
import type { GameState } from '../src/sim/types';

const steps = async () => (await import('../src/ui/howto')).STEPS;
const due = async (s: GameState) => (await steps()).filter((st) => st.when?.(s)).map((st) => st.id);

describe('tip triggers', () => {
  it('no tip fires on the month alone', async () => {
    for (const st of await steps()) {
      if (!st.when) continue;
      const early = newGame(1);
      const late = newGame(1);
      late.month = 200;
      expect(st.when(late), st.id).toBe(st.when(early));
    }
  });

  it('the first shop names a combo to build beside it, with its pieces as pictures', async () => {
    const s = newGame(1);
    expect(await due(s)).not.toContain('combo');
    addBuilding(s, 'warung', 1, 1, 'active');
    expect(await due(s)).toContain('combo');
    const combo = (await steps()).find((st) => st.id === 'combo')!;
    const own = combo.tip!(s)!;
    expect(own.body).toMatch(/combo/);
    expect(own.body).not.toMatch(/[{}]/);
    expect(own.pics.filter((p) => 'sprite' in p).length).toBeGreaterThanOrEqual(2);
    expect(own.pics.some((p) => 'text' in p && p.text === '+')).toBe(true);
  });

  it('a found combo swaps the combo tip for the one that points at the Combo list', async () => {
    const s = newGame(1);
    addBuilding(s, 'warung', 1, 1, 'active');
    s.discovered.push('tongkrongan');
    const ids = await due(s);
    expect(ids).not.toContain('combo');
    expect(ids).toContain('comboFound');
  });

  it('the found-combo tip stays out of How to play', async () => {
    const found = (await steps()).find((st) => st.id === 'comboFound')!;
    expect(found.tipOnly).toBe(true);
  });

  it('jobs waits for a job the player built, not the Kantor RT seats', async () => {
    const s = newGame(1);
    s.residents[0].job = 'pns';
    expect(await due(s)).not.toContain('jobs');
    s.residents[1].job = 'ojol';
    expect(await due(s)).toContain('jobs');
  });

  it('wacana follows a Popularitas fall, and the report card follows the first ranking', async () => {
    const s = newGame(1);
    expect(await due(s)).not.toContain('wacana');
    expect(await due(s)).not.toContain('ranking');
    s.warned = ['sabar'];
    s.ranking.push({ year: 1, us: 90, them: 80, won: true });
    const ids = await due(s);
    expect(ids).toContain('wacana');
    expect(ids).toContain('ranking');
  });
});
