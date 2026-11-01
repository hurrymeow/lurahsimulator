import { beforeEach, afterEach, describe, expect, it } from 'vitest';
import { connectedRoad, hasRoadBeside, layRoads, refreshAccess, setRoadRule } from '../src/sim/access';
import { demolish, place } from '../src/sim/rules';
import { addBuilding, buildingAt, housing, isWorking, newGame } from '../src/sim/state';
import { buildingIncome, tick } from '../src/sim/tick';
import { deserialize, serialize } from '../src/sim/save';

beforeEach(() => setRoadRule(true));
afterEach(() => setRoadRule(false));

describe('road access', () => {
  it('starts with the kantor and both houses connected', () => {
    const s = newGame(1);
    expect(s.buildings.some((b) => b.noRoad)).toBe(false);
    expect(housing(s)).toBe(6);
  });

  it('switches off a building with no path and earns nothing from it', () => {
    const s = newGame(1);
    const w = addBuilding(s, 'warung', 0, 0, 'active');
    refreshAccess(s);
    expect(w.noRoad).toBe(true);
    expect(isWorking(w)).toBe(false);
    expect(buildingIncome(s, w)).toBe(0);
  });

  it('a path chain from the kantor wakes it, and removing the chain switches it off again', () => {
    const s = newGame(1);
    const k = s.buildings.find((b) => b.def === 'kantorRT')!;
    // The starter lanes end at k.x + 4, k.y + 2. The warung sits two tiles off them.
    const w = addBuilding(s, 'warung', k.x + 5, k.y + 4, 'active');
    refreshAccess(s);
    place(s, 'jalan', k.x + 4, k.y + 3);
    expect(w.noRoad).toBe(true);
    place(s, 'jalan', k.x + 4, k.y + 4);
    expect(w.noRoad).toBeUndefined();
    const link = buildingAt(s, k.x + 4, k.y + 3)!;
    demolish(s, link);
    expect(w.noRoad).toBe(true);
  });

  it('a Wifi Tower needs no path, while a warung in the same spot does', () => {
    const s = newGame(1);
    const wifi = addBuilding(s, 'wifi', 0, 0, 'active');
    refreshAccess(s);
    expect(wifi.noRoad).toBeUndefined();
    expect(isWorking(wifi)).toBe(true);
    const warung = addBuilding(s, 'warung', 0, 0, 'active');
    refreshAccess(s);
    expect(warung.noRoad).toBe(true);
    expect(isWorking(warung)).toBe(false);
  });

  it('a path island that never touches the kantor does not count', () => {
    const s = newGame(1);
    const w = addBuilding(s, 'warung', 0, 0, 'active');
    addBuilding(s, 'jalan', 1, 0, 'active');
    refreshAccess(s);
    expect(w.noRoad).toBe(true);
    expect(hasRoadBeside(connectedRoad(s), { def: 'warung', x: 0, y: 0 })).toBe(false);
  });

  it('a house with no path adds no beds', () => {
    const s = newGame(1);
    addBuilding(s, 'rumah', 0, 0, 'active');
    refreshAccess(s);
    expect(housing(s)).toBe(6);
  });

  it('does not stop the monthly tick, and perantau houses are built beside a path', () => {
    const s = newGame(2);
    for (let i = 0; i < 40; i++) tick(s);
    for (const b of s.buildings.filter((o) => o.def === 'rumah')) expect(b.noRoad, `house ${b.x},${b.y}`).toBeUndefined();
  });

  it('lays paths for an old save so nothing loads switched off', () => {
    const s = newGame(3);
    const k = s.buildings.find((b) => b.def === 'kantorRT')!;
    s.buildings = s.buildings.filter((b) => b.def !== 'jalan');
    addBuilding(s, 'warung', k.x + 3, k.y, 'active');
    s.roadsLaid = false;
    const l = deserialize(serialize(s))!;
    expect(l.buildings.some((b) => b.noRoad)).toBe(false);
    expect(l.roadsLaid).toBe(true);
    layRoads(l);
  });
});
