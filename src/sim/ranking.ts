import { t } from '../i18n';
import { LOSE, RIVAL_BASE, RIVAL_JITTER, RIVAL_NAMES, RIVAL_PER_YEAR, RIVAL_GROWTH_QUARTERS, RIVAL_SCALE, RIVAL_START, RIVAL_TRACK, SCORE, WIN } from '../data/ranking';
import { def, isCover } from './content';
import { gain, type Fx } from './gain';
import { viewOf } from './neighbourView';
import { lombaMult } from './kel';
import { popReportBonus } from './rw';
import { randInt } from './rng';
import { isWorking, population } from './state';
import { WACANA_POWER } from '../data/wacana';
import { liveRealisasi, realisasiDone } from './realisasi';
import type { GameState } from './types';

/** The points the player's programs add: each wacana by its current approval, each working Realisasi, each one carried out for good. */
export function programScore(s: GameState): number {
  return SCORE.perWacana * s.wacana.reduce((n, w) => n + w.power / WACANA_POWER, 0) + SCORE.perRealisasiLive * liveRealisasi(s).length + SCORE.perRealisasiDone * realisasiDone(s);
}

/** The parts of a score, for screens that explain it: what residents, working buildings, combos, Popularitas and programs add. */
export function scoreParts(s: GameState): { residents: number; buildings: number; combos: number; sabar: number; programs: number; total: number } {
  const working = s.buildings.filter((b) => isWorking(b) && b.def !== 'rumah' && b.def !== 'parkir' && !isCover(def(b.def))).length;
  const parts = {
    residents: Math.round(population(s) * SCORE.perResident),
    buildings: Math.round(working * SCORE.perBuilding),
    combos: Math.round(s.discovered.length * SCORE.perCombo),
    sabar: Math.round(s.res.sabar * SCORE.perSabar),
    programs: Math.round(programScore(s)),
  };
  return { ...parts, total: score(s) };
}

export function score(s: GameState): number {
  const working = s.buildings.filter((b) => isWorking(b) && b.def !== 'rumah' && b.def !== 'parkir' && !isCover(def(b.def))).length;
  return Math.round(
    population(s) * SCORE.perResident + working * SCORE.perBuilding + s.discovered.length * SCORE.perCombo + s.res.sabar * SCORE.perSabar + s.emas * SCORE.perEmas + programScore(s),
  );
}

/** The score of the whole area being ranked: the player's RT plus every AI RT in it. RTs the player runs are already in the player's score. */
export const areaScore = (s: GameState): number => Math.round((score(s) + popReportBonus(s, population(s)) + s.neighbours.reduce((sum, n) => sum + (n.run === 'player' ? 0 : score(viewOf(s, n))), 0)) * lombaMult(s));

export function addEmas(s: GameState, amount: number): void {
  s.emas = Math.max(0, s.emas + amount);
}

/** The quarter the rival's score is set by: the calendar at the RT; from the RW on, the quarters spent in the stage, up to RIVAL_GROWTH_QUARTERS. */
export function rivalYear(s: GameState, year: number): number {
  const stage = s.stage.current;
  if (stage === 'rt') return year;
  return RIVAL_START[stage] + Math.min(RIVAL_GROWTH_QUARTERS, s.ranking.filter((r) => (r.tier ?? 'rt') === stage).length + 1);
}

/** Runs at each year end. Win: Sabar, Orang Dalam and a sliver of Emas. Lose: a little Sabar. */
export function yearlyRanking(s: GameState, fx: Fx, year: number): void {
  const stage = s.stage.current;
  const RIVAL_NAME = RIVAL_NAMES[stage];
  const us = areaScore(s);
  let them = Math.round((RIVAL_BASE + RIVAL_PER_YEAR * rivalYear(s, year) + randInt(s, -RIVAL_JITTER, RIVAL_JITTER)) * RIVAL_SCALE[stage]);
  // From the RW on the rival follows the player's last score in the stage, so a strong kampung is still chased.
  if (stage !== 'rt') {
    const prev = s.ranking.filter((r) => r.tier === stage).at(-1);
    if (prev) them = Math.max(them, Math.round(prev.us * RIVAL_TRACK));
  }
  const won = us > them;
  s.ranking.push({ tier: stage, year, us, them, won });
  const hq = s.buildings.find((b) => b.def === 'kantorRT');
  if (won) {
    gain(s, fx, 'sabar', WIN.sabar, hq);
    gain(s, fx, 'orangDalam', WIN.orangDalam);
    addEmas(s, WIN.emas);
    fx.push({ kind: 'notice', title: t('sim.rankWinTitle', { year, rival: RIVAL_NAME }), body: t('sim.rankWinBody', { us, them, sabar: WIN.sabar, od: WIN.orangDalam, emas: WIN.emas }), tone: 'good', fanfare: true });
  } else {
    gain(s, fx, 'sabar', LOSE.sabar, hq);
    fx.push({ kind: 'notice', title: t('sim.rankLoseTitle', { year, rival: RIVAL_NAME }), body: t('sim.rankLoseBody', { us, them, sabar: LOSE.sabar }), tone: 'bad' });
  }
  s.lastNovelty = s.month;
}

