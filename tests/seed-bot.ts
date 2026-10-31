// Builds the developer seed saves in src/sim/seeds/: a game played forward by a plain bot to a higher stage.
export type SeedId = 'rt3' | 'rw' | 'kel';
// Regenerate with `SEED_WRITE=1 npx vitest run tests/seed.test.ts`.
import { checkRepair, repair, resolveEvent } from '../src/sim/events';
import { fundNeighbour, promote, setAutoFund } from '../src/sim/grow';
import { connectedRoad, FLAT, hasRoadBeside } from '../src/sim/access';
import { lotAt } from '../src/sim/area';
import { placeableDefs } from '../src/sim/content';
import { checkRestart, restart } from '../src/sim/projects';
import { checkPlace, checkUpgrade, place, skipPermit, upgrade } from '../src/sim/rules';
import { newGame } from '../src/sim/state';
import { tick } from '../src/sim/tick';
import { GRID_H, GRID_W, RT_H, RT_W, setGrid, type GameState } from '../src/sim/types';



const SEED = 7;

/** Street rows of the player's RT (13x17): a Jalan Setapak every fourth row, joined by a spine through the Kantor. */
const STREETS = [2, 6, 10, 14];
const SPINE_X = 6;
/** Tiles from the Kantor's door, so the town grows outward from the centre in rings. */
const near = (p: { x: number; y: number }) => Math.abs(p.x - SPINE_X) + Math.abs(p.y - 8);

/** Lays the streets once. Tiles that are taken, such as the Kantor, are skipped. */
function laySetapak(s: GameState): void {
  const tiles: [number, number][] = [];
  for (const y of STREETS) for (let x = 0; x < RT_W; x++) tiles.push([x, y]);
  for (let y = 0; y < RT_H; y++) if (!STREETS.includes(y)) tiles.push([SPINE_X, y]);
  for (const [x, y] of tiles) if (checkPlace(s, 'jalan', x, y).ok) place(s, 'jalan', x, y);
}

/** How many of one kind a planned town holds: houses in blocks, one or two of everything else. */
const capOf = (id: string, max?: number): number => Math.min(max ?? 99, id === 'rumah' ? 8 : 4);

const count = (s: GameState, id: string) => s.buildings.filter((b) => b.def === id).length;

/** Plays a planned routine: streets first, then one of each kind in turn, houses in blocks, flat and decor pieces in the gaps, upgrade, mend, fund every RT. */
function play(s: GameState, months: number, scopes: string[]): void {
  const cells: { x: number; y: number }[] = [];
  for (let y = 0; y < GRID_H; y++) for (let x = 0; x < GRID_W; x++) cells.push({ x, y });
  if (scopes.includes('rt')) laySetapak(s);
  for (let m = 0; m < months; m++) {
    if (s.pendingEvent) resolveEvent(s, [], 0);
    // The town is for looking at, so the bot never goes short of money to finish it.
    s.res.rupiah = Math.max(s.res.rupiah, 8_000_000);
    for (const n of s.neighbours) if (s.res.rupiah > 3_000_000) fundNeighbour(s, n);
    // One placement per kind per month, so the mix grows evenly instead of one kind eating the budget.
    for (const d of placeableDefs()) {
      const scope = d.scope ?? 'rt';
      if (d.id === 'jalan' || !scopes.includes(scope) || s.res.rupiah < 200_000) continue;
      if (count(s, d.id) >= capOf(d.id, d.maxCount)) continue;
      const free = (p: { x: number; y: number }) => checkPlace(s, d.id, p.x, p.y).ok;
      const needsRoad = scope === 'rt' && d.category !== 'decoration' && !FLAT.has(d.id) && !d.id.startsWith('kantor');
      // Road-fed buildings stand beside a street, nearest the Kantor first. Flat pieces and decor fill the gaps away from the streets.
      let spot: { x: number; y: number } | undefined;
      if (scope !== 'rt') spot = cells.find((p) => lotAt(p.x, p.y) === scope && free(p));
      else {
        const lots = cells.filter((p) => lotAt(p.x, p.y) === 'rt' && free(p));
        const conn = connectedRoad(s);
        const fed = lots.filter((p) => hasRoadBeside(conn, { def: d.id, x: p.x, y: p.y }));
        spot = needsRoad ? fed.sort((p, q) => near(p) - near(q) || p.y - q.y)[0] : lots.filter((p) => !fed.includes(p))[0] ?? lots[0];
      }
      if (spot) place(s, d.id, spot.x, spot.y);
    }
    for (const b of s.buildings) {
      if (b.status === 'permit') skipPermit(s, b);
      else if (b.status === 'damaged' && checkRepair(s, b).ok) repair(s, b);
      else if (b.status === 'mangkrak' && checkRestart(s, b).ok) restart(s, b);
      else if (b.status === 'active' && s.res.rupiah > 2_000_000 && checkUpgrade(s, b).ok) upgrade(s, b);
    }
    tick(s);
  }
}

/** Builds a seeded save for the given stage. Leaves the grid set to that stage. */
export function seedGame(id: SeedId): GameState {
  setGrid('rt');
  const s = newGame(SEED);
  s.res.rupiah = 5_000_000;
  // Stars are set first, so every kind the stage opens is on the map.
  s.stage.stars.rt = 3;
  play(s, 72, ['rt']);
  if (id === 'rt3') { s.res.rupiah = 5_000_000; s.stage.sk = 'offered'; return s; }
  promote(s, []);
  for (const n of s.neighbours) setAutoFund(n, 6);
  s.res.rupiah = 30_000_000;
  s.stage.stars.rw = 3;
  play(s, 72, ['rt', 'rw']);
  if (id === 'rw') { s.res.rupiah = 20_000_000; s.stage.sk = 'offered'; return s; }
  promote(s, []);
  s.stage.path = 'kelurahan';
  s.res.rupiah = 60_000_000;
  play(s, 36, ['rt', 'rw', 'kel']);
  s.res.rupiah = 45_000_000;
  return s;
}
