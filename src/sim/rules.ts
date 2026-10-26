import { bBlock, bName, t } from '../i18n';
import { rupiah } from '../format';
import { REFUND } from './balance';
import { def, hasDef } from './content';
import { addBuilding, buildCost, buildingAt, count, inBounds, population, upgradeCost, year } from './state';
import type { Building, BuildingDef, CheckResult, GameState } from './types';

const result = (missing: string[]): CheckResult => (missing.length ? { ok: false, missing } : { ok: true });

function moneyGap(s: GameState, cost: number, missing: string[]): void {
  if (s.res.rupiah < cost) missing.push(t('sim.moneyGap', { amt: rupiah(cost - s.res.rupiah), cost: rupiah(cost) }));
}

/** Requirements that do not depend on the tile. Every miss says exactly what is missing. */
export function requirementGaps(s: GameState, d: BuildingDef, opts: { ignoreLimit?: boolean } = {}): string[] {
  const missing: string[] = [];
  const r = d.requires;
  if (r?.population && population(s) < r.population) missing.push(t('sim.needPop', { n: r.population, have: population(s) }));
  for (const id of r?.buildings ?? []) if (count(s, id, true) === 0) missing.push(t('sim.needBuilding', { name: bName(def(id)) }));
  if (r?.year && year(s) < r.year) missing.push(t('sim.unlocksYear', { n: r.year }));
  if (!opts.ignoreLimit && d.maxCount && count(s, d.id) >= d.maxCount) missing.push(t('sim.limit', { n: d.maxCount }));
  return missing;
}

export function checkPlace(s: GameState, id: string, x: number, y: number): CheckResult {
  if (!hasDef(id)) return { ok: false, missing: [t('sim.unknownBuilding')] };
  const d = def(id);
  const missing: string[] = [];
  if (!d.placeable) missing.push(t('sim.cannotPlace', { name: bName(d) }));
  missing.push(...requirementGaps(s, d));
  if (!inBounds(x, y)) missing.push(t('sim.offMap'));
  else if (buildingAt(s, x, y)) missing.push(t('sim.tileHas', { name: bName(def(buildingAt(s, x, y)!.def)) }));
  moneyGap(s, buildCost(s, d), missing);
  return result(missing);
}

export function place(s: GameState, id: string, x: number, y: number): CheckResult & { uid?: number } {
  const check = checkPlace(s, id, x, y);
  if (!check.ok) return check;
  const d = def(id);
  const cost = buildCost(s, d);
  s.res.rupiah -= cost;
  s.stats.spent += cost;
  const instant = d.permitMonths <= 0 && d.buildMonths <= 0;
  const b = addBuilding(s, id, x, y, instant ? 'active' : d.permitMonths > 0 ? 'permit' : 'building', cost);
  b.timer = instant ? 0 : d.permitMonths > 0 ? d.permitMonths : Math.max(1, d.buildMonths);
  return { ok: true, uid: b.uid };
}

export function checkUpgrade(s: GameState, b: Building): CheckResult {
  const d = def(b.def);
  const missing: string[] = [];
  if (b.status !== 'active') missing.push(t('sim.mustWork', { status: t(`status.${b.status}`) }));
  if (b.level >= d.maxLevel) missing.push(t('sim.maxLevel', { n: d.maxLevel }));
  else moneyGap(s, upgradeCost(s, b), missing);
  return result(missing);
}

export function upgrade(s: GameState, b: Building): CheckResult {
  const check = checkUpgrade(s, b);
  if (!check.ok) return check;
  const cost = upgradeCost(s, b);
  s.res.rupiah -= cost;
  s.stats.spent += cost;
  b.invested += cost;
  b.level++;
  return check;
}

export function checkDemolish(s: GameState, b: Building): CheckResult {
  const d = def(b.def);
  if (!d.removable) return { ok: false, missing: [bBlock(d) ?? t('sim.cannotRemove', { name: bName(d) })] };
  void s;
  return { ok: true };
}

export function demolish(s: GameState, b: Building): CheckResult & { refund?: number } {
  const check = checkDemolish(s, b);
  if (!check.ok) return check;
  const refund = Math.round((b.invested * REFUND) / 1000) * 1000;
  s.res.rupiah += refund;
  s.buildings = s.buildings.filter((o) => o.uid !== b.uid);
  return { ok: true, refund };
}

/** Orang Dalam skips the permit queue entirely. */
export function checkSkipPermit(s: GameState, b: Building): CheckResult {
  const missing: string[] = [];
  if (b.status !== 'permit') missing.push(t('sim.notWaiting'));
  if (s.res.orangDalam < 1) missing.push(t('sim.needOD', { have: Math.floor(s.res.orangDalam) }));
  return result(missing);
}

export function skipPermit(s: GameState, b: Building): CheckResult {
  const check = checkSkipPermit(s, b);
  if (!check.ok) return check;
  s.res.orangDalam -= 1;
  b.status = 'building';
  b.timer = Math.max(1, def(b.def).buildMonths);
  return check;
}
