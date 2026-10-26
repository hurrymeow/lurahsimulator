import { STAGES } from '../data/stages';
import { t, type Key } from '../i18n';
import { population } from './state';
import type { GameState, Goal, StageDef, StageId, Stars } from './types';

export function stageDef(id: StageId): StageDef {
  const d = STAGES.find((x) => x.id === id);
  if (!d) throw new Error(`Unknown stage ${id}`);
  return d;
}

export const currentStage = (s: GameState): StageDef => stageDef(s.stage.current);
export const starsOf = (s: GameState, id: StageId = s.stage.current): Stars => s.stage.stars[id];

export interface GoalProgress {
  have: number;
  need: number;
}

/** One check per goal kind. The mapped type makes a missing kind a compile error. */
const GOAL_CHECKS: { [K in Goal['kind']]: (s: GameState, g: Extract<Goal, { kind: K }>) => number } = {
  residents: (s) => population(s),
  combos: (s) => s.discovered.length,
  rankWins: (s) => s.ranking.filter((r) => r.won).length,
  winStreak: (s) => {
    let n = 0;
    for (let i = s.ranking.length - 1; i >= 0 && s.ranking[i].won; i--) n++;
    return n;
  },
  sabar: (s) => Math.floor(s.res.sabar),
};

const GOAL_KEYS: Record<Goal['kind'], Key> = {
  residents: 'stage.goal.residents',
  combos: 'stage.goal.combos',
  rankWins: 'stage.goal.rankWins',
  winStreak: 'stage.goal.winStreak',
  sabar: 'stage.goal.sabar',
};

export function goalProgress(s: GameState, g: Goal): GoalProgress {
  const check = GOAL_CHECKS[g.kind] as (s: GameState, g: Goal) => number;
  return { have: check(s, g), need: g.n };
}

export interface ChecklistLine {
  goal: Goal;
  done: boolean;
  /** Says exactly what is missing, for example "25 residents (have 18)". */
  text: string;
}

/** The checklist for the next star, or null at 3 stars. */
export function nextStarChecklist(s: GameState, id: StageId = s.stage.current): ChecklistLine[] | null {
  const stars = starsOf(s, id);
  if (stars === 3) return null;
  return stageDef(id).stars[stars].goals.map((goal) => {
    const { have, need } = goalProgress(s, goal);
    return { goal, done: have >= need, text: t(GOAL_KEYS[goal.kind], { n: need, have }) };
  });
}

export const starsEarnable = (s: GameState, id: StageId = s.stage.current): boolean => nextStarChecklist(s, id)?.every((l) => l.done) ?? false;
