import { describe, expect, it } from 'vitest';
import { SHOP_STAFF_CUT } from '../src/data/jobs';
import { openJobs, slots, staffing, staffMult } from '../src/sim/jobs';
import { addBuilding, addResident, newGame } from '../src/sim/state';
import { buildingIncome } from '../src/sim/tick';
import type { GameState, JobId } from '../src/sim/types';

// Shops give jobs, and a shop short of staff earns less (decisions/shop-jobs.md).
const game = (): GameState => {
  const s = newGame(3);
  s.buildings = s.buildings.filter((b) => b.def === 'kantorRT');
  for (const r of s.residents) { r.job = 'none'; r.manual = true; }
  return s;
};
const hire = (s: GameState, job: JobId) => {
  const r = addResident(s);
  r.job = job;
  r.manual = true;
};

describe('shop jobs', () => {
  it('each shop opens its own kind of post, one per level', () => {
    const s = game();
    const w = addBuilding(s, 'warung', 2, 2, 'active');
    addBuilding(s, 'rumahMakan', 4, 2, 'active');
    addBuilding(s, 'barbershop', 6, 2, 'active');
    expect(slots(s, 'penjaga')).toBe(1);
    expect(slots(s, 'tukangMasak')).toBe(1);
    expect(slots(s, 'tukangCukur')).toBe(1);
    w.level = 3;
    expect(slots(s, 'penjaga')).toBe(3);
    expect(openJobs(s).map((o) => o.job)).toEqual(expect.arrayContaining(['penjaga', 'tukangMasak', 'tukangCukur']));
  });

  it('an unstaffed shop loses the cut, pro rata as posts fill', () => {
    const s = game();
    const w = addBuilding(s, 'warung', 2, 2, 'active');
    w.level = 2;
    const full = buildingIncome(s, w) / staffMult(s, w);
    expect(staffMult(s, w)).toBeCloseTo(1 - SHOP_STAFF_CUT);
    hire(s, 'penjaga');
    expect(staffing(s, w)).toEqual({ job: 'penjaga', filled: 1, total: 2 });
    expect(staffMult(s, w)).toBeCloseTo(1 - SHOP_STAFF_CUT / 2);
    hire(s, 'penjaga');
    expect(staffMult(s, w)).toBe(1);
    expect(buildingIncome(s, w)).toBeCloseTo(full, -2);
  });

  it('buildings without a shop post are never cut', () => {
    const s = game();
    const k = addBuilding(s, 'kebunSayur', 2, 2, 'active');
    expect(staffing(s, k)).toBeUndefined();
    expect(staffMult(s, k)).toBe(1);
  });
});
