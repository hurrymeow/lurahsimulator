import type { Fx } from './gain';
import type { FirstKind, GameState } from './types';

/** Queues the big celebration for a milestone, once per game. Later ones get the normal small feedback. */
export function first(s: GameState, fx: Fx, what: FirstKind, at?: { x: number; y: number }): void {
  s.firsts ??= [];
  if (s.firsts.includes(what)) return;
  s.firsts.push(what);
  fx.push({ kind: 'first', what, x: at?.x, y: at?.y });
}
