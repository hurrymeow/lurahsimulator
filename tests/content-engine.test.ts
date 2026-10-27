import { describe, expect, it } from 'vitest';
import { BUILDINGS } from '../src/data/buildings';
import { DECOR_CAP } from '../src/sim/balance';
import { checkPlace, place } from '../src/sim/rules';
import { deserialize, serialize } from '../src/sim/save';
import { addBuilding, newGame } from '../src/sim/state';
import { buildingIncome, checkUnlocks, type Fx } from '../src/sim/tick';
import { score } from '../src/sim/ranking';

describe('biopori replaces selokan', () => {
  it('migrates old saves at the same level, including unlocks and Kerja Bakti', () => {
    const s = newGame(1);
    const b = addBuilding(s, 'warung', 0, 0, 'active');
    b.def = 'selokan';
    b.level = 2;
    s.unlocked.push('selokan');
    s.modifiers.push({ id: 'kb', label: 'Kerja bakti', target: 'selokan', incomeMult: 1.2, monthsLeft: 3 });
    const l = deserialize(serialize(s))!;
    expect(l.buildings.at(-1)).toMatchObject({ def: 'biopori', level: 2 });
    expect(l.unlocked).toContain('biopori');
    expect(l.unlocked).not.toContain('selokan');
    expect(l.modifiers[0].target).toBe('biopori');
  });
  it('no building def is called selokan any more', () => {
    expect(BUILDINGS.some((d) => d.id === 'selokan')).toBe(false);
  });
});

describe('decoration aura', () => {
  const decor = (s: ReturnType<typeof newGame>, x: number, y: number) => addBuilding(s, 'tamanBermain', x, y, 'active');
  it('lifts income of a shop in radius, and nothing outside it', () => {
    const s = newGame(2);
    const w = addBuilding(s, 'warung', 5, 5, 'active');
    const base = buildingIncome(s, w);
    decor(s, 6, 5);
    expect(buildingIncome(s, w)).toBeGreaterThan(base);
    const s2 = newGame(2);
    const w2 = addBuilding(s2, 'warung', 0, 0, 'active');
    const base2 = buildingIncome(s2, w2);
    decor(s2, 10, 12);
    expect(buildingIncome(s2, w2)).toBe(base2);
  });
  it('is capped however many stand nearby', () => {
    const s = newGame(3);
    const w = addBuilding(s, 'warung', 5, 5, 'active');
    const base = buildingIncome(s, w);
    for (let i = 0; i < 8; i++) decor(s, 4 + (i % 3), 4 + Math.floor(i / 3));
    expect(buildingIncome(s, w)).toBeLessThanOrEqual(Math.round(base * (1 + DECOR_CAP)) + 1);
  });
  it('ignores a decoration that is still being built, and does not raise the ranking score', () => {
    const s = newGame(4);
    const w = addBuilding(s, 'warung', 5, 5, 'active');
    const base = buildingIncome(s, w);
    const a = score(s);
    addBuilding(s, 'tamanBermain', 6, 5, 'building');
    expect(buildingIncome(s, w)).toBe(base);
    s.buildings.at(-1)!.status = 'active';
    expect(score(s)).toBe(a);
  });
});

describe('Orang Dalam cost', () => {
  it('blocks placing without enough Orang Dalam and spends it when placed', () => {
    const s = newGame(5);
    s.res.rupiah = 50_000_000;
    s.stage.stars.rt = 2;
    s.res.orangDalam = 1;
    const no = checkPlace(s, 'patungIkon', 3, 3);
    expect(no.ok).toBe(false);
    expect(no.ok ? [] : no.missing.join(' ')).toMatch(/Orang Inside/);
    s.res.orangDalam = 2.5;
    expect(place(s, 'patungIkon', 3, 3).ok).toBe(true);
    expect(s.res.orangDalam).toBeCloseTo(0.5);
  });
});

describe('unlock notices', () => {
  it('stays quiet on the first month, when the opening menu is not a reward', () => {
    const s = newGame(6);
    s.month = 1;
    const fx: Fx = [];
    checkUnlocks(s, fx);
    expect(fx).toHaveLength(0);
    expect(s.unlocked.length).toBeGreaterThan(6);
  });

  it('batches several unlocks in one month into one notice', () => {
    const s = newGame(6);
    s.month = 5;
    s.stage.stars.rt = 2;
    const fx: Fx = [];
    checkUnlocks(s, fx);
    const notices = fx.filter((f) => f.kind === 'notice');
    expect(notices).toHaveLength(1);
    expect(s.unlocked.length).toBeGreaterThan(6);
    const again: Fx = [];
    checkUnlocks(s, again);
    expect(again).toHaveLength(0);
  });
});
