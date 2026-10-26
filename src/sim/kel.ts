// The Kelurahan and Desa stage's rules: Anggaran, serapan, audits and the combos and jobs that need them.
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
/** Calendar month of the harvest (0 = January). */
export const HARVEST_MONTH = 9;
export const PANEN_BONUS = 2_000_000;
/** Dana Desa shrinks to this share without a Pendamping Desa. */
export const NO_PENDAMPING = 0.5;
/** Months a wacana's receipt stays good. */
export const RECEIPT_MONTHS = 12;

const inKel = (s: GameState) => s.stage.current === 'kelurahan';

const spentThisYear = (s: GameState) => Math.max(0, s.stats.spent - s.kel.spentBase);

/** Percent of the budget due so far that has been spent. 100 before any budget arrives. */
export function serapan(s: GameState): number {
  const due = (s.kel.budget * (((s.month - 1) % 12) + 1)) / 12;
  return due > 0 ? Math.round((spentThisYear(s) / due) * 100) : 100;
}

const pendampingEmployed = (s: GameState) => s.residents.some((r) => r.job === 'pendampingDesa');

/** The budget that arrives now: last year's share of the base, less Dana Desa without a Pendamping. */
function nextBudget(s: GameState): number {
  const base = price(s, KEL.anggaranPerYear);
  let share = 1;
  if (s.kel.budget > 0) share = Math.max(BUDGET_FLOOR, Math.min(1, spentThisYear(s) / s.kel.budget)) ** KEL.unspentCut;
  if (s.stage.path === 'desa' && s.stage.stars.kelurahan >= 2 && !pendampingEmployed(s)) share *= NO_PENDAMPING;
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

/** Monthly: the January budget, serapan, the December rush and the harvest. */
export function kelSystem(s: GameState, fx: Fx): void {
  if (!inKel(s)) return;
  const k = s.kel;
  if (k.budget === 0 || s.month % 12 === 0) {
    const was = k.budget;
    k.budget = nextBudget(s);
    k.spentBase = s.stats.spent;
    gain(s, fx, 'rupiah', k.budget);
    const cut = was > 0 ? Math.round((1 - k.budget / price(s, KEL.anggaranPerYear)) * 100) : 0;
    fx.push({ kind: 'notice', title: t('sim.anggaranTitle'), body: t('sim.anggaranBody', { amt: k.budget, cut }), tone: cut > 0 ? 'bad' : 'good' });
  }
  const m = s.month % 12;
  if (m === 11) {
    const short = Math.max(0, k.budget - spentThisYear(s));
    const rush = Math.min(Math.floor(s.res.rupiah), Math.round((short * RUSH_SHARE) / 1000) * 1000);
    if (rush > 0) {
      gain(s, fx, 'rupiah', -rush);
      s.stats.spent += rush;
      fx.push({ kind: 'notice', title: t('sim.rushTitle'), body: t('sim.rushBody', { amt: rush }), tone: 'info' });
    }
  }
  if (m === HARVEST_MONTH) {
    for (const a of activeCombos(s)) {
      if (a.combo.id !== 'panenRaya') continue;
      gain(s, fx, 'rupiah', price(s, PANEN_BONUS), a.members[0]);
      fx.push({ kind: 'notice', title: t('sim.panenTitle'), body: t('sim.panenBody', { amt: price(s, PANEN_BONUS) }), tone: 'good', x: a.members[0].x, y: a.members[0].y });
    }
  }
  k.serapanRun = serapan(s) >= SERAPAN_TARGET ? k.serapanRun + 1 : 0;
}
