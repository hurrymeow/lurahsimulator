import { LANGS, t, type Key } from '../i18n';
import type { App } from '../app';
import { h } from './dom';
import { audio } from '../audio';
import { closeSheet, openSheet } from './sheet';
import { THEMES } from '../settings';

/** Settings rows added by later systems. */
export const settingsExtras: ((app: App) => Node[])[] = [];

type ToggleKey = 'effects' | 'haptics' | 'largeText' | 'reduceMotion' | 'highContrast';
const TOGGLES: { key: ToggleKey; label: Key; help: Key }[] = [
  { key: 'effects', label: 'set.effects', help: 'set.effectsHelp' },
  { key: 'haptics', label: 'set.haptics', help: 'set.hapticsHelp' },
  { key: 'largeText', label: 'set.largeText', help: 'set.largeTextHelp' },
  { key: 'reduceMotion', label: 'set.reduceMotion', help: 'set.reduceMotionHelp' },
  { key: 'highContrast', label: 'set.highContrast', help: 'set.highContrastHelp' },
];

function toggleRow(app: App, tg: (typeof TOGGLES)[number]): Node {
  const state = () => (app.settings[tg.key] ? t('set.on') : t('set.off'));
  const btn = h('button', { class: 'btn toggle', role: 'switch', 'aria-checked': String(app.settings[tg.key]) });
  const paint = () => {
    btn.setAttribute('aria-checked', String(app.settings[tg.key]));
    btn.replaceChildren(h('span', {}, t(tg.label)), h('b', {}, state()));
  };
  btn.addEventListener('click', () => {
    app.settings[tg.key] = !app.settings[tg.key];
    app.applySettings();
    paint();
  });
  paint();
  return h('div', { class: 'action' }, btn, h('p', { class: 'meta' }, t(tg.help)));
}

function languageRow(app: App): Node {
  const btns = LANGS.map((l) =>
    h('button', {
      class: `btn ${app.settings.lang === l.id ? 'btn-primary' : ''}`,
      lang: l.id,
      'data-lang': l.id,
      'aria-pressed': String(app.settings.lang === l.id),
      onclick: () => {
        if (app.settings.lang === l.id) return;
        app.setLanguage(l.id);
        openSettings(app);
      },
    }, l.label),
  );
  return h('div', { class: 'action lang-row' }, h('strong', {}, t('set.language')), h('div', { class: 'row' }, ...btns), h('p', { class: 'meta' }, t('set.languageHelp')));
}

function themeRow(app: App): Node {
  const btns = THEMES.map((th) =>
    h('button', {
      class: `btn ${app.settings.theme === th ? 'btn-primary' : ''}`,
      'data-theme': th,
      'aria-pressed': String(app.settings.theme === th),
      onclick: () => {
        if (app.settings.theme === th) return;
        app.settings.theme = th;
        app.applySettings();
        openSettings(app);
      },
    }, t(th === 'light' ? 'set.themeLight' : 'set.themeDark')),
  );
  return h('div', { class: 'action lang-row' }, h('strong', {}, t('set.theme')), h('div', { class: 'row' }, ...btns), h('p', { class: 'meta' }, t('set.themeHelp')));
}

const SLIDERS: { key: 'musicVol' | 'sfxVol'; label: Key; help: Key }[] = [
  { key: 'musicVol', label: 'set.music', help: 'set.musicHelp' },
  { key: 'sfxVol', label: 'set.sfx', help: 'set.sfxHelp' },
];

function sliderRow(app: App, v: (typeof SLIDERS)[number]): Node {
  const out = h('b', {}, `${app.settings[v.key]}%`);
  const input = h('input', { type: 'range', min: '0', max: '100', step: '10', value: String(app.settings[v.key]), 'aria-label': t(v.label), class: 'slider' }) as HTMLInputElement;
  input.addEventListener('input', () => {
    app.settings[v.key] = Number(input.value);
    out.textContent = `${input.value}%`;
    app.applySettings();
    if (v.key === 'sfxVol') audio.preview();
    else audio.start();
  });
  return h('div', { class: 'action' }, h('label', { class: 'slider-row' }, h('span', {}, t(v.label)), out), input, h('p', { class: 'meta' }, t(v.help)));
}

export function openSettings(app: App): void {
  let armed = false;
  const reset = h('button', { class: 'btn' }, t('set.newGame'));
  reset.addEventListener('click', () => {
    if (!armed) {
      armed = true;
      reset.textContent = t('set.newGameArmed');
      reset.classList.add('btn-danger');
      return;
    }
    app.newGame();
    closeSheet();
  });
  openSheet(t('menu.settings'), [
    languageRow(app),
    themeRow(app),
    ...SLIDERS.map((v) => sliderRow(app, v)),
    ...TOGGLES.map((tg) => toggleRow(app, tg)),
    ...settingsExtras.flatMap((fn) => fn(app)),
    h('div', { class: 'action' }, reset),
    h('p', { class: 'meta' }, t('set.satire')),
  ]);
}
