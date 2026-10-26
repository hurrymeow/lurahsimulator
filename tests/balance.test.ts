import { describe, expect, it } from 'vitest';
import { placeableDefs } from '../src/sim/content';
import { checkRepair, repair, resolveEvent } from '../src/sim/events';
import { checkRestart, restart } from '../src/sim/projects';
import { checkPlace, place, skipPermit, upgrade } from '../src/sim/rules';
import { emptyTiles, newGame, population } from '../src/sim/state';
import { tick } from '../src/sim/tick';
import type { GameState } from '../src/sim/types';

/** A simple autoplayer: builds what it can afford, always takes the free event choice. */
function play(seed: number, years: number, smart: boolean): { s: GameState; minRupiahY1: number } {
  const s = newGame(seed);
  let minRupiahY1 = Infinity;
  for (let m = 0; m < years * 12; m++) {
    if (s.pendingEvent) resolveEvent(s, [], 0);
    if (smart) {
      for (const d of placeableDefs()) {
        const spot = emptyTiles(s).find((t) => t.y < 4);
        // Sensible player: keep a cash buffer and do not stack buildings that only cost upkeep.
        const have = s.buildings.filter((b) => b.def === d.id).length;
        const worthIt = d.income > d.upkeep || have === 0;
        if (spot && worthIt && have < 4 && checkPlace(s, d.id, spot.x, spot.y).ok && s.res.rupiah > d.cost * 3) place(s, d.id, spot.x, spot.y);
      }
      for (const b of s.buildings) {
        if (b.status === 'permit') skipPermit(s, b);
        else if (b.status === 'damaged' && checkRepair(s, b).ok) repair(s, b);
        else if (b.status === 'mangkrak' && checkRestart(s, b).ok) restart(s, b);
        else if (b.status === 'active' && b.level < 2 && s.res.rupiah > 12_000_000) upgrade(s, b);
      }
    }
    tick(s);
    if (s.month <= 12) minRupiahY1 = Math.min(minRupiahY1, s.res.rupiah);
  }
  return { s, minRupiahY1 };
}

describe('balance', () => {
  it('a player who does nothing never goes into debt in year 1 and never soft-locks', () => {
    for (let seed = 1; seed <= 10; seed++) {
      const { s, minRupiahY1 } = play(seed, 10, false);
      expect(minRupiahY1, `seed ${seed}`).toBeGreaterThanOrEqual(0);
      expect(population(s)).toBeGreaterThanOrEqual(2);
      if (s.pendingEvent) { const id = s.pendingEvent; const r = resolveEvent(s, [], 0); expect(r.ok, id + JSON.stringify(r)).toBe(true); }
      expect(s.pendingEvent).toBeNull();
    }
  });

  it('a simple builder grows the kampung and mostly beats Kampung Sebelah early on', () => {
    let wins = 0;
    let total = 0;
    for (let seed = 1; seed <= 10; seed++) {
      const { s, minRupiahY1 } = play(seed, 8, true);
      expect(minRupiahY1).toBeGreaterThanOrEqual(0);
      expect(population(s)).toBeGreaterThan(8);
      for (const r of s.ranking.slice(0, 3)) {
        total++;
        if (r.won) wins++;
      }
    }
    expect(wins / total).toBeGreaterThan(0.5);
  });

  it('inflation is small: prices rise 3% a year', () => {
    const { s } = play(1, 5, false);
    expect(s.inflation).toBeCloseTo(1.03 ** 5, 5);
  });
});
