import { t } from '../i18n';
import type { App } from '../app';
import { nextStep } from '../sim/nextstep';
import { nextStarChecklist } from '../sim/stages';
import { h } from './dom';

/**
 * The goal, as a pill on the map: what is left for the next star, kept to one line. Tap it to see every
 * unmet goal with have and need, and one next step when there is one. The first house and the first combo
 * lead the line instead, because they teach. The full checklist is in Menu.
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
    const left = nextStarChecklist(a.s)?.filter((l) => !l.done) ?? [];
    const step = nextStep(a.s);
    const starLine = left.length === 1
      ? t('goal.leftOne', { goal: left[0].text })
      : left.length ? t('goal.left', { n: left.length, goal: left[0].text }) : '';
    const stepLeads = !!step && (step.kind === 'house' || step.kind === 'combo' || step.kind === 'desk' || !left.length);
    el.hidden = !left.length && !step;
    text.textContent = stepLeads ? step!.text : starLine;
    // Opened: every unmet goal, then the step when the line does not already say it.
    const rows = [
      ...left.map((l) => h('p', { class: 'goal-row' }, `★ ${l.text}`)),
      ...(step && !stepLeads ? [h('p', { class: 'goal-row goal-step' }, t('goal.step', { step: step.text }))] : []),
    ];
    const cut = !open && text.scrollWidth > text.clientWidth + 1;
    const more = open || cut || rows.length > 1 || (stepLeads && rows.length > 0);
    el.classList.toggle('open', open);
    now.dataset.more = String(more);
    now.setAttribute('aria-expanded', String(open));
    star.hidden = !(open && rows.length);
    star.replaceChildren(...rows);
  });
  app.refresh();
}
