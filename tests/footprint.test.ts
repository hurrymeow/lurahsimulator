import { afterEach, describe, expect, it } from 'vitest';
import { def } from '../src/sim/content';
import { checkPlace, place } from '../src/sim/rules';
import { buildingAt, emptyTiles, footprintOf, newGame, pathMult, tilesOf } from '../src/sim/state';
import { GRID_W } from '../src/sim/types';

const big = (id: string, n: number) => {
  const d = def(id);
  const old = d.footprint;
  d.footprint = n;
  return () => (d.footprint = old);
};

describe('multi-tile footprints', () => {
  let undo: (() => void) | null = null;
  afterEach(() => undo?.());

  it('defaults to one tile and lists every covered tile', () => {
    const s = newGame(1);
    expect(footprintOf('warung')).toBe(1);
    undo = big('warung', 2);
    expect(tilesOf({ def: 'warung', x: 3, y: 4 })).toEqual([{ x: 3, y: 4 }, { x: 4, y: 4 }, { x: 3, y: 5 }, { x: 4, y: 5 }]);
    expect(s.buildings.length).toBeGreaterThan(0);
  });

  it('finds the building from any covered tile and blocks overlaps', () => {
    const s = newGame(1);
    s.res.rupiah = 1e9;
    undo = big('warung', 2);
    const r = place(s, 'warung', 1, 1);
    expect(r.ok).toBe(true);
    for (const [x, y] of [[1, 1], [2, 1], [1, 2], [2, 2]]) expect(buildingAt(s, x, y)?.uid).toBe(r.uid);
    expect(buildingAt(s, 3, 1)).toBeUndefined();
    expect(checkPlace(s, 'warung', 2, 2).ok).toBe(false);
    expect(checkPlace(s, 'warung', 3, 1).ok).toBe(true);
    expect(emptyTiles(s).some((t) => t.x === 2 && t.y === 2)).toBe(false);
  });

  it('refuses a footprint that runs off the map or into another lot', () => {
    const s = newGame(1);
    s.res.rupiah = 1e9;
    undo = big('warung', 3);
    expect(checkPlace(s, 'warung', GRID_W - 1, 0).ok).toBe(false);
    expect(checkPlace(s, 'warung', 11, 5).ok).toBe(false);
  });

  it('gives a path bonus to a big building beside any edge tile', () => {
    const s = newGame(1);
    s.res.rupiah = 1e9;
    undo = big('warung', 2);
    place(s, 'warung', 1, 1);
    const w = buildingAt(s, 1, 1)!;
    w.status = 'active';
    expect(pathMult(s, w)).toBe(1);
    place(s, 'jalan', 3, 2);
    const j = buildingAt(s, 3, 2)!;
    j.status = 'active';
    expect(pathMult(s, w)).toBeGreaterThan(1);
  });
});
