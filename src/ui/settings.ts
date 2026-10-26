import type { App } from '../app';
import type { Settings } from '../settings';
import { h } from './dom';
import { closeSheet, openSheet } from './sheet';

/** Settings rows added by later systems. */
export const settingsExtras: ((app: App) => Node[])[] = [];

const TOGGLES: { key: keyof Settings; label: string; help: string }[] = [
  { key: 'effects', label: 'Effects', help: 'Number pops rise, buildings pop in, chips flash, screen shakes on bad news. Off keeps the numbers, drops the motion.' },
  { key: 'haptics', label: 'Haptics', help: 'Short vibrations on build, unlock and events. Phones only.' },
  { key: 'largeText', label: 'Large text', help: 'Bigger text in panels and buttons.' },
  { key: 'reduceMotion', label: 'Reduce motion', help: 'Turns off all animation. Follows your phone setting by default.' },
  { key: 'highContrast', label: 'High contrast', help: 'Brighter text and borders.' },
];

function toggleRow(app: App, t: (typeof TOGGLES)[number]): Node {
  const state = () => (app.settings[t.key] ? 'On' : 'Off');
  const btn = h('button', { class: 'btn toggle', role: 'switch', 'aria-checked': String(app.settings[t.key]) });
  const paint = () => {
    btn.setAttribute('aria-checked', String(app.settings[t.key]));
    btn.replaceChildren(h('span', {}, t.label), h('b', {}, state()));
  };
  btn.addEventListener('click', () => {
    app.settings[t.key] = !app.settings[t.key];
    app.applySettings();
    paint();
  });
  paint();
  return h('div', { class: 'action' }, btn, h('p', { class: 'meta' }, t.help));
}

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
    ...TOGGLES.map((t) => toggleRow(app, t)),
    ...settingsExtras.flatMap((fn) => fn(app)),
    h('div', { class: 'action' }, reset),
    h('p', { class: 'meta' }, 'Pak RT is satire about systems and bureaucracy. Any resemblance to your actual kelurahan is a coincidence you should report, then wait 3 months for a reply.'),
  ]);
}
