import { t } from '../i18n';
import type { App } from '../app';
import { nextStarChecklist } from '../sim/stages';

/** One line under the Emas bar: the next star goal, always in view. The full checklist is in Menu. */
export function setupGoal(app: App): void {
  const el = document.getElementById('goal')!;
  app.refreshers.push((a) => {
    const open = nextStarChecklist(a.s)?.find((l) => !l.done);
    el.hidden = !open;
    if (!open) return;
    el.textContent = t('goal.line', { goal: open.text });
  });
  app.refresh();
}
