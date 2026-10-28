// Trouble the kampung has met at least once. Some buildings open only when their problem shows up, so
// the fix arrives with the trouble and the player learns why it exists.
import type { GameState, ProblemId } from './types';

/** Residents idle this long, this many of them, before the jobless problem counts as real. */
export const JOBLESS_PROBLEM = 3;
export const JOBLESS_MONTHS = 6;

export const hasProblem = (s: GameState, id: ProblemId): boolean => !!s.problems?.includes(id);

export function noteProblem(s: GameState, id: ProblemId): void {
  s.problems ??= [];
  if (!s.problems.includes(id)) s.problems.push(id);
}

/**
 * Monthly: counts each resident's idle months, then notes a permit queue, or a few residents idle for half a
 * year, as met. Banjir is noted by the flood itself.
 */
export function problemSystem(s: GameState): void {
  for (const r of s.residents) r.idle = r.job === 'none' ? (r.idle ?? 0) + 1 : 0;
  if (s.buildings.some((b) => b.status === 'permit')) noteProblem(s, 'permitQueue');
  if (s.residents.filter((r) => (r.idle ?? 0) >= JOBLESS_MONTHS).length >= JOBLESS_PROBLEM) noteProblem(s, 'jobless');
}
