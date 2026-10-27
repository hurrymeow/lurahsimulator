import { t } from '../i18n';
import type { App } from '../app';
import { shortGoal } from '../sim/nextstep';
import { nextStarChecklist } from '../sim/stages';
import { h } from './dom';

/** Two lines under the Emas bar: a quick goal for the next minute, and the next star. The full checklist is in Menu. */
export function setupGoal(app: App): void {
  const el = document.getElementById('goal')!;
  const now = h('div', { class: 'goal-now' });
  const star = h('div', { class: 'goal-star' });
  el.append(now, star);
  app.refreshers.push((a) => {
    const open = nextStarChecklist(a.s)?.find((l) => !l.done);
    const quick = shortGoal(a.s);
    el.hidden = !open && !quick;
    now.hidden = !quick;
    star.hidden = !open;
    if (quick) now.textContent = quick;
    if (open) star.textContent = t('goal.line', { goal: open.text });
  });
  app.refresh();
}
