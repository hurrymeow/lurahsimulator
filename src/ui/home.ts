import { t } from '../i18n';
import { SAVE_KEY, type App } from '../app';
import { deserialize } from '../sim/save';
import { storage } from '../storage';
import { h } from './dom';
import { hasSeenHowto, resetHowto, showHowto, skipHowto } from './howto';
import { coachPending, resetCoach } from './coach';
import { resetBuildSeen } from './build';
import { KAMPUNG_NAMES, NAMES, PLAYER_NAME_MAX } from '../data/names';
import type { PlayerInfo } from '../sim/types';
import { resetTips } from './tips';
import { openSettings } from './settings';

const hasSave = () => deserialize(storage.get(SAVE_KEY)) !== null;

/**
 * Launch screen. The map shows behind it with the game held. Only Start and a
 * settings gear. Start asks Continue or New game, and New game confirms before it
 * overwrites a save. The first-launch tutorial follows New game.
 */
export function showHome(app: App, install: HTMLButtonElement, update: HTMLButtonElement): void {
  const root = document.getElementById('app')!;
  const el = h('div', { id: 'home', class: 'home' });
  const leave = () => {
    el.remove();
    root.classList.remove('home-open');
    app.view.recentre();
    app.held = false;
    // The latest notice (Welcome on a new game) shows as a toast once the map is in view.
    app.toast();
  };
  const begin = (fresh: boolean, player?: PlayerInfo) => {
    if (fresh) {
      app.newGame(player);
      resetHowto();
      resetTips();
      resetBuildSeen();
      resetCoach();
    }
    leave();
    if (coachPending()) skipHowto();
    else if (!hasSeenHowto()) showHowto(app, true);
  };

  const start = h('button', { class: 'btn btn-primary home-start', id: 'home-start' }, t('home.start'));
  const gear = h('button', { class: 'btn btn-icon home-gear', id: 'home-gear', 'aria-label': t('menu.settings'), onclick: () => openSettings(app) }, '⚙');
  const front = () => el.replaceChildren(h('h1', { class: 'home-title' }, document.title), gear, h('div', { class: 'home-actions' }, update, start, install));
  const choose = () => {
    const saved = hasSave();
    el.replaceChildren(
      h('h1', { class: 'home-title' }, document.title),
      gear,
      h('div', { class: 'home-actions' },
        saved ? h('button', { class: 'btn btn-primary', id: 'home-continue', onclick: () => begin(false) }, t('home.continue')) : null,
        h('button', { class: `btn ${saved ? '' : 'btn-primary'}`, id: 'home-new', onclick: () => (saved ? sure() : naming()) }, t('home.new')),
        h('button', { class: 'btn', onclick: front }, t('home.back')),
      ),
    );
  };
  const sure = () => {
    el.replaceChildren(
      h('h1', { class: 'home-title' }, document.title),
      gear,
      h('div', { class: 'home-actions' },
        h('p', { class: 'home-warn' }, t('home.wipe')),
        h('button', { class: 'btn btn-danger', id: 'home-wipe', onclick: naming }, t('home.wipeYes')),
        h('button', { class: 'btn', onclick: choose }, t('home.back')),
      ),
    );
  };
  // New game asks who the player is and what their kampung is called. Each field has a dice.
  const naming = () => {
    const pick = <T,>(list: T[]) => list[Math.floor(Math.random() * list.length)];
    let title: 'Pak' | 'Bu' = 'Pak';
    const nameIn = h('input', { type: 'text', id: 'home-name', class: 'name-input', maxlength: String(PLAYER_NAME_MAX), value: pick(NAMES), 'aria-label': t('name.name') }) as HTMLInputElement;
    const kampungIn = h('input', { type: 'text', id: 'home-kampung', class: 'name-input', maxlength: String(PLAYER_NAME_MAX), value: pick(KAMPUNG_NAMES), 'aria-label': t('name.kampung') }) as HTMLInputElement;
    const titleBtn = (v: 'Pak' | 'Bu') => h('button', { class: `btn ${v === title ? 'btn-primary' : ''}`, type: 'button', 'data-title': v, 'aria-pressed': String(v === title), onclick: () => {
      title = v;
      titles.querySelectorAll('button').forEach((b) => {
        b.classList.toggle('btn-primary', b.getAttribute('data-title') === v);
        b.setAttribute('aria-pressed', String(b.getAttribute('data-title') === v));
      });
    } }, t(v === 'Pak' ? 'name.pak' : 'name.bu'));
    const titles = h('div', { class: 'row name-titles', role: 'group', 'aria-label': t('name.title') }, titleBtn('Pak'), titleBtn('Bu'));
    const dice = (input: HTMLInputElement, list: string[]) => h('button', { class: 'btn', type: 'button', onclick: () => (input.value = pick(list)) }, t('name.dice'));
    const clean = (v: string, fallback: string) => v.replace(/\s+/g, ' ').trim().slice(0, PLAYER_NAME_MAX) || fallback;
    el.replaceChildren(
      h('h1', { class: 'home-title' }, document.title),
      gear,
      h('form', { class: 'home-actions home-naming', onsubmit: (e: Event) => {
        e.preventDefault();
        begin(true, { title, name: clean(nameIn.value, 'RT'), kampung: `Kampung ${clean(kampungIn.value, KAMPUNG_NAMES[0])}` });
      } },
        h('p', { class: 'home-warn' }, t('name.title')),
        titles,
        h('label', { class: 'name-label' }, t('name.name')),
        h('div', { class: 'name-row' }, nameIn, dice(nameIn, NAMES)),
        h('label', { class: 'name-label' }, t('name.kampung')),
        h('div', { class: 'name-row' }, h('span', { class: 'name-prefix' }, 'Kampung'), kampungIn, dice(kampungIn, KAMPUNG_NAMES)),
        h('button', { class: 'btn btn-primary', id: 'home-begin', type: 'submit' }, t('name.begin')),
        h('button', { class: 'btn', type: 'button', onclick: choose }, t('home.back')),
      ),
    );
  };
  start.addEventListener('click', choose);

  app.held = true;
  root.classList.add('home-open');
  app.view.recentre();
  front();
  root.append(el);
  start.focus({ preventScroll: true });
}
