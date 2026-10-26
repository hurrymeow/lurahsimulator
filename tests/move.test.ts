import { describe, expect, it } from 'vitest';
import { checkMove, moveBuilding, place, rotateBuilding } from '../src/sim/rules';
import { buildingAt, newGame } from '../src/sim/state';

describe('moving and rotating', () => {
  it('moves a building for free and keeps its level and status', () => {
    const s = newGame(1);
    s.res.rupiah = 1e9;
    const uid = place(s, 'warung', 1, 1).uid!;
    const b = s.buildings.find((o) => o.uid === uid)!;
    b.level = 2;
    const cash = s.res.rupiah;
    expect(moveBuilding(s, b, 3, 1).ok).toBe(true);
    expect(buildingAt(s, 1, 1)).toBeUndefined();
    expect(buildingAt(s, 3, 1)?.uid).toBe(uid);
    expect(b.level).toBe(2);
    expect(s.res.rupiah).toBe(cash);
  });

  it('refuses a tile that is taken or off the map, and says why', () => {
    const s = newGame(1);
    s.res.rupiah = 1e9;
    const b = s.buildings.find((o) => o.def === 'rumah')!;
    const k = s.buildings.find((o) => o.def === 'kantorRT')!;
    const r = checkMove(s, b, k.x, k.y);
    expect(r.ok).toBe(false);
    expect(checkMove(s, b, -1, 0).ok).toBe(false);
  });

  it('lets a building stay on a tile it already covers', () => {
    const s = newGame(1);
    s.res.rupiah = 1e9;
    const b = s.buildings.find((o) => o.def === 'rumah')!;
    expect(checkMove(s, b, b.x, b.y).ok).toBe(true);
  });

  it('rotates back and forth without touching anything else', () => {
    const s = newGame(1);
    const b = s.buildings[0];
    rotateBuilding(b);
    expect(b.rot).toBe(1);
    rotateBuilding(b);
    expect(b.rot).toBe(0);
  });
});
