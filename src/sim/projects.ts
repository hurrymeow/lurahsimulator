import { rupiah } from '../format';
import { def } from './content';
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
      title: `${d.name} mangkrak at ${MANGKRAK_AT}`,
      body: `The funds ran out at ${MANGKRAK_AT}. Restart costs double, or normal price once Viral reaches ${VIRAL_REPAIR_AT}. It drains ${MANGKRAK_SABAR} Sabar a month.`,
      tone: 'bad',
      x: b.x,
      y: b.y,
    });
    return 'mangkrak';
  }
  if (d.shop) spawnParkir(s, fx, b);
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
    title: 'A tukang parkir appeared',
    body: `Beside the new ${def(shop.def).name}. He pays retribusi to the kas and costs Sabar. Cannot be removed, only upgraded.`,
    tone: 'bad',
    x: p.x,
    y: p.y,
  });
}

export function restartCost(s: GameState, b: Building): number {
  const base = buildCost(s, def(b.def));
  return s.res.viral >= VIRAL_REPAIR_AT ? base : base * 2;
}

export function checkRestart(s: GameState, b: Building): CheckResult {
  if (b.status !== 'mangkrak') return { ok: false, missing: ['Not frozen'] };
  const cost = restartCost(s, b);
  if (s.res.rupiah >= cost) return { ok: true };
  return { ok: false, missing: [`Need ${rupiah(cost - s.res.rupiah)} more (restart costs ${rupiah(cost)})`] };
}

export function restart(s: GameState, b: Building): CheckResult {
  const check = checkRestart(s, b);
  if (!check.ok) return check;
  const cost = restartCost(s, b);
  s.res.rupiah -= cost;
  s.stats.spent += cost;
  b.invested += cost;
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

