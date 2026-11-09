import { describe, expect, it } from 'vitest';
import { buildsInLine, linePath, placeLine } from '../src/sim/line';
import { def } from '../src/sim/content';
import { buildCost, buildingAt, newGame } from '../src/sim/state';

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

describe('building a row of Decor between two tiles', () => {
  /** A game with the Decor open: RT 3★, a full kas and Orang Inside, and a free row at the top of the RT. */
  const open = () => {
    const s = newGame(1);
    s.stage.stars.rt = 3;
    s.res.rupiah = 1e9;
    s.res.orangDalam = 10;
    for (const id of ['pohonRindang', 'bangku', 'lampuTaman', 'mural']) if (!s.unlocked.includes(id)) s.unlocked.push(id);
    return s;
  };

  it('is how every Decor-tab building is placed, and not a house', () => {
    for (const id of ['jalan', 'biopori', 'pohonRindang', 'bangku', 'lampuTaman', 'mural', 'patungIkon', 'taman']) expect(buildsInLine(def(id)), id).toBe(true);
    for (const id of ['rumah', 'warung', 'posRonda']) expect(buildsInLine(def(id)), id).toBe(false);
  });

  it('plants a whole row of trees in one go', () => {
    const s = open();
    const row = linePath(s, 'pohonRindang', { x: 1, y: 0 }, { x: 4, y: 0 });
    const free = row.filter((p) => p.ok && !p.have).length;
    expect(free).toBeGreaterThan(1);
    const before = s.buildings.filter((b) => b.def === 'pohonRindang').length;
    expect(placeLine(s, 'pohonRindang', row)).toBe(free);
    expect(s.buildings.filter((b) => b.def === 'pohonRindang').length).toBe(before + free);
  });

  it('marks only as many as the kas pays for', () => {
    const s = open();
    s.res.rupiah = 2 * buildCost(s, def('pohonRindang')) + 1;
    const row = linePath(s, 'pohonRindang', { x: 1, y: 0 }, { x: 6, y: 0 });
    expect(row.filter((p) => p.ok && !p.have)).toHaveLength(2);
  });

  it('stops at a cap: Patung Ikon allows two', () => {
    const s = open();
    s.stage.current = 'rw';
    s.unlocked.push('patungIkon');
    const row = linePath(s, 'patungIkon', { x: 1, y: 0 }, { x: 6, y: 0 });
    expect(row.filter((p) => p.ok && !p.have)).toHaveLength(2);
  });
});
