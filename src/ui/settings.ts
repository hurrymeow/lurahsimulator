import type { App } from '../app';
import { h } from './dom';
import { closeSheet, openSheet } from './sheet';

/** Settings rows added by later systems. */
export const settingsExtras: ((app: App) => Node[])[] = [];

export function openSettings(app: App): void {
  let armed = false;
  const reset = h('button', { class: 'btn' }, 'New game');
  reset.addEventListener('click', () => {
    if (!armed) {
      armed = true;
      reset.textContent = 'Tap again to wipe this kampung';
      reset.classList.add('btn-danger');
      return;
    }
    app.newGame();
    closeSheet();
  });
  openSheet('Settings', [
    ...settingsExtras.flatMap((fn) => fn(app)),
    h('div', { class: 'action' }, reset),
    h('p', { class: 'meta' }, 'Pak RT is satire about systems and bureaucracy. Any resemblance to your actual kelurahan is a coincidence you should report, then wait 3 months for a reply.'),
  ]);
}
