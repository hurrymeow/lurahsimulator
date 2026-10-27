import { eModLabel, eOutcome, eResult, t } from '../i18n';
import { BANJIR_HIT_CHANCE, BANJIR_MAX_PROTECT, BANJIR_PROTECT_PER_LEVEL, BANJIR_SABAR, EVENTS, POPUP_CHANCE, MIN_REPEAT_GAP, POPUP_GAP, REPAIR_FRACTION, eventDef, type EventChoice, type EventDef, type EventOutcome as OutcomeDef } from '../data/events';
import { STAGE_EVENTS } from '../data/higher';
import { rupiah } from '../format';
import { activeCombos } from './combos';
import { def, isCover } from './content';
import { gateOpen } from './gate';
import { banjirCut, wacanaNoReceipt } from './kel';
import type { StageEventChoice } from '../data/higher';
import { gain, type Fx } from './gain';
import { VIRAL_REPAIR_AT } from './projects';
import { IURAN } from './balance';
import { chance, rand } from './rng';
import { population, price } from './state';
import { buildingIncome, buildingUpkeep } from './tick';
import type { Building, CheckResult, GameState, Resources } from './types';

/** What the kampung nets in a month: building income less upkeep, plus iuran. Prices that follow it never fall behind the economy. */
export function monthlyNet(s: GameState): number {
  return s.buildings.reduce((n, b) => n + buildingIncome(s, b) - buildingUpkeep(s, b), population(s) * IURAN);
}

/** Rupiah worth `months` of net income, floored at a small base so a poor kampung still sees a number. */
export function incomeShare(s: GameState, months: number): number {
  return Math.round((months * Math.max(monthlyNet(s), price(s, 500_000))) / 1000) * 1000;
}

export function eventCost(s: GameState, c: EventChoice): { rupiah: number; orangDalam: number } {
  const base = c.cost?.rupiah ? price(s, c.cost.rupiah) : 0;
  const scaled = c.cost?.incomeMonths ? incomeShare(s, c.cost.incomeMonths) : 0;
  return { rupiah: Math.max(base, scaled), orangDalam: c.cost?.orangDalam ?? 0 };
}

export function checkChoice(s: GameState, c: EventChoice): CheckResult {
  const cost = eventCost(s, c);
  const missing: string[] = [];
  if (cost.rupiah > 0 && s.res.rupiah < cost.rupiah) missing.push(t('sim.moneyGap', { amt: rupiah(cost.rupiah - s.res.rupiah), cost: rupiah(cost.rupiah) }));
  if (cost.orangDalam > 0 && s.res.orangDalam < cost.orangDalam) missing.push(t('sim.needODn', { n: cost.orangDalam, have: Math.floor(s.res.orangDalam) }));
  return missing.length ? { ok: false, missing } : { ok: true };
}

export function banjirProtection(s: GameState): number {
  const levels = s.buildings.filter((b) => b.def === 'biopori' && b.status === 'active').reduce((n, b) => n + b.level, 0);
  const combos = activeCombos(s).reduce((n, a) => n + (a.combo.banjirProtect ?? 0), 0);
  // Kerja Bakti makes the biopori work harder for a while.
  const boost = s.modifiers.filter((m) => m.target === 'biopori').reduce((m, x) => m * x.incomeMult, 1);
  return Math.min(BANJIR_MAX_PROTECT, levels * BANJIR_PROTECT_PER_LEVEL * boost + combos + banjirCut(s));
}

/** Lapangan doubles the 17 Agustus prize. Panjat Pinang adds half again. */
export function agustusMult(s: GameState): number {
  let m = s.buildings.some((b) => b.def === 'lapangan' && b.status === 'active') ? 2 : 1;
  for (const a of activeCombos(s)) m *= a.combo.agustusMult ?? 1;
  return m;
}

function eligible(s: GameState, e: EventDef): boolean {
  const w = e.when;
  if (w.chance <= 0) return false;
  if (w.minMonth !== undefined && s.month < w.minMonth) return false;
  if (w.minStars !== undefined && s.stage.stars.rt < w.minStars) return false;
  if (w.months && !w.months.includes(s.month % 12)) return false;
  if (w.needs && !s.buildings.some((b) => b.def === w.needs && b.status === 'active')) return false;
  const last = s.lastEvent?.[e.id];
  const gap = w.chance < 1 ? Math.max(w.cooldown ?? 0, MIN_REPEAT_GAP) : (w.cooldown ?? 0);
  return !(gap && last !== undefined && s.month - last < gap);
}

function raise(s: GameState, fx: Fx, e: EventDef): void {
  s.pendingEvent = e.id;
  (s.lastEvent ??= {})[e.id] = s.month;
  s.lastNovelty = s.month;
  fx.push({ kind: 'event', eventId: e.id });
}

/** Months since the last random popup. Scheduled events (chance 1) and inspections do not count. */
function sinceRandomPopup(s: GameState): number {
  const times = Object.entries(s.lastEvent ?? {})
    .filter(([id]) => {
      const c = eventDef(id)?.when.chance ?? 0;
      return c > 0 && c < 1;
    })
    .map(([, m]) => m);
  return times.length ? s.month - Math.max(...times) : Infinity;
}

/**
 * Monthly system: maybe raise an event. At most one per month.
 * Scheduled events (chance 1) always come. Random ones share a pool: at most one popup every POPUP_GAP months,
 * picked by weight, so a longer list adds variety and not more interruptions.
 */
export function eventSystem(s: GameState, fx: Fx): void {
  if (s.pendingEvent) return;
  const all = [...EVENTS, ...STAGE_EVENTS.filter((x) => gateOpen(s, x.gate))].filter((e) => eligible(s, e));
  const scheduled = all.find((e) => e.when.chance >= 1);
  if (scheduled) return raise(s, fx, scheduled);
  const pool = all.filter((e) => e.when.chance < 1);
  if (!pool.length || sinceRandomPopup(s) < POPUP_GAP || !chance(s, POPUP_CHANCE)) return;
  let roll = rand(s) * pool.reduce((n, e) => n + e.when.chance, 0);
  for (const e of pool) {
    roll -= e.when.chance;
    if (roll <= 0) return raise(s, fx, e);
  }
  raise(s, fx, pool[pool.length - 1]);
}

export interface EventOutcome {
  ok: boolean;
  text: string;
  missing?: string[];
  /** Net change per resource, costs included. */
  delta?: Partial<Resources>;
  /** Timed income modifier the choice started. */
  modifier?: { label: string; incomeMult: number; months: number };
}

function floodDamage(s: GameState, fx: Fx): string {
  const protect = banjirProtection(s);
  const sabarHit = Math.round(BANJIR_SABAR * (1 - protect));
  gain(s, fx, 'sabar', -sabarHit);
  const targets = s.buildings.filter((b) => b.status === 'active' && b.def !== 'rumah' && b.def !== 'parkir' && b.def !== 'biopori' && !isCover(def(b.def)));
  let hit = 0;
  for (const b of targets) {
    if (s.month < 12 && hit >= 1) break;
    if (chance(s, BANJIR_HIT_CHANCE * (1 - protect))) {
      b.status = 'damaged';
      hit++;
      fx.push({ kind: 'pop', x: b.x, y: b.y, res: 'sabar', amount: -1 });
    }
  }
  const pct = Math.round(protect * 100);
  if (!hit) return t('sim.floodHeld', { pct, sabar: sabarHit });
  return t(hit > 1 ? 'sim.floodN' : 'sim.flood1', { n: hit, pct, sabar: sabarHit, at: VIRAL_REPAIR_AT });
}

/** A signed rupiah change worth `months` of net income. */
function payout(s: GameState, months: number): void {
  const amt = incomeShare(s, months);
  s.res.rupiah += amt;
  if (amt > 0) s.stats.earned += amt;
}

function rollOutcome(s: GameState, list: OutcomeDef[]): OutcomeDef {
  let roll = rand(s) * list.reduce((n, o) => n + o.weight, 0);
  for (const o of list) {
    roll -= o.weight;
    if (roll <= 0) return o;
  }
  return list[list.length - 1];
}

function applyOutcome(s: GameState, o: OutcomeDef): void {
  if (o.incomePct) payout(s, o.incomePct);
  for (const [k, v] of Object.entries(o.res ?? {})) s.res[k as 'sabar'] += v as number;
}

export function resolveEvent(s: GameState, fx: Fx, choiceIdx: number): EventOutcome {
  const e = s.pendingEvent ? eventDef(s.pendingEvent) : undefined;
  const c = e?.choices[choiceIdx];
  if (!e || !c) return { ok: false, text: t('sim.noEvent') };
  const check = checkChoice(s, c);
  if (!check.ok) return { ok: false, text: t('sim.cantAfford'), missing: check.missing };
  const before = { ...s.res };
  const cost = eventCost(s, c);
  s.res.rupiah -= cost.rupiah;
  s.stats.spent += cost.rupiah;
  s.res.orangDalam -= cost.orangDalam;
  if (c.incomePct) payout(s, c.incomePct);
  // Advice: the outcome is rolled now and revealed in the result popup.
  const rolled = c.outcomes ? rollOutcome(s, c.outcomes) : undefined;
  if (rolled) applyOutcome(s, rolled);
  for (const [k, v] of Object.entries(c.res ?? {})) s.res[k as 'sabar'] += e.id === 'agustusan' && (v as number) > 0 ? Math.round((v as number) * agustusMult(s)) : (v as number);
  if (c.inspectPrep && s.inspection) s.inspection.prep += c.inspectPrep;
  const efx = (c as StageEventChoice).fx;
  if (efx?.letterMult) s.rw.letterMult = { mult: efx.letterMult, until: s.month + (efx.months ?? 1) };
  if (efx?.lombaScoreMult) s.kel.lomba = { mult: efx.lombaScoreMult, until: s.month + (efx.months ?? 1) };
  if (efx?.cleanAudit) s.kel.cleanAudits += efx.cleanAudit;
  if (efx?.sabarPerWacanaNoReceipt) {
    const bare = wacanaNoReceipt(s);
    s.res.sabar -= bare * efx.sabarPerWacanaNoReceipt;
    // Showing everything counts as clean only when nothing is missing.
    if (!bare) s.kel.cleanAudits++;
  }
  if (efx?.popReportPct) s.rw.popReport = { pct: efx.popReportPct, until: s.month + (efx.months ?? 1) };
  if (c.modifier) s.modifiers.push({ id: `${e.id}-${s.month}`, label: eModLabel(e, choiceIdx, c.modifier.label), target: c.modifier.target, incomeMult: c.modifier.incomeMult, monthsLeft: c.modifier.months });
  const text = c.special === 'banjir' ? floodDamage(s, fx) : rolled ? eOutcome(e, choiceIdx, c.outcomes!.indexOf(rolled), rolled) : eResult(e, choiceIdx, c);
  s.pendingEvent = null;
  const delta: Partial<Resources> = {};
  for (const k of Object.keys(before) as (keyof Resources)[]) if (s.res[k] !== before[k]) delta[k] = s.res[k] - before[k];
  const mod = c.modifier && { label: eModLabel(e, choiceIdx, c.modifier.label), incomeMult: c.modifier.incomeMult, months: c.modifier.months };
  return { ok: true, text, delta, modifier: mod };
}

export function repairCost(s: GameState, b: Building): number {
  return s.res.viral >= VIRAL_REPAIR_AT ? 0 : price(s, def(b.def).cost * REPAIR_FRACTION);
}

export function checkRepair(s: GameState, b: Building): CheckResult {
  if (b.status !== 'damaged') return { ok: false, missing: [t('sim.notDamaged')] };
  const cost = repairCost(s, b);
  if (s.res.rupiah >= cost) return { ok: true };
  return { ok: false, missing: [t('sim.repairGap', { amt: rupiah(cost - s.res.rupiah), cost: rupiah(cost), at: VIRAL_REPAIR_AT, have: Math.floor(s.res.viral) })] };
}

export function repair(s: GameState, b: Building): CheckResult {
  const check = checkRepair(s, b);
  if (!check.ok) return check;
  const cost = repairCost(s, b);
  s.res.rupiah -= cost;
  s.stats.spent += cost;
  b.status = 'active';
  return check;
}

