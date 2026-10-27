import { describe, expect, it } from 'vitest';
import { linePath, placeLine } from '../src/sim/line';
import { buildingAt, newGame } from '../src/sim/state';

describe('laying a path between two tiles', () => {
  it('runs an L from start to end and counts every tile once', () => {
    const s = newGame(1);
    const tiles = linePath(s, 'jalan', { x: 1, y: 1 }, { x: 4, y: 3 });
    expect(tiles).toHaveLength(6);
    expect(tiles[0]).toMatchObject({ x: 1, y: 1 });
    expect(tiles[tiles.length - 1]).toMatchObject({ x: 4, y: 3 });
  });

  it('takes the bend with fewer blocked tiles', () => {
    const s = newGame(1);
    const k = s.buildings.find((b) => b.def === 'kantorRT')!;
    // The Kantor RT sits on the x-first bend, so the path swings round the other way.
    const tiles = linePath(s, 'jalan', { x: k.x - 1, y: k.y }, { x: k.x + 1, y: k.y - 2 });
    expect(tiles.every((p) => p.ok)).toBe(true);
  });

  it('lays every free tile, skips paths already there, and reports blocked ones', () => {
    const s = newGame(1);
    s.res.rupiah = 1e9;
    const k = s.buildings.find((b) => b.def === 'kantorRT')!;
    const first = linePath(s, 'jalan', { x: 1, y: 1 }, { x: 3, y: 1 });
    expect(placeLine(s, 'jalan', first)).toBe(3);
    const again = linePath(s, 'jalan', { x: 0, y: 1 }, { x: 3, y: 1 });
    expect(again.filter((p) => p.have)).toHaveLength(3);
    expect(placeLine(s, 'jalan', again)).toBe(1);
    expect(buildingAt(s, 0, 1)?.def).toBe('jalan');
    const through = linePath(s, 'jalan', { x: k.x, y: k.y - 1 }, { x: k.x, y: k.y + 1 });
    expect(through.some((p) => !p.ok)).toBe(true);
  });
});
