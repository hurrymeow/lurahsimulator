// Pak Camat's board (docs/plans/camat-board.md, T2): one sheet from Menu, three side goals, a Claim on a done one.
import { t, type Key } from '../i18n';
import type { App } from '../app';
import { boardGoalDef } from '../data/board';
import { rupiah } from '../format';
import { boardGoalText, boardProgress, boardRewardAmount, claimBoard, markBoardSeen } from '../sim/board';
import type { Fx } from '../sim/gain';
import type { BoardGoal, GameState } from '../sim/types';
import { newTag } from './build';
import { h } from './dom';
import { openSheet } from './sheet';

/** What a goal pays, in one short line. */
function rewardLine(s: GameState, g: BoardGoal): string {
  const kind = boardGoalDef(g.id).reward;
  const n = boardRewardAmount(s, g.id);
  return t(`board.reward.${kind}` as Key, { n, amt: rupiah(n) });
}

/** The board: one row per goal, each a goal line and its reward. A done goal has the one Claim. */
export function openBoard(app: App): void {
  const s = app.s;
  const b = s.board;
  // Goals that went up since the last look carry New on this opening only.
  const seenBefore = b?.seen ?? -1;
  markBoardSeen(s);
  app.refresh();
  if (!b || !b.goals.length) {
    openSheet(t('board.title'), [h('p', { class: 'meta' }, t('board.empty'))]);
    return;
  }
  // UI.md rule 14: one primary per screen, so only the first goal waiting to be claimed gets the filled button.
  const firstDone = b.goals.findIndex((g) => g.done && !g.claimed);
  const rows = b.goals.map((g, i) => {
    const { have, need } = boardProgress(s, g);
    const state = g.claimed ? 'claimed' : g.done ? 'done' : 'open';
    const reward = rewardLine(s, g);
    return h('div', { class: 'card-btn static board-goal', 'data-goal': g.id, 'data-state': state },
      h('div', { class: 'card-text' },
        h('div', { class: 'card-title' }, h('strong', {}, boardGoalText(g.id)), !g.claimed && g.since > seenBefore ? newTag(true) : null),
        h('p', { class: 'meta' }, need > 1 && !g.done ? t('board.progress', { have, need, reward }) : reward),
        g.claimed ? h('p', { class: 'meta good' }, t('board.claimed')) : null,
        state === 'done'
          ? h('button', { class: `btn ${i === firstDone ? 'btn-primary' : 'btn-secondary'} board-claim`, type: 'button', onclick: () => {
            const fx: Fx = [];
            if (!claimBoard(s, i, fx)) return;
            app.handleFx(fx);
            app.tap(15);
            app.save();
            app.refresh();
            openBoard(app);
          } }, t('board.claim'))
          : null,
      ),
    );
  });
  openSheet(t('board.title'), [h('p', { class: 'meta' }, t('board.intro')), ...rows]);
}
