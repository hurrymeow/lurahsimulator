import { t } from '../i18n';
import type { App } from '../app';
import { STEMPEL } from '../sim/balance';
import { nextStep } from '../sim/nextstep';
import { nextStarChecklist } from '../sim/stages';
import { h } from './dom';

/**
 * The goal, as a pill on the map: what is left for the next star, one goal at a time, up to two lines. Tap it to see every
 * unmet goal with have and need, and one next step when there is one. The first house and the first combo
 * lead the line instead, because they teach. The full checklist is in Menu.
 */
export function setupGoal(app: App): void {
  const el = document.getElementById('goal')!;
  let open = false;
  const text = h('span', { class: 'goal-text' });
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
    const stepLeads = !!step && (step.kind === 'house' || step.kind === 'combo' || step.kind === 'desk' || step.kind === 'stempel' || !left.length);
    el.hidden = !left.length && !step;
    text.textContent = t('goal.label', { goal: stepLeads ? step!.text : left[0]?.short ?? '' });
    // Opened: every unmet goal, then the step when the line does not already say it.
    const rows = [
      ...left.map((l) => h('p', { class: 'goal-row' }, l.holding ? `★ ${l.text} · ${t('goal.onTrack')}` : `★ ${l.text}`)),
      ...(step && !stepLeads ? [h('p', { class: 'goal-row goal-step' }, t('goal.step', { step: step.text }))] : []),
      ...(left.some((l) => l.goal.kind === 'stempelClear')
        ? [h('p', { class: 'goal-row goal-step' }, t('goal.stempelHelp', { base: STEMPEL.base, perBalai: STEMPEL.perBalai }))]
        : []),
    ];
    const more = open || rows.length > 0;
    el.classList.toggle('open', open);
    now.dataset.more = String(more);
    now.setAttribute('aria-expanded', String(open));
    star.hidden = !(open && rows.length);
    star.replaceChildren(...rows);
  });
  app.refresh();
}
