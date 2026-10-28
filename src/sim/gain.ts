/** Popularitas above which gains start to shrink. */
export const SABAR_SOFT = 80;
import type { GameState, ResourceId, SimEffect } from './types';

export type Fx = SimEffect[];

/** Adds to a resource and queues a number pop on the tile that caused it. */
export function gain(s: GameState, fx: Fx, res: ResourceId, amount: number, at?: { x: number; y: number }): void {
  if (!amount) return;
  // Above SABAR_SOFT, Popularitas gains shrink toward nothing at 100, so a full kampung settles below the
  // cap instead of sitting on it, and a policy or a program still has room to move it.
  if (res === 'sabar' && amount > 0 && s.res.sabar > SABAR_SOFT) amount *= Math.max(0, (100 - s.res.sabar) / (100 - SABAR_SOFT));
  s.res[res] += amount;
  if (res === 'rupiah' && amount > 0) s.stats.earned += amount;
  if (at && Math.abs(amount) >= (res === 'rupiah' ? 1 : 0.5)) fx.push({ kind: 'pop', x: at.x, y: at.y, res, amount });
}
