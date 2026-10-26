import { describe, expect, it } from 'vitest';
import { placeableDefs } from '../src/sim/content';
import { checkRepair, repair, resolveEvent } from '../src/sim/events';
import { checkRestart, restart } from '../src/sim/projects';
import { checkPlace, lotGaps, place, requirementGaps, skipPermit, upgrade } from '../src/sim/rules';
import { tilesAt } from '../src/sim/footprint';
import { activeCombos } from '../src/sim/combos';
import { addBuilding, emptyTiles, neighbours, newGame, population } from '../src/sim/state';
import { tick } from '../src/sim/tick';
import type { GameState } from '../src/sim/types';

/** A simple autoplayer: builds what it can afford, always takes the free event choice. */
function play(seed: number, years: number, smart: boolean, starMonths: number[] = []): { s: GameState; minRupiahY1: number } {
  const s = newGame(seed);
  let minRupiahY1 = Infinity;
  for (let m = 0; m < years * 12; m++) {
    if (s.pendingEvent) resolveEvent(s, [], 0);
    if (smart) {
      // The bot packs a 9x5 corner so combo members stay in range, and does not plan paths. 2x2 buildings made it one row deeper.
      for (const d of placeableDefs().filter((p) => !p.pathIncome)) {
        // Sensible player: keep a cash buffer and do not stack buildings that only cost upkeep, or one spare when two years pass with no combo.
        const have = s.buildings.filter((b) => b.def === d.id).length;
        const worthIt = d.income > d.upkeep || have === 0 || (have === 1 && s.discovered.length === 0 && s.month >= 24);
        if (!worthIt || have >= 4 || s.res.rupiah <= d.cost * 3 || requirementGaps(s, d).length) continue;
        // Small builds take the first free tile. A 2x2, or a spare upkeep-only building, goes where it would
        // complete the most combos, as a player reading the Buku Combo would, then where it touches the most kinds of building.
        const big = (d.footprint ?? 1) > 1;
        const aimed = big || (have > 0 && d.income <= d.upkeep);
        const fits = emptyTiles(s).filter((t) => t.y < 5 && t.x < 9 && (!big || lotGaps(s, d, t.x, t.y).length === 0));
        const score = (t: { x: number; y: number }) => {
          const kinds = new Set(tilesAt(t.x, t.y, d.footprint ?? 1).flatMap((p) => neighbours(s, p)).filter((b) => b.def !== 'rumah' && b.def !== 'parkir' && b.def !== d.id).map((b) => b.def)).size;
          addBuilding(s, d.id, t.x, t.y, 'active');
          const combos = activeCombos(s).length;
          s.buildings.pop();
          s.nextUid--;
          return combos * 10 + kinds;
        };
        const spot = aimed ? fits.map((t) => ({ t, k: score(t) })).reduce<{ t: { x: number; y: number }; k: number } | undefined>((a, b) => (!a || b.k > a.k ? b : a), undefined)?.t : fits[0];
        if (spot && checkPlace(s, d.id, spot.x, spot.y).ok) place(s, d.id, spot.x, spot.y);
      }
      for (const b of s.buildings) {
        if (b.status === 'permit') skipPermit(s, b);
        else if (b.status === 'damaged' && checkRepair(s, b).ok) repair(s, b);
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
  });

  it('inflation is small: prices rise 3% a year', () => {
    const { s } = play(1, 5, false);
    expect(s.inflation).toBeCloseTo(1.03 ** 5, 5);
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
    // 3 stars needs 3 combos and Sabar 50, which this bot does not plan for.
    expect(two).toBeGreaterThanOrEqual(8);
  });
});
