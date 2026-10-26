import { afterEach, describe, expect, it } from 'vitest';
import { checkRepair, repair, resolveEvent } from '../src/sim/events';
import { checkRestart, restart } from '../src/sim/projects';
import { fundNeighbour, promote } from '../src/sim/grow';
import { lotAt } from '../src/sim/area';
import { checkPlace, place, skipPermit } from '../src/sim/rules';
import { newGame } from '../src/sim/state';
import { tick } from '../src/sim/tick';
import { GRID_H, GRID_W, setGrid, type GameState } from '../src/sim/types';

afterEach(() => setGrid('rt'));

/** An RW bot: funds every RT, builds each RW building once on a seam lot, takes the free event choice. */
function playRw(seed: number, years: number): GameState {
  const s = newGame(seed);
  s.stage.stars.rt = 3;
  promote(s, []);
  s.stage.current = 'rw';
  s.res.rupiah = 30_000_000;
  const seam: { x: number; y: number }[] = [];
  for (let y = 0; y < GRID_H; y++) for (let x = 0; x < GRID_W; x++) if (lotAt(x, y) === 'rw') seam.push({ x, y });
  for (let m = 0; m < years * 12; m++) {
    if (s.pendingEvent) resolveEvent(s, [], 0);
    for (const n of s.neighbours) if (s.res.rupiah > 3_000_000) fundNeighbour(s, n);
    for (const id of ['balaiRW', 'posyandu', 'portal', 'pasarKaget', 'gapura']) {
      // Build close together: combos need their members within a few tiles.
      const anchor = s.buildings.find((x) => lotAt(x.x, x.y) === 'rw') ?? seam[0];
      const spot = seam.filter((p) => checkPlace(s, id, p.x, p.y).ok).sort((p, q) => Math.abs(p.x - anchor.x) + Math.abs(p.y - anchor.y) - Math.abs(q.x - anchor.x) - Math.abs(q.y - anchor.y))[0];
      if (spot && s.res.rupiah > 6_000_000) place(s, id, spot.x, spot.y);
    }
    for (const b of s.buildings) {
      if (b.status === 'permit') skipPermit(s, b);
      else if (b.status === 'damaged' && checkRepair(s, b).ok) repair(s, b);
      else if (b.status === 'mangkrak' && checkRestart(s, b).ok) restart(s, b);
    }
    tick(s);
  }
  return s;
}

describe('RW bot', () => {
  it('reaches 2 stars, with 2 RW combos, from a plain fund-and-build routine', () => {
    const got = [1, 2, 3, 4, 5].map((seed) => {
      const s = playRw(seed, 12);
      return { seed, stars: s.stage.stars.rw, combos: s.discovered.filter((d) => ['grupChatWarga', 'posSiaga', 'jalanDitutup', 'agustusanAkbar'].includes(d)), rts: s.neighbours.map((n) => n.stars), sabar: Math.round(s.res.sabar), clear: s.stempel.clear };
    });
    
    expect(got.filter((g) => g.stars >= 2).length, JSON.stringify(got)).toBeGreaterThanOrEqual(4);
    for (const g of got) expect(g.combos.length, `seed ${g.seed}`).toBeGreaterThanOrEqual(2);
    // Five 12-year runs that test every seam tile each month. 2x2 lots check four tiles, so give it room on slow CI.
  }, 20_000);
});
