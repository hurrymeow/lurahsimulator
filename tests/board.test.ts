import { describe, expect, it } from 'vitest';
import { BOARD, BOARD_GOALS } from '../src/data/board';
import { setLang, t } from '../src/i18n';
import { boardGoalText, boardProgress, boardQuarter, boardSystem, boardWaiting, claimBoard, markBoardSeen, offerable, tallyBoard } from '../src/sim/board';
import type { Fx } from '../src/sim/gain';
import { starChecklist } from '../src/sim/stages';
import { newGame } from '../src/sim/state';
import type { GameState } from '../src/sim/types';

/** An RT at 1★ with one Wacana announced, so most of the pool is doable. */
function rt1(seed = 1): GameState {
  const s = newGame(seed);
  s.stage.stars.rt = 1;
  s.wacana.push({ id: 'hijau', power: 0, times: 1, lastAnnounced: 0 });
  return s;
}

describe("Pak Camat's board", () => {
  it('opens at RT 1★ with one goal, and not before', () => {
    const s = newGame(1);
    boardSystem(s);
    expect(s.board).toBeUndefined();
    s.stage.stars.rt = 1;
    s.wacana.push({ id: 'hijau', power: 0, times: 1, lastAnnounced: 0 });
    boardSystem(s);
    expect(s.board?.goals).toHaveLength(1);
  });

  it('adds one goal a quarter and never holds more than three', () => {
    const s = rt1();
    boardSystem(s);
    for (let q = 0; q < 6; q++) {
      s.month += 12;
      boardQuarter(s);
      expect(s.board!.goals.length).toBeLessThanOrEqual(BOARD.size);
    }
    expect(s.board!.goals).toHaveLength(BOARD.size);
    expect(new Set(s.board!.goals.map((g) => g.id)).size).toBe(BOARD.size);
  });

  it('offers only goals that can be done now', () => {
    const s = rt1();
    // An RT has no Stempel backlog to clear, no neighbour to fund and no Kecamatan Aman goal.
    expect(offerable(s, 'stempelClear')).toBe(false);
    expect(offerable(s, 'fund')).toBe(false);
    expect(offerable(s, 'aman')).toBe(false);
    const fresh = newGame(1);
    expect(offerable(fresh, 'noWacana')).toBe(false);
    expect(offerable(fresh, 'realisasi')).toBe(false);
  });

  it('a done goal pays once, on claim', () => {
    const s = rt1();
    s.board = { goals: [{ id: 'bimtek', since: s.month, base: 0, done: false, claimed: false }], tally: { bimtek: 0, fund: 0 } };
    boardSystem(s);
    expect(s.board.goals[0].done).toBe(false);
    expect(claimBoard(s, 0, [])).toBe(false);
    tallyBoard(s, 'bimtek');
    boardSystem(s);
    expect(s.board.goals[0].done).toBe(true);
    const od = s.res.orangDalam;
    expect(claimBoard(s, 0, [])).toBe(true);
    expect(s.res.orangDalam).toBe(od + BOARD.reward.orangDalam);
    expect(claimBoard(s, 0, [])).toBe(false);
    // A claimed goal leaves at the next quarter, and a new one takes its place.
    s.month += 12;
    boardQuarter(s);
    expect(s.board.goals.some((g) => g.claimed)).toBe(false);
  });

  it('a quiet quarter with no Wacana announced counts for Tanpa Wacana; one announcement breaks it', () => {
    const s = rt1();
    s.board = { goals: [{ id: 'noWacana', since: s.month, base: 1, done: false, claimed: false }], tally: { bimtek: 0, fund: 0 } };
    s.month += 6;
    boardSystem(s);
    expect(s.board.goals[0].done).toBe(false);
    s.month += 6;
    boardSystem(s);
    expect(s.board.goals[0].done).toBe(true);
    const t = rt1();
    t.board = { goals: [{ id: 'noWacana', since: t.month, base: 1, done: false, claimed: false }], tally: { bimtek: 0, fund: 0 } };
    t.wacana[0].times++;
    t.month += 12;
    boardSystem(t);
    expect(t.board.goals[0].done).toBe(false);
  });

  it('Pak Camat names each new goal in a toast, never a card', () => {
    const s = rt1();
    const fx: Fx = [];
    boardSystem(s, fx);
    s.month += 12;
    boardQuarter(s, fx);
    const notes = fx.filter((f) => f.kind === 'notice');
    expect(notes).toHaveLength(2);
    for (const n of notes) {
      if (n.kind !== 'notice') continue;
      expect(n.card).toBeFalsy();
      expect(n.fanfare).toBeFalsy();
    }
    expect(notes.map((n) => (n.kind === 'notice' ? n.body : ''))).toEqual(s.board!.goals.map((g) => t('board.newGoal', { goal: boardGoalText(g.id) })));
  });

  it('counts goals that are new or done and unclaimed, until the board is opened', () => {
    const s = rt1();
    boardSystem(s);
    expect(boardWaiting(s)).toBe(1);
    markBoardSeen(s);
    expect(boardWaiting(s)).toBe(0);
    s.month += 12;
    boardQuarter(s);
    expect(boardWaiting(s)).toBe(1);
    markBoardSeen(s);
    s.board!.goals[0].done = true;
    expect(boardWaiting(s)).toBe(1);
    claimBoard(s, 0, []);
    expect(boardWaiting(s)).toBe(0);
  });

  it('shows progress for goals that ask for more than one', () => {
    const s = rt1();
    s.board = { goals: [{ id: 'fund', since: s.month, base: 2, done: false, claimed: false }, { id: 'aman', since: s.month, base: 3, done: false, claimed: false }], tally: { bimtek: 0, fund: 3 } };
    expect(boardProgress(s, s.board.goals[0])).toEqual({ have: 1, need: 2 });
    expect(boardProgress(s, s.board.goals[1])).toEqual({ have: 3, need: 8 });
    s.board.goals[0].done = true;
    expect(boardProgress(s, s.board.goals[0])).toEqual({ have: 2, need: 2 });
  });

  it('every goal has a line in both languages', () => {
    for (const g of BOARD_GOALS) {
      for (const lang of ['en', 'id'] as const) {
        setLang(lang);
        const line = boardGoalText(g.id);
        expect(line, `${lang} ${g.id}`).not.toMatch(/board\.g\.|\{/);
        expect(line.split(/\s+/).length, `${lang} ${g.id} words`).toBeLessThanOrEqual(12);
      }
    }
    setLang('en');
  });

  it('is never a star line', () => {
    const s = rt1();
    boardSystem(s);
    for (const st of [0, 1, 2] as const) for (const l of starChecklist(s, 'rt', st) ?? []) expect(String(l.goal.kind)).not.toMatch(/board/);
  });
});
