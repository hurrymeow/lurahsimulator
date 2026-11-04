import { afterEach, describe, expect, it } from 'vitest';
import { checkRepair, repair, resolveEvent } from '../src/sim/events';
import { checkRestart, restart } from '../src/sim/projects';
import { cellOrigin } from '../src/sim/area';
import { promote } from '../src/sim/grow';
import { lotAt } from '../src/sim/area';
import { checkPlace, place, skipPermit } from '../src/sim/rules';
import { newGame } from '../src/sim/state';
import { tick } from '../src/sim/tick';
import { GRID_H, GRID_W, RT_H, RT_W, setGrid, type GameState } from '../src/sim/types';

afterEach(() => setGrid('rt'));

/** What the bot builds in Kampung Sebelah, in turn: homes for its warga, then what its RT stars and combos ask for. */
const SEBELAH = ['rumah', 'warung', 'posRonda', 'rumah', 'wifi', 'biopori', 'rumah', 'rumahMakan', 'indomaret', 'rumah', 'barbershop', 'pohonRindang', 'rumah', 'bankSampah', 'kebunSayur', 'rumah'];

/** An RW bot: builds up Kampung Sebelah one building at a time, builds each RW building once on a seam lot, takes the free event choice. */
function playRw(seed: number, years: number, auto = false): GameState {
  const s = newGame(seed);
  s.stage.stars.rt = 3;
  // The player's RT reached 3 stars, which takes 3 combos.
  if (auto) s.discovered = ['tongkrongan', 'rapatMalam', 'perangKuota'];
  promote(s, []);
  s.stage.current = 'rw';
  s.res.rupiah = 30_000_000;
  const o = cellOrigin(1, 0);
  const lots: { x: number; y: number }[] = [];
  for (let y = o.y; y < o.y + RT_H; y++) for (let x = o.x; x < o.x + RT_W; x++) lots.push({ x, y });
  let next = 0;
  const seam: { x: number; y: number }[] = [];
  for (let y = 0; y < GRID_H; y++) for (let x = 0; x < GRID_W; x++) if (lotAt(x, y) === 'rw') seam.push({ x, y });
  for (let m = 0; m < years * 12; m++) {
    if (s.pendingEvent) resolveEvent(s, [], 0);
    for (const id of ['balaiRW', 'posyandu', 'portal', 'pasarKaget', 'gapura']) {
      // Build close together: combos need their members within a few tiles.
      const anchor = s.buildings.find((x) => lotAt(x.x, x.y) === 'rw') ?? seam[0];
      const spot = seam.filter((p) => checkPlace(s, id, p.x, p.y).ok).sort((p, q) => Math.abs(p.x - anchor.x) + Math.abs(p.y - anchor.y) - Math.abs(q.x - anchor.x) - Math.abs(q.y - anchor.y))[0];
      if (spot && !s.buildings.some((x) => x.def === id) && s.res.rupiah > 3_000_000) place(s, id, spot.x, spot.y);
    }
    // One a week while the letters keep up: more only piles up the backlog the 1-star goal counts.
    if (s.stempel.backlog < 3) {
      const id = SEBELAH[next % SEBELAH.length];
      const spot = lots.find((p) => checkPlace(s, id, p.x, p.y).ok);
      if (spot && s.res.rupiah > 3_000_000) place(s, id, spot.x, spot.y);
      next++;
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
  it('reaches 2 stars from a plain build routine in Kampung Sebelah, and 2 RW combos by year 12', () => {
    const got = [1, 2, 3, 4, 5].map((seed) => {
      const s = playRw(seed, 12);
      return { seed, stars: s.stage.stars.rw, combos: s.discovered.filter((d) => ['grupChatWarga', 'posSiaga', 'jalanDitutup', 'agustusanAkbar'].includes(d)), rts: s.neighbours.map((n) => n.stars), sabar: Math.round(s.res.sabar), clear: s.stempel.clear };
    });
    
    expect(got.filter((g) => g.stars >= 2).length, JSON.stringify(got)).toBeGreaterThanOrEqual(4);
    for (const g of got) expect(g.combos.length, `seed ${g.seed}`).toBeGreaterThanOrEqual(2);
  }, 30_000);

  it('reaches 3 stars within 9 years: Kampung Sebelah at 3 stars and 2 RW combos', () => {
    const got = [1, 2, 3, 4, 5].map((seed) => {
      const s = playRw(seed, 9, true);
      return { seed, stars: s.stage.stars.rw, rts: s.neighbours.map((n) => n.stars).join('') };
    });
    expect(got.filter((g) => g.stars === 3).length, JSON.stringify(got)).toBeGreaterThanOrEqual(4);
  }, 60_000);
});
