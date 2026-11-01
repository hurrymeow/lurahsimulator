import { describe, expect, it } from 'vitest';
import { checkDemolish, upgrade } from '../src/sim/rules';
import { bedsOf, homelessWithout, housing, newGame, occupants, population } from '../src/sim/state';

describe('rumah levels', () => {
  it('a rumah upgrades to level 3 and gains beds at each level', () => {
    const s = newGame(1);
    s.res.rupiah = 1e9;
    const b = s.buildings.find((o) => o.def === 'rumah')!;
    const before = housing(s);
    expect(bedsOf(b)).toBe(3);
    expect(upgrade(s, b).ok).toBe(true);
    expect(bedsOf(b)).toBe(4);
    expect(upgrade(s, b).ok).toBe(true);
    expect(bedsOf(b)).toBe(5);
    expect(housing(s)).toBe(before + 2);
    expect(upgrade(s, b).ok).toBe(false);
  });

  it('a full rumah tingkat cannot be torn down from under its residents', () => {
    const s = newGame(1);
    s.res.rupiah = 1e9;
    const b = s.buildings.find((o) => o.def === 'rumah')!;
    upgrade(s, b);
    upgrade(s, b);
    while (s.residents.length < housing(s) - 3) s.residents.push({ id: s.nextResidentId++, name: 'Pak Budi', job: 'none', pensiun: 0, fake: 0, arrived: 0 } as never);
    // Removing it would drop 5 beds, not the 3 a level 1 house had.
    expect(checkDemolish(s, b).ok).toBe(false);
  });

  it('fills the oldest houses first, and Bongkar says how many warga would lose a bed', () => {
    const s = newGame(1);
    const houses = s.buildings.filter((o) => bedsOf(o) > 0 && !o.noRoad);
    const total = houses.reduce((n, o) => n + occupants(s, o), 0);
    expect(total).toBe(Math.min(population(s), housing(s)));
    // Every house before the last one with anybody in it is full.
    const filled = houses.map((o) => occupants(s, o));
    const lastIn = filled.length - 1 - [...filled].reverse().findIndex((n) => n > 0);
    filled.slice(0, lastIn).forEach((n, i) => expect(n).toBe(bedsOf(houses[i])));
    const b = houses[0];
    while (s.residents.length < housing(s)) s.residents.push({ id: s.nextResidentId++, name: 'Bu Sri', job: 'none', pensiun: 0, fake: 0, arrived: 0 } as never);
    expect(homelessWithout(s, b)).toBe(bedsOf(b));
    const check = checkDemolish(s, b);
    expect(check.ok).toBe(false);
    if (!check.ok) expect(check.missing[0]).toMatch(new RegExp(`^Residents here: ${occupants(s, b)}\..*Free beds needed: ${bedsOf(b)}`));
  });
});
