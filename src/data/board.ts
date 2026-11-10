import type { BoardGoalId, BoardReward } from '../sim/types';

// Pak Camat's board (docs/plans/camat-board.md): three side goals at a time, one new a quarter, never a star line.

export interface BoardGoalDef {
  id: BoardGoalId;
  /** How many more of the thing it asks for (one Bimtek, two Dana...), or weeks for Aman. */
  n: number;
  reward: BoardReward;
}

export const BOARD_GOALS: BoardGoalDef[] = [
  { id: 'bimtek', n: 1, reward: 'orangDalam' },
  { id: 'hire', n: 1, reward: 'rupiah' },
  { id: 'realisasi', n: 1, reward: 'sabar' },
  { id: 'noWacana', n: 1, reward: 'sabar' },
  { id: 'stempelClear', n: 1, reward: 'orangDalam' },
  { id: 'fund', n: 2, reward: 'rupiah' },
  { id: 'decor', n: 1, reward: 'sabar' },
  { id: 'aman', n: 8, reward: 'orangDalam' },
];

export const BOARD = {
  size: 3,
  /** Aman at or above this counts a week for the Aman goal. */
  amanMin: 60,
  /** Small, sure rewards. Rupiah is this many weeks of net income, never less than `rupiahFloor` (before prices). */
  reward: { orangDalam: 1, sabar: 5, stempel: 3, rupiahWeeks: 2, rupiahFloor: 500_000 },
};

export const boardGoalDef = (id: BoardGoalId): BoardGoalDef => BOARD_GOALS.find((g) => g.id === id)!;
