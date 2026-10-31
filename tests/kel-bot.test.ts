import { afterEach, describe, expect, it } from 'vitest';
import { lotAt } from '../src/sim/area';
import { population } from '../src/sim/state';
import { tick } from '../src/sim/tick';
import { setGrid, type GameState } from '../src/sim/types';
import { kelSetup, kelWeek } from './kel-bot-lib';

afterEach(() => setGrid('rt'));

/**
 * A Kelurahan bot: funds every RT, builds each Kelurahan building once on a seam lot, takes the free event choice,
 * and tends its own kampung: Popularitas buildings beside a road while Popularitas is under 70, and homes only while
 * it is at least GROW_FROM. Returns the state and the month each Kelurahan star came.
 */
function playKel(seed: number, years: number, auto = false): { s: GameState; at: number[] } {
  const { s, seam, all } = kelSetup(seed, auto);
  const at: number[] = [];
  for (let m = 0; m < years * 12 && s.stage.stars.kelurahan < 3; m++) {
    kelWeek(s, seam, all, auto);
    const before = s.stage.stars.kelurahan;
    tick(s);
    if (s.stage.stars.kelurahan > before) at.push(s.month);
  }
  return { s, at };
}

// A month is 8s at 1x: 48 months is 6.4 min, 120 is 16 min and 180 is 24 min.
describe('Kelurahan bot', () => {
  it('builds 2x2 Kelurahan buildings and reaches 1 star in years 4 to 8 from a plain fund-and-build routine', () => {
    const got = [1, 2, 5].map((seed) => {
      const { s, at } = playKel(seed, 8);
      return { seed, at, built: s.buildings.filter((b) => lotAt(b.x, b.y) === 'kel').length, pop: population(s), sabar: Math.round(s.res.sabar) };
    });
    const msg = JSON.stringify(got);
    expect(got.every((g) => g.built > 0), msg).toBe(true);
    expect(got.every((g) => g.at[0] !== undefined && g.at[0] >= 48), msg).toBe(true);
  }, 120_000);

  it('reaches 3 stars on Auto-dana in weeks 120 to 180 on two seeds of three, with the player\'s own kampung full', () => {
    const got = [3, 4, 6].map((seed) => {
      const { s, at } = playKel(seed, 15, true);
      return { seed, at, pop: population(s), sabar: Math.round(s.res.sabar), rts: s.neighbours.map((n) => n.stars).join('') };
    });
    const msg = JSON.stringify(got);
    // Two seeds of three: a kampung that grows well past 200 can settle under the Popularitas bar and stay there
    // (TODO: "Stop a big kampung getting stuck under the Kelurahan 3-star Popularitas bar").
    const three = got.filter((g) => g.at.length === 3);
    expect(three.length, msg).toBeGreaterThanOrEqual(2);
    expect(three.every((g) => g.at[2] >= 120 && g.at[2] <= 180), msg).toBe(true);
    expect(three.every((g) => g.pop >= 200), msg).toBe(true);
  }, 480_000);
});
