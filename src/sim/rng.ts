import type { GameState } from './types';

// mulberry32, with its state stored in the game so saves replay identically.
export function rand(s: GameState): number {
  s.rng = (s.rng + 0x6d2b79f5) | 0;
  let t = s.rng;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

export function randInt(s: GameState, min: number, max: number): number {
  return min + Math.floor(rand(s) * (max - min + 1));
}

export function pick<T>(s: GameState, list: readonly T[]): T {
  return list[Math.floor(rand(s) * list.length)];
}

export function chance(s: GameState, p: number): boolean {
  return rand(s) < p;
}
