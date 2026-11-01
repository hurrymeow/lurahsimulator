import { checkRepair, repair, resolveEvent } from '../src/sim/events';
import { checkRestart, restart } from '../src/sim/projects';
import { fundNeighbour, promote, setAutoFund } from '../src/sim/grow';
import { connectedRoad, hasRoadBeside } from '../src/sim/access';
import { lotAt } from '../src/sim/area';
import { placeableDefs } from '../src/sim/content';
import { checkPlace, checkUpgrade, place, skipPermit, upgrade } from '../src/sim/rules';
import { housing, newGame, population } from '../src/sim/state';
import { checkPost, hire, postLowongan, queueMonths } from '../src/sim/staff';
import { ROLE_FX } from '../src/data/staff';
import { GRID_H, GRID_W, type GameState } from '../src/sim/types';

/** Popularitas buildings, strongest first, and homes, biggest first. */
const SABAR = ['kolamPancing', 'panggungSenam', 'bidan', 'posRonda', 'bankSampah'];
const HOMES = ['kontrakan', 'kosan', 'rumah'];
/** The bot only grows while Popularitas is at least this, as a player waiting for the kampung to settle. */
const GROW_FROM = 55;

/** The setup of a Kelurahan game: RT and RW at 3 stars, promoted onto the Kelurahan path, with the lots the bot builds on. */
export function kelSetup(seed: number, auto = false) {
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
  return { s, seam, all };
}

/** One week of the Kelurahan bot's routine, before the tick. `extra` lists more stage buildings to place on a seam lot. */
export function kelWeek(s: GameState, seam: { x: number; y: number }[], all: { x: number; y: number }[], auto: boolean, extra: string[] = [], homes = true): void {
    if (s.pendingEvent) resolveEvent(s, [], 0);
    if (!auto) for (const n of s.neighbours) if (s.res.rupiah > 3_000_000) fundNeighbour(s, n);
    for (const id of ['kantorKel', 'pasar', 'terminal', 'taman', 'studiBanding', 'embung', ...extra]) {
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
    // Short of the star's Popularitas: a second one the same week.
    if (s.res.sabar < 50) placeFirst(SABAR);
    if (homes && s.res.sabar >= GROW_FROM && population(s) >= housing(s) - 1) placeFirst(HOMES);
    // Spend like a player would: anything placeable that fits, plus upgrades. No new homes while Popularitas is low,
    // and nothing new while the permit queue is deep: the goal strip says to hire first.
    const deep = queueMonths(s) >= ROLE_FX.asisten.hireAfter;
    for (const d of placeableDefs()) {
      if (!deep && (d.scope ?? 'rt') !== 'kel' && s.res.rupiah > 20_000_000 && !(d.housing && s.res.sabar < GROW_FROM)) {
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
    // A deep permit queue is a staffing problem, as the goal strip says: post for an Asisten and take the best Lobi.
    if (queueMonths(s) >= ROLE_FX.asisten.hireAfter && checkPost(s, 'asisten', 'online').ok) postLowongan(s, 'asisten', 'online');
    const apps = s.lowongan?.applicants ?? [];
    if (apps.length) hire(s, [...apps].sort((a, b) => b.stats.lobi - a.stats.lobi)[0].id);
}
