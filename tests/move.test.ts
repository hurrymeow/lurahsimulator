import { describe, expect, it } from 'vitest';
import { checkMove, move, place, rotate } from '../src/sim/rules';
import { deserialize, serialize } from '../src/sim/save';
import { byUid, housing, newGame, population } from '../src/sim/state';
import type { GameState } from '../src/sim/types';

const build = (s: GameState) => {
  const r = place(s, 'warung', 0, 0);
  return byUid(s, r.uid!)!;
};

describe('moving buildings', () => {
  it('moves for free and keeps its level, investment and timer', () => {
    const s = newGame(31);
    const b = build(s);
    b.level = 3;
    b.invested = 9_000_000;
    b.status = 'building';
    b.timer = 2;
    b.placedAt = 4;
    const rupiah = s.res.rupiah;
    const spent = s.stats.spent;

    expect(move(s, b, 1, 0).ok).toBe(true);
    expect(b.x).toBe(1);
    expect(b.y).toBe(0);
    expect(b.level).toBe(3);
    expect(b.invested).toBe(9_000_000);
    expect(b.status).toBe('building');
    expect(b.timer).toBe(2);
    expect(b.placedAt).toBe(4);
    expect(s.res.rupiah).toBe(rupiah);
    expect(s.stats.spent).toBe(spent);
  });

  it('refuses a tile another building or a neighbour already holds', () => {
    const s = newGame(32);
    const b = build(s);
    const kantor = s.buildings.find((o) => o.def === 'kantorRT')!;
    expect(checkMove(s, b, kantor.x, kantor.y)).toEqual({ ok: false, missing: ['Tile has a Kantor RT'] });
    expect(move(s, b, kantor.x, kantor.y).ok).toBe(false);
    expect(b.x).toBe(0);
    expect(b.y).toBe(0);
  });

  it('refuses tiles off the map', () => {
    const s = newGame(33);
    const b = build(s);
    expect(checkMove(s, b, -1, 0)).toEqual({ ok: false, missing: ['Tile is off the map'] });
  });

  it('can stay on its own tile', () => {
    const s = newGame(34);
    const b = build(s);
    expect(move(s, b, b.x, b.y).ok).toBe(true);
  });

  it('moves a house with residents in it without changing the population', () => {
    const s = newGame(35);
    const house = s.buildings.find((o) => o.def === 'rumah')!;
    const beds = housing(s);
    expect(move(s, house, 0, 0).ok).toBe(true);
    expect(housing(s)).toBe(beds);
    expect(population(s)).toBe(4);
  });
});

describe('rotating buildings', () => {
  it('cycles four quarter turns for free', () => {
    const s = newGame(36);
    const b = build(s);
    const rupiah = s.res.rupiah;
    const spent = s.stats.spent;
    expect(b.rot ?? 0).toBe(0);
    for (const want of [1, 2, 3, 0]) {
      expect(rotate(b)).toBe(want);
      expect(b.rot).toBe(want);
    }
    expect(s.res.rupiah).toBe(rupiah);
    expect(s.stats.spent).toBe(spent);
  });

  it('keeps the chosen rotation through a save and load', () => {
    const s = newGame(37);
    const b = build(s);
    rotate(b);
    rotate(b);
    move(s, b, 1, 0);
    const back = deserialize(serialize(s))!;
    const same = byUid(back, b.uid)!;
    expect(same.rot).toBe(2);
    expect(same.x).toBe(1);
    expect(same.y).toBe(0);
  });

  it('places a new building already turned', () => {
    const s = newGame(38);
    const r = place(s, 'rumah', 0, 0, 3);
    expect(byUid(s, r.uid!)!.rot).toBe(3);
  });
});
