import { describe, expect, it } from 'vitest';
import { CHAINS, chainSystem } from '../src/sim/chains';
import { deskCapacity, output } from '../src/sim/staff';
import { addBuilding, newGame } from '../src/sim/state';
import { EN } from '../src/i18n/en';
import { ID } from '../src/i18n/id';
import type { Fx } from '../src/sim/gain';
import type { GameState, Staff } from '../src/sim/types';

const special = (id: number, sp: string, role: Staff['role'], level: number): Staff => ({ id, name: sp, stars: 4, stats: { rajin: 60, lobi: 70, jujur: 65, gaul: 25 }, salary: 2_000_000, role, xp: 40, level, hiredAt: 0, special: sp });
const run = (s: GameState, weeks: number) => {
  const fx: Fx = [];
  for (let i = 0; i < weeks; i++) chainSystem(s, fx);
  return fx;
};

describe('quest chains for the named specials', () => {
  it('Pak Purna\'s memoir waits for Bu Juru Ketik, then pays Lobi +10 and Popularitas', () => {
    const s = newGame(4);
    s.staff = [];
    const purna = special(21, 'pakPurna', 'hansip', 3);
    s.staff!.push(purna);
    s.res.sabar = 60;
    run(s, 6);
    // Level 3 is done, but the memoir waits for a typist.
    expect(purna.chainStep).toBe(1);
    s.staff!.push(special(22, 'buJuruKetik', 'asisten', 2));
    run(s, 1);
    expect(purna.chainStep).toBe(2);
    const k = s.buildings.find((b) => b.def === 'kantorRT')!;
    addBuilding(s, 'balaiWarga', k.x + 3, k.y + 3, 'active');
    const lobi = purna.stats.lobi;
    const fx = run(s, 1);
    expect(purna.chainDone).toBe(true);
    expect(purna.stats.lobi).toBe(lobi + 10);
    expect(fx.some((f) => f.kind === 'notice' && f.card)).toBe(true);
  });

  it('Bu Juru Ketik\'s typewriter needs Bang Rental PS and a Bengkel, then her desk clears twice the folders', () => {
    const s = newGame(4);
    s.staff = [];
    const ketik = special(22, 'buJuruKetik', 'asisten', 2);
    s.staff!.push(ketik);
    const before = output(ketik);
    run(s, 3);
    expect(ketik.chainStep).toBe(1);
    s.staff!.push(special(23, 'bangRentalPS', 'pu', 1));
    const k = s.buildings.find((b) => b.def === 'kantorRT')!;
    addBuilding(s, 'bengkel', k.x - 3, k.y + 3, 'active');
    run(s, 3);
    expect(ketik.chainDone).toBe(true);
    expect(output(ketik)).toBeCloseTo(before * 2);
    expect(deskCapacity(s)).toBeGreaterThan(0);
  });

  it('every chain step, title and reward is written in both languages', () => {
    for (const c of CHAINS) {
      const keys = ['name', 'doneTitle', 'reward', ...c.steps.map((_s, i) => `step${i}`)].map((p) => `chain.${c.special}.${p}`);
      for (const k of keys) {
        expect((EN as Record<string, string>)[k], k).toBeTruthy();
        expect((ID as Record<string, string>)[k], k).toBeTruthy();
      }
    }
  });
});
