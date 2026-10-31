import { t } from './i18n';
import '@fontsource/atkinson-hyperlegible/latin-400.css';
import '@fontsource/atkinson-hyperlegible/latin-700.css';
import './style.css';
import { App } from './app';
import { allDefs } from './sim/content';
import { setupInstall } from './pwa/install';
import { setupUpdates } from './pwa/update';
import { openBuild } from './ui/build';
import { h } from './ui/dom';
import { ICON_PX, menuIconURL } from './ui/icons';
import { inspect } from './ui/inspect';
import { openResident } from './ui/panels';
import { showHome } from './ui/home';
import { showHowto } from './ui/howto';
import { setupCoach } from './ui/coach';
import { setupGoal } from './ui/goal';
import { seeAllTips, setupTips } from './ui/tips';
import { openSettings } from './ui/settings';
import { openNeighbours } from './ui/neighbours';
import { openMenu } from './ui/menu';
import { closeSheet } from './ui/sheet';
import { setupBack } from './ui/back';
import { registerSystems } from './systems';
import { setupConsole } from './ui/console';
import { observeStatIcons } from './ui/statIcons';

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;

const app = new App();
app.inspect = (uid) => inspect(app, uid);
app.openResident = (id) => openResident(app, id);
app.actions.push({ id: 'build', label: () => t('menu.build'), open: openBuild });
registerSystems(app);
setupBack(app);
app.actions.push(
  { id: 'neighbours', label: () => t('grow.title'), show: (a) => a.s.neighbours.length > 0, open: openNeighbours },
  { id: 'log', label: () => t('menu.log'), group: 'records', open: (a) => a.openLog() },
  { id: 'stats', label: () => t('menu.stats'), group: 'records', open: (a) => a.openStats() },
  { id: 'howto', label: () => t('menu.howto'), group: 'game', open: (a) => { closeSheet(); showHowto(a); } },
  { id: 'settings', label: () => t('menu.settings'), group: 'game', open: openSettings },
);

// Lives in the Menu's Game group. Hidden until the browser offers an install.
const installBtn = h('button', { class: 'tile', id: 'install-btn', hidden: true }, h('img', { src: menuIconURL('install')!, alt: '', width: ICON_PX, height: ICON_PX, class: 'pixel' }), h('span', { id: 'install-label' }, t('menu.install')));

$('menu-btn').addEventListener('click', () => openMenu(app, [updateTile, installBtn]));
$('hud').addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') app.openStats();
});
$('place-cancel').addEventListener('click', () => app.stopPlacing());
$('place-exit').addEventListener('click', () => app.stopPlacing());
$('place-rot').addEventListener('click', () => app.rotatePlacing());
$('place-ok').addEventListener('click', () => app.confirmPlace());
$('scrim').addEventListener('click', closeSheet);

setupInstall(installBtn, (text) => app.modal({ title: t('install.title'), body: text, tone: 'info' }));
app.refresh();
setupGoal(app);
setupCoach(app);
setupConsole(app);
observeStatIcons();
// Second install button on the home screen. Hidden when installed or not offered.
const homeInstall = h('button', { class: 'btn home-install', id: 'home-install', hidden: true }, t('menu.install'));
setupInstall(homeInstall, (text) => app.modal({ title: t('install.title'), body: text, tone: 'info' }));
// A waiting version: a full-screen card on the home screen only, and during play a dot on Menu and an Update tile in it.
const updateButton = h('button', { class: 'btn btn-primary', id: 'update-go' }, t('update.go'));
const updateScreen = h('div', { id: 'update-screen', class: 'update-screen', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'update-title', hidden: true },
  h('div', { class: 'update-card' }, h('h2', { id: 'update-title' }, t('update.title')), h('p', {}, t('update.body')), updateButton));
$('app').append(updateScreen);
const updateTile = h('button', { class: 'tile', id: 'update-tile', hidden: true }, h('img', { src: menuIconURL('install')!, alt: '', width: ICON_PX, height: ICON_PX, class: 'pixel' }), h('span', {}, t('update.tile')));
setupUpdates({
  screen: updateScreen,
  screenButton: updateButton,
  menuTile: updateTile,
  onReady: () => $('menu-btn').append(h('span', { class: 'update-dot', role: 'img', 'aria-label': t('update.title') })),
  beforeReload: () => app.save(),
});
showHome(app, homeInstall);
// After home is up: a refresh before it (setupConsole makes one) would show a due tip over the home screen.
setupTips(app);

// ?debug exposes the app for play-testing from the console.
if (new URLSearchParams(location.search).has('debug')) Object.assign(window, { pakrt: app, pakrtDefs: allDefs, pakrtTips: { seeAll: seeAllTips } });
