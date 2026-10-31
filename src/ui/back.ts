import { t } from '../i18n';
import { closeSheet, sheetOpen } from './sheet';

const LEAVE_WINDOW_MS = 2000;

interface BackHost {
  placing: unknown;
  stopPlacing(): void;
}

const shown = (id: string) => {
  const el = document.getElementById(id);
  return !!el && !el.hidden;
};

/**
 * Closes the top layer and says whether it did. 'leave' means nothing is
 * open on the home screen, so the phone's back may quit the app.
 */
export function closeTopLayer(app: BackHost): 'closed' | 'held' | 'bare' | 'leave' {
  if (shown('howto')) {
    document.getElementById('howtoGo')?.click();
    return 'closed';
  }
  if (sheetOpen()) {
    closeSheet();
    return 'closed';
  }
  if (shown('modal')) {
    const modal = document.getElementById('modal')!;
    // An event card needs a choice, so back never skips it.
    if (modal.querySelector('.card.event')) return 'held';
    modal.click();
    return 'closed';
  }
  if (app.placing) {
    app.stopPlacing();
    return 'closed';
  }
  if (document.getElementById('home')) return 'leave';
  return 'bare';
}

/**
 * Android back closes the top panel. On the bare map the first back shows a
 * hint and a second one within 2s leaves, so a stray swipe never loses the month.
 */
export function setupBack(app: BackHost): void {
  const hint = document.createElement('div');
  hint.id = 'back-hint';
  hint.className = 'back-hint';
  hint.setAttribute('role', 'status');
  hint.hidden = true;
  document.getElementById('app')?.append(hint);

  let armedAt = 0;
  let hideTimer = 0;
  const guard = () => history.pushState({ guard: true }, '');
  guard();

  window.addEventListener('popstate', () => {
    const r = closeTopLayer(app);
    if (r === 'leave') return;
    if (r === 'bare') {
      const now = Date.now();
      if (now - armedAt < LEAVE_WINDOW_MS) {
        // Second back inside the window: step out past the guard entry.
        history.back();
        return;
      }
      armedAt = now;
      hint.textContent = t('back.again');
      hint.hidden = false;
      clearTimeout(hideTimer);
      hideTimer = window.setTimeout(() => (hint.hidden = true), LEAVE_WINDOW_MS);
    }
    guard();
  });
}
