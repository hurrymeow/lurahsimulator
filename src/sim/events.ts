import { eModLabel, eResult, t } from '../i18n';
import { BANJIR_HIT_CHANCE, BANJIR_MAX_PROTECT, BANJIR_PROTECT_PER_LEVEL, BANJIR_SABAR, EVENTS, REPAIR_FRACTION, eventDef, type EventChoice } from '../data/events';
import { rupiah } from '../format';
import { def } from './content';
import { gain, type Fx } from './gain';
import { VIRAL_REPAIR_AT } from './projects';
import { chance } from './rng';
import { price } from './state';
import type { Building, CheckResult, GameState, Resources } from './types';

export function eventCost(s: GameState, c: EventChoice): { rupiah: number; orangDalam: number } {
  return { rupiah: c.cost?.rupiah ? price(s, c.cost.rupiah) : 0, orangDalam: c.cost?.orangDalam ?? 0 };
}

export function checkChoice(s: GameState, c: EventChoice): CheckResult {
  const cost = eventCost(s, c);
  const missing: string[] = [];
  if (cost.rupiah > 0 && s.res.rupiah < cost.rupiah) missing.push(t('sim.moneyGap', { amt: rupiah(cost.rupiah - s.res.rupiah), cost: rupiah(cost.rupiah) }));
  if (cost.orangDalam > 0 && s.res.orangDalam < cost.orangDalam) missing.push(t('sim.needODn', { n: cost.orangDalam, have: Math.floor(s.res.orangDalam) }));
  return missing.length ? { ok: false, missing } : { ok: true };
}

export function banjirProtection(s: GameState): number {
  const levels = s.buildings.filter((b) => b.def === 'selokan' && b.status === 'active').reduce((n, b) => n + b.level, 0);
  return Math.min(BANJIR_MAX_PROTECT, levels * BANJIR_PROTECT_PER_LEVEL);
}

/** Monthly system: maybe raise an event. At most one per month. */
export function eventSystem(s: GameState, fx: Fx): void {
  if (s.pendingEvent) return;
  const m = s.month % 12;
  for (const e of EVENTS) {
    const w = e.when;
    if (w.chance <= 0) continue;
    if (w.minMonth !== undefined && s.month < w.minMonth) continue;
    if (w.months && !w.months.includes(m)) continue;
    const last = s.lastEvent?.[e.id];
    if (w.cooldown && last !== undefined && s.month - last < w.cooldown) continue;
    if (!chance(s, w.chance)) continue;
    s.pendingEvent = e.id;
    (s.lastEvent ??= {})[e.id] = s.month;
    s.lastNovelty = s.month;
    fx.push({ kind: 'event', eventId: e.id });
    return;
  }
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
  const targets = s.buildings.filter((b) => b.status === 'active' && b.def !== 'rumah' && b.def !== 'parkir' && b.def !== 'selokan');
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
  for (const [k, v] of Object.entries(c.res ?? {})) s.res[k as 'sabar'] += v as number;
  if (c.inspectPrep && s.inspection) s.inspection.prep += c.inspectPrep;
  if (c.modifier) s.modifiers.push({ id: `${e.id}-${s.month}`, label: eModLabel(e, choiceIdx, c.modifier.label), target: c.modifier.target, incomeMult: c.modifier.incomeMult, monthsLeft: c.modifier.months });
  const text = c.special === 'banjir' ? floodDamage(s, fx) : eResult(e, choiceIdx, c);
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

