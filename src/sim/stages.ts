import { RW_COMBOS } from '../data/higher/rw';
import { rwOf } from './area';
import { promote } from './grow';
import { STAGES } from '../data/stages';
import { bName, t, tr, type Key } from '../i18n';
import { def } from './content';
import { gain, type Fx } from './gain';
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

const pending = (): number => 0;

/** Stars of every RW on a Kelurahan map. Yours is the one you earned. An AI RW is as good as its weakest RT. */
function rwStars(s: GameState): number[] {
  const out = new Map<string, number>([['0,0', s.stage.stars.rw]]);
  for (const n of s.neighbours) {
    const { rx, ry } = rwOf(n.cx, n.cy);
    const key = `${rx},${ry}`;
    if (key !== '0,0') out.set(key, Math.min(out.get(key) ?? 3, n.stars));
  }
  return [...out.values()];
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
  rwCombos: (s) => s.discovered.filter((id) => RW_COMBOS.some((c) => c.id === id)).length,
  // These read state the stage engine adds (AI RTs, Stempel, Anggaran, Tim Audit). Until it
  // lands the stages are unreachable, so they count nothing.
  fundedRts: (s) => s.neighbours.filter((n) => n.everFunded).length,
  stempelClear: (s) => s.stempel.clear,
  rtsAtStars: (s, g) => [s.stage.stars.rt, ...s.neighbours.map((n) => n.stars)].filter((x) => x >= g.stars).length,
  rwsAtStars: (s, g) => rwStars(s).filter((x) => x >= g.stars).length,
  tierWins: (s, g) => s.ranking.filter((r) => r.won && (r.tier ?? 'rt') === g.tier).length,
  noDebtMonths: (s) => s.debtFree,
  serapanMonths: pending,
  cleanAudits: pending,
};

const GOAL_KEYS: Record<Goal['kind'], Key> = {
  residents: 'stage.goal.residents',
  combos: 'stage.goal.combos',
  rankWins: 'stage.goal.rankWins',
  winStreak: 'stage.goal.winStreak',
  sabar: 'stage.goal.sabar',
  rwCombos: 'stage.goal.rwCombos',
  fundedRts: 'stage.goal.fundedRts',
  stempelClear: 'stage.goal.stempelClear',
  rtsAtStars: 'stage.goal.rtsAtStars',
  rwsAtStars: 'stage.goal.rwsAtStars',
  tierWins: 'stage.goal.tierWins',
  noDebtMonths: 'stage.goal.noDebtMonths',
  serapanMonths: 'stage.goal.serapanMonths',
  cleanAudits: 'stage.goal.cleanAudits',
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
    return { goal, done: have >= need, text: t(GOAL_KEYS[goal.kind], { ...goal, n: need, have }) };
  });
}

export const starsEarnable = (s: GameState, id: StageId = s.stage.current): boolean => nextStarChecklist(s, id)?.every((l) => l.done) ?? false;

/** Stage title for a star count, for example "RT Rintisan" at 1 star. */
export const stageTitle = (id: StageId, stars: number): string => tr(`stage.${id}.title${stars}`, stageDef(id).titles[stars]);

/** Monthly system: earns the next star when its checklist is done. At most one star a month, so each gets its fanfare. */
export function stageSystem(s: GameState, fx: Fx): void {
  const id = s.stage.current;
  const have = s.stage.stars[id];
  if (have === 3 || !starsEarnable(s, id)) return;
  const star = stageDef(id).stars[have];
  const stars = (have + 1) as Stars;
  s.stage.stars[id] = stars;
  for (const unlock of star.unlocks) if (!s.unlocked.includes(unlock)) s.unlocked.push(unlock);
  for (const [res, v] of Object.entries(star.reward ?? {})) gain(s, fx, res as 'sabar', v as number);
  const opens = star.unlocks.map((u) => bName(def(u))).join(', ');
  fx.push({ kind: 'notice', title: t('sim.starTitle', { stars, title: stageTitle(id, stars) }), body: opens ? t('sim.starBody', { list: opens }) : t('sim.starBodyNone'), tone: 'good', fanfare: true });
  if (stars === 3 && stageDef(id).next) {
    s.stage.sk = 'offered';
    fx.push({ kind: 'notice', title: t('sim.skTitle'), body: t('sim.skBody'), tone: 'good', fanfare: true });
  }
  s.lastNovelty = s.month;
}

/** The SK can only be accepted once the next stage exists in the data. */
export const canPromote = (s: GameState): boolean => {
  const next = currentStage(s).next;
  return s.stage.stars[s.stage.current] === 3 && !!next && STAGES.some((d) => d.id === next);
};

/** Accepting the SK raises the stage and grows the map (see promote in grow.ts). */
export function acceptSK(s: GameState, fx: Fx = []): boolean {
  if (!canPromote(s)) return false;
  promote(s, fx);
  delete s.stage.sk;
  return true;
}

export function declineSK(s: GameState): void {
  if (s.stage.stars[s.stage.current] === 3) s.stage.sk = 'declined';
}

export function reofferSK(s: GameState): void {
  if (s.stage.sk === 'declined') s.stage.sk = 'offered';
}
