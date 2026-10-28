import { t } from '../i18n';
import type { App } from '../app';
import { shortGoal } from '../sim/nextstep';
import { nextStarChecklist } from '../sim/stages';
import { h } from './dom';

/**
 * The goal, as a pill on the map: a quick goal for the next minute, kept to one line. Tap it to see the
 * whole line and the next star below. The full checklist is in Menu.
 */
export function setupGoal(app: App): void {
  const el = document.getElementById('goal')!;
  let open = false;
  const text = h('span', { class: 'goal-text', 'data-clamp': '1' });
  const now = h('button', { class: 'goal-now', id: 'goal-now', type: 'button', 'aria-expanded': 'false' }, text);
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
    // One line: the quick goal, or the next star when there is no quick goal. It opens when there is
    // more to read: the rest of a long line, or the next star.
    text.textContent = quick ?? starText;
    const cut = !open && text.scrollWidth > text.clientWidth + 1;
    const more = open || (!!quick && !!next) || cut;
    el.classList.toggle('open', open);
    now.dataset.more = String(more);
    now.setAttribute('aria-expanded', String(open));
    star.hidden = !(open && !!quick && !!next);
    star.textContent = starText;
  });
  app.refresh();
}
