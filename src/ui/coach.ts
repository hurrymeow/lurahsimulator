import { bName, t } from '../i18n';
import type { App } from '../app';
import { def } from '../sim/content';
import { storage } from '../storage';
import { h } from './dom';

const KEY = 'pakrt.coach';
const DONE_MS = 6000;
// ?debug keeps the e2e suite free of the opener. ?debug&coach turns it back on for its own test.
const q = new URLSearchParams(location.search);
const enabled = !q.has('debug') || q.has('coach');

let running = false;

/** New game: the guided first build runs again. */
export function resetCoach(): void {
  storage.set(KEY, 'pending');
}

/** True while the opener is on screen, so tips wait their turn. */
export const coachActive = (): boolean => running;

const visible = (el: Element | null): el is HTMLElement => !!el && (el as HTMLElement).offsetParent !== null;

/**
 * The first build, one tap at a time: Menu, Build, Rumah, a tile, Place. The step comes from what is
 * on screen, not from a counter, so backing out of a sheet just returns the hint to the step before.
 */
export function setupCoach(app: App): void {
  if (!enabled) return;
  const text = h('p', { class: 'coach-text', role: 'status', 'aria-live': 'polite' });
  const bar = h('div', { id: 'coach', class: 'coach', hidden: true }, text,
    h('button', { class: 'btn', id: 'coach-skip', onclick: () => finish() }, t('coach.skip')));
  document.getElementById('stage')!.append(bar);
  const rumahs = () => app.s.buildings.filter((b) => b.def === 'rumah').length;
  let start = -1;
  let doneAt = 0;
  let marked: Element | null = null;

  const finish = () => {
    storage.set(KEY, 'done');
    running = false;
    bar.hidden = true;
    marked?.classList.remove('coach-pulse');
  };

  const show = (msg: string, target: Element | null) => {
    text.textContent = msg;
    bar.hidden = false;
    if (marked !== target) {
      marked?.classList.remove('coach-pulse');
      target?.classList.add('coach-pulse');
      marked = target;
    }
  };

  const step = () => {
    if (storage.get(KEY) !== 'pending' && !doneAt) return;
    const idle = !document.getElementById('home') && document.getElementById('howto')!.hidden;
    if (!idle) return;
    if (start < 0) start = rumahs();
    running = true;
    if (doneAt) {
      if (Date.now() - doneAt > DONE_MS) finish();
      return;
    }
    if (rumahs() > start) {
      doneAt = Date.now();
      show(t('coach.done'), null);
      return;
    }
    const list = document.querySelector('.build-list');
    const card = [...document.querySelectorAll('.build-list .card-btn')].find((c) => c.querySelector('strong')?.textContent?.startsWith(bName(def('rumah'))));
    if (app.placing) {
      const ok = document.getElementById('place-ok');
      if (visible(ok) && !(ok as HTMLButtonElement).disabled) show(t('coach.place'), ok);
      else show(t('coach.tile'), null);
    } else if (visible(list)) {
      if (card) show(t('coach.pick'), card);
      else show(t('coach.housing'), document.querySelector('.tab[data-tab="housing"]'));
    } else if (visible(document.getElementById('act-build'))) show(t('coach.build'), document.getElementById('act-build'));
    else show(t('coach.menu'), document.getElementById('menu-btn'));
  };
  setInterval(step, 250);
}
