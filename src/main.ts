import { t } from './i18n';
import '@fontsource/pixelify-sans/latin-400.css';
import '@fontsource/pixelify-sans/latin-700.css';
import '@fontsource/atkinson-hyperlegible/latin-400.css';
import '@fontsource/atkinson-hyperlegible/latin-700.css';
import './style.css';
import { App } from './app';
import { setupInstall } from './pwa/install';
import { setupUpdates } from './pwa/update';
import { openBuild } from './ui/build';
import { h } from './ui/dom';
import { glyphURL } from './ui/glyphs';
import { inspect } from './ui/inspect';
import { showHome } from './ui/home';
import { showHowto } from './ui/howto';
import { setupTips } from './ui/tips';
import { openSettings } from './ui/settings';
import { openMenu } from './ui/menu';
import { closeSheet } from './ui/sheet';
import { registerSystems } from './systems';

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;

const app = new App();
app.inspect = (uid) => inspect(app, uid);
app.actions.push({ id: 'build', label: () => t('menu.build'), open: openBuild });
registerSystems(app);
app.actions.push(
  { id: 'log', label: () => t('menu.log'), group: 'records', open: (a) => a.openLog() },
  { id: 'stats', label: () => t('menu.stats'), group: 'records', open: (a) => a.openStats() },
  { id: 'howto', label: () => t('menu.howto'), group: 'game', open: (a) => { closeSheet(); showHowto(a); } },
  { id: 'settings', label: () => t('menu.settings'), group: 'game', open: openSettings },
);

// Lives in the Menu's Game group. Hidden until the browser offers an install.
const installBtn = h('button', { class: 'tile', id: 'install-btn', hidden: true }, h('img', { src: glyphURL('install')!, alt: '', width: 32, height: 32, class: 'pixel' }), h('span', { id: 'install-label' }, t('menu.install')));

$('menu-btn').addEventListener('click', () => openMenu(app, [installBtn]));
$('hud').addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') app.openStats();
});
$('place-cancel').addEventListener('click', () => app.stopPlacing());
$('place-ok').addEventListener('click', () => app.confirmPlace());
$('scrim').addEventListener('click', closeSheet);

setupInstall(installBtn, (text) => app.modal({ title: t('install.title'), body: text, tone: 'info' }));
setupUpdates($('update-banner'), $<HTMLButtonElement>('update-btn'));
app.refresh();
setupTips(app);
// Second install button on the home screen. Hidden when installed or not offered.
const homeInstall = h('button', { class: 'btn home-install', id: 'home-install', hidden: true }, t('menu.install'));
setupInstall(homeInstall, (text) => app.modal({ title: t('install.title'), body: text, tone: 'info' }));
showHome(app, homeInstall);

// ?debug exposes the app for play-testing from the console.
if (new URLSearchParams(location.search).has('debug')) (window as unknown as { pakrt: App }).pakrt = app;
