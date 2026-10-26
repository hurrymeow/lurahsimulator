import { t } from '../i18n';
import { WACANA, WACANA_COST, WACANA_COST_CAP, WACANA_COST_STEP, WACANA_DECAY, WACANA_FATIGUE, WACANA_FATIGUE_FLOOR, WACANA_POWER, WACANA_SABAR_PER_POWER } from '../data/wacana';
import { EMAS } from '../data/ranking';
import { rupiah } from '../format';
import { addEmas } from './ranking';
import { gain, type Fx } from './gain';
import { price } from './state';
import type { CheckResult, GameState, ResourceId } from './types';

/** Rises with each repeat of the same policy. */
export const wacanaCost = (s: GameState, id?: string) => {
  const times = s.wacana.find((x) => x.id === id)?.times ?? 0;
  return price(s, WACANA_COST * (1 + Math.min(WACANA_COST_CAP, times * WACANA_COST_STEP)));
};

export function checkAnnounce(s: GameState, id: string): CheckResult {
  const cost = wacanaCost(s, id);
  if (!WACANA.some((w) => w.id === id)) return { ok: false, missing: [t('sim.unknownWacana')] };
  return s.res.rupiah >= cost ? { ok: true } : { ok: false, missing: [t('sim.konsumsi', { amt: rupiah(cost - s.res.rupiah), cost: rupiah(cost) })] };
}

export function announce(s: GameState, id: string): CheckResult {
  const check = checkAnnounce(s, id);
  if (!check.ok) return check;
  const cost = wacanaCost(s, id);
  s.res.rupiah -= cost;
  s.stats.spent += cost;
  let w = s.wacana.find((x) => x.id === id);
  if (!w) s.wacana.push((w = { id, power: 0, times: 0, lastAnnounced: s.month }));
  w.power = WACANA_POWER * Math.max(WACANA_FATIGUE_FLOOR, 1 - WACANA_FATIGUE * w.times);
  w.times++;
  addEmas(s, EMAS.perWacana);
  w.lastAnnounced = s.month;
  return check;
}

export function wacanaSystem(s: GameState, fx: Fx): void {
  const site = s.buildings.find((b) => b.def === 'kantorRT');
  for (const w of s.wacana) {
    gain(s, fx, 'sabar', w.power * WACANA_SABAR_PER_POWER, site);
    const side = WACANA.find((x) => x.id === w.id)?.side ?? {};
    for (const [res, v] of Object.entries(side) as [ResourceId, number][]) gain(s, fx, res, v * (w.power / WACANA_POWER) * (res === 'rupiah' ? s.inflation : 1));
    w.power *= WACANA_DECAY;
    if (w.power < 0.5) w.power = 0;
  }
}
