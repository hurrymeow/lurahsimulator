import { describe, expect, it } from 'vitest';
import { BUILDINGS } from '../src/data/buildings';
import { SHOP_BUILDINGS } from '../src/data/shops';
import { assign, slots } from '../src/sim/jobs';
import { addBuilding, addResident, housing, newGame } from '../src/sim/state';
import { advanceConstruction, buildingIncome } from '../src/sim/tick';
import type { Fx } from '../src/sim/gain';

describe('shops, facilities and housing', () => {
  it('ids are unique across every RT building', () => {
    const ids = BUILDINGS.map((b) => b.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
  it('every shop earns something once it works', () => {
    const s = newGame(1);
    for (const d of SHOP_BUILDINGS.filter((x) => x.income)) {
      const b = addBuilding(s, d.id, 0, 0, 'active');
      expect(buildingIncome(s, b), d.id).toBeGreaterThan(0);
      s.buildings = s.buildings.filter((o) => o !== b);
    }
  });
  it('kontrakan adds beds', () => {
    const s = newGame(2);
    const before = housing(s);
    addBuilding(s, 'kontrakan', 3, 3, 'active');
    expect(housing(s)).toBe(before + 12);
  });
  it('bengkel opens ojol slots, gudang opens tukang slots', () => {
    const s = newGame(3);
    const ojol = slots(s, 'ojol');
    addBuilding(s, 'bengkel', 3, 3, 'active');
    expect(slots(s, 'ojol')).toBe(ojol + 2);
    addBuilding(s, 'gudangMaterial', 4, 3, 'active');
    expect(slots(s, 'tukang')).toBe(2);
  });
  it('tukang speed up construction', () => {
    const run = (tukang: number) => {
      const s = newGame(4);
      addBuilding(s, 'gudangMaterial', 4, 3, 'active');
      for (let i = 0; i < tukang; i++) {
        const r = addResident(s);
        assign(s, r, 'tukang', true);
      }
      const site = addBuilding(s, 'warung', 6, 6, 'building');
      site.timer = 40;
      const fx: Fx = [];
      for (let m = 1; m <= 8; m++) {
        s.month = m;
        advanceConstruction(s, fx);
      }
      return site.timer;
    };
    expect(run(2)).toBeLessThan(run(0));
    expect(run(0)).toBe(32);
  });
});
