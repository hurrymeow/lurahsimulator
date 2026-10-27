// Jalan Setapak decay. Paths crack at random, a crack stops being road, and a stretch left alone
// slowly spreads into the paths beside it. Fix it with Rupiah, tile by tile or all at once, or call
// in a favour with Orang Dalam.
import { rupiah } from '../format';
import { t } from '../i18n';
import { PATH_DECAY } from './balance';
import type { Fx } from './gain';
import { price } from './state';
import type { Building, CheckResult, GameState } from './types';

const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];

export const isPath = (b: Building) => b.def === 'jalan';
export const isCracked = (b: Building) => isPath(b) && b.status === 'damaged';

/**
 * A 0..1 roll from the seed, month and building, so path decay never draws from the shared RNG and
 * every other system rolls exactly what it rolled before paths could crack.
 */
function roll(s: GameState, uid: number, salt: number): number {
  let h = Math.imul(s.seed ^ (s.month * 0x9e3779b1) ^ (uid * 0x85ebca6b) ^ (salt * 0xc2b2ae35), 0x27d4eb2f);
  h ^= h >>> 15;
  h = Math.imul(h, 0x165667b1);
  h ^= h >>> 13;
  return (h >>> 0) / 4294967296;
}

function pathMap(s: GameState): Map<string, Building> {
  const m = new Map<string, Building>();
  for (const b of s.buildings) if (isPath(b)) m.set(`${b.x},${b.y}`, b);
  return m;
}

/** The cracked tiles joined to this one, side by side. One stretch is fixed as one job. */
export function stretchOf(s: GameState, b: Building, paths = pathMap(s)): Building[] {
  if (!isCracked(b)) return [];
  const out = [b];
  const seen = new Set([b.uid]);
  for (let i = 0; i < out.length; i++)
    for (const [dx, dy] of DIRS) {
      const o = paths.get(`${out[i].x + dx},${out[i].y + dy}`);
      if (o && isCracked(o) && !seen.has(o.uid)) {
        seen.add(o.uid);
        out.push(o);
      }
    }
  return out;
}

/** Months the oldest crack in a stretch has gone unrepaired. */
export const neglect = (s: GameState, stretch: Building[]) => s.month - Math.min(...stretch.map((b) => b.crackedAt ?? s.month));

function crack(s: GameState, b: Building): void {
  b.status = 'damaged';
  b.crackedAt = s.month;
}

/** Monthly: new cracks, then every neglected stretch spreads on its six-month mark. */
export function pathDecaySystem(s: GameState, fx: Fx): void {
  // A path damaged some other way (a flood) starts its neglect clock now.
  for (const b of s.buildings) if (isCracked(b)) b.crackedAt ??= s.month;
  if (s.month <= PATH_DECAY.safeMonths) return;
  const paths = pathMap(s);
  const fresh = s.buildings.filter((b) => isPath(b) && b.status === 'active' && roll(s, b.uid, 1) < PATH_DECAY.crackChance);
  // Find every stretch before anything changes, so a tile that cracks by spreading is not visited
  // again and spread twice in one month, and a new crack never spreads in its first month.
  const done = new Set<number>();
  const stretches: Building[][] = [];
  for (const b of s.buildings) {
    if (!isCracked(b) || done.has(b.uid)) continue;
    const stretch = stretchOf(s, b, paths);
    for (const o of stretch) done.add(o.uid);
    stretches.push(stretch);
  }
  let spread: Building | null = null;
  for (const stretch of stretches) {
    const age = neglect(s, stretch);
    if (age <= 0 || age % PATH_DECAY.spreadEvery) continue;
    const grow = Math.max(1, Math.round(stretch.length * PATH_DECAY.spreadRate));
    const edge = new Map<number, Building>();
    for (const c of stretch)
      for (const [dx, dy] of DIRS) {
        const o = paths.get(`${c.x + dx},${c.y + dy}`);
        if (o && o.status === 'active') edge.set(o.uid, o);
      }
    const next = [...edge.values()].sort((a, z) => roll(s, a.uid, 2) - roll(s, z.uid, 2)).slice(0, grow);
    for (const o of next) {
      o.status = 'damaged';
      // It joins the old stretch, so the stretch keeps the oldest crack's clock.
      o.crackedAt = Math.min(...stretch.map((c) => c.crackedAt ?? s.month));
      spread ??= o;
    }
  }
  for (const b of fresh) crack(s, b);
  // One message a month at most, so a big network never floods the log.
  const at = fresh[0] ?? spread;
  if (at) fx.push({ kind: 'notice', title: t(fresh.length ? 'decay.crackTitle' : 'decay.spreadTitle'), body: t(fresh.length ? 'decay.crackBody' : 'decay.spreadBody', { every: PATH_DECAY.spreadEvery }), tone: 'bad', x: at.x, y: at.y });
}

/** Rupiah to fix one cracked tile now. */
export const tileRepairCost = (s: GameState) => price(s, PATH_DECAY.repairPerTile);

export type RepairWay = 'tile' | 'stretch' | 'favour';

export function repairPathCost(s: GameState, b: Building, way: RepairWay): number {
  if (way === 'favour') return 0;
  return tileRepairCost(s) * (way === 'tile' ? 1 : stretchOf(s, b).length);
}

export function checkRepairPath(s: GameState, b: Building, way: RepairWay): CheckResult {
  if (!isCracked(b)) return { ok: false, missing: [t('sim.notDamaged')] };
  if (way === 'favour') return s.res.orangDalam >= PATH_DECAY.favour ? { ok: true } : { ok: false, missing: [t('sim.needODn', { n: PATH_DECAY.favour, have: Math.floor(s.res.orangDalam) })] };
  const cost = repairPathCost(s, b, way);
  return s.res.rupiah >= cost ? { ok: true } : { ok: false, missing: [t('sim.moneyGap', { amt: rupiah(cost - s.res.rupiah), cost: rupiah(cost) })] };
}

/** Fixes one tile, or its whole stretch. Returns the tiles fixed. */
export function repairPath(s: GameState, b: Building, way: RepairWay): Building[] {
  if (!checkRepairPath(s, b, way).ok) return [];
  const tiles = way === 'tile' ? [b] : stretchOf(s, b);
  if (way === 'favour') s.res.orangDalam -= PATH_DECAY.favour;
  else {
    const cost = repairPathCost(s, b, way);
    s.res.rupiah -= cost;
    s.stats.spent += cost;
  }
  for (const o of tiles) {
    o.status = 'active';
    delete o.crackedAt;
  }
  return tiles;
}
