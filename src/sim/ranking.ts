import { t } from '../i18n';
import { LOSE, RIVAL_BASE, RIVAL_JITTER, RIVAL_NAME, RIVAL_PER_YEAR, SCORE, WIN } from '../data/ranking';
import { def } from './content';
import { gain, type Fx } from './gain';
import { randInt } from './rng';
import { isWorking, population } from './state';
import type { GameState } from './types';

export function score(s: GameState): number {
  const working = s.buildings.filter((b) => isWorking(b) && b.def !== 'rumah' && b.def !== 'parkir' && !def(b.def).pathIncome).length;
  return Math.round(
    population(s) * SCORE.perResident + working * SCORE.perBuilding + s.discovered.length * SCORE.perCombo + s.res.sabar * SCORE.perSabar + s.emas * SCORE.perEmas,
  );
}

export function addEmas(s: GameState, amount: number): void {
  s.emas = Math.max(0, s.emas + amount);
}

/** Runs at each year end. Win: Sabar, Orang Dalam and a sliver of Emas. Lose: a little Sabar. */
export function yearlyRanking(s: GameState, fx: Fx, year: number): void {
  const us = score(s);
  const them = RIVAL_BASE + RIVAL_PER_YEAR * year + randInt(s, -RIVAL_JITTER, RIVAL_JITTER);
  const won = us > them;
  s.ranking.push({ year, us, them, won });
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

