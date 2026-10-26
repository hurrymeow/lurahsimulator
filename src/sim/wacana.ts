import { t } from '../i18n';
import { WACANA, WACANA_COST, WACANA_DECAY, WACANA_POWER, WACANA_SABAR_PER_POWER } from '../data/wacana';
import { EMAS } from '../data/ranking';
import { rupiah } from '../format';
import { addEmas } from './ranking';
import { gain, type Fx } from './gain';
import { price } from './state';
import type { CheckResult, GameState } from './types';

export const wacanaCost = (s: GameState) => price(s, WACANA_COST);

export function checkAnnounce(s: GameState, id: string): CheckResult {
  const cost = wacanaCost(s);
  if (!WACANA.some((w) => w.id === id)) return { ok: false, missing: [t('sim.unknownWacana')] };
  return s.res.rupiah >= cost ? { ok: true } : { ok: false, missing: [t('sim.konsumsi', { amt: rupiah(cost - s.res.rupiah), cost: rupiah(cost) })] };
}

export function announce(s: GameState, id: string): CheckResult {
  const check = checkAnnounce(s, id);
  if (!check.ok) return check;
  s.res.rupiah -= wacanaCost(s);
  s.stats.spent += wacanaCost(s);
  let w = s.wacana.find((x) => x.id === id);
  if (!w) s.wacana.push((w = { id, power: 0, times: 0, lastAnnounced: s.month }));
  w.power = WACANA_POWER;
  w.times++;
  addEmas(s, EMAS.perWacana);
  w.lastAnnounced = s.month;
  return check;
}

export function wacanaSystem(s: GameState, fx: Fx): void {
  const site = s.buildings.find((b) => b.def === 'kantorRT');
  for (const w of s.wacana) {
    gain(s, fx, 'sabar', w.power * WACANA_SABAR_PER_POWER, site);
    w.power *= WACANA_DECAY;
    if (w.power < 0.5) w.power = 0;
  }
}
