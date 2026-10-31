import { describe, expect, it } from 'vitest';
import { placeableDefs } from '../src/sim/content';
import { checkRepair, repair, resolveEvent } from '../src/sim/events';
import { checkRestart, checkRestartODn, restart } from '../src/sim/projects';
import { checkPlace, place, skipPermit, upgrade } from '../src/sim/rules';
import { attractTarget, emptyTiles, housing, newGame, population } from '../src/sim/state';
import { tick } from '../src/sim/tick';
import { announce } from '../src/sim/wacana';
import { INFLATION_PER_YEAR } from '../src/sim/balance';
import type { GameState } from '../src/sim/types';

/**
 * A simple autoplayer. `years` counts blocks of 12 weeks (the old year), not calendar years.
 * It: builds the two early combos, keeps a bed ahead of demand,
 * and buys what it can afford. It never plans combos beyond the two it is told to.
 */
function play(seed: number, years: number, smart: boolean, starMonths: number[] = [], eventMonths: number[] = []): { s: GameState; minRupiahY1: number } {
  const s = newGame(seed);
  let minRupiahY1 = Infinity;
  for (let m = 0; m < years * 12; m++) {
    if (s.pendingEvent) { eventMonths.push(s.month); resolveEvent(s, [], 0); }
    if (smart) {
      // Rapat Malam (office + hut) and Tongkrongan (hut + warung + wifi), by hand.
      const k = s.buildings.find((b) => b.def === 'kantorRT')!;
      const want = (def: string, x: number, y: number, min: number) => {
        if (s.buildings.some((b) => b.def === def) || s.res.rupiah < min) return;
        if (checkPlace(s, def, x, y).ok) place(s, def, x, y);
      };
      want('posRonda', k.x + 1, k.y, 2_400_000);
      want('warung', k.x + 1, k.y - 1, 3_000_000);
      want('wifi', k.x, k.y - 1, 5_000_000);
      // A bed for the next arrivals, up to what the top goals need.
      if (population(s) < 42 && housing(s) < attractTarget(s) + 3) {
        const spot = emptyTiles(s)[0];
        if (spot && s.res.rupiah > 2_000_000 && checkPlace(s, 'rumah', spot.x, spot.y).ok) place(s, 'rumah', spot.x, spot.y);
      }
      // The bot packs the middle of the map so leftover combo members stay in range.
      // Tongkrongan's wifi costs more than the filler buildings, so stop buying filler until it is up.
      const savingForWifi = s.month >= 12 && !s.buildings.some((b) => b.def === 'wifi');
      for (const d of savingForWifi ? [] : placeableDefs().filter((p) => !p.pathIncome && !p.housing)) {
        // The tiles saved for the combo pieces stay free, as a player planning a combo keeps them.
        const saved = [{ x: k.x + 1, y: k.y }, { x: k.x + 1, y: k.y - 1 }, { x: k.x, y: k.y - 1 }];
        const spot = emptyTiles(s).find((t) => t.y < 9 && !saved.some((p) => p.x === t.x && p.y === t.y));
        // Sensible player: keep a cash buffer and do not stack buildings that only cost upkeep.
        const have = s.buildings.filter((b) => b.def === d.id).length;
        const worthIt = d.income > d.upkeep || have === 0;
        if (spot && worthIt && have < 4 && checkPlace(s, d.id, spot.x, spot.y).ok && s.res.rupiah > d.cost * 3) place(s, d.id, spot.x, spot.y);
      }
      // Preman get a Satpam post each, as a player answers a preman with a Pos Satpam.
      const preman = s.residents.filter((r) => r.preman).length;
      if (preman && s.buildings.filter((b) => b.def === 'posSatpam').length < preman + 1) {
        const spot = emptyTiles(s).find((t) => checkPlace(s, 'posSatpam', t.x, t.y).ok);
        if (spot && s.res.rupiah > 2_000_000) place(s, 'posSatpam', spot.x, spot.y);
      }
      // A player watches Popularitas: when it sags and there is cash, announce a cheap policy.
      if (s.res.sabar < 55 && s.res.rupiah > 2_000_000 && s.month % 3 === 0) announce(s, 'hijau');
      for (const b of s.buildings) {
        if (b.status === 'permit') skipPermit(s, b);
        else if (b.status === 'damaged' && checkRepair(s, b).ok) repair(s, b);
        // A stalled project restarts with a favour when there are favours to spare, otherwise with rupiah.
        else if (b.status === 'mangkrak' && checkRestartODn(s, b).ok) restart(s, b, true);
        else if (b.status === 'mangkrak' && checkRestart(s, b).ok) restart(s, b);
        else if (b.status === 'active' && b.level < 2 && s.res.rupiah > 12_000_000) upgrade(s, b);
      }
    }
    tick(s);
    while (starMonths.length < s.stage.stars.rt) starMonths.push(s.month);
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
  }, 30_000);

  it('inflation is small: prices rise 12.55% a year', () => {
    const { s } = play(1, 8, false); // 8 blocks of 12 weeks = 2 years
    expect(s.inflation).toBeCloseTo((1 + INFLATION_PER_YEAR) ** 2, 5);
  });
});

describe('star pacing', () => {
  it('a simple builder earns 1 star within 3 years and 2 stars within 4, and never gets stuck', () => {
    let two = 0;
    for (let seed = 1; seed <= 10; seed++) {
      const m: number[] = [];
      const { s } = play(seed, 8, true, m);
      expect(m[0], `1 star, seed ${seed}`).toBeLessThanOrEqual(36);
      if (m[1] !== undefined && m[1] <= 48) two++;
      expect(population(s), `population, seed ${seed}`).toBeGreaterThan(20);
    }
    // 3 stars needs 3 combos and Sabar 65, which this bot does not plan for.
    expect(two).toBeGreaterThanOrEqual(8);
  }, 30_000);
});

// GAME-DESIGN.md targets 4 and 6. A month is 8s at 1x, so 2 min is 15 months, 5 min is 37 and 10 min is 75.
describe('pacing targets', () => {
  it('stars come on time and popups never come within 3 months of each other', () => {
    for (let seed = 1; seed <= 10; seed++) {
      const stars: number[] = [];
      const events: number[] = [];
      play(seed, 7, true, stars, events);
      expect(stars[0], `1 star, seed ${seed}`).toBeLessThanOrEqual(15);
      expect(stars[1], `2 stars, seed ${seed}`).toBeLessThanOrEqual(37);
      expect(stars[2], `3 stars, seed ${seed}`).toBeLessThanOrEqual(75);
      events.forEach((m, i) => { if (i) expect(m - events[i - 1], `events at ${events[i - 1]} and ${m}, seed ${seed}`).toBeGreaterThanOrEqual(3); });
    }
  }, 30_000);
});
