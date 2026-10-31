// Lomba Agustusan: prep from May, the day on 17 Agustus. The player picks contests, a stage and a ketua panitia;
// on the day the climb and the sack race are short mini-games, the rest are decided by the odds.
import { t, type Key } from '../i18n';
import { CONTESTS, LOMBA, STAGES_17, type ContestDef } from '../data/lomba';
import { agustusMult } from './events';
import { WEEKS_PER_MONTH, WEEKS_PER_YEAR, weekOfYear, yearsDone } from './calendar';
import { gain, type Fx } from './gain';
import { meters } from './needs';
import { chance } from './rng';
import { isWorking, price } from './state';
import { inemHeadlined } from './staff';
import type { GameState, LombaState, Staff } from './types';

export const contestDef = (id: string): ContestDef => CONTESTS.find((c) => c.id === id)!;
const year = (s: GameState) => yearsDone(s.month);

/** This year's lomba while it can still be prepared: from the panitia's card until the day. */
export function lombaPrep(s: GameState): LombaState | null {
  const l = s.lomba;
  return l && l.year === year(s) && !l.held && !l.due ? l : null;
}

/** Weeks until 17 Agustus. */
export const weeksToDay = (s: GameState): number => (LOMBA.dayWeek - weekOfYear(s.month) + WEEKS_PER_YEAR) % WEEKS_PER_YEAR;

/** The ketua panitia: the staff member the player named, still on staff. */
export function ketua(s: GameState): Staff | undefined {
  const id = s.lomba?.ketua;
  return id === undefined ? undefined : s.staff?.find((x) => x.id === id);
}
const stat = (s: GameState, k: 'rajin' | 'gaul') => ketua(s)?.stats[k] ?? 0;

/** Climb: how tall the green band is, as a share of the pole's bar. A Rajin ketua widens it. */
export const climbBand = (s: GameState): number => Math.min(0.45, LOMBA.climbBand + stat(s, 'rajin') * LOMBA.climbPerRajin);
/** Sack race: taps needed in the time. A Gaul ketua brings a louder crowd, so fewer. */
export const mashTaps = (s: GameState): number => Math.max(12, Math.round(LOMBA.mashTaps - stat(s, 'gaul') * LOMBA.mashPerGaul));
/** A contest decided on the day: luck, the ketua's Gaul and how safe the kampung feels. */
export const rollChance = (s: GameState): number =>
  Math.min(0.9, LOMBA.rollBase + stat(s, 'gaul') * LOMBA.rollPerGaul + meters(s).aman * LOMBA.rollPerAman);

/** Turnout: Popularitas brings people, the stage keeps them. Every prize is multiplied by it. */
export const turnout = (s: GameState): number =>
  (LOMBA.turnoutBase + s.res.sabar * LOMBA.turnoutPerSabar) * STAGES_17[s.lomba?.stage ?? 0].turnout;

export function checkContest(s: GameState, id: string): string | null {
  const l = lombaPrep(s);
  const c = contestDef(id);
  if (!l) return t('lomba.closed');
  if (l.contests.includes(id)) return null;
  if (l.contests.length >= LOMBA.maxContests) return t('lomba.full', { n: LOMBA.maxContests });
  if (c.needs && !s.buildings.some((b) => b.def === c.needs && isWorking(b))) return t('lomba.needs', { name: cNeed(c) });
  if (s.res.rupiah < price(s, c.cost)) return t('lomba.money', { amt: price(s, c.cost) - Math.floor(s.res.rupiah) });
  return null;
}

/** The name of the building a contest needs, for the reason line. */
export const cNeed = (c: ContestDef): string => (c.needs ? t(`lomba.need.${c.needs}` as Key) : '');

/** Picks a contest (paying for it), or drops it again (getting the money back): the day has not come yet. */
export function toggleContest(s: GameState, id: string): string | null {
  const l = lombaPrep(s);
  if (!l) return t('lomba.closed');
  const cost = price(s, contestDef(id).cost);
  if (l.contests.includes(id)) {
    l.contests = l.contests.filter((c) => c !== id);
    s.res.rupiah += cost;
    s.stats.spent -= cost;
    return null;
  }
  const why = checkContest(s, id);
  if (why) return why;
  l.contests.push(id);
  s.res.rupiah -= cost;
  s.stats.spent += cost;
  return null;
}

/** Sets the stage, paying the difference (or getting it back for a smaller one). */
export function setStage(s: GameState, level: number): string | null {
  const l = lombaPrep(s);
  if (!l || !STAGES_17[level]) return t('lomba.closed');
  const diff = price(s, STAGES_17[level].cost) - price(s, STAGES_17[l.stage].cost);
  if (diff > 0 && s.res.rupiah < diff) return t('lomba.money', { amt: diff - Math.floor(s.res.rupiah) });
  s.res.rupiah -= diff;
  s.stats.spent += diff;
  l.stage = level;
  return null;
}

export function setKetua(s: GameState, staffId: number | undefined): void {
  const l = lombaPrep(s);
  if (l) l.ketua = staffId;
}

/** Month by month: the panitia forms in May; on 17 Agustus the day begins, or a skipped lomba costs Popularitas. */
export function lombaSystem(s: GameState, fx: Fx): void {
  const wk = weekOfYear(s.month);
  if (wk === LOMBA.announceWeek && s.month + (LOMBA.dayWeek - LOMBA.announceWeek) >= LOMBA.fromMonth && s.lomba?.year !== year(s)) {
    s.lomba = { year: year(s), contests: [], stage: 0 };
    fx.push({ kind: 'notice', title: t('lomba.announceTitle'), body: t('lomba.announceBody', { n: LOMBA.dayWeek - LOMBA.announceWeek }), tone: 'info', card: true, open: 'lomba' });
    return;
  }
  const l = s.lomba;
  if (wk !== LOMBA.dayWeek || !l || l.year !== year(s) || l.held || l.due) return;
  if (l.contests.length) {
    // The day itself: time stops until the player has played it through.
    l.due = true;
    return;
  }
  l.held = true;
  gain(s, fx, 'sabar', -LOMBA.skipSabar, s.buildings.find((b) => b.def === 'kantorRT'));
  fx.push({ kind: 'notice', title: t('lomba.skipTitle'), body: t('lomba.skipBody', { n: LOMBA.skipSabar }), tone: 'bad', card: true });
}

/** A contest decided by the odds, rolled once when the day reaches it. */
export const rollContest = (s: GameState): boolean => chance(s, rollChance(s));

export interface LombaResult {
  wins: string[];
  viral: number;
  sabar: number;
  rupiah: number;
  ricuh: boolean;
  trophy: boolean;
  inem: boolean;
}

/** The day is over: prizes for every win, scaled by turnout and the 17 Agustus combos. */
export function finishLomba(s: GameState, won: Record<string, boolean>, fx: Fx): LombaResult {
  const l = s.lomba!;
  const k = turnout(s) * agustusMult(s);
  const wins = l.contests.filter((id) => won[id]);
  const sum = (key: 'viral' | 'sabar' | 'rupiah') => wins.reduce((n, id) => n + contestDef(id).prize[key], 0) * k;
  const res: LombaResult = {
    wins,
    viral: Math.round(sum('viral')),
    sabar: Math.round(sum('sabar')),
    rupiah: price(s, Math.round(sum('rupiah') / 1000) * 1000),
    ricuh: meters(s).aman < LOMBA.ricuhBelowAman,
    trophy: wins.length >= 2 && wins.length === l.contests.length,
    inem: !!STAGES_17[l.stage].inem,
  };
  const hq = s.buildings.find((b) => b.def === 'kantorRT');
  gain(s, fx, 'viral', res.viral, hq);
  gain(s, fx, 'sabar', res.sabar - (res.ricuh ? LOMBA.ricuhSabar : 0), hq);
  gain(s, fx, 'rupiah', res.rupiah, hq);
  if (res.trophy) s.pialaUntil = s.month + LOMBA.trophyMonths;
  // The crowd stays a while: shops earn more for two months after any win.
  if (wins.length) s.modifiers.push({ id: 'lombaCrowd', label: t('lomba.crowd'), target: '*', incomeMult: LOMBA.crowdMult, monthsLeft: LOMBA.crowdMonths });
  if (res.inem) inemHeadlined(s, fx);
  l.held = true;
  l.due = false;
  l.result = res;
  return res;
}

/** The trophy stands by the Kantor RT for a year after a clean sweep. */
/** July and August (weeks 24 to 31) once the lomba has started: the kampung puts up bunting and umbul-umbul. */
export const agustusan = (s: GameState): boolean => s.month + 1 >= LOMBA.fromMonth && weeksToDay(s) < 2 * WEEKS_PER_MONTH;

export const showTrophy = (s: GameState): boolean => (s.pialaUntil ?? -1) > s.month;
