import { afterEach, describe, expect, it } from 'vitest';
import { lotAt } from '../src/sim/area';
import { housing, population } from '../src/sim/state';
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

  it('reaches 3 stars on Auto-dana in weeks 240 to 330 on every seed, with the player\'s own kampung full', () => {
    const got = [3, 4, 6].map((seed) => {
      const { s, at } = playKel(seed, 28, true);
      return { seed, at, pop: population(s), sabar: Math.round(s.res.sabar), rts: s.neighbours.map((n) => n.stars).join('') };
    });
    const msg = JSON.stringify(got);
    // Every seed: a big kampung no longer settles under the Popularitas bar (decisions/big-kampung-taper.md).
    const three = got.filter((g) => g.at.length === 3);
    expect(three.length, msg).toBe(3);
    // 14 ranking wins at Kel 3★ (decisions/stage-lengths-quarterly-wins.md). This shortcut kampung starts small, so it loses its first year.
    expect(three.every((g) => g.at[2] >= 240 && g.at[2] <= 330), msg).toBe(true);
    expect(three.every((g) => g.pop >= 200), msg).toBe(true);
    // Three seeds of up to about 330 weeks each since #376: allow a slow machine.
  }, 900_000);

  it('a kampung that overgrew to about 400 residents still climbs back over the 3-star Popularitas bar', () => {
    const got = [3, 4, 6].map((seed) => {
      const { s, seam, all } = kelSetup(seed, true);
      const at: number[] = [];
      let crowded = false;
      for (let m = 0; m < 400 && s.stage.stars.kelurahan < 3; m++) {
        // Homes again once the overflow has moved out, as a player would.
        kelWeek(s, seam, all, true, [], !crowded || population(s) <= housing(s));
        // From 1 star and about 110 warga, 280 more turn up at once, far past the beds: the worst a player could overgrow.
        if (!crowded && s.stage.stars.kelurahan >= 1 && population(s) >= 110) {
          crowded = true;
          for (let i = 0; i < 280; i++) s.residents.push({ ...s.residents[0], id: 90_000 + i, job: 'none' });
        }
        const before = s.stage.stars.kelurahan;
        tick(s);
        if (s.stage.stars.kelurahan > before) at.push(s.month);
      }
      return { seed, at, pop: population(s), sabar: Math.round(s.res.sabar) };
    });
    expect(got.every((g) => g.at.length === 3), JSON.stringify(got)).toBe(true);
  }, 900_000);
});
