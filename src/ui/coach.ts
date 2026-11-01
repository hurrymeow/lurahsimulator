import { bName, t, type Key } from '../i18n';
import type { App } from '../app';
import { def } from '../sim/content';
import { storage } from '../storage';
import { h } from './dom';
import { inemURL } from '../render/inem';

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
  // No Skip: the button only appears on the last note, as "Got it".
  const next = h('button', { class: 'btn', id: 'coach-skip', hidden: true, onclick: () => finish() }, t('coach.gotIt'));
  // Inem guides the first build, so her face sits beside the words.
  const face = h('img', { src: inemURL(), alt: '', width: 44, height: 60, class: 'pixel coach-face' });
  const bar = h('div', { id: 'coach', class: 'coach', hidden: true }, face, text, next);
  document.body.append(bar);
  const rumahs = () => app.s.buildings.filter((b) => b.def === 'rumah').length;
  let start = -1;
  let doneAt = 0;
  let marked: Element | null = null;

  // While a step names one control, taps land only there. Null means no lock (welcome, last note).
  let allowed: string[] | null = null;
  const lock = (e: Event) => {
    if (!allowed || !(e.target instanceof Element)) return;
    // Event pop-ups and the coach note itself always work, so nothing can trap the player.
    // Placing is checked live: the step note catches up within a quarter second of the tap that started it.
    const placing = app.placing ? ', #map, #placebar, #place-float' : '';
    if (e.target.closest(`#coach, #modal, ${allowed.join(', ')}${placing}`)) return;
    e.stopPropagation();
    e.preventDefault();
  };
  for (const ev of ['click', 'pointerdown', 'pointerup', 'mousedown', 'touchstart', 'touchend']) document.addEventListener(ev, lock, true);

  const finish = () => {
    allowed = null;
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
    let r = target?.getBoundingClientRect();
    const inSheet = !!target && !!document.getElementById('sheet')?.contains(target);
    const h = bar.offsetHeight;
    let up = false;
    if (inSheet && r) {
      // No room under the target: scroll the sheet up just enough, while the target stays in full view.
      const sheet = document.getElementById('sheet')!;
      const short = r.bottom + 12 + h - (innerHeight - 8);
      const spare = r.top - sheet.getBoundingClientRect().top;
      if (short > 0 && short <= spare) {
        sheet.scrollTop += short;
        r = target!.getBoundingClientRect();
      }
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
    // The arrow is placed within the bar, which on a desktop sits inside the centred game column.
    if (r) bar.style.setProperty('--ax', `${Math.min(Math.max(r.left + r.width / 2 - 12 - b.left, 24), b.width - 48)}px`);
  };

  const show = (key: Key, target: Element | null, label: Key | null = null) => {
    text.textContent = t(key);
    next.hidden = !label;
    if (label) next.textContent = t(label);
    bar.hidden = false;
    if (marked !== target) {
      marked?.classList.remove('coach-pulse');
      target?.classList.add('coach-pulse');
      marked = target;
      // On a short phone the sheet can list Rumah below the fold. Bring it up, or the note points at nothing.
      const sheet = document.getElementById('sheet');
      if (target && sheet?.contains(target)) {
        const r = target.getBoundingClientRect();
        const s = sheet.getBoundingClientRect();
        if (r.top < s.top || r.bottom > Math.min(s.bottom, innerHeight)) target.scrollIntoView({ block: 'center' });
      }
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
      allowed = null;
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
    // Build has its own button in the bottom dock, so the opener points straight at it.
    const build = document.getElementById('dock-build');
    // Time holds while the welcome is up, so nothing happens before the first tap.
    app.held = !app.placing && !visible(list);
    if (app.placing) {
      allowed = ['#map', '#placebar', '#place-float'];
      const ok = document.getElementById('place-ok');
      if (visible(ok) && !(ok as HTMLButtonElement).disabled) show('coach.place', ok);
      else show('coach.tile', null);
    } else if (visible(list)) {
      allowed = card ? ['#sheet .build-list .card-btn.coach-pulse'] : ['#sheet .tab[data-tab="housing"]'];
      if (card) show('coach.pick', card);
      else show('coach.housing', document.querySelector('.tab[data-tab="housing"]'));
    } else {
      allowed = ['#dock-build'];
      show('coach.menu', build);
    }
  };
  setInterval(step, 250);
}
