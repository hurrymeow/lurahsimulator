import { afterEach, describe, expect, it } from 'vitest';
import { checkRepair, repair, resolveEvent } from '../src/sim/events';
import { checkRestart, restart } from '../src/sim/projects';
import { fundNeighbour, promote } from '../src/sim/grow';
import { lotAt } from '../src/sim/area';
import { placeableDefs } from '../src/sim/content';
import { checkPlace, checkUpgrade, place, skipPermit, upgrade } from '../src/sim/rules';
import { newGame } from '../src/sim/state';
import { tick } from '../src/sim/tick';
import { GRID_H, GRID_W, setGrid, type GameState } from '../src/sim/types';

afterEach(() => setGrid('rt'));

/** A Kelurahan bot: funds every RT, builds each Kelurahan building once on a seam lot, takes the free event choice. */
function playKel(seed: number, years: number): GameState {
  const s = newGame(seed);
  s.stage.stars.rt = 3;
  promote(s, []);
  s.stage.stars.rw = 3;
  promote(s, []);
  s.stage.path = 'kelurahan';
  s.res.rupiah = 60_000_000;
  const seam: { x: number; y: number }[] = [];
  const all: { x: number; y: number }[] = [];
  for (let y = 0; y < GRID_H; y++) for (let x = 0; x < GRID_W; x++) {
    if (lotAt(x, y) === 'kel') seam.push({ x, y });
    if (['rt', 'rw'].includes(lotAt(x, y))) all.push({ x, y });
  }
  let best = 0;
  for (let m = 0; m < years * 12; m++) {
    if (s.pendingEvent) resolveEvent(s, [], 0);
    for (const n of s.neighbours) if (s.res.rupiah > 3_000_000) fundNeighbour(s, n);
    for (const id of ['kantorKel', 'pasar', 'terminal', 'taman', 'studiBanding', 'embung']) {
      const anchor = s.buildings.find((x) => lotAt(x.x, x.y) === 'kel') ?? seam[0];
      const spot = seam.filter((p) => checkPlace(s, id, p.x, p.y).ok).sort((p, q) => Math.abs(p.x - anchor.x) + Math.abs(p.y - anchor.y) - Math.abs(q.x - anchor.x) - Math.abs(q.y - anchor.y))[0];
      if (spot && s.res.rupiah > 6_000_000) place(s, id, spot.x, spot.y);
    }
    // Spend like a player would: anything placeable that fits, plus upgrades.
    for (const d of placeableDefs()) {
      if ((d.scope ?? 'rt') !== 'kel' && s.res.rupiah > 20_000_000) {
        const spot = all.find((p) => checkPlace(s, d.id, p.x, p.y).ok);
        if (spot) place(s, d.id, spot.x, spot.y);
      }
    }
    for (const b of s.buildings) if (s.res.rupiah > 20_000_000 && checkUpgrade(s, b).ok) upgrade(s, b);
    for (const b of s.buildings) {
      if (b.status === 'permit') skipPermit(s, b);
      else if (b.status === 'damaged' && checkRepair(s, b).ok) repair(s, b);
      else if (b.status === 'mangkrak' && checkRestart(s, b).ok) restart(s, b);
    }
    tick(s);
    best = Math.max(best, s.kel.serapanRun);
  }
  s.kel.serapanRun = best;
  return s;
}

describe('Kelurahan bot', () => {
  it('builds 2x2 Kelurahan buildings and reaches 1 star from a plain fund-and-build routine', () => {
    const got = [1, 2, 3].map((seed) => {
      const s = playKel(seed, 6);
      return { seed, stars: s.stage.stars.kelurahan, built: s.buildings.filter((b) => lotAt(b.x, b.y) === 'kel').length, run: s.kel.serapanRun, bud: Math.round(s.kel.budget), spent: Math.round(s.stats.spent - s.kel.spentBase), cash: Math.round(s.res.rupiah), ids: s.buildings.filter((b) => lotAt(b.x, b.y) === "kel").map((b) => b.def).join(), rts: s.neighbours.map((n) => n.stars).join('') };
    });
    expect(got.filter((g) => g.built > 0).length, JSON.stringify(got)).toBe(3);
    expect(got.filter((g) => g.stars >= 1).length, JSON.stringify(got)).toBeGreaterThanOrEqual(2);
  }, 30_000);
});
