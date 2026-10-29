// Builds the developer seed saves in src/sim/seeds/: a game played forward by a plain bot to a higher stage.
export type SeedId = 'rt3' | 'rw' | 'kel';
// Regenerate with `SEED_WRITE=1 npx vitest run tests/seed.test.ts`.
import { checkRepair, repair, resolveEvent } from '../src/sim/events';
import { fundNeighbour, promote, setAutoFund } from '../src/sim/grow';
import { lotAt } from '../src/sim/area';
import { placeableDefs } from '../src/sim/content';
import { checkRestart, restart } from '../src/sim/projects';
import { checkPlace, checkUpgrade, place, skipPermit, upgrade } from '../src/sim/rules';
import { newGame } from '../src/sim/state';
import { tick } from '../src/sim/tick';
import { GRID_H, GRID_W, setGrid, type GameState } from '../src/sim/types';



const SEED = 7;

/** Plays `months` of a plain routine: build everything placeable in the current scope, upgrade, mend, fund every RT. */
function play(s: GameState, months: number, scopes: string[]): void {
  const cells: { x: number; y: number }[] = [];
  for (let y = 0; y < GRID_H; y++) for (let x = 0; x < GRID_W; x++) cells.push({ x, y });
  for (let m = 0; m < months; m++) {
    if (s.pendingEvent) resolveEvent(s, [], 0);
    for (const n of s.neighbours) if (s.res.rupiah > 3_000_000) fundNeighbour(s, n);
    for (const d of placeableDefs()) {
      if (!scopes.includes(d.scope ?? 'rt') || s.res.rupiah < 200_000) continue;
      const spot = cells.find((p) => lotAt(p.x, p.y) === (d.scope ?? 'rt') && checkPlace(s, d.id, p.x, p.y).ok)
        ?? (d.scope ? undefined : cells.find((p) => ['rt', 'rw'].includes(lotAt(p.x, p.y)) && checkPlace(s, d.id, p.x, p.y).ok));
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
  play(s, 72, ['rt']);
  s.stage.stars.rt = 3;
  if (id === 'rt3') { s.res.rupiah = Math.max(s.res.rupiah, 5_000_000); return s; }
  promote(s, []);
  for (const n of s.neighbours) setAutoFund(n, 6);
  s.res.rupiah = 30_000_000;
  play(s, 72, ['rt', 'rw']);
  s.stage.stars.rw = 3;
  if (id === 'rw') { s.res.rupiah = Math.max(s.res.rupiah, 20_000_000); return s; }
  promote(s, []);
  s.stage.path = 'kelurahan';
  s.res.rupiah = 60_000_000;
  play(s, 36, ['rt', 'rw', 'kel']);
  s.res.rupiah = Math.max(s.res.rupiah, 30_000_000);
  return s;
}
