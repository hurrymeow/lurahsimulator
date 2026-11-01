import { RW_COMBOS } from '../data/higher/rw';
import { DESA_TITLES } from '../data/higher/stages';
import { rwOf } from './area';
import { promote } from './grow';
import { STAGES } from '../data/stages';
import { bName, t, tr, type Key } from '../i18n';
import { def, hasDef } from './content';
import { first } from './firsts';
import { amanAcross, kecSystem, kelStars, weeksSinceRazia } from './kec';
import { gain, type Fx } from './gain';
import { YEARLY_EVERY } from './calendar';
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
  /** The goal is met while `have` is below `need`, as with pinjol under 25%. */
  under?: boolean;
}

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
  combos: (s) => Math.max(s.discovered.length, s.comboShare ?? 0),
  rankWins: (s) => s.ranking.filter((r) => r.won).length,
  winStreak: (s) => {
    let n = 0;
    for (let i = s.ranking.length - 1; i >= 0 && s.ranking[i].won; i--) n++;
    return n;
  },
  sabar: (s) => Math.floor(s.res.sabar),
  rwCombos: (s) => s.discovered.filter((id) => RW_COMBOS.some((c) => c.id === id)).length,
  fundedRts: (s) => s.neighbours.filter((n) => n.everFunded).length,
  stempelClear: (s) => s.stempel.clear,
  rtsAtStars: (s, g) => [s.stage.stars.rt, ...s.neighbours.map((n) => n.stars)].filter((x) => x >= g.stars).length,
  rwsAtStars: (s, g) => rwStars(s).filter((x) => x >= g.stars).length,
  // Only the yearly rankings count (every fourth quarterly one), won in that stage since the promotion into it.
  tierWins: (s, g) => s.ranking.filter((r) => r.won && (r.tier ?? 'rt') === g.tier && r.year % YEARLY_EVERY === 0).length,
  noDebtMonths: (s) => s.debtFree,
  serapanMonths: (s) => s.kel.serapanRun,
  cleanAudits: (s) => s.kel.cleanAudits,
  kelsAtStars: (s, g) => kelStars(s).filter((x) => x >= g.stars).length,
  built: (s, g) => s.buildings.filter((b) => b.def === g.def && b.status === 'active').length,
  pinjolUnder: (s) => Math.round(s.kec?.pinjol ?? 0),
  amanWeeks: (s) => s.kec?.amanRun ?? 0,
  amanNow: (s) => amanAcross(s),
  noRaziaWeeks: (s) => weeksSinceRazia(s),
};

/** Goals met from below: the line is done while `have` stays under `need`. */
const UNDER = new Set<Goal['kind']>(['pinjolUnder']);

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
  kelsAtStars: 'stage.goal.kelsAtStars',
  built: 'stage.goal.built',
  pinjolUnder: 'stage.goal.pinjolUnder',
  amanWeeks: 'stage.goal.amanWeeks',
  amanNow: 'stage.goal.amanNow',
  noRaziaWeeks: 'stage.goal.noRaziaWeeks',
};

export function goalProgress(s: GameState, g: Goal): GoalProgress {
  const check = GOAL_CHECKS[g.kind] as (s: GameState, g: Goal) => number;
  return UNDER.has(g.kind) ? { have: check(s, g), need: g.n, under: true } : { have: check(s, g), need: g.n };
}

export interface ChecklistLine {
  goal: Goal;
  done: boolean;
  /** Says exactly what is missing, for example "25 residents (have 18)". */
  text: string;
  /** The goal alone as a short phrase with no have and need, for example "reach 25 residents". */
  short: string;
}

/** The checklist for the next star, or null at 3 stars. */
export function nextStarChecklist(s: GameState, id: StageId = s.stage.current): ChecklistLine[] | null {
  return starChecklist(s, id, starsOf(s, id));
}

/** The checklist for the star after `stars`, read from `s`, which can be an AI RT's view. Null at 3 stars. */
export function starChecklist(s: GameState, id: StageId, stars: Stars): ChecklistLine[] | null {
  if (stars === 3) return null;
  return stageDef(id).stars[stars].goals.map((goal) => {
    const { have, need, under } = goalProgress(s, goal);
    const name = goal.kind === 'built' ? (hasDef(goal.def) ? bName(def(goal.def)) : goal.def) : '';
    const vars = { ...goal, n: need, have, name, backlog: s.stempel.backlog };
    return { goal, done: under ? have < need : have >= need, text: t(GOAL_KEYS[goal.kind], vars), short: t(`stage.goalShort.${goal.kind}` as Key, vars) };
  });
}

export const starsEarnable = (s: GameState, id: StageId = s.stage.current): boolean => nextStarChecklist(s, id)?.every((l) => l.done) ?? false;

/** Stage title for a star count, for example "RT Rintisan" at 1 star. */
export const stageTitle = (id: StageId, stars: number, path?: 'kelurahan' | 'desa'): string =>
  id === 'kelurahan' && path === 'desa' ? tr(`stage.desa.title${stars}`, DESA_TITLES[stars]) : tr(`stage.${id}.title${stars}`, stageDef(id).titles[stars]);

/** Monthly system: earns the next star when its checklist is done. At most one star a month, so each gets its fanfare. */
export function stageSystem(s: GameState, fx: Fx): void {
  const id = s.stage.current;
  const have = s.stage.stars[id];
  kecSystem(s);
  // Saves that were at 3★ before the next stage opened (Kelurahan, before Kecamatan) get their SK now.
  if (have === 3 && stageDef(id).next && s.stage.sk === undefined && canPromote(s)) {
    s.stage.sk = 'offered';
    fx.push({ kind: 'notice', title: t('sim.skTitle'), body: t('sim.skBody'), tone: 'good', fanfare: true });
  }
  if (have === 3 || !starsEarnable(s, id)) return;
  const star = stageDef(id).stars[have];
  const stars = (have + 1) as Stars;
  s.stage.stars[id] = stars;
  for (const unlock of star.unlocks) if (!s.unlocked.includes(unlock)) s.unlocked.push(unlock);
  for (const [res, v] of Object.entries(star.reward ?? {})) gain(s, fx, res as 'sabar', v as number);
  const opens = star.unlocks.map((u) => bName(def(u))).join(', ');
  fx.push({ kind: 'notice', title: t('sim.starTitle', { stars, title: stageTitle(id, stars, s.stage.path) }), body: opens ? t('sim.starBody', { list: opens }) : t('sim.starBodyNone'), tone: 'good', fanfare: true });
  first(s, fx, 'star');
  if (stars === 3 && stageDef(id).next) {
    s.stage.sk = 'offered';
    fx.push({ kind: 'notice', title: t('sim.skTitle'), body: t('sim.skBody'), tone: 'good', fanfare: true });
  }
  s.lastNovelty = s.month;
}

/** The SK can only be accepted once the next stage is marked playable in the data. */
export const canPromote = (s: GameState): boolean => {
  const next = currentStage(s).next;
  return s.stage.stars[s.stage.current] === 3 && !!next && STAGES.some((d) => d.id === next && d.playable === true);
};

/** Accepting the SK raises the stage and grows the map (see promote in grow.ts). */
export function acceptSK(s: GameState, fx: Fx = [], path?: 'kelurahan' | 'desa'): boolean {
  if (!canPromote(s)) return false;
  // The Kelurahan promotion is where the player picks a path. Kelurahan is the default.
  if (currentStage(s).next === 'kelurahan') s.stage.path = path ?? 'kelurahan';
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
