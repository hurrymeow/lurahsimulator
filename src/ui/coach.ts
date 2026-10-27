import { bName, t, type Key } from '../i18n';
import type { App } from '../app';
import { def } from '../sim/content';
import { storage } from '../storage';
import { h } from './dom';

const KEY = 'pakrt.coach';
const DONE_MS = 20_000;
// ?debug keeps the e2e suite free of the opener. ?debug&coach turns it back on for its own test.
const q = new URLSearchParams(location.search);
const enabled = !q.has('debug') || q.has('coach');

let running = false;

/** New game: the guided first build runs again. */
export function resetCoach(): void {
  storage.set(KEY, 'pending');
}

/** True when a new game should start with the guide, not the How to play card. */
export const coachPending = (): boolean => enabled && storage.get(KEY) === 'pending';

/** True while the opener is on screen, so tips wait their turn. */
export const coachActive = (): boolean => running;

const visible = (el: Element | null): el is HTMLElement => !!el && (el as HTMLElement).offsetParent !== null;

/**
 * The first build, told like a guide would: Menu, Build, Rumah, a tile, Place. The step comes from what
 * is on screen, not from a counter, so backing out of a sheet just returns to the step before. The note
 * sits right above whatever is open at the bottom, so it reads next to the button it points at.
 */
export function setupCoach(app: App): void {
  if (!enabled) return;
  const text = h('p', { class: 'coach-text', role: 'status', 'aria-live': 'polite' });
  const next = h('button', { class: 'btn', id: 'coach-skip', onclick: () => finish() }, t('coach.skip'));
  const bar = h('div', { id: 'coach', class: 'coach', hidden: true }, text, next);
  document.body.append(bar);
  const rumahs = () => app.s.buildings.filter((b) => b.def === 'rumah').length;
  let start = -1;
  let doneAt = 0;
  let marked: Element | null = null;

  const finish = () => {
    storage.set(KEY, 'done');
    doneAt = 0;
    running = false;
    app.held = false;
    bar.hidden = true;
    marked?.classList.remove('coach-pulse');
  };

  /**
   * Targets inside a sheet get the note right under them, so it never hides the thing it points at and
   * still fits on a small phone where the sheet fills the screen. Anything else sits on top of the
   * Place bar or the bottom bar, whichever is up.
   */
  const dock = (target: HTMLElement | null) => {
    const r = target?.getBoundingClientRect();
    const inSheet = !!target && !!document.getElementById('sheet')?.contains(target);
    const h = bar.offsetHeight;
    let up = false;
    if (inSheet && r) {
      const top = r.bottom + 12;
      if (top + h > innerHeight - 8) {
        // No room under the target. Above it would sit on the sheet's own text and tabs, so go above the sheet.
        bar.style.top = 'auto';
        bar.style.bottom = `${innerHeight - document.getElementById('sheet')!.getBoundingClientRect().top + 8}px`;
      } else {
        up = true;
        bar.style.top = `${top}px`;
        bar.style.bottom = 'auto';
      }
    } else {
      const floor = ['placebar', 'bottombar'].map((id) => document.getElementById(id)).find(visible)!;
      bar.style.top = 'auto';
      bar.style.bottom = `${innerHeight - floor.getBoundingClientRect().top + 12}px`;
      // A small phone can leave the target right where the note lands. Then the note goes above the target.
      const b = bar.getBoundingClientRect();
      if (r && r.top < b.bottom && r.bottom > b.top && r.left < b.right && r.right > b.left) bar.style.bottom = `${innerHeight - r.top + 12}px`;
    }
    const b = bar.getBoundingClientRect();
    const pointsDown = !!r && !inSheet && r.top >= b.bottom - 2;
    bar.classList.toggle('arrow-up', up);
    bar.classList.toggle('no-arrow', !(up || pointsDown || (inSheet && !!r && r.top >= b.bottom - 2)));
    if (r) bar.style.setProperty('--ax', `${Math.min(Math.max(r.left + r.width / 2 - 12, 24), innerWidth - 24 - 24)}px`);
  };

  const show = (key: Key, target: Element | null, label: Key = 'coach.skip') => {
    text.textContent = t(key);
    next.textContent = t(label);
    bar.hidden = false;
    if (marked !== target) {
      marked?.classList.remove('coach-pulse');
      target?.classList.add('coach-pulse');
      marked = target;
    }
    dock(target as HTMLElement | null);
  };

  const step = () => {
    if (storage.get(KEY) !== 'pending' && !doneAt) return;
    const idle = !document.getElementById('home') && document.getElementById('howto')!.hidden;
    if (!idle) return;
    if (start < 0) start = rumahs();
    running = true;
    if (doneAt) {
      app.held = true;
      show('coach.done', null, 'coach.gotIt');
      if (Date.now() - doneAt > DONE_MS) finish();
      return;
    }
    if (rumahs() > start) {
      doneAt = Date.now();
      return;
    }
    const list = document.querySelector('.build-list');
    const card = [...document.querySelectorAll('.build-list .card-btn')].find((c) => c.querySelector('strong')?.textContent?.startsWith(bName(def('rumah'))));
    const menu = document.getElementById('act-build');
    // Time holds while the welcome is up, so nothing happens before the first tap.
    app.held = !app.placing && !visible(list) && !visible(menu);
    if (app.placing) {
      const ok = document.getElementById('place-ok');
      if (visible(ok) && !(ok as HTMLButtonElement).disabled) show('coach.place', ok);
      else show('coach.tile', null);
    } else if (visible(list)) {
      if (card) show('coach.pick', card);
      else show('coach.housing', document.querySelector('.tab[data-tab="housing"]'));
    } else if (visible(menu)) show('coach.build', menu);
    else show('coach.menu', document.getElementById('menu-btn'));
  };
  setInterval(step, 250);
}
