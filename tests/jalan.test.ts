import { describe, expect, it } from 'vitest';
import { deserialize, serialize } from '../src/sim/save';
import { place } from '../src/sim/rules';
import { score } from '../src/sim/ranking';
import { SAVE_VERSION, addBuilding, newGame } from '../src/sim/state';
import { buildingIncome } from '../src/sim/tick';
import { GRID_H, GRID_W } from '../src/sim/types';

describe('jalan', () => {
  it('is free, instant, and adds 10% income beside a shop', () => {
    const s = newGame(1);
    const w = addBuilding(s, 'warung', 0, 0, 'active');
    const base = buildingIncome(s, w);
    const before = s.res.rupiah;
    const r = place(s, 'jalan', 1, 0);
    expect(r.ok).toBe(true);
    expect(s.res.rupiah).toBe(before);
    expect(buildingIncome(s, w)).toBe(Math.round(base * 1.1));
    place(s, 'jalan', 0, 1);
    expect(buildingIncome(s, w)).toBe(Math.round(base * 1.1));
  });
  it('does not raise the ranking score', () => {
    const s = newGame(2);
    const a = score(s);
    place(s, 'jalan', 0, 0);
    expect(score(s)).toBe(a);
  });
  it('migrates v1 saves by centring them', () => {
    const s = newGame(3);
    s.version = 1;
    s.buildings = [];
    addBuilding(s, 'warung', 3, 4, 'active');
    const l = deserialize(serialize(s))!;
    expect(l.version).toBe(SAVE_VERSION);
    expect(l.buildings[0]).toMatchObject({ x: 5, y: 6 });
    expect(l.buildings[0].x).toBeLessThan(GRID_W);
    expect(l.buildings[0].y).toBeLessThan(GRID_H);
  });
});
