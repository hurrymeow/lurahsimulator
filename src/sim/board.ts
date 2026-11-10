// Pak Camat's board (docs/plans/camat-board.md): three side goals at a time, from RT 1★, one new a quarter.
// Small sure rewards; a board goal is never a star line. The sheet and the card come in T2.
import { BOARD, BOARD_GOALS, boardGoalDef } from '../data/board';
import { STAT_MAX, roleDef } from '../data/staff';
import { categoryOf } from '../data/categories';
import { RANKING_WEEKS } from './calendar';
import { def, hasDef } from './content';
import { monthlyNet } from './events';
import { gain, type Fx } from './gain';
import { meters } from './needs';
import { realisasiDone } from './realisasi';
import { staffSlots } from './staff';
import { price } from './state';
import type { BoardGoal, BoardGoalId, BoardState, GameState } from './types';

const isDecor = (id: string): boolean => hasDef(id) && !def(id).pathIncome && categoryOf(def(id)) === 'decoration';
const announced = (s: GameState): number => s.wacana.reduce((n, w) => n + w.times, 0);
const decorOwned = (s: GameState): number => s.buildings.filter((b) => isDecor(b.def) && b.status === 'active').length;

/** The count a goal is measured from when it goes up. */
function baseOf(s: GameState, b: BoardState, id: BoardGoalId): number {
  switch (id) {
    case 'bimtek': return b.tally.bimtek;
    case 'fund': return b.tally.fund;
    case 'realisasi': return realisasiDone(s);
    case 'noWacana': return announced(s);
    case 'decor': return decorOwned(s);
    default: return 0;
  }
}

/** True when the goal can be done now and is not already true. */
export function offerable(s: GameState, id: BoardGoalId): boolean {
  const stage = s.stage.current;
  switch (id) {
    case 'bimtek': return (s.staff ?? []).some((x) => !x.inem && !x.away && x.stats[roleDef(x.role).stat] < STAT_MAX);
    case 'hire': return (s.staff ?? []).length < staffSlots(s);
    case 'realisasi':
    case 'noWacana': return s.wacana.some((w) => w.times > 0);
    case 'stempelClear': return stage !== 'rt' && s.stempel.backlog >= 3;
    case 'fund': return stage !== 'rt' && s.neighbours.some((n) => n.run !== 'player' && !n.absorbed);
    case 'decor': return s.unlocked.some(isDecor);
    case 'aman': return stage === 'kecamatan' && meters(s).aman < BOARD.amanMin;
  }
}

/** Whether a goal on the board is met now. Aman counts weeks in a row in `base`; Tanpa Wacana needs its quarter to pass. */
function met(s: GameState, b: BoardState, g: BoardGoal): boolean {
  const n = boardGoalDef(g.id).n;
  switch (g.id) {
    case 'bimtek': return b.tally.bimtek - g.base >= n;
    case 'fund': return b.tally.fund - g.base >= n;
    case 'hire': return (s.staff ?? []).filter((x) => !x.inem && x.hiredAt >= g.since).length >= n;
    case 'realisasi': return realisasiDone(s) - g.base >= n;
    case 'noWacana': return s.month - g.since >= RANKING_WEEKS && announced(s) === g.base;
    case 'stempelClear': return s.stempel.backlog === 0;
    case 'decor': return decorOwned(s) - g.base >= n;
    case 'aman': return g.base >= n;
  }
}

/** Puts one new goal up, picked among those doable now and not already on the board. */
function addGoal(s: GameState, b: BoardState): void {
  const pool = BOARD_GOALS.map((g) => g.id).filter((id) => !b.goals.some((g) => g.id === id) && offerable(s, id));
  if (!pool.length) return;
  // Picked by the week, not the game's dice, so the board never shifts any other random roll.
  const id = pool[Math.floor(s.month / RANKING_WEEKS) % pool.length];
  b.goals.push({ id, since: s.month, base: baseOf(s, b, id), done: false, claimed: false });
}

/** Counts something the sim keeps nowhere else. A no-op until the board exists. */
export function tallyBoard(s: GameState, key: keyof BoardState['tally'], n = 1): void {
  if (s.board) s.board.tally[key] += n;
}

/** Weekly: the board opens at RT 1★ with one goal; each goal on it is marked done once met. */
export function boardSystem(s: GameState): void {
  if (!s.board) {
    if (s.stage.current === 'rt' && s.stage.stars.rt < 1) return;
    s.board = { goals: [], tally: { bimtek: 0, fund: 0 } };
    addGoal(s, s.board);
    return;
  }
  const b = s.board;
  for (const g of b.goals) {
    if (g.done) continue;
    if (g.id === 'aman') g.base = meters(s).aman >= BOARD.amanMin ? g.base + 1 : 0;
    if (met(s, b, g)) g.done = true;
  }
}

/** Each quarterly ranking: claimed goals leave, and one new goal comes, pushing out the oldest open one when full. */
export function boardQuarter(s: GameState): void {
  const b = s.board;
  if (!b) return;
  b.goals = b.goals.filter((g) => !g.claimed);
  if (b.goals.length >= BOARD.size) {
    const oldest = b.goals.filter((g) => !g.done).sort((x, y) => x.since - y.since)[0];
    // Every goal is done and waiting to be claimed: nothing leaves, nothing comes.
    if (!oldest) return;
    b.goals = b.goals.filter((g) => g !== oldest);
  }
  addGoal(s, b);
}

/** What a goal pays when claimed, in its own unit. */
export function boardRewardAmount(s: GameState, id: BoardGoalId): number {
  const r = BOARD.reward;
  switch (boardGoalDef(id).reward) {
    case 'orangDalam': return r.orangDalam;
    case 'sabar': return r.sabar;
    case 'stempel': return r.stempel;
    case 'rupiah': return Math.round(Math.max(price(s, r.rupiahFloor), r.rupiahWeeks * monthlyNet(s)) / 1000) * 1000;
  }
}

/** Pays a done goal once. Returns false if it is not done or already claimed. */
export function claimBoard(s: GameState, i: number, fx: Fx): boolean {
  const g = s.board?.goals[i];
  if (!g || !g.done || g.claimed) return false;
  const reward = boardGoalDef(g.id).reward;
  const amount = boardRewardAmount(s, g.id);
  if (reward === 'stempel') s.stempel.stock += amount;
  else gain(s, fx, reward, amount);
  g.claimed = true;
  return true;
}
