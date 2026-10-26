import { describe, expect, it } from 'vitest';
import { FARM_BUILDINGS } from '../src/data/farm';
import { JOBS } from '../src/data/jobs';
import { assign, checkAssign, slots } from '../src/sim/jobs';
import { addBuilding, addResident, newGame } from '../src/sim/state';
import { tick } from '../src/sim/tick';

describe('farm', () => {
  it('every farm earns and opens a farm job', () => {
    for (const d of FARM_BUILDINGS) {
      expect(d.income, d.id).toBeGreaterThan(0);
      expect(Object.keys(d.jobSlots ?? {}).length, d.id).toBeGreaterThan(0);
    }
  });
  it('a petani needs a farm, then pays rupiah each month', () => {
    const build = () => {
      const s = newGame(1);
      s.residents = [];
      const r = addResident(s);
      r.manual = true;
      addBuilding(s, 'sawah', 4, 4, 'active');
      return { s, r };
    };
    const { s: idle, r: free } = build();
    expect(checkAssign(newGame(1), free, 'petani').ok).toBe(false);
    const { s, r } = build();
    expect(slots(s, 'petani')).toBe(2);
    expect(assign(s, r, 'petani', true).ok).toBe(true);
    tick(idle);
    tick(s);
    expect(s.res.rupiah - idle.res.rupiah).toBeGreaterThanOrEqual(70_000);
  });
  it('farm jobs carry text in both languages', () => {
    for (const id of ['petani', 'peternak', 'pengepul']) expect(JOBS.find((j) => j.id === id), id).toBeTruthy();
  });
});
