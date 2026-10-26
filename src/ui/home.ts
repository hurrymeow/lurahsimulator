import { t } from '../i18n';
import { SAVE_KEY, type App } from '../app';
import { deserialize } from '../sim/save';
import { storage } from '../storage';
import { h } from './dom';
import { hasSeenHowto, resetHowto, showHowto } from './howto';
import { resetTips } from './tips';
import { openSettings } from './settings';

const hasSave = () => deserialize(storage.get(SAVE_KEY)) !== null;

/**
 * Launch screen. The map shows behind it with the game held. Only Start and a
 * settings gear. Start asks Continue or New game, and New game confirms before it
 * overwrites a save. The first-launch tutorial follows New game.
 */
export function showHome(app: App): void {
  const root = document.getElementById('app')!;
  const el = h('div', { id: 'home', class: 'home' });
  const leave = () => {
    el.remove();
    root.classList.remove('home-open');
    app.held = false;
  };
  const begin = (fresh: boolean) => {
    if (fresh) {
      app.newGame();
      resetHowto();
      resetTips();
    }
    leave();
    if (!hasSeenHowto()) showHowto(app, true);
  };

  const start = h('button', { class: 'btn btn-primary home-start', id: 'home-start' }, t('home.start'));
  const gear = h('button', { class: 'btn btn-icon home-gear', id: 'home-gear', 'aria-label': t('menu.settings'), onclick: () => openSettings(app) }, '⚙');
  const front = () => el.replaceChildren(h('h1', { class: 'home-title' }, document.title), gear, h('div', { class: 'home-actions' }, start));
  const choose = () => {
    const saved = hasSave();
    el.replaceChildren(
      h('h1', { class: 'home-title' }, document.title),
      gear,
      h('div', { class: 'home-actions' },
        saved ? h('button', { class: 'btn btn-primary', id: 'home-continue', onclick: () => begin(false) }, t('home.continue')) : null,
        h('button', { class: `btn ${saved ? '' : 'btn-primary'}`, id: 'home-new', onclick: () => (saved ? sure() : begin(true)) }, t('home.new')),
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
        h('button', { class: 'btn btn-danger', id: 'home-wipe', onclick: () => begin(true) }, t('home.wipeYes')),
        h('button', { class: 'btn', onclick: choose }, t('home.back')),
      ),
    );
  };
  start.addEventListener('click', choose);

  app.held = true;
  root.classList.add('home-open');
  front();
  root.append(el);
  start.focus({ preventScroll: true });
}
