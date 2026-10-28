import { describe, expect, it } from 'vitest';
import { deserialize, serialize } from '../src/sim/save';
import { refreshAccess } from '../src/sim/access';
import { checkPlace, place } from '../src/sim/rules';
import { score } from '../src/sim/ranking';
import { addBuilding, buildingAt, newGame } from '../src/sim/state';
import { SYSTEMS, buildingIncome } from '../src/sim/tick';
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
    expect(l.version).toBe(2);
    expect(l.buildings[0]).toMatchObject({ x: 5, y: 6 });
    expect(l.buildings[0].x).toBeLessThan(GRID_W);
    expect(l.buildings[0].y).toBeLessThan(GRID_H);
  });
});

describe('path wear', () => {
  it('never breaks in a long game, and a flood leaves paths alone', () => {
    const s = newGame(3);
    const p = addBuilding(s, 'jalan', 1, 0, 'active');
    for (let m = 0; m < 600; m++) {
      s.month = m;
      for (const sys of SYSTEMS) sys(s, []);
    }
    expect(p.status).toBe('active');
  });
  it('restores broken paths from older saves', () => {
    const s = newGame(4);
    const p = addBuilding(s, 'jalan', 1, 0, 'damaged');
    (p as { crackedAt?: number }).crackedAt = 20;
    const back = deserialize(serialize(s))!;
    const q = back.buildings.find((b) => b.uid === p.uid)!;
    expect(q.status).toBe('active');
    expect('crackedAt' in q).toBe(false);
  });
});

describe('building over a path', () => {
  it('a building replaces the jalan under it, but a path never replaces a building', () => {
    const s = newGame(1);
    s.res.rupiah = 10_000_000;
    const k = s.buildings.find((b) => b.def === 'kantorRT')!;
    const x = k.x + 2;
    const y = k.y + 2;
    expect(buildingAt(s, x, y)?.def).toBe('jalan');
    expect(place(s, 'warung', x, y).ok).toBe(true);
    expect(buildingAt(s, x, y)?.def).toBe('warung');
    expect(s.buildings.filter((b) => b.x === x && b.y === y)).toHaveLength(1);
    expect(checkPlace(s, 'jalan', x, y).ok).toBe(false);
  });

  it('a decoration works without a path and the start map has plenty of lanes', () => {
    const s = newGame(1);
    expect(s.buildings.filter((b) => b.def === 'jalan').length).toBeGreaterThan(15);
    const p = addBuilding(s, 'potBunga', 0, 0, 'active');
    const bio = addBuilding(s, 'biopori', 1, 0, 'active');
    refreshAccess(s);
    expect(p.noRoad).toBeUndefined();
    expect(bio.noRoad).toBeUndefined();
  });
});
