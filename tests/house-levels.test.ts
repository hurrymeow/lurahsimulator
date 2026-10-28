import { describe, expect, it } from 'vitest';
import { checkDemolish, upgrade } from '../src/sim/rules';
import { bedsOf, housing, newGame } from '../src/sim/state';

describe('rumah levels', () => {
  it('a rumah upgrades to level 3 and gains beds at each level', () => {
    const s = newGame(1);
    s.res.rupiah = 1e9;
    const b = s.buildings.find((o) => o.def === 'rumah')!;
    const before = housing(s);
    expect(bedsOf(b)).toBe(3);
    expect(upgrade(s, b).ok).toBe(true);
    expect(bedsOf(b)).toBe(5);
    expect(upgrade(s, b).ok).toBe(true);
    expect(bedsOf(b)).toBe(7);
    expect(housing(s)).toBe(before + 4);
    expect(upgrade(s, b).ok).toBe(false);
  });

  it('a full rumah tingkat cannot be torn down from under its residents', () => {
    const s = newGame(1);
    s.res.rupiah = 1e9;
    const b = s.buildings.find((o) => o.def === 'rumah')!;
    upgrade(s, b);
    upgrade(s, b);
    while (s.residents.length < housing(s) - 3) s.residents.push({ id: s.nextResidentId++, name: 'Pak Budi', job: 'none', pensiun: 0, fake: 0, arrived: 0 } as never);
    // Removing it would drop 7 beds, not the 3 a level 1 house had.
    expect(checkDemolish(s, b).ok).toBe(false);
  });
});
