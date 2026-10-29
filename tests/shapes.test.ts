import { afterEach, describe, expect, it } from 'vitest';
import { checkPlace, checkRotate, moveBuilding, place, rotateBuilding } from '../src/sim/rules';
import { addBuilding, buildingAt, newGame, sizeOf, tilesOf, withinEdges } from '../src/sim/state';
import { deserialize, serialize } from '../src/sim/save';
import { neighboursSystem, promote, setAutoFund } from '../src/sim/grow';
import { setGrid, type GameState } from '../src/sim/types';

afterEach(() => setGrid('rt'));

/** A town at RT 3 stars with money, nothing built but the Kantor, so every lot is free. */
function town(): GameState {
  const s = newGame(3);
  s.buildings = s.buildings.filter((b) => b.def === 'kantorRT');
  s.stage.stars.rt = 3;
  s.res.rupiah = 1e9;
  return s;
}

describe('1x2 and other shapes', () => {
  it('a 2x1 covers two tiles along x, and turning swaps them along y', () => {
    expect(sizeOf({ def: 'kosan' })).toEqual({ w: 2, h: 1 });
    expect(sizeOf({ def: 'kosan', rot: 1 })).toEqual({ w: 1, h: 2 });
    expect(tilesOf({ def: 'kosan', x: 2, y: 3, rot: 1 })).toEqual([{ x: 2, y: 3 }, { x: 2, y: 4 }]);
    expect(sizeOf({ def: 'lapangan' })).toEqual({ w: 2, h: 3 });
    expect(sizeOf({ def: 'koperasi', rot: 1 })).toEqual({ w: 2, h: 2 });
  });

  it('places turned, blocks both tiles, and counts range from either end', () => {
    const s = town();
    expect(place(s, 'kosan', 1, 1, 1).ok).toBe(true);
    const k = s.buildings.at(-1)!;
    expect(k.rot).toBe(1);
    expect(buildingAt(s, 1, 2)?.uid).toBe(k.uid);
    expect(buildingAt(s, 2, 1)).toBeUndefined();
    expect(checkPlace(s, 'warung', 1, 2).ok).toBe(false);
    // (1,3) is next to the far end (1,2); unturned, the same kos is 2 rows away.
    expect(withinEdges(k, { def: 'warung', x: 1, y: 3 }, 1)).toBe(true);
    expect(withinEdges({ def: 'kosan', x: 1, y: 1 }, { def: 'warung', x: 1, y: 3 }, 1)).toBe(false);
  });

  it('turns a long building only when the turned footprint is free', () => {
    const s = town();
    const b = addBuilding(s, 'bengkel', 1, 1, 'active');
    addBuilding(s, 'warung', 1, 2, 'active');
    expect(checkRotate(s, b).ok).toBe(false);
    expect(rotateBuilding(s, b).ok).toBe(false);
    expect(b.rot ?? 0).toBe(0);
    s.buildings = s.buildings.filter((o) => o.def !== 'warung');
    expect(rotateBuilding(s, b).ok).toBe(true);
    expect(sizeOf(b)).toEqual({ w: 1, h: 2 });
    // A square one turns anywhere: only its picture changes.
    const w = addBuilding(s, 'warung', 5, 5, 'active');
    addBuilding(s, 'warung', 6, 5, 'active');
    expect(rotateBuilding(s, w).ok).toBe(true);
  });

  it('an old save keeps every grown building: fitted, turned, or kept small until moved', () => {
    const s = town();
    // Old layout: 1x1 kos-kosan with neighbours on the side it would grow into.
    const fits = addBuilding(s, 'kosan', 1, 1, 'active');
    const turns = addBuilding(s, 'kosan', 5, 1, 'active');
    addBuilding(s, 'warung', 6, 1, 'active');
    const boxed = addBuilding(s, 'kosan', 5, 5, 'active');
    addBuilding(s, 'warung', 6, 5, 'active');
    addBuilding(s, 'warung', 5, 6, 'active');
    const raw = JSON.parse(serialize(s));
    delete raw.sized;
    const back = deserialize(JSON.stringify(raw))!;
    const at = (uid: number) => back.buildings.find((b) => b.uid === uid)!;
    expect(sizeOf(at(fits.uid))).toEqual({ w: 2, h: 1 });
    expect(at(turns.uid).rot).toBe(1);
    expect(at(boxed.uid).small).toBe(1);
    expect(sizeOf(at(boxed.uid))).toEqual({ w: 1, h: 1 });
    expect(back.buildings).toHaveLength(s.buildings.length);
    // Moving it somewhere roomy gives it its full size.
    expect(moveBuilding(back, at(boxed.uid), 9, 9).ok).toBe(true);
    expect(sizeOf(at(boxed.uid))).toEqual({ w: 2, h: 1 });
  });

  it('AI RTs never stack a big building on another', () => {
    const s = newGame(2);
    s.stage.stars.rt = 3;
    promote(s, []);
    s.stage.current = 'rw';
    s.neighbours.forEach((n) => {
      n.trait = 'rajin';
      n.stars = 3;
      setAutoFund(n, 12);
    });
    for (let m = 0; m < 120; m++) {
      s.res.rupiah = 1e9;
      s.month++;
      neighboursSystem(s, []);
    }
    for (const n of s.neighbours) {
      const seen = new Set<string>();
      for (const b of n.buildings)
        for (const p of tilesOf(b)) {
          expect(seen.has(`${p.x},${p.y}`), `${b.def} at ${p.x},${p.y}`).toBe(false);
          seen.add(`${p.x},${p.y}`);
        }
      expect(n.buildings.some((b) => b.def === 'bengkel' || b.def === 'koperasi')).toBe(true);
    }
  });
});
