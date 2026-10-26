import { describe, expect, it } from 'vitest';
import { WACANA } from '../src/data/wacana';
import { placeableDefs } from '../src/sim/content';
import { buildCost, newGame, sprawl } from '../src/sim/state';
import { addBuilding } from '../src/sim/state';
import { expectations } from '../src/sim/tick';
import { announce, wacanaCost, wacanaSystem } from '../src/sim/wacana';

describe('policies are a trade', () => {
  it('every policy charges something besides Popularitas', () => {
    for (const w of WACANA) expect(Object.keys(w.side).length, w.id).toBeGreaterThan(0);
  });

  it('a repeat costs more and lands softer', () => {
    const s = newGame(1);
    s.res.rupiah = 5_000_000;
    const first = wacanaCost(s, 'gotong');
    announce(s, 'gotong');
    const firstPower = s.wacana[0].power;
    expect(wacanaCost(s, 'gotong')).toBeGreaterThan(first);
    announce(s, 'gotong');
    expect(s.wacana[0].power).toBeLessThan(firstPower);
  });

  it('an active policy drains its side cost every month', () => {
    const s = newGame(1);
    s.res.rupiah = 5_000_000;
    announce(s, 'digital');
    const before = { rupiah: s.res.rupiah, viral: s.res.viral };
    wacanaSystem(s, []);
    expect(s.res.rupiah).toBeLessThan(before.rupiah);
    expect(s.res.viral).toBeGreaterThan(before.viral);
  });
});

describe('money sinks', () => {
  it('buildings get dearer once the kampung sprawls', () => {
    const s = newGame(1);
    const d = placeableDefs().find((p) => !p.pathIncome)!;
    const base = buildCost(s, d);
    for (let i = 0; i < 12; i++) addBuilding(s, 'rumah', i, 12, 'active');
    expect(sprawl(s)).toBeGreaterThan(1);
    expect(buildCost(s, d)).toBeGreaterThan(base);
  });

  it('a bigger kampung expects more every month', () => {
    const s = newGame(1);
    s.res.sabar = 80;
    expectations(s, []);
    expect(s.res.sabar).toBeLessThan(80);
  });
});
