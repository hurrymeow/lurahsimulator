import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { refreshAccess, setRoadRule } from '../src/sim/access';
import { PATH_DECAY } from '../src/sim/balance';
import { checkRepairPath, isCracked, pathDecaySystem, repairPath, repairPathCost, stretchOf, tileRepairCost } from '../src/sim/decay';
import { checkRepair, repair, repairCost } from '../src/sim/events';
import { place } from '../src/sim/rules';
import { addBuilding, buildingAt, newGame } from '../src/sim/state';
import { tick } from '../src/sim/tick';
import type { Building, GameState } from '../src/sim/types';

/** A straight path of n tiles along row y, from x = 0. */
function lane(s: GameState, n: number, y = 0): Building[] {
  return Array.from({ length: n }, (_, x) => addBuilding(s, 'jalan', x, y, 'active'));
}

/** Runs only the decay system, month by month, with new cracks switched off unless asked. */
function age(s: GameState, months: number, cracks = false): void {
  const chance = PATH_DECAY.crackChance;
  if (!cracks) (PATH_DECAY as { crackChance: number }).crackChance = 0;
  try {
    for (let i = 0; i < months; i++) {
      s.month++;
      pathDecaySystem(s, []);
    }
  } finally {
    (PATH_DECAY as { crackChance: number }).crackChance = chance;
  }
}

const cracked = (s: GameState) => s.buildings.filter(isCracked).length;

describe('path decay', () => {
  it('never cracks a path in year 1', () => {
    for (let seed = 1; seed <= 20; seed++) {
      const s = newGame(seed);
      lane(s, 12);
      age(s, PATH_DECAY.safeMonths, true);
      expect(cracked(s), `seed ${seed}`).toBe(0);
    }
  });

  it('cracks now and then after that: rare, not a flood', () => {
    let total = 0;
    for (let seed = 1; seed <= 20; seed++) {
      const s = newGame(seed);
      lane(s, 12);
      lane(s, 12, 2);
      lane(s, 6, 4);
      s.month = PATH_DECAY.safeMonths;
      // Fix every crack at once, so this counts new cracks only.
      for (let m = 0; m < 24; m++) {
        age(s, 1, true);
        for (const b of s.buildings.filter(isCracked)) {
          total++;
          b.status = 'active';
          delete b.crackedAt;
        }
      }
    }
    // 30 paths for 24 months, 20 times: about 0.4% a path a month.
    const rate = total / (30 * 24 * 20);
    expect(rate).toBeGreaterThan(0.001);
    expect(rate).toBeLessThan(0.01);
  });

  it('does not draw from the shared random stream', () => {
    const s = newGame(7);
    lane(s, 20);
    s.month = 40;
    const rng = s.rng;
    age(s, 30, true);
    expect(s.rng).toBe(rng);
  });

  it('spreads gradually: one tile per six months of neglect, never sooner', () => {
    const s = newGame(1);
    const path = lane(s, 12);
    s.month = 30;
    path[5].status = 'damaged';
    path[5].crackedAt = s.month;
    age(s, PATH_DECAY.spreadEvery - 1);
    expect(cracked(s)).toBe(1);
    age(s, 1);
    expect(cracked(s)).toBe(2);
    age(s, PATH_DECAY.spreadEvery);
    expect(cracked(s)).toBe(3);
    // Still one stretch, still the first crack's clock.
    expect(stretchOf(s, path[5])).toHaveLength(3);
  });

  it('a long neglected stretch grows by about 10% each time', () => {
    const s = newGame(2);
    const path = lane(s, 13);
    lane(s, 13, 1);
    s.month = 30;
    for (const b of path.slice(0, 13)) {
      b.status = 'damaged';
      b.crackedAt = s.month;
    }
    for (const b of s.buildings.filter((o) => o.def === 'jalan' && o.y === 1).slice(0, 7)) {
      b.status = 'damaged';
      b.crackedAt = s.month;
    }
    expect(cracked(s)).toBe(20);
    age(s, PATH_DECAY.spreadEvery);
    // 20 tiles in one stretch grow by round(20 x 10%) = 2.
    expect(cracked(s)).toBe(22);
  });

  it('cuts off a building past the crack, and fixing it reconnects', () => {
    setRoadRule(true);
    try {
      const s = newGame(1);
      const k = s.buildings.find((b) => b.def === 'kantorRT')!;
      const w = addBuilding(s, 'warung', k.x + 5, k.y + 4, 'active');
      place(s, 'jalan', k.x + 4, k.y + 3);
      place(s, 'jalan', k.x + 4, k.y + 4);
      refreshAccess(s);
      expect(w.noRoad).toBeUndefined();
      const link = buildingAt(s, k.x + 4, k.y + 3)!;
      link.status = 'damaged';
      link.crackedAt = s.month;
      refreshAccess(s);
      expect(w.noRoad).toBe(true);
      s.res.rupiah = 10_000_000;
      repairPath(s, link, 'tile');
      refreshAccess(s);
      expect(w.noRoad).toBeUndefined();
    } finally {
      setRoadRule(false);
    }
  });

  it('fixes a tile, a stretch, or a stretch through a favour, at the right price', () => {
    const s = newGame(3);
    const path = lane(s, 6);
    s.month = 30;
    for (const b of path.slice(1, 5)) {
      b.status = 'damaged';
      b.crackedAt = s.month;
    }
    const one = tileRepairCost(s);
    expect(repairPathCost(s, path[2], 'tile')).toBe(one);
    expect(repairPathCost(s, path[2], 'stretch')).toBe(one * 4);
    // The generic repair button charges the same per tile, Virality or not.
    s.res.viral = 100;
    expect(repairCost(s, path[1])).toBe(one);

    s.res.rupiah = one;
    expect(checkRepairPath(s, path[2], 'stretch').ok).toBe(false);
    expect(repairPath(s, path[2], 'tile')).toHaveLength(1);
    expect(s.res.rupiah).toBe(0);
    expect(cracked(s)).toBe(3);

    s.res.orangDalam = 0;
    expect(checkRepairPath(s, path[1], 'favour').ok).toBe(false);
    s.res.orangDalam = PATH_DECAY.favour;
    // Tile 2 is fixed, so tile 1 stands alone and tiles 3-4 are a separate stretch.
    expect(repairPath(s, path[3], 'favour')).toHaveLength(2);
    expect(s.res.orangDalam).toBe(0);
    expect(cracked(s)).toBe(1);

    s.res.rupiah = one;
    expect(checkRepair(s, path[1]).ok).toBe(true);
    repair(s, path[1]);
    expect(cracked(s)).toBe(0);
    expect(path[1].crackedAt).toBeUndefined();
  });
});

describe('path decay in play', () => {
  beforeEach(() => setRoadRule(false));
  afterEach(() => setRoadRule(false));

  it('runs every month without breaking a long game', () => {
    const s = newGame(11);
    lane(s, 12);
    for (let m = 0; m < 120; m++) {
      if (s.pendingEvent) s.pendingEvent = null;
      tick(s);
    }
    for (const b of s.buildings.filter(isCracked)) expect(b.crackedAt).toBeLessThanOrEqual(s.month);
  });
});
