import { bBlurb, bName, t, type Key } from '../i18n';
import {
  ARRIVE_MIN_SABAR, BROKE_SABAR_DRAIN, INFLATION_PER_YEAR, IURAN, LEAVE_BELOW_SABAR, MIN_RESIDENTS,
  EXPECT_PER_RESIDENT, NOVELTY_GAP, QUEUE_SABAR_DRAIN, SETORAN_RATE, SABAR_MAX, SABAR_REGEN, SABAR_REGEN_BELOW, TUKANG_MAX, VIRAL_DECAY, VIRAL_INCOME, VIRAL_MAX,
} from './balance';
import { accessSystem, connectedRoad, hasRoadBeside } from './access';
import { comboIncomeMult, comboSystem } from './combos';
import { def, placeableDefs } from './content';
import { EMAS } from '../data/ranking';
import { eventSystem } from './events';
import { first } from './firsts';
import { camatCallSystem, lineSystem } from './lines';
import { debtSystem, iuranFromNeighbours, neighboursSystem, neighboursYearEnd, stempelSystem } from './grow';
import { inspectionSystem } from './inspection';
import { jobsSystem, used } from './jobs';
import { mangkrakSystem, onBuildingFinished } from './projects';
import { addEmas, yearlyRanking } from './ranking';
import { kelSystem, comboUpkeepMult } from './kel';
import { rwSystem, rwYearEnd, burstMult } from './rw';
import { stageSystem } from './stages';
import { wacanaSystem } from './wacana';
import { chance, pick, randInt } from './rng';
import { noteNet, quarterSystem, snapshot } from './report';
import { requirementGaps } from './rules';
import { brandMult, royaltyRate } from './brands';
import { problemSystem } from './problems';
import { needsSystem, premanTake } from './needs';
import { realisasiSystem, realisasiWarungMult } from './realisasi';
import { addBuilding, addResident, attractTarget, decorMult, emptyTiles, housing, isWorking, levelMult, neighbours, pathMult, population } from './state';
import { gain, type Fx } from './gain';
import type { Building, GameState, ResourceId } from './types';

export { gain };
export type { Fx };

/** Multiplier on a building's income from timed modifiers. Systems added later extend this. */
export function incomeMult(s: GameState, b: Building): number {
  let m = comboIncomeMult(s, b);
  for (const mod of s.modifiers) if (mod.target === '*' || mod.target === b.def) m *= mod.incomeMult;
  if (def(b.def).shop) m *= 1 + s.res.viral * VIRAL_INCOME;
  return m;
}

export function buildingIncome(s: GameState, b: Building): number {
  if (!isWorking(b)) return 0;
  const d = def(b.def);
  return Math.round(d.income * levelMult(b.level) * incomeMult(s, b) * pathMult(s, b) * decorMult(s, b) * burstMult(s, b) * brandMult(s, b) * (1 - premanTake(s, b)) * (b.def === 'warung' ? realisasiWarungMult(s) : 1));
}

export function buildingUpkeep(s: GameState, b: Building): number {
  const d = def(b.def);
  if (b.status === 'mangkrak') return 0;
  return Math.round(d.upkeep * levelMult(b.level) * s.inflation * comboUpkeepMult(s, b));
}

function clampResources(s: GameState): void {
  s.res.sabar = Math.max(0, Math.min(SABAR_MAX, s.res.sabar));
  s.res.viral = Math.max(0, Math.min(VIRAL_MAX, s.res.viral));
  s.res.orangDalam = Math.max(0, s.res.orangDalam);
}

function novelty(s: GameState): void {
  s.lastNovelty = s.month;
}

export function advanceConstruction(s: GameState, fx: Fx): void {
  // Each tukang on the crew gives every site an extra month of progress one month in four.
  const crew = Math.min(TUKANG_MAX, used(s, 'tukang'));
  for (const b of s.buildings) {
    if (b.status !== 'permit' && b.status !== 'building') continue;
    b.timer -= b.status === 'building' && (s.month + b.uid) % 4 < crew ? 2 : 1;
    if (b.status === 'permit') {
      gain(s, fx, 'sabar', -QUEUE_SABAR_DRAIN, b);
      if (b.timer <= 0) {
        b.status = 'building';
        b.timer = Math.max(1, def(b.def).buildMonths);
      }
    } else if (b.timer <= 0) {
      b.status = 'active';
      fx.push({ kind: 'built', uid: b.uid });
      if (onBuildingFinished(s, fx, b) === 'ok') fx.push({ kind: 'notice', title: t('sim.openTitle', { name: bName(def(b.def)) }), body: bBlurb(def(b.def)), tone: 'good', x: b.x, y: b.y });
      if (b.def === 'rumah') first(s, fx, 'house', b);
      novelty(s);
    }
  }
}

export function collectIncome(s: GameState, fx: Fx): void {
  let gross = 0;
  let royalty = 0;
  for (const b of s.buildings) {
    const d = def(b.def);
    gross += buildingIncome(s, b);
    royalty += buildingIncome(s, b) * royaltyRate(s, b);
    const net = buildingIncome(s, b) - buildingUpkeep(s, b);
    gain(s, fx, 'rupiah', net, b);
    noteNet(s, b.uid, net);
    if (isWorking(b) && d.perMonth) {
      for (const [res, v] of Object.entries(d.perMonth) as [ResourceId, number][]) gain(s, fx, res, v * levelMult(b.level), res === 'orangDalam' ? undefined : b);
    }
  }
  const kantor = s.buildings.find((b) => b.def === 'kantorRT');
  gain(s, fx, 'rupiah', population(s) * IURAN, kantor);
  iuranFromNeighbours(s, fx);
  // A franchise's royalty goes up the chain with the setoran.
  const setoran = Math.round(gross * SETORAN_RATE + royalty);
  if (setoran > 0) {
    s.res.rupiah -= setoran;
    s.stats.spent += setoran;
  }
}

/** A bigger kampung expects more. Without this, jobs and policies pin Popularitas at the top. */
export function expectations(s: GameState, fx: Fx): void {
  gain(s, fx, 'sabar', -population(s) * EXPECT_PER_RESIDENT);
}

/** Year 1 safety net: upkeep can never push the kas below zero. */
export function safetyNet(s: GameState, fx: Fx): void {
  if (s.res.rupiah >= 0) return;
  if (s.month < 12) {
    fx.push({ kind: 'notice', title: t('sim.danaTitle'), body: t('sim.danaBody', { amt: -Math.round(s.res.rupiah) }), tone: 'info' });
    s.res.rupiah = 0;
  } else {
    gain(s, fx, 'sabar', -BROKE_SABAR_DRAIN);
  }
}

function spawnRumah(s: GameState): Building | null {
  const empty = emptyTiles(s);
  if (!empty.length) return null;
  // A perantau builds beside a road when there is one, so his house works at once.
  const conn = connectedRoad(s);
  const onRoad = empty.filter((e) => hasRoadBeside(conn, { def: 'rumah', ...e }));
  const pool = onRoad.length ? onRoad : empty;
  const near = pool.filter((t) => neighbours(s, t).some((b) => b.def !== 'rumah' || chance(s, 0.5)));
  const spot = pick(s, near.length ? near : pool);
  return addBuilding(s, 'rumah', spot.x, spot.y, 'active');
}

/**
 * A resident moves in only when a bed is free. Houses are built by the player, so a full
 * kampung stops growing until a Rumah goes up. The exception is the perantau who brings his
 * own house, which keeps a neglected kampung from stalling completely.
 */
function arrive(s: GameState, fx: Fx, reason: string, ownHouse = false): boolean {
  if (population(s) + 1 > housing(s) && !(ownHouse && spawnRumah(s))) return false;
  const r = addResident(s);
  s.stats.arrived++;
  s.lastArrival = s.month;
  const home = s.buildings.filter((b) => b.def === 'rumah').at(-1);
  fx.push({ kind: 'notice', title: t('sim.movedIn', { name: r.name }), body: reason, tone: 'good', x: home?.x, y: home?.y });
  first(s, fx, 'resident', home);
  novelty(s);
  return true;
}

export function residentsMove(s: GameState, fx: Fx): void {
  const target = attractTarget(s);
  if (s.res.sabar < LEAVE_BELOW_SABAR && population(s) > MIN_RESIDENTS) {
    const r = s.residents.splice(randInt(s, 0, s.residents.length - 1), 1)[0];
    s.stats.left++;
    fx.push({ kind: 'notice', title: t('sim.movedOut', { name: r.name }), body: t('sim.movedOutBody', { n: LEAVE_BELOW_SABAR }), tone: 'bad' });
    return;
  }
  let arrived = 0;
  if (population(s) < target && s.res.sabar >= ARRIVE_MIN_SABAR) {
    const n = Math.min(2, target - population(s));
    for (let i = 0; i < n; i++) if (arrive(s, fx, t('sim.arriveWarung'))) arrived++;
  }
  // Nothing new for a while: a perantau turns up with his own house. Pacing safety valve,
  // not the normal way to grow the map.
  if (arrived === 0 && s.month - (s.lastArrival ?? 0) >= NOVELTY_GAP) arrive(s, fx, t('sim.arrivePerantau'), true);
}

/** One notice per month, however many buildings opened: a star can unlock a dozen and they must not queue a dozen pop-ups. */
export function checkUnlocks(s: GameState, fx: Fx): void {
  let opened = placeableDefs().filter((d) => !s.unlocked.includes(d.id) && requirementGaps(s, d, { ignoreLimit: true }).length === 0);
  if (!opened.length) return;
  for (const d of opened) s.unlocked.push(d.id);
  novelty(s);
  // The first month's batch is the starting menu, not a reward, and it would land on top of the opener.
  if (s.month <= 1) return;
  // A building that opens with its problem says why: the trouble is the lesson.
  const byProblem = new Map<string, typeof opened>();
  for (const d of opened) if (d.requires?.problem) byProblem.set(d.requires.problem, [...(byProblem.get(d.requires.problem) ?? []), d]);
  for (const [problem, defs] of byProblem) {
    const list = defs.map((d) => bName(d)).join(', ');
    fx.push({ kind: 'notice', title: t('sim.unlockedTitle', { name: list }), body: t(`problem.${problem}` as Key, { list }), tone: 'good', fanfare: true });
  }
  opened = opened.filter((d) => !d.requires?.problem);
  if (!opened.length) return;
  if (opened.length === 1) {
    const d = opened[0];
    fx.push({ kind: 'notice', title: t('sim.unlockedTitle', { name: bName(d) }), body: bBlurb(d), tone: 'good', fanfare: true });
    return;
  }
  fx.push({ kind: 'notice', title: t('sim.unlockedManyTitle', { n: opened.length }), body: t('sim.unlockedManyBody'), tone: 'good', fanfare: true });
}

/** A calm village settles back toward a floor. Bad choices slow you down, they never trap you at zero. */
export function sabarRegen(s: GameState, fx: Fx): void {
  if (s.res.sabar < SABAR_REGEN_BELOW) gain(s, fx, 'sabar', Math.min(SABAR_REGEN, SABAR_REGEN_BELOW - s.res.sabar), s.buildings.find((b) => b.def === 'kantorRT'));
}

export function decay(s: GameState): void {
  s.res.viral *= 1 - VIRAL_DECAY;
  for (const m of s.modifiers) m.monthsLeft--;
  s.modifiers = s.modifiers.filter((m) => m.monthsLeft > 0);
}

export function yearEnd(s: GameState, fx: Fx): void {
  s.inflation *= 1 + INFLATION_PER_YEAR;
  addEmas(s, EMAS.perYear);
  neighboursYearEnd(s, s.month / 12);
  rwYearEnd(s, fx);
  yearlyRanking(s, fx, s.month / 12);
  fx.push({ kind: 'notice', title: t('sim.yearTitle', { n: s.month / 12 + 1 }), body: t('sim.yearBody', { pct: Math.round(INFLATION_PER_YEAR * 100) }), tone: 'info' });
}

/** Ordered list of monthly systems. Later milestones insert their systems here. */
export const SYSTEMS: ((s: GameState, fx: Fx) => void)[] = [
  accessSystem,
  advanceConstruction,
  accessSystem,
  collectIncome,
  comboSystem,
  rwSystem,
  kelSystem,
  neighboursSystem,
  stempelSystem,
  jobsSystem,
  realisasiSystem,
  needsSystem,
  wacanaSystem,
  mangkrakSystem,
  expectations,
  sabarRegen,
  safetyNet,
  debtSystem,
  residentsMove,
  stageSystem,
  problemSystem,
  checkUnlocks,
  inspectionSystem,
  eventSystem,
  lineSystem,
  camatCallSystem,
  quarterSystem,
];

/** One month. Pure apart from mutating the state it is given. */
export function tick(s: GameState): Fx {
  const fx: Fx = [];
  if (s.pendingEvent) return fx;
  s.quarter ??= snapshot(s);
  s.month++;
  for (const system of SYSTEMS) system(s, fx);
  decay(s);
  if (s.month % 12 === 0) yearEnd(s, fx);
  clampResources(s);
  return fx;
}
