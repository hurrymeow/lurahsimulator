import type { GameState, ResourceId, SimEffect } from './types';

export type Fx = SimEffect[];

/** Adds to a resource and queues a number pop on the tile that caused it. */
export function gain(s: GameState, fx: Fx, res: ResourceId, amount: number, at?: { x: number; y: number }): void {
  if (!amount) return;
  s.res[res] += amount;
  if (res === 'rupiah' && amount > 0) s.stats.earned += amount;
  if (at && Math.abs(amount) >= (res === 'rupiah' ? 1 : 0.5)) fx.push({ kind: 'pop', x: at.x, y: at.y, res, amount });
}
