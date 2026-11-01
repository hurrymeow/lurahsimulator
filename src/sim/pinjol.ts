// Pinjol and judol, the first Act 2 pressure (docs/plans/kecamatan-slice.md). They exist only in the Kecamatan stage.
// Households are groups of three residents (householdGroups). A household is in debt when any member has `debt`,
// and on judol when any member has `judol`.
import { JUDOL, PINJOL } from '../data/higher/kecamatan';
import { t } from '../i18n';
import { def, stageFx } from './content';
import type { Fx } from './gain';
import { isWorking } from './state';
import { debtHouseholds, fedBase, householdGroups, households, judolHouseholds } from './needs';
import { chance } from './rng';
import { realisasiSum } from './realisasi';
import type { GameState, Resident } from './types';

/** True only in the Kecamatan stage, once the state exists. Act 1 saves never run any of this. */
export const pinjolOn = (s: GameState): boolean => s.stage.current === 'kecamatan' && !!s.kec;

const pct = (n: number, of: number): number => (of ? Math.round((n / of) * 100) : 0);

/** Share of households in debt, 0 to 100. */
export const pinjolShare = (s: GameState): number => pct(debtHouseholds(s), households(s));
/** Share of households on judol, 0 to 100. */
export const judolShare = (s: GameState): number => pct(judolHouseholds(s), households(s));

/** Chance a week that a household starts on judol, from Viral and from the Baliho standing. */
export const judolStartChance = (viral: number, balihos = 0): number => Math.floor(Math.max(0, viral - JUDOL.viralFloor) / JUDOL.viralStep) * JUDOL.perStep + balihos * JUDOL.balihoStart;

/** Idle warga retrained this week by the Balai Latihan Kerja standing. */
const retrained = (s: GameState): number => s.buildings.reduce((n, b) => n + (isWorking(b) ? stageFx(def(b.def))?.retrain ?? 0 : 0), 0);

const working = (s: GameState, id: string): number => s.buildings.filter((b) => b.def === id && isWorking(b)).length;

/** Share of shop income judol takes: the cut times the share of households on it. 0 outside the Kecamatan. */
export const judolIncomeCut = (s: GameState): number => (pinjolOn(s) ? JUDOL.incomeCut * (judolHouseholds(s) / Math.max(1, households(s))) : 0);

const idleLong = (g: Resident[]): boolean => g.some((r) => (r.idle ?? 0) >= PINJOL.idleWeeks);

/** Weekly. Judol starts and quits, households borrow and repay, and the debt collector calls on long debts. */
export function pinjolSystem(s: GameState, fx: Fx): void {
  if (!pinjolOn(s)) return;
  const kec = s.kec!;
  const groups = householdGroups(s);
  // The last households in the order go hungry first when the kampung is short of food.
  const unfedFrom = Math.min(groups.length, fedBase(s));
  // Literasi Keuangan stops a share of new cases, of both kinds, while it works.
  const literasi = Math.max(0, 1 - realisasiSum(s, 'pinjolCut'));
  const startJudol = judolStartChance(s.res.viral, working(s, 'baliho')) * literasi;
  // A Koperasi Simpan Pinjam makes a fair loan easy to find. Two at most count.
  const borrow = PINJOL.borrow * literasi * (1 - PINJOL.koperasiCut * Math.min(2, working(s, 'koperasiSP')));
  // A Balai Latihan Kerja retrains the longest-idle warga, so their idle time starts again.
  const idlers = s.residents.filter((r) => r.job === 'none' && !r.preman && r.staffId === undefined && (r.idle ?? 0) > 0).sort((a, b) => (b.idle ?? 0) - (a.idle ?? 0));
  for (let i = 0; i < retrained(s) && i < idlers.length; i++) idlers[i].idle = 0;
  groups.forEach((g, i) => {
    const onJudol = g.some((r) => r.judol);
    if (onJudol) {
      if (chance(s, JUDOL.quit)) for (const r of g) delete r.judol;
    } else if (startJudol > 0 && chance(s, startJudol)) g[0].judol = true;

    const debtor = g.find((r) => r.debt !== undefined);
    const hungry = i >= unfedFrom || idleLong(g);
    if (debtor) {
      for (const r of g) if (r.debt !== undefined) r.debt++;
      if (debtor.debt === PINJOL.collectAfter) {
        (kec.hits ??= []).push(s.month + PINJOL.collectorWeeks);
        fx.push({ kind: 'notice', title: t('pinjol.collectorTitle'), body: t('pinjol.collectorBody', { aman: PINJOL.collectorAman, weeks: PINJOL.collectorWeeks }), tone: 'bad' });
      }
      if (!hungry && chance(s, PINJOL.repay)) for (const r of g) delete r.debt;
    } else if (hungry && chance(s, borrow * (onJudol ? JUDOL.borrowMult : 1))) g[0].debt = 0;
  });
  kec.hits = (kec.hits ?? []).filter((until) => until > s.month);
  kec.pinjol = pinjolShare(s);
}
