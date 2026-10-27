import { bBlock, bName, t } from '../i18n';
import { rupiah } from '../format';
import { REFUND } from './balance';
import { lotAt } from './area';
import { def, gateOf, hasDef } from './content';
import { gateOpen } from './gate';
import { neighbourAt } from './grow';
import { stageTitle } from './stages';
import { FLAT, refreshAccess } from './access';
import { addBuilding, buildCost, count, covers, footprintOf, housing, inBounds, population, tilesOf, upgradeCost, year } from './state';
import type { Building, BuildingDef, CheckResult, GameState } from './types';

export { gateOpen };

const result = (missing: string[]): CheckResult => (missing.length ? { ok: false, missing } : { ok: true });

function moneyGap(s: GameState, cost: number, missing: string[]): void {
  if (s.res.rupiah < cost) missing.push(t('sim.moneyGap', { amt: rupiah(cost - s.res.rupiah), cost: rupiah(cost) }));
}

/** Requirements that do not depend on the tile. Every miss says exactly what is missing. */
export function requirementGaps(s: GameState, d: BuildingDef, opts: { ignoreLimit?: boolean } = {}): string[] {
  const missing: string[] = [];
  const r = d.requires;
  if (r?.population && population(s) < r.population) missing.push(t('sim.needPop', { n: r.population, have: population(s) }));
  if (r?.stars && s.stage.stars[r.stars.stage] < r.stars.n) missing.push(t('sim.needStars', { title: stageTitle(r.stars.stage, r.stars.n), n: r.stars.n }));
  for (const id of r?.buildings ?? []) if (count(s, id, true) === 0) missing.push(t('sim.needBuilding', { name: bName(def(id)) }));
  const gate = gateOf(d);
  if (gate && !gateOpen(s, gate)) missing.push(t('sim.needStars', { title: stageTitle(gate.stage, gate.stars), n: gate.stars }));
  if (r?.year && year(s) < r.year) missing.push(t('sim.unlocksYear', { n: r.year }));
  if (!opts.ignoreLimit && d.maxCount && count(s, d.id) >= d.maxCount) missing.push(t('sim.limit', { n: d.maxCount }));
  if (!opts.ignoreLimit && d.orangDalamCost && s.res.orangDalam < d.orangDalamCost) missing.push(t('sim.needODn', { n: d.orangDalamCost, have: Math.floor(s.res.orangDalam) }));
  return missing;
}

/** A building stands on a jalan setapak and replaces it. Flat pieces (paths, plots, drains) never do. */
const overwritesPath = (d: BuildingDef) => !FLAT.has(d.id);
const pathUnder = (o: Building, d: BuildingDef) => o.def === 'jalan' && overwritesPath(d);

/** Drops the plain paths a building is about to cover. */
function clearPaths(s: GameState, d: BuildingDef, x: number, y: number, ignore?: number): void {
  const tiles = footprintOf(d.id) === 1 ? [{ x, y }] : tilesOf({ def: d.id, x, y });
  s.buildings = s.buildings.filter((o) => o.uid === ignore || !(pathUnder(o, d) && tiles.some((p) => covers(o, p.x, p.y))));
}

/** What is wrong with standing a building on this spot: off the map, in the way, or on the wrong lot. `ignore` is a building that is moving, so it never blocks itself. */
export function siteGaps(s: GameState, d: BuildingDef, x: number, y: number, ignore?: number): string[] {
  const missing: string[] = [];
  const tiles = footprintOf(d.id) === 1 ? [{ x, y }] : tilesOf({ def: d.id, x, y });
  const off = tiles.find((p) => !inBounds(p.x, p.y));
  const hit = off ? undefined : tiles.map((p) => s.buildings.find((o) => o.uid !== ignore && !pathUnder(o, d) && covers(o, p.x, p.y)) ?? neighbourAt(s, p.x, p.y)).find(Boolean);
  const lots = off ? [] : tiles.map((p) => lotAt(p.x, p.y));
  if (off) missing.push(t('sim.offMap'));
  else if (hit) missing.push(t('sim.tileHas', { name: bName(def(hit.def)) }));
  else if (lots.includes('other')) missing.push(t('sim.notYours'));
  else if (lots.some((l) => l !== (d.scope ?? 'rt'))) missing.push(t(d.scope && d.scope !== 'rt' ? 'sim.needLot' : 'sim.needRtLot'));
  return missing;
}

export function checkPlace(s: GameState, id: string, x: number, y: number): CheckResult {
  if (!hasDef(id)) return { ok: false, missing: [t('sim.unknownBuilding')] };
  const d = def(id);
  const missing: string[] = [];
  if (!d.placeable) missing.push(t('sim.cannotPlace', { name: bName(d) }));
  missing.push(...requirementGaps(s, d));
  missing.push(...siteGaps(s, d, x, y));
  moneyGap(s, buildCost(s, d), missing);
  return result(missing);
}

export function place(s: GameState, id: string, x: number, y: number): CheckResult & { uid?: number } {
  const check = checkPlace(s, id, x, y);
  if (!check.ok) return check;
  const d = def(id);
  const cost = buildCost(s, d);
  s.res.rupiah -= cost;
  s.res.orangDalam -= d.orangDalamCost ?? 0;
  s.stats.spent += cost;
  const instant = d.permitMonths <= 0 && d.buildMonths <= 0;
  clearPaths(s, d, x, y);
  const b = addBuilding(s, id, x, y, instant ? 'active' : d.permitMonths > 0 ? 'permit' : 'building', cost);
  b.timer = instant ? 0 : d.permitMonths > 0 ? d.permitMonths : Math.max(1, d.buildMonths);
  refreshAccess(s);
  return { ok: true, uid: b.uid };
}

export function checkUpgrade(s: GameState, b: Building): CheckResult {
  const d = def(b.def);
  const missing: string[] = [];
  if (b.status !== 'active') missing.push(t('sim.mustWork', { status: t(`status.${b.status}`) }));
  if (b.level >= d.maxLevel) missing.push(t('sim.maxLevel', { n: d.maxLevel }));
  else {
    const need = d.upgradeStars?.[b.level + 1];
    if (need && s.stage.stars.rt < need) missing.push(t('sim.needStars', { title: stageTitle('rt', need), n: need }));
    moneyGap(s, upgradeCost(s, b), missing);
  }
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
  // Housing cannot be removed from under the people living in it.
  if (d.housing && housing(s) - d.housing < population(s)) return { ok: false, missing: [t('sim.houseFull')] };
  return { ok: true };
}

export function demolish(s: GameState, b: Building): CheckResult & { refund?: number } {
  const check = checkDemolish(s, b);
  if (!check.ok) return check;
  const refund = Math.round((b.invested * REFUND) / 1000) * 1000;
  s.res.rupiah += refund;
  s.buildings = s.buildings.filter((o) => o.uid !== b.uid);
  refreshAccess(s);
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

/** Moving is free. The building keeps its level, status and timers. */
export function checkMove(s: GameState, b: Building, x: number, y: number): CheckResult {
  return result(siteGaps(s, def(b.def), x, y, b.uid));
}

export function moveBuilding(s: GameState, b: Building, x: number, y: number): CheckResult {
  const check = checkMove(s, b, x, y);
  if (!check.ok) return check;
  clearPaths(s, def(b.def), x, y, b.uid);
  b.x = x;
  b.y = y;
  refreshAccess(s);
  return check;
}

/** Turns a building to face the other way. Free, and it changes nothing but the picture. */
export function rotateBuilding(b: Building): void {
  b.rot = b.rot ? 0 : 1;
}
