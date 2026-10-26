// The RW stage's rules: building effects, Kader and Calo upkeep, and the timed effects events start.
import { t } from '../i18n';
import { SCORE } from '../data/ranking';
import { activeCombos } from './combos';
import { allDefs, def, stageFx } from './content';
import { gain, type Fx } from './gain';
import { chance } from './rng';
import { isWorking, price } from './state';
import type { Building, GameState } from './types';

/** Share of Kader output lost a year without an Apresiasi. */
export const KADER_DECAY_PER_YEAR = 0.2;
export const KADER_DECAY_MAX = 0.8;
const active = (s: GameState, id: string): Building[] => s.buildings.filter((b) => b.def === id && isWorking(b));

/** True in the month a Pasar Kaget pays its burst. */
export function isBurstMonth(s: GameState, b: Building): boolean {
  const burst = stageFx(def(b.def))?.burst;
  return !!burst && s.month % burst.every === burst.every - 1;
}

/** Multiplier on a building's income from its own burst. */
export function burstMult(s: GameState, b: Building): number {
  return isBurstMonth(s, b) ? stageFx(def(b.def))!.burst!.mult : 1;
}

/** Ojol income multiplier. Portals count once, however many stand. A Jalan Ditutup month zeroes it. */
export function ojolMult(s: GameState): number {
  let m = 1;
  for (const d of allDefs()) {
    const v = stageFx(d)?.ojolIncomeMult;
    if (v !== undefined && s.buildings.some((b) => b.def === d.id && isWorking(b))) m = Math.min(m, v);
  }
  const closed = activeCombos(s).some((a) => a.combo.id === 'jalanDitutup' && a.members.some((b) => isBurstMonth(s, b)));
  return closed ? 0 : m;
}

/** Surat Pengantar multiplier while Musim Pindahan lasts. */
export const letterMult = (s: GameState): number => (s.rw.letterMult && s.month < s.rw.letterMult.until ? s.rw.letterMult.mult : 1);

/** Percent added to the reported population while a Pendataan report stands. */
export const popReportPct = (s: GameState): number => (s.rw.popReport && s.month < s.rw.popReport.until ? s.rw.popReport.pct : 0);

/** Score the player's RT gains from a padded population report. */
export const popReportBonus = (s: GameState, population: number): number => Math.round((population * popReportPct(s) * SCORE.perResident) / 100);

/** Share of Kader output left. */
export const kaderOutput = (s: GameState): number => 1 - s.rw.kaderDecay;

/** Monthly: Posyandu and Gapura. Everything that needs the calendar or a neighbour. */
export function rwSystem(s: GameState, fx: Fx): void {
  if (s.stage.current === 'rt') return;
  for (const d of allDefs()) {
    const e = stageFx(d);
    if (!e) continue;
    for (const b of active(s, d.id)) {
      for (const [res, v] of Object.entries(e.neighbourRt ?? {})) gain(s, fx, res as 'sabar', (v as number) * b.level, b);
      if (e.seasonal && s.month % 12 === e.seasonal.month) {
        for (const [res, v] of Object.entries(e.seasonal.res)) gain(s, fx, res as 'viral', v as number, b);
        const cost = price(s, e.seasonal.cost);
        gain(s, fx, 'rupiah', -cost, b);
        s.stats.spent += cost;
        fx.push({ kind: 'notice', title: t('sim.gapuraTitle'), body: t('sim.gapuraBody', { viral: e.seasonal.res.viral ?? 0, amt: cost }), tone: 'info', x: b.x, y: b.y });
      }
    }
  }
}

/** Yearly: the Kader are paid an Apresiasi if the kas allows, otherwise their output falls. */
export function rwYearEnd(s: GameState, fx: Fx): void {
  const kader = s.residents.filter((r) => r.job === 'kaderPosyandu').length;
  if (!kader) return;
  const amt = price(s, 300_000) * kader;
  if (s.res.rupiah >= amt) {
    gain(s, fx, 'rupiah', -amt);
    s.stats.spent += amt;
    s.rw.kaderDecay = 0;
    fx.push({ kind: 'notice', title: t('sim.kaderPaidTitle'), body: t('sim.kaderPaidBody', { amt }), tone: 'info' });
  } else {
    s.rw.kaderDecay = Math.min(KADER_DECAY_MAX, s.rw.kaderDecay + KADER_DECAY_PER_YEAR);
    fx.push({ kind: 'notice', title: t('sim.kaderLapseTitle'), body: t('sim.kaderLapseBody', { pct: Math.round(kaderOutput(s) * 100) }), tone: 'bad' });
  }
}

/** A Calo turns Rupiah into a stamp. Returns true if a scandal ended the job. */
export function caloMonth(s: GameState, fx: Fx, name: string, site: Building | undefined, job: { converts: { rupiah: number; stempel?: number; orangDalam?: number }; scandal?: { chance: number; sabar: number } }): boolean {
  const cost = price(s, -job.converts.rupiah);
  if (s.res.rupiah >= cost) {
    gain(s, fx, 'rupiah', -cost, site);
    s.stats.spent += cost;
    // The stamp clears a waiting letter first, and otherwise sits in stock.
    const stamps = job.converts.stempel ?? 0;
    const cleared = Math.min(stamps, s.stempel.backlog);
    s.stempel.backlog -= cleared;
    s.stempel.stock += stamps - cleared;
    if (job.converts.orangDalam) gain(s, fx, 'orangDalam', job.converts.orangDalam);
  }
  if (job.scandal && chance(s, job.scandal.chance)) {
    gain(s, fx, 'sabar', -job.scandal.sabar, site);
    fx.push({ kind: 'notice', title: t('sim.caloTitle', { name }), body: t('sim.caloBody', { sabar: job.scandal.sabar }), tone: 'bad', x: site?.x, y: site?.y });
    return true;
  }
  return false;
}
