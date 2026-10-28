import { afterEach, describe, expect, it } from 'vitest';
import { COMBOS } from '../src/data/combos';
import { STAGE_COMBOS } from '../src/data/higher';
import { BRANDS } from '../src/data/brands';
import { activeCombos, bookCombos, comboStatus, parseNeed } from '../src/sim/combos';
import { checkMove, moveBuilding } from '../src/sim/rules';
import { def } from '../src/sim/content';
import { addBuilding, footprintOf, newGame } from '../src/sim/state';
import { promote } from '../src/sim/grow';
import { GRID_H, GRID_W, setGrid, type Building, type GameState } from '../src/sim/types';
import type { StageComboDef } from '../src/data/higher/types';

const ALL = [...COMBOS, ...STAGE_COMBOS] as (StageComboDef | (typeof COMBOS)[number])[];

/** True when no tile of an n x n lot at x,y is taken. */
const free = (s: GameState, x: number, y: number, n: number) =>
  x >= 0 && y >= 0 && x + n <= GRID_W && y + n <= GRID_H &&
  s.buildings.every((b) => {
    const m = footprintOf(b.def);
    return x + n <= b.x || b.x + m <= x || y + n <= b.y || b.y + m <= y;
  });

/** A fresh town at the combo's stage with nothing built, so only the combo's members are on the map. */
function town(c: (typeof ALL)[number]): GameState {
  const s = newGame(7);
  const gate = (c as Partial<StageComboDef>).gate;
  // The map grows with the stage, and RW and Kelurahan buildings only stand on their own lots.
  if (gate?.stage === 'rw') promote(s, []);
  if (gate?.stage === 'kelurahan') setGrid('kelurahan');
  s.buildings = [];
  if (gate) {
    s.stage.current = gate.stage;
    (s.stage.stars as unknown as Record<string, number>)[gate.stage] = Math.max(gate.stars, 0);
    if (gate.path) s.stage.path = gate.path as never;
  }
  return s;
}

/** Builds the combo: the anchor in the middle, every other member on the nearest free lot in range. */
function build(s: GameState, c: (typeof ALL)[number]): Building[] {
  const needs = c.needs.map(parseNeed);
  const cx = Math.floor(GRID_W / 2) - 1;
  const cy = Math.floor(GRID_H / 2) - 1;
  const members: Building[] = [];
  needs.forEach((need, k) => {
    const n = footprintOf(need.id);
    // Stand it off the map, then find the nearest lot it may legally take: anywhere for the anchor,
    // within the combo's radius of the anchor for the rest.
    const b = addBuilding(s, need.id, -10, -10, 'active');
    b.level = need.level;
    const ox = k === 0 ? cx : members[0].x;
    const oy = k === 0 ? cy : members[0].y;
    const r = k === 0 ? Math.max(GRID_W, GRID_H) : Math.min(c.radius, 8) + footprintOf(members[0].def) + n;
    // A tukang parkir is never placed by hand: the game drops it beside a new shop on any free tile.
    const legal = (x: number, y: number) => (def(need.id).placeable ? checkMove(s, b, x, y).ok : true);
    let spot: { x: number; y: number } | null = null;
    for (let d = 0; !spot && d <= r; d++)
      for (let dy = -d; !spot && dy <= d; dy++)
        for (let dx = -d; !spot && dx <= d; dx++) {
          const x = ox + dx;
          const y = oy + dy;
          if (Math.max(Math.abs(dx), Math.abs(dy)) === d && free(s, x, y, n) && legal(x, y) && (k === 0 || gap(members[0], x, y, n) <= c.radius)) spot = { x, y };
        }
    expect(spot, `${c.id}: a legal lot for ${need.id} within ${c.radius} tiles`).not.toBeNull();
    b.x = spot!.x;
    b.y = spot!.y;
    members.push(b);
  });
  // A price war needs a different brand on every member.
  if (c.brands === 'different') members.forEach((b, i) => (b.brand = BRANDS[b.def].names[i % BRANDS[b.def].names.length]));
  const sc = c as Partial<StageComboDef>;
  if (sc.needsJob) s.residents[0].job = sc.needsJob as never;
  if (sc.rule === 'sameTraitNeighbours') {
    s.neighbours = [0, 1].map((i) => ({ cx: i + 1, cy: 0, trait: 'rajin', buildings: [], pop: 10, stars: { rt: 0, rw: 0, kelurahan: 0 }, funded: 0, everFunded: false, lastBuild: 0 })) as never;
  }
  return members;
}

/** Tiles between the anchor's lot and an n x n lot at x,y, edge to edge, as combos count it. */
const gap = (a: Building, x: number, y: number, n: number) => {
  const m = footprintOf(a.def);
  return Math.max(0, a.x - (x + n - 1), x - (a.x + m - 1), a.y - (y + n - 1), y - (a.y + m - 1));
};

const on = (s: GameState, id: string) => activeCombos(s).some((a) => a.combo.id === id);

afterEach(() => setGrid('rt'));

describe('every combo in the book works', () => {
  for (const c of ALL) {
    it(`${c.id} fires when its buildings stand together, and follows a member that moves`, () => {
      const s = town(c);
      s.res.rupiah = 1e12;
      expect(on(s, c.id), `${c.id} before building`).toBe(false);
      const members = build(s, c);
      expect(on(s, c.id), `${c.id} with every member in range`).toBe(true);
      expect(comboStatus(s, c).state).toBe('active');
      // A retired combo is listed once found; firing it finds it.
      if (c.retired) s.discovered.push(c.id);
      expect(bookCombos(s).some((b) => b.id === c.id), `${c.id} listed in the Buku Combo`).toBe(true);
      // Combos that reach across the whole map, or that hang on the neighbours, ignore distance.
      if (c.radius >= 99 || members.length < 2) return;
      // Move the last member the player can move by hand.
      const mover = [...members].reverse().find((m, i) => i < members.length - 1 && def(m.def).placeable);
      if (!mover) return;
      const home = { x: mover.x, y: mover.y };
      const n = footprintOf(mover.def);
      // The nearest lot out of range that the building may legally stand on (RW and Kelurahan lots sit on seams).
      let far: { x: number; y: number } | null = null;
      for (let d = c.radius + 1; !far && d < Math.max(GRID_W, GRID_H); d++)
        for (let dy = -d; !far && dy <= d; dy++)
          for (let dx = -d; !far && dx <= d; dx++) {
            const x = members[0].x + dx;
            const y = members[0].y + dy;
            if (Math.max(Math.abs(dx), Math.abs(dy)) === d && x >= 0 && y >= 0 && x + n <= GRID_W && y + n <= GRID_H && gap(members[0], x, y, n) > c.radius && checkMove(s, mover, x, y).ok) far = { x, y };
          }
      expect(far, `${c.id}: somewhere out of range to move ${mover.def}`).not.toBeNull();
      expect(moveBuilding(s, mover, far!.x, far!.y).ok, `${c.id}: move ${mover.def} away`).toBe(true);
      // Another copy may sit in range already (a combo of two of the same building); only then may it stay on.
      if (!members.some((m) => m !== mover && m.def === mover.def)) expect(on(s, c.id), `${c.id} after a member moved away`).toBe(false);
      expect(mover.level).toBe(parseNeed(c.needs[members.indexOf(mover)]).level);
      expect(moveBuilding(s, mover, home.x, home.y).ok, `${c.id}: move ${mover.def} back`).toBe(true);
      expect(on(s, c.id), `${c.id} after moving back`).toBe(true);
    });
  }
});
