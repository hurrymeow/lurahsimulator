import { bName, t } from '../i18n';
import { rupiah } from '../format';
import { def, stageFx } from './content';
import { studiBanding } from './kel';
import { gain, type Fx } from './gain';
import { chance } from './rng';
import { EMAS } from '../data/ranking';
import { addEmas } from './ranking';
import { addBuilding, buildCost, emptyTiles } from './state';
import type { Building, CheckResult, GameState } from './types';

export const MANGKRAK_AT = '80%';
/** Year 1 is protected: no project freezes. */
const MANGKRAK_FROM_MONTH = 12;
export const VIRAL_REPAIR_AT = 30;
export const MANGKRAK_SABAR = 1;
export const MANGKRAK_SABAR_CAP = 3;

/** Called when a building finishes construction. Maybe freezes it, maybe spawns a parkir. */
export function onBuildingFinished(s: GameState, fx: Fx, b: Building): 'ok' | 'mangkrak' {
  const d = def(b.def);
  if (d.mangkrakChance && !b.restarted && s.month >= MANGKRAK_FROM_MONTH && chance(s, d.mangkrakChance)) {
    b.status = 'mangkrak';
    b.timer = 0;
    addEmas(s, EMAS.perMangkrak);
    fx.push({
      kind: 'notice',
      title: t('sim.mangkrakTitle', { name: bName(d), at: MANGKRAK_AT }),
      body: t('sim.mangkrakBody', { at: MANGKRAK_AT, viral: VIRAL_REPAIR_AT, sabar: MANGKRAK_SABAR }),
      tone: 'bad',
      x: b.x,
      y: b.y,
    });
    return 'mangkrak';
  }
  if (stageFx(d)?.randomWacana) studiBanding(s, fx, b);
  if (d.shop) for (let i = 0; i < (stageFx(d)?.spawns?.count ?? 1); i++) spawnParkir(s, fx, b);
  return 'ok';
}

function spawnParkir(s: GameState, fx: Fx, shop: Building): void {
  const empty = emptyTiles(s);
  if (!empty.length) return;
  const next = empty.filter((t) => Math.abs(t.x - shop.x) <= 1 && Math.abs(t.y - shop.y) <= 1);
  const spot = (next.length ? next : empty).sort((a, b) => Math.abs(a.x - shop.x) + Math.abs(a.y - shop.y) - (Math.abs(b.x - shop.x) + Math.abs(b.y - shop.y)))[0];
  const p = addBuilding(s, 'parkir', spot.x, spot.y, 'active');
  p.owner = shop.uid;
  fx.push({ kind: 'built', uid: p.uid });
  fx.push({
    kind: 'notice',
    title: t('sim.parkirTitle'),
    body: t('sim.parkirBody', { name: bName(def(shop.def)) }),
    tone: 'bad',
    x: p.x,
    y: p.y,
  });
}

export function restartCost(s: GameState, b: Building): number {
  const base = buildCost(s, def(b.def));
  return s.res.viral >= VIRAL_REPAIR_AT ? base : base * 2;
}

/** Calling in a favour restarts a frozen project for this many Orang Inside, no money. */
export const RESTART_ODN = 2;

export function checkRestartODn(s: GameState, b: Building): CheckResult {
  if (b.status !== 'mangkrak') return { ok: false, missing: [t('sim.notFrozen')] };
  if (s.res.orangDalam >= RESTART_ODN) return { ok: true };
  return { ok: false, missing: [t('sim.needODn', { n: RESTART_ODN, have: Math.floor(s.res.orangDalam) })] };
}

export function checkRestart(s: GameState, b: Building): CheckResult {
  if (b.status !== 'mangkrak') return { ok: false, missing: [t('sim.notFrozen')] };
  const cost = restartCost(s, b);
  if (s.res.rupiah >= cost) return { ok: true };
  return { ok: false, missing: [t('sim.restartGap', { amt: rupiah(cost - s.res.rupiah), cost: rupiah(cost) })] };
}

export function restart(s: GameState, b: Building, withODn = false): CheckResult {
  const check = withODn ? checkRestartODn(s, b) : checkRestart(s, b);
  if (!check.ok) return check;
  if (withODn) s.res.orangDalam -= RESTART_ODN;
  else {
    const cost = restartCost(s, b);
    s.res.rupiah -= cost;
    s.stats.spent += cost;
    b.invested += cost;
  }
  b.status = 'building';
  b.timer = 1;
  b.restarted = true;
  addEmas(s, EMAS.perRestart);
  return check;
}

/** Frozen projects are an eyesore and cost Sabar every month. */
export function mangkrakSystem(s: GameState, fx: Fx): void {
  // Capped, so a pile of abandoned projects hurts but never snowballs.
  const frozen = s.buildings.filter((b) => b.status === 'mangkrak').slice(0, MANGKRAK_SABAR_CAP);
  for (const b of frozen) gain(s, fx, 'sabar', -MANGKRAK_SABAR, b);
}

