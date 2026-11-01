// The Kelurahan stage's rules: Anggaran, serapan, audits and the combos and jobs that need them.
import { WEEKS_PER_YEAR, weekOfYear } from './calendar';
import { bName, t } from '../i18n';
import { KEL } from '../data/higher';
import { WACANA, WACANA_POWER } from '../data/wacana';
import { activeCombos } from './combos';
import { allDefs, def, stageFx } from './content';
import { gain, type Fx } from './gain';
import { pick } from './rng';
import { price } from './state';
import type { Building, GameState } from './types';

/** Serapan the first star asks for, as a percent of the budget due so far. */
export const SERAPAN_TARGET = 80;
/** A badly spent year never cuts the next budget below this share. */
export const BUDGET_FLOOR = 0.2;
/** Share of the December shortfall that gets spent in a rush, whatever it buys. */
export const RUSH_SHARE = 0.5;
/** Months a wacana's receipt stays good. */
export const RECEIPT_MONTHS = 12;

const inKel = (s: GameState) => s.stage.current === 'kelurahan';

const spentThisYear = (s: GameState) => Math.max(0, s.stats.spent - s.kel.spentBase);

/** Percent of the budget due so far that has been spent. 100 before any budget arrives. */
export function serapan(s: GameState): number {
  const due = (s.kel.budget * (weekOfYear(s.month - 1) + 1)) / WEEKS_PER_YEAR;
  return due > 0 ? Math.round((spentThisYear(s) / due) * 100) : 100;
}

/** The budget that arrives now: last year's share of the base. */
function nextBudget(s: GameState): number {
  const base = price(s, KEL.anggaranPerYear);
  let share = 1;
  if (s.kel.budget > 0) share = Math.max(BUDGET_FLOOR, Math.min(1, spentThisYear(s) / s.kel.budget)) ** KEL.unspentCut;
  return Math.round((base * share) / 1000) * 1000;
}

/** Wacana with no receipt: announced, and the paperwork has gone stale. */
export const wacanaNoReceipt = (s: GameState): number => s.wacana.filter((w) => w.times > 0 && s.month - w.lastAnnounced >= RECEIPT_MONTHS).length;

/** Multiplier on the area score while a Lomba Kelurahan entry stands. */
export const lombaMult = (s: GameState): number => (s.kel.lomba && s.month < s.kel.lomba.until ? s.kel.lomba.mult : 1);

/** Multiplier on a building's upkeep from combos that raise it. */
export function comboUpkeepMult(s: GameState, b: Building): number {
  let m = 1;
  for (const a of activeCombos(s)) if (a.members.includes(b)) m *= (a.combo as { upkeepMult?: Record<string, number> }).upkeepMult?.[b.def] ?? 1;
  return m;
}

/** Banjir damage share Embung and its kin absorb, on top of selokan. */
export const banjirCut = (s: GameState): number => allDefs().reduce((n, d) => n + (stageFx(d)?.banjirCut ?? 0) * s.buildings.filter((b) => b.def === d.id && b.status === 'active').length, 0);

/** Studi Banding pays out one random wacana when it opens. */
export function studiBanding(s: GameState, fx: Fx, b: Building): void {
  const w = pick(s, WACANA);
  let state = s.wacana.find((x) => x.id === w.id);
  if (!state) s.wacana.push((state = { id: w.id, power: 0, times: 0, lastAnnounced: s.month }));
  state.power = WACANA_POWER;
  state.times++;
  state.lastAnnounced = s.month;
  fx.push({ kind: 'notice', title: t('sim.studiTitle', { name: bName(def(b.def)) }), body: t('sim.studiBody', { name: w.name }), tone: 'info', x: b.x, y: b.y });
}

/** Monthly: the January budget, serapan, and the December rush. */
export function kelSystem(s: GameState, fx: Fx): void {
  if (!inKel(s)) return;
  const k = s.kel;
  if (k.budget === 0 || s.month % WEEKS_PER_YEAR === 0) {
    const was = k.budget;
    k.budget = nextBudget(s);
    k.spentBase = s.stats.spent;
    gain(s, fx, 'rupiah', k.budget);
    const cut = was > 0 ? Math.round((1 - k.budget / price(s, KEL.anggaranPerYear)) * 100) : 0;
    fx.push({ kind: 'notice', title: t('sim.anggaranTitle'), body: t('sim.anggaranBody', { amt: k.budget, cut }), tone: cut > 0 ? 'bad' : 'good' });
  }
  if (weekOfYear(s.month) === WEEKS_PER_YEAR - 1) {
    const short = Math.max(0, k.budget - spentThisYear(s));
    const rush = Math.min(Math.floor(s.res.rupiah), Math.round((short * RUSH_SHARE) / 1000) * 1000);
    if (rush > 0) {
      gain(s, fx, 'rupiah', -rush);
      s.stats.spent += rush;
      fx.push({ kind: 'notice', title: t('sim.rushTitle'), body: t('sim.rushBody', { amt: rush }), tone: 'info' });
    }
  }
  // The month a fresh budget lands has nothing spent against it yet, so it neither counts nor breaks the run.
  if (s.month % WEEKS_PER_YEAR !== 0) k.serapanRun = serapan(s) >= SERAPAN_TARGET ? k.serapanRun + 1 : 0;
}
