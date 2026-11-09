import { connectedRoad, hasRoadBeside } from '../src/sim/access';
import { resolveEvent } from '../src/sim/events';
import { def, placeableDefs } from '../src/sim/content';
import { promote } from '../src/sim/grow';
import { checkDemolish, checkPlace, demolish, place } from '../src/sim/rules';
import { amanAcross, checkRazia, startRazia } from '../src/sim/kec';
import { judolShare, pinjolShare } from '../src/sim/pinjol';
import { checkRealisasi, startRealisasi } from '../src/sim/realisasi';
import { lotAt } from '../src/sim/area';
import { buildingIncome, tick } from '../src/sim/tick';
import { fedBase, households } from '../src/sim/needs';
import { GRID_H, GRID_W, setGrid } from '../src/sim/types';
import { runBot } from './scorecard/driver';
import { buildCost, isWorking, occupants, population } from '../src/sim/state';
import { nextStarChecklist } from '../src/sim/stages';
import type { GameState } from '../src/sim/types';
import { kelSetup, kelWeek, SABAR } from './kel-bot-lib';

/** Kecamatan buildings the bot places on a seam lot, one at a time, as a player with money would. */
const KEC = ['kantorKec', 'posSatpol', 'koperasiSP', 'balaiLatihanKerja', 'baliho', 'tamanKota'];

/** Where the Kecamatan bot stops building homes. */
export const KEC_POP_CAP = Number(process.env.POPCAP ?? 270);
/** The Kelurahan asks for 200 residents; the bot stops adding homes a little past that. */
export const KEL_POP_CAP = Number(process.env.KELCAP ?? 230);

/** Past the 65 Aman the Kecamatan 3-star goal asks for, so a dip does not lose it. */
const KEC_AMAN_GOAL = 67;

/** Builds one, replacing the commonest building that gives no jobs or Popularitas when the map is full, as a player with money would. */
function makeRoomFor(s: GameState, id: string, cells: { x: number; y: number }[]): void {
  if (s.res.rupiah < buildCost(s, def(id))) return;
  let spot = cells.find((p) => checkPlace(s, id, p.x, p.y).ok);
  if (!spot) {
    const many = (d: string) => s.buildings.filter((b) => b.def === d).length;
    const spare = s.buildings.filter((b) => b.status === 'active' && b.def !== id && !SABAR.includes(b.def) && !def(b.def).housing && !def(b.def).pathIncome && !def(b.def).jobSlots && checkDemolish(s, b).ok);
    const victim = spare.sort((a, b) => many(b.def) - many(a.def))[0];
    if (victim && demolish(s, victim).ok) spot = victim;
  }
  if (spot) place(s, id, spot.x, spot.y);
}

/** Share of residents with no job. */
const jobless = (s: GameState): number => s.residents.filter((r) => r.job === 'none' && r.staffId === undefined).length / Math.max(1, s.residents.length);

/**
 * What a player does when the pinjol meter says too many households are idle: stop adding homes and build places that
 * give work, one a week, beside a road, until the jobless share is down.
 */
export function kecWeek(s: GameState, seam: { x: number; y: number }[], all: { x: number; y: number }[], jobShare = 0.1, stage: 'kelurahan' | 'kecamatan' = 'kecamatan'): void {
  // The Kantor Kecamatan is the first goal, so a player saves for it instead of spending on whatever fits.
  if (stage === 'kecamatan' && !s.buildings.some((b) => b.def === 'kantorKec')) {
    const spot = seam.find((p) => checkPlace(s, 'kantorKec', p.x, p.y).ok);
    if (spot) place(s, 'kantorKec', spot.x, spot.y);
    else {
      if (s.pendingEvent) resolveEvent(s, [], 0);
      return;
    }
  }
  // Each preman costs 4 Aman, and a free Satpam post turns one into the guard. With none left, Lampu Jalan lift Aman toward the goal.
  if (s.residents.some((r) => r.preman)) makeRoomFor(s, 'posSatpam', [...all, ...seam]);
  else if (stage === 'kecamatan' && amanAcross(s) < KEC_AMAN_GOAL) makeRoomFor(s, 'lampuTaman', [...all, ...seam]);
  const short = jobless(s) > jobShare;
  // The Kecamatan asks for 250 residents, so a player stops adding homes a little past that: every resident drains Popularitas.
  const hungry = stage === 'kecamatan' && fedBase(s) < households(s);
  const full = population(s) >= (stage === 'kecamatan' ? KEC_POP_CAP : KEL_POP_CAP) || hungry;
  // The Kecamatan's tools for pinjol: two Koperasi Simpan Pinjam, a Balai Latihan Kerja, and Literasi Keuangan.
  if (stage === 'kecamatan') {
    // Hungry households cost Popularitas, so a player builds food: a Toko Kelontong first, a Warung if that did not go up.
    if (hungry) {
      const before = s.buildings.length;
      makeRoomFor(s, 'tokoKelontong', [...seam, ...all]);
      if (s.buildings.length === before) makeRoomFor(s, 'warung', [...seam, ...all]);
    }
    if (s.buildings.filter((b) => b.def === 'koperasiSP').length < 2) makeRoomFor(s, 'koperasiSP', [...seam, ...all]);
    if (!s.buildings.some((b) => b.def === 'balaiLatihanKerja')) makeRoomFor(s, 'balaiLatihanKerja', [...seam, ...all]);
    if (pinjolShare(s) >= 20 && checkRealisasi(s, 'literasiKeuangan').ok) startRealisasi(s, 'literasiKeuangan');
  }
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

/** Goal lines done on the next star's checklist, plus 10 for each star earned so a new star always counts as progress. */
const doneGoals = (s: GameState): number => (nextStarChecklist(s) ?? []).filter((l) => l.done).length;

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
  /** Longest wait, in weeks, between two novelties and between two goal lines done, after promotion. A week is 8s at 1x. */
  noveltyGap?: number;
  goalGap?: number;
  /** Weeks after promotion until the first household was in debt. Undefined: never. A week is 8s at 1x. */
  firstPinjol?: number;
  /** Longest wait in weeks between two stop points: the promotion, a star or a report. Counted to the 3rd star. */
  stopGap?: number;
  /** The same, counting only the promotion and the stars. */
  starGap?: number;
  /** Judol: highest and mean share of households on it, in percent, after promotion. */
  judolPeak?: number;
  judolMean?: number;
  /** Mean share of all building income that Baliho earned, in percent, from the week the first Baliho worked. Undefined: never built. */
  balihoPct?: number;
  /** Mean weekly income of one working Baliho, in rupiah, over the same weeks. */
  balihoRp?: number;
  /** How the run got to the Kecamatan: the Kelurahan routine on a shortcut start, or the hint bot from a new game. */
  path?: 'shortcut' | 'hint';
}

/** The Kecamatan phase: from the promotion to the 3rd star. Shared by both ways of reaching the Kelurahan 3rd star. */
function kecPhase(s: GameState, seam: { x: number; y: number }[], all: { x: number; y: number }[], run: KecRun, kecWeeks: number, jobShare: number): KecRun {
  const from = s.month;
  let lastNov = s.lastNovelty;
  let novAt = s.month;
  let goalAt = s.month;
  let stopAt = s.month;
  let starAt = s.month;
  let goals = doneGoals(s) + s.stage.stars.kecamatan * 10;
  let noveltyGap = 0;
  let goalGap = 0;
  let stopGap = 0;
  let starGap = 0;
  let judolSum = 0;
  let judolPeak = 0;
  let weeks = 0;
  let balihoShare = 0;
  let balihoRp = 0;
  let balihoWeeks = 0;
  for (let w = 0; w < kecWeeks && s.stage.stars.kecamatan < 3; w++) {
    kecWeek(s, seam, all, jobShare);
    if (s.stage.stars.kecamatan < 2 && pinjolShare(s) >= 30 && checkRazia(s).ok) {
      startRazia(s, []);
      run.razias++;
    }
    const before = s.stage.stars.kecamatan;
    const fx = tick(s);
    if (s.stage.stars.kecamatan > before) {
      run.at.push(s.month - from);
      starGap = Math.max(starGap, s.month - starAt);
      starAt = s.month;
    }
    if (s.stage.stars.kecamatan > before || fx.some((e) => e.kind === 'report')) {
      stopGap = Math.max(stopGap, s.month - stopAt);
      stopAt = s.month;
    }
    if (run.firstPinjol === undefined && pinjolShare(s) > 0) run.firstPinjol = s.month - from;
    const judol = judolShare(s);
    judolSum += judol;
    judolPeak = Math.max(judolPeak, judol);
    weeks++;
    const balihos = s.buildings.filter((b) => b.def === 'baliho' && isWorking(b));
    if (balihos.length) {
      const total = s.buildings.reduce((n, b) => n + buildingIncome(s, b), 0);
      const mine = balihos.reduce((n, b) => n + buildingIncome(s, b), 0);
      balihoShare += total ? mine / total : 0;
      balihoRp += mine / balihos.length;
      balihoWeeks++;
    }
    if (s.lastNovelty !== lastNov) {
      noveltyGap = Math.max(noveltyGap, s.month - novAt);
      novAt = s.month;
      lastNov = s.lastNovelty;
    }
    const now = doneGoals(s) + s.stage.stars.kecamatan * 10;
    if (now !== goals) {
      goalGap = Math.max(goalGap, s.month - goalAt);
      goalAt = s.month;
      goals = now;
    }
  }
  // The wait still open when the run ends counts: a bot that never earns a star has waited the whole run.
  stopGap = Math.max(stopGap, s.month - stopAt);
  starGap = Math.max(starGap, s.month - starAt);
  return {
    ...run, pop: population(s), pinjol: Math.round(pinjolShare(s)), stars: `${s.stage.stars.kecamatan}`, noveltyGap, goalGap, stopGap, starGap,
    judolPeak, judolMean: weeks ? Math.round((judolSum / weeks) * 10) / 10 : 0,
    balihoPct: balihoWeeks ? Math.round((balihoShare / balihoWeeks) * 1000) / 10 : undefined,
    balihoRp: balihoWeeks ? Math.round(balihoRp / balihoWeeks) : undefined,
  };
}

/**
 * A Kecamatan bot: plays the Kelurahan routine to 3 stars on Auto-dana, takes the promotion, then keeps the same routine
 * and adds the Kecamatan buildings. It runs a razia while pinjol is high and the 3rd star is not yet near.
 */
export function playKec(seed: number, kelWeeks = 340, kecWeeks = 700, jobShare = 0.1): KecRun {
  const { s, seam, all } = kelSetup(seed, true);
  const run: KecRun = { seed, at: [], pop: 0, pinjol: 0, stars: '', razias: 0, path: 'shortcut' };
  for (let w = 0; w < kelWeeks && s.stage.stars.kelurahan < 3; w++) {
    kecWeek(s, seam, all, jobShare, 'kelurahan');
    tick(s);
  }
  if (s.stage.stars.kelurahan < 3) return { ...run, pop: population(s), stars: `kel ${s.stage.stars.kelurahan}` };
  run.promoted = s.month;
  promote(s, []);
  return kecPhase(s, seam, all, run, kecWeeks, jobShare);
}

/**
 * The same Kecamatan phase, but reached by playing the hint bot from a new game to the Kelurahan 3rd star
 * (the one bot that gets there on 10 of 10 seeds), instead of the shortcut start of `kelSetup`.
 */
export function playKecHint(seed: number, kecWeeks = 700, jobShare = 0.1): KecRun {
  const out: { s?: GameState } = {};
  runBot('hint', seed, 900, { stopStars: 9, out });
  const s = out.s!;
  const run: KecRun = { seed, at: [], pop: 0, pinjol: 0, stars: '', razias: 0, path: 'hint' };
  if (s.stage.stars.kelurahan < 3) return { ...run, pop: population(s), stars: `kel ${s.stage.stars.kelurahan}` };
  run.promoted = s.month;
  try {
    promote(s, []);
    setGrid(s.stage.current);
    const seam: { x: number; y: number }[] = [];
    const all: { x: number; y: number }[] = [];
    for (let y = 0; y < GRID_H; y++) for (let x = 0; x < GRID_W; x++) {
      if (lotAt(x, y) === 'kel') seam.push({ x, y });
      if (['rt', 'rw'].includes(lotAt(x, y))) all.push({ x, y });
    }
    return kecPhase(s, seam, all, run, kecWeeks, jobShare);
  } finally {
    setGrid('rt');
  }
}
