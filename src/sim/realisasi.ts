import { rEffect, rName, t } from '../i18n';
import { rupiah } from '../format';
import { REALISASI, realisasiDef, type RealisasiDef } from '../data/realisasi';
import { gain, type Fx } from './gain';
import { price } from './state';
import type { CheckResult, GameState } from './types';

/** Programs working this month. */
export const liveRealisasi = (s: GameState): RealisasiDef[] =>
  (s.realisasi ?? []).filter((r) => r.landsAt <= s.month && s.month < r.endsAt).map((r) => realisasiDef(r.id)).filter((d): d is RealisasiDef => !!d);

/** True while a program is paid for and has not ended, so it cannot be bought twice at once. */
export const runningRealisasi = (s: GameState, id: string): boolean => (s.realisasi ?? []).some((r) => r.id === id && s.month < r.endsAt);

/** Total of one effect across the programs working now. */
export const realisasiSum = (s: GameState, key: 'kerja' | 'aman' | 'perutCover' | 'viral' | 'repairs'): number => liveRealisasi(s).reduce((n, d) => n + (d[key] ?? 0), 0);

/** A lasting program's banjir protection counts once it has landed, for good. */
export const realisasiBanjir = (s: GameState): number =>
  (s.realisasi ?? []).filter((r) => r.landsAt <= s.month).reduce((n, r) => n + (realisasiDef(r.id)?.banjirProtect ?? 0), 0);

export const realisasiWarungMult = (s: GameState): number => liveRealisasi(s).reduce((m, d) => m * (d.warungMult ?? 1), 1);

export const realisasiCost = (s: GameState, d: RealisasiDef): number => price(s, d.cost);

/** Programs carried out so far, for the Laporan. */
export const realisasiDone = (s: GameState): number => (s.realisasi ?? []).filter((r) => r.landsAt <= s.month).length;

export function checkRealisasi(s: GameState, id: string): CheckResult {
  const d = realisasiDef(id);
  if (!d) return { ok: false, missing: [t('sim.unknownWacana')] };
  if (runningRealisasi(s, id)) return { ok: false, missing: [t('real.running')] };
  const cost = realisasiCost(s, d);
  return s.res.rupiah >= cost ? { ok: true } : { ok: false, missing: [t('sim.moneyGap', { amt: rupiah(cost - s.res.rupiah), cost: rupiah(cost) })] };
}

export function startRealisasi(s: GameState, id: string): CheckResult {
  const check = checkRealisasi(s, id);
  if (!check.ok) return check;
  const d = realisasiDef(id)!;
  const cost = realisasiCost(s, d);
  s.res.rupiah -= cost;
  s.stats.spent += cost;
  s.realisasi ??= [];
  const landsAt = s.month + d.delay;
  s.realisasi.push({ id, landsAt, endsAt: d.lasts ? landsAt + d.lasts : Infinity });
  return check;
}

/** Monthly: landing notices, Virality, and repairs from the programs working now. */
export function realisasiSystem(s: GameState, fx: Fx): void {
  for (const r of s.realisasi ?? []) {
    const d = realisasiDef(r.id);
    if (d && r.landsAt === s.month) fx.push({ kind: 'notice', title: t('real.landedTitle', { name: rName(d) }), body: rEffect(d), tone: 'good' });
  }
  const viral = realisasiSum(s, 'viral');
  if (viral) gain(s, fx, 'viral', viral);
  let fixes = realisasiSum(s, 'repairs');
  for (const b of s.buildings) {
    if (fixes <= 0) break;
    if (b.status !== 'damaged') continue;
    b.status = 'active';
    fixes--;
  }
}

export { REALISASI };
