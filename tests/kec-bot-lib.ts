import { connectedRoad, hasRoadBeside } from '../src/sim/access';
import { placeableDefs } from '../src/sim/content';
import { promote } from '../src/sim/grow';
import { checkPlace, demolish, place } from '../src/sim/rules';
import { checkRazia, startRazia } from '../src/sim/kec';
import { pinjolShare } from '../src/sim/pinjol';
import { occupants, population } from '../src/sim/state';
import { tick } from '../src/sim/tick';
import type { GameState } from '../src/sim/types';
import { kelSetup, kelWeek } from './kel-bot-lib';

/** Kecamatan buildings the bot places on a seam lot, one at a time, as a player with money would. */
const KEC = ['kantorKec', 'posSatpol', 'koperasiSP', 'balaiLatihanKerja', 'baliho', 'tamanKota'];

/** Where the Kecamatan bot stops building homes. */
export const KEC_POP_CAP = Number(process.env.POPCAP ?? 270);
/** The Kelurahan asks for 200 residents; the bot stops adding homes a little past that. */
export const KEL_POP_CAP = Number(process.env.KELCAP ?? 230);

/** Share of residents with no job. */
const jobless = (s: GameState): number => s.residents.filter((r) => r.job === 'none' && r.staffId === undefined).length / Math.max(1, s.residents.length);

/**
 * What a player does when the pinjol meter says too many households are idle: stop adding homes and build places that
 * give work, one a week, beside a road, until the jobless share is down.
 */
export function kecWeek(s: GameState, seam: { x: number; y: number }[], all: { x: number; y: number }[], jobShare = 0.2, stage: 'kelurahan' | 'kecamatan' = 'kecamatan'): void {
  const short = jobless(s) > jobShare;
  // The Kecamatan asks for 250 residents, so a player stops adding homes a little past that: every resident drains Popularitas.
  const full = population(s) >= (stage === 'kecamatan' ? KEC_POP_CAP : KEL_POP_CAP);
  kelWeek(s, seam, all, true, stage === 'kecamatan' ? KEC : [], !short && !full);
  if (!short || s.res.rupiah < 3_000_000) return;
  const conn = connectedRoad(s);
  const cells = [...all, ...seam];
  for (const d of placeableDefs().filter((x) => x.jobSlots && Object.values(x.jobSlots).some((n) => n > 0))) {
    const spot = cells.find((p) => checkPlace(s, d.id, p.x, p.y).ok && hasRoadBeside(conn, { def: d.id, x: p.x, y: p.y }));
    if (spot) return void place(s, d.id, spot.x, spot.y);
  }
  // The map is full of homes: a player pulls one down to make room for work. The emptiest home goes, one a week.
  const homesOnMap = s.buildings.filter((b) => ['kontrakan', 'kosan', 'rumah'].includes(b.def) && b.status === 'active');
  const victim = homesOnMap.sort((a, b) => occupants(s, a) - occupants(s, b))[0];
  if (victim) demolish(s, victim);
}

export interface KecRun {
  seed: number;
  /** Week the Kelurahan reached 3 stars and the bot was promoted. */
  promoted?: number;
  /** Weeks after promotion for each Kecamatan star. */
  at: number[];
  pop: number;
  pinjol: number;
  stars: string;
  razias: number;
}

/**
 * A Kecamatan bot: plays the Kelurahan routine to 3 stars on Auto-dana, takes the promotion, then keeps the same routine
 * and adds the Kecamatan buildings. It runs a razia while pinjol is high and the 3rd star is not yet near.
 */
export function playKec(seed: number, kelWeeks = 200, kecWeeks = 700, jobShare = 0.2): KecRun {
  const { s, seam, all } = kelSetup(seed, true);
  const run: KecRun = { seed, at: [], pop: 0, pinjol: 0, stars: '', razias: 0 };
  for (let w = 0; w < kelWeeks && s.stage.stars.kelurahan < 3; w++) {
    kecWeek(s, seam, all, jobShare, 'kelurahan');
    tick(s);
  }
  if (s.stage.stars.kelurahan < 3) return { ...run, pop: population(s), stars: `kel ${s.stage.stars.kelurahan}` };
  run.promoted = s.month;
  promote(s, []);
  const from = s.month;
  for (let w = 0; w < kecWeeks && s.stage.stars.kecamatan < 3; w++) {
    kecWeek(s, seam, all, jobShare);
    if (s.stage.stars.kecamatan < 2 && pinjolShare(s) >= 30 && checkRazia(s).ok) {
      startRazia(s, []);
      run.razias++;
    }
    const before = s.stage.stars.kecamatan;
    tick(s);
    if (s.stage.stars.kecamatan > before) run.at.push(s.month - from);
  }
  return { ...run, pop: population(s), pinjol: Math.round(pinjolShare(s)), stars: `${s.stage.stars.kecamatan}` };
}

