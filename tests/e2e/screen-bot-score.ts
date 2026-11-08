import { goalProgress, nextStarChecklist } from '../../src/sim/stages';
import type { GameState } from '../../src/sim/types';

/**
 * The scorer of the screen-only bot. It reads the sim's JSON snapshots, never the screen, and never talks to the player.
 *
 * A checkpoint is right when, by the next checkpoint's snapshot (about 60s of game time on), an unmet star line moved:
 * its have went up, or it was met. A "wait" is right when something was pending (a permit or a build under way), or a line moved anyway. A "can't tell" is always wrong: the screen did not name an action.
 */
export type Verdict = 'right' | 'wrong' | 'cant-tell';

export interface Snap {
  /** Game seconds at 1x, from the sim's week count. */
  t: number;
  s: GameState;
}

const MONTH_S = 8;
export const gameSeconds = (s: GameState): number => s.month * MONTH_S;

/** The unmet lines of the next star: [index, have, need]. */
function unmet(s: GameState): { i: number; have: number; need: number }[] {
  const out: { i: number; have: number; need: number }[] = [];
  (nextStarChecklist(s) ?? []).forEach((l, i) => {
    if (l.done) return;
    const { have, need } = goalProgress(s, l.goal);
    out.push({ i, have, need });
  });
  return out;
}

const pending = (s: GameState): boolean => s.buildings.some((b) => b.status === 'permit' || b.status === 'building');

export function score(kind: 'build' | 'sk' | 'wait' | 'cant-tell', before: GameState, after: GameState): { verdict: Verdict; reason: string } {
  if (kind === 'cant-tell') return { verdict: 'cant-tell', reason: 'the screen named no action' };
  if (kind === 'sk') return { verdict: before.stage.sk === 'offered' ? 'right' : 'wrong', reason: 'SK accepted' };
  const b = unmet(before);
  const a = unmet(after);
  const stars = (s: GameState) => s.stage.stars[s.stage.current];
  if (stars(after) > stars(before) || s_stage(after) !== s_stage(before)) return { verdict: 'right', reason: 'a star was earned' };
  const moved = b.filter((x) => {
    const y = a.find((z) => z.i === x.i);
    return !y || y.have > x.have;
  });
  if (moved.length) return { verdict: 'right', reason: `moved: line ${moved.map((m) => m.i + 1).join(',')}` };
  if (kind === 'wait' && pending(before)) return { verdict: 'right', reason: 'waiting on a build under way' };
  return { verdict: 'wrong', reason: 'no unmet star line moved' };
}

const s_stage = (s: GameState): string => s.stage.current;
