import { afterEach, describe, expect, it } from 'vitest';
import { checkRepair, repair, resolveEvent } from '../src/sim/events';
import { checkRestart, restart } from '../src/sim/projects';
import { fundNeighbour, promote, setAutoFund } from '../src/sim/grow';
import { connectedRoad, hasRoadBeside } from '../src/sim/access';
import { lotAt } from '../src/sim/area';
import { placeableDefs } from '../src/sim/content';
import { checkPlace, checkUpgrade, place, skipPermit, upgrade } from '../src/sim/rules';
import { housing, newGame, population } from '../src/sim/state';
import { tick } from '../src/sim/tick';
import { GRID_H, GRID_W, setGrid, type GameState } from '../src/sim/types';

afterEach(() => setGrid('rt'));

/** Popularitas buildings, strongest first, and homes, biggest first. */
const SABAR = ['kolamPancing', 'panggungSenam', 'bidan', 'posRonda', 'bankSampah'];
const HOMES = ['kontrakan', 'kosan', 'rumah'];
/** The bot only grows while Popularitas is at least this, as a player waiting for the kampung to settle. */
const GROW_FROM = 55;

/**
 * A Kelurahan bot: funds every RT, builds each Kelurahan building once on a seam lot, takes the free event choice,
 * and tends its own kampung: Popularitas buildings beside a road while Popularitas is under 70, and homes only while
 * it is at least GROW_FROM. Returns the state and the month each Kelurahan star came.
 */
function playKel(seed: number, years: number, auto = false): { s: GameState; at: number[] } {
  const s = newGame(seed);
  s.stage.stars.rt = 3;
  if (auto) s.discovered = ['tongkrongan', 'rapatMalam', 'perangKuota'];
  promote(s, []);
  s.stage.stars.rw = 3;
  promote(s, []);
  s.stage.path = 'kelurahan';
  s.res.rupiah = 60_000_000;
  if (auto) for (const n of s.neighbours) setAutoFund(n, 6);
  const seam: { x: number; y: number }[] = [];
  const all: { x: number; y: number }[] = [];
  for (let y = 0; y < GRID_H; y++) for (let x = 0; x < GRID_W; x++) {
    if (lotAt(x, y) === 'kel') seam.push({ x, y });
    if (['rt', 'rw'].includes(lotAt(x, y))) all.push({ x, y });
  }
  const at: number[] = [];
  for (let m = 0; m < years * 12 && s.stage.stars.kelurahan < 3; m++) {
    if (s.pendingEvent) resolveEvent(s, [], 0);
    if (!auto) for (const n of s.neighbours) if (s.res.rupiah > 3_000_000) fundNeighbour(s, n);
    for (const id of ['kantorKel', 'pasar', 'terminal', 'taman', 'studiBanding', 'embung']) {
      const anchor = s.buildings.find((x) => lotAt(x.x, x.y) === 'kel') ?? seam[0];
      const spot = seam.filter((p) => checkPlace(s, id, p.x, p.y).ok).sort((p, q) => Math.abs(p.x - anchor.x) + Math.abs(p.y - anchor.y) - Math.abs(q.x - anchor.x) - Math.abs(q.y - anchor.y))[0];
      if (spot && s.res.rupiah > 6_000_000) place(s, id, spot.x, spot.y);
    }
    // Tend the kampung: one Popularitas building and one home a month at most, each beside a road.
    const conn = connectedRoad(s);
    const roadSpot = (id: string) => all.find((p) => checkPlace(s, id, p.x, p.y).ok && hasRoadBeside(conn, { def: id, x: p.x, y: p.y }));
    const placeFirst = (ids: string[]) => {
      for (const id of ids) {
        const spot = roadSpot(id);
        if (spot && s.res.rupiah > 3_000_000) return void place(s, id, spot.x, spot.y);
      }
    };
    if (s.res.sabar < 70) placeFirst(SABAR);
    if (s.res.sabar >= GROW_FROM && population(s) >= housing(s) - 1) placeFirst(HOMES);
    // Spend like a player would: anything placeable that fits, plus upgrades. No new homes while Popularitas is low.
    for (const d of placeableDefs()) {
      if ((d.scope ?? 'rt') !== 'kel' && s.res.rupiah > 20_000_000 && !(d.housing && s.res.sabar < GROW_FROM)) {
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

  it('reaches 3 stars on Auto-dana in years 10 to 15, and the player\'s own kampung is full and liked when it does', () => {
    const got = [3, 4, 6].map((seed) => {
      const { s, at } = playKel(seed, 15, true);
      return { seed, at, pop: population(s), sabar: Math.round(s.res.sabar), rts: s.neighbours.map((n) => n.stars).join('') };
    });
    const msg = JSON.stringify(got);
    expect(got.every((g) => g.at.length === 3), msg).toBe(true);
    expect(got.every((g) => g.at[2] >= 120 && g.at[2] <= 180), msg).toBe(true);
    expect(got.every((g) => g.pop >= 200 && g.sabar >= 40), msg).toBe(true);
  }, 240_000);
});
