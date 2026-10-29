import { describe, expect, it } from 'vitest';
import { BUILDINGS } from '../src/data/buildings';
import { allDefs, def } from '../src/sim/content';
import { checkPlace, place } from '../src/sim/rules';
import { addBuilding, buildingAt, newGame } from '../src/sim/state';

describe('categories and sizes', () => {
  it('every RT building has a category, and the road and tab names are the known ones', () => {
    const known = ['housing', 'shops', 'facilities', 'farm', 'decoration', 'paths'];
    for (const d of BUILDINGS) expect(known, d.id).toContain(d.category);
    for (const tab of known) expect(BUILDINGS.some((d) => d.category === tab), tab).toBe(true);
  });
  it('lapangan is 2x3, and 3x3 is kept for the Terminal landmark', () => {
    const sides = (d: { footprint?: number | [number, number] }) => (typeof d.footprint === 'number' ? [d.footprint, d.footprint] : d.footprint ?? [1, 1]);
    expect(BUILDINGS.find((d) => d.id === 'lapangan')!.footprint).toEqual([2, 3]);
    expect(Math.max(...BUILDINGS.flatMap(sides))).toBe(3);
    expect(BUILDINGS.filter((d) => sides(d).every((n) => n === 1)).length).toBeGreaterThan(BUILDINGS.length / 2);
    expect(def('terminal').footprint).toBe(3);
    expect(allDefs().filter((d) => sides(d)[0] === 3 && sides(d)[1] === 3).map((d) => d.id)).toEqual(['terminal']);
  });
  it('a big building blocks every tile it covers', () => {
    const s = newGame(1);
    s.stage.stars.rt = 2;
    s.res.rupiah = 50_000_000;
    const at = { x: 7, y: 3 };
    addBuilding(s, 'lapangan', at.x, at.y, 'active');
    expect(buildingAt(s, at.x + 1, at.y + 2)?.def).toBe('lapangan');
    expect(buildingAt(s, at.x + 2, at.y)).toBeUndefined();
    expect(checkPlace(s, 'pohonRindang', at.x + 1, at.y + 1).ok).toBe(false);
    expect(place(s, 'pohonRindang', at.x + 2, at.y).ok).toBe(true);
  });
});
