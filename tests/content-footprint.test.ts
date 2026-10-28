import { describe, expect, it } from 'vitest';
import { BUILDINGS } from '../src/data/buildings';
import { checkPlace, place } from '../src/sim/rules';
import { addBuilding, buildingAt, newGame } from '../src/sim/state';

describe('categories and sizes', () => {
  it('every RT building has a category, and the road and tab names are the known ones', () => {
    const known = ['housing', 'shops', 'facilities', 'farm', 'decoration', 'paths'];
    for (const d of BUILDINGS) expect(known, d.id).toContain(d.category);
    for (const tab of known) expect(BUILDINGS.some((d) => d.category === tab), tab).toBe(true);
  });
  it('lapangan is 3x3, the biggest thing in the RT', () => {
    const sizes = BUILDINGS.map((d) => d.footprint ?? 1);
    expect(BUILDINGS.find((d) => d.id === 'lapangan')!.footprint).toBe(3);
    expect(Math.max(...sizes)).toBe(3);
    expect(sizes.filter((n) => n === 1).length).toBeGreaterThan(sizes.length / 2);
  });
  it('a big building blocks every tile it covers', () => {
    const s = newGame(1);
    s.stage.stars.rt = 2;
    s.res.rupiah = 50_000_000;
    const at = { x: 7, y: 3 };
    addBuilding(s, 'lapangan', at.x, at.y, 'active');
    expect(buildingAt(s, at.x + 2, at.y + 2)?.def).toBe('lapangan');
    expect(checkPlace(s, 'pohonRindang', at.x + 1, at.y + 1).ok).toBe(false);
    expect(place(s, 'pohonRindang', at.x + 3, at.y).ok).toBe(true);
  });
});
