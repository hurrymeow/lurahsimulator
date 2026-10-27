import { t } from '../i18n';
import type { App } from '../app';
import { shortGoal } from '../sim/nextstep';
import { nextStarChecklist } from '../sim/stages';
import { h } from './dom';

/**
 * The goal, on one line in the status row beside the Emas meter: a quick goal for the next minute.
 * Tap it to show the next star below. The full checklist is in Menu.
 */
export function setupGoal(app: App): void {
  const el = document.getElementById('goal')!;
  let open = false;
  const now = h('button', { class: 'goal-now', id: 'goal-now', type: 'button', 'aria-expanded': 'false' });
  const star = h('div', { class: 'goal-star', hidden: true });
  now.addEventListener('click', () => {
    if (now.dataset.more !== 'true') return;
    open = !open;
    app.refresh();
  });
  el.append(now, star);
  app.refreshers.push((a) => {
    const next = nextStarChecklist(a.s)?.find((l) => !l.done);
    const quick = shortGoal(a.s);
    const starText = next ? t('goal.line', { goal: next.text }) : '';
    el.hidden = !next && !quick;
    // One line: the quick goal, or the next star when there is no quick goal. The star expands only
    // when it is not already the line.
    const more = !!quick && !!next;
    now.textContent = quick ?? starText;
    now.dataset.more = String(more);
    now.setAttribute('aria-expanded', String(more && open));
    star.hidden = !(more && open);
    star.textContent = starText;
  });
  app.refresh();
}
