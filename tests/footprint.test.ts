import { describe, expect, it } from 'vitest';
import { activeCombos } from '../src/sim/combos';
import { def } from '../src/sim/content';
import { sizeOf, tilesOf } from '../src/sim/footprint';
import { promote, fundNeighbour, neighbourAt, neighboursSystem } from '../src/sim/grow';
import { checkPlace, place } from '../src/sim/rules';
import { deserialize, serialize } from '../src/sim/save';
import { addBuilding, buildingAt, emptyTiles, newGame, pathMult } from '../src/sim/state';
import { RT_H, RT_W, type GameState } from '../src/sim/types';

const add = (s: GameState, id: string, x: number, y: number) => addBuilding(s, id, x, y, 'active');
const rich = (s: GameState) => {
  s.res.rupiah = 100_000_000;
  s.stage.stars.rt = 2;
  s.residents.length = 0;
  for (let i = 0; i < 10; i++) s.residents.push({ id: 100 + i, name: 'x', job: 'none', pensiun: 0, fake: 0, arrived: 0 });
  add(s, 'warung', 12, 16);
};

describe('footprints', () => {
  it('gives shops, towers and fields a 2x2 lot and keeps small things on one tile', () => {
    for (const id of ['indomaret', 'alfamart', 'wifi', 'kosan', 'lapangan', 'balaiRW', 'pasarKaget']) expect(def(id).footprint, id).toBe(2);
    for (const id of ['warung', 'posRonda', 'selokan', 'jalan', 'rumah', 'parkir', 'kantorRT', 'bankSampah', 'posyandu', 'portal', 'gapura']) expect(def(id).footprint ?? 1, id).toBe(1);
  });

  it('takes every tile of the lot, so any of them finds the building', () => {
    const s = newGame(1);
    rich(s);
    const r = place(s, 'wifi', 0, 0);
    expect(r.ok).toBe(true);
    const w = s.buildings.find((b) => b.uid === r.uid)!;
    for (const t of [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }]) expect(buildingAt(s, t.x, t.y)).toBe(w);
    expect(buildingAt(s, 2, 0)).toBeUndefined();
    expect(emptyTiles(s).some((t) => t.x <= 1 && t.y <= 1)).toBe(false);
    expect(tilesOf(w)).toHaveLength(4);
  });

  it('refuses a lot when any of its tiles is taken or off the RT', () => {
    const s = newGame(2);
    rich(s);
    add(s, 'warung', 1, 1);
    const blocked = checkPlace(s, 'indomaret', 0, 0);
    expect(blocked.ok).toBe(false);
    if (!blocked.ok) expect(blocked.missing.join()).toMatch(/2×2 free tiles.*Warung/);
    // The bottom-right corner tile fits a warung but not a 2x2.
    expect(checkPlace(s, 'posRonda', RT_W - 1, 0).ok).toBe(true);
    const edge = checkPlace(s, 'indomaret', RT_W - 1, 0);
    expect(edge.ok).toBe(false);
    // A 1x1 build keeps its old one-tile messages.
    const one = checkPlace(s, 'posRonda', 1, 1);
    if (!one.ok) expect(one.missing.join()).toMatch(/Tile has a Warung/);
  });

  it('counts combo range from the edge of the lot', () => {
    const s = newGame(3);
    s.buildings = [];
    // Pos Ronda at the far side of the tower still touches its right-hand tiles.
    add(s, 'wifi', 0, 0);
    add(s, 'posRonda', 2, 1);
    add(s, 'warung', 3, 1);
    expect(activeCombos(s).map((a) => a.combo.id)).toContain('tongkrongan');
  });

  it('a path beside any tile of a big shop raises its income', () => {
    const s = newGame(4);
    s.buildings = [];
    const shop = add(s, 'indomaret', 0, 0);
    expect(pathMult(s, shop)).toBe(1);
    add(s, 'jalan', 1, 2);
    expect(pathMult(s, shop)).toBeCloseTo(1.1);
  });

  it('grows old saves into free ground, and keeps a boxed-in one small', () => {
    const s = newGame(5);
    s.version = 2;
    s.buildings = [];
    const free = add(s, 'indomaret', 3, 3);
    const boxed = add(s, 'alfamart', 8, 8);
    for (const [x, y] of [[7, 7], [8, 7], [9, 7], [7, 8], [9, 8], [7, 9], [8, 9], [9, 9]]) add(s, 'warung', x, y);
    const l = deserialize(serialize(s))!;
    const a = l.buildings.find((b) => b.uid === free.uid)!;
    const b = l.buildings.find((o) => o.uid === boxed.uid)!;
    expect(sizeOf(a)).toBe(2);
    expect(a).toMatchObject({ x: 3, y: 3 });
    expect(sizeOf(b)).toBe(1);
    expect(b).toMatchObject({ x: 8, y: 8 });
    // Nothing overlaps after the move.
    const seen = new Set<string>();
    for (const o of l.buildings) for (const t of tilesOf(o)) {
      expect(seen.has(`${t.x},${t.y}`)).toBe(false);
      seen.add(`${t.x},${t.y}`);
    }
  });

  it('shifts an old 2x2 back or up when only that way is free', () => {
    const s = newGame(6);
    s.version = 2;
    s.buildings = [];
    const k = add(s, 'kosan', 5, 5);
    add(s, 'warung', 6, 5);
    add(s, 'warung', 5, 6);
    const l = deserialize(serialize(s))!;
    const moved = l.buildings.find((b) => b.uid === k.uid)!;
    expect(sizeOf(moved)).toBe(2);
    expect(moved).toMatchObject({ x: 4, y: 4 });
  });

  it('AI RTs build 2x2 shops without overlapping anything', () => {
    const s = newGame(7);
    s.res.rupiah = 1_000_000_000;
    promote(s, []);
    for (let m = 0; m < 120; m++) {
      for (const n of s.neighbours) fundNeighbour(s, n);
      s.month++;
      neighboursSystem(s, []);
    }
    for (const n of s.neighbours) {
      const seen = new Set<string>();
      for (const b of n.buildings)
        for (const t of tilesOf(b)) {
          expect(seen.has(`${t.x},${t.y}`), `${b.def} at ${t.x},${t.y}`).toBe(false);
          seen.add(`${t.x},${t.y}`);
          expect(Math.floor(t.x / RT_W) === n.cx && Math.floor(t.y / RT_H) === n.cy, `${b.def} left its RT`).toBe(true);
          expect(neighbourAt(s, t.x, t.y)).toBe(b);
        }
      expect(n.buildings.some((b) => sizeOf(b) === 2)).toBe(true);
    }
  });
});
