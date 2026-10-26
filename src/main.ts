import '@fontsource/pixelify-sans/latin-400.css';
import '@fontsource/pixelify-sans/latin-700.css';
import './style.css';
import { App } from './app';
import { setupInstall } from './pwa/install';
import { setupUpdates } from './pwa/update';
import { openBuild } from './ui/build';
import { h } from './ui/dom';
import { inspect } from './ui/inspect';
import { openSettings } from './ui/settings';
import { closeSheet } from './ui/sheet';
import { registerSystems } from './systems';

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;

const app = new App();
app.inspect = (uid) => inspect(app, uid);
app.actions.push({ id: 'build', label: 'Build', open: openBuild });
registerSystems(app);

$('actions').replaceChildren(...app.actions.map((a) => h('button', { class: `btn ${a.id === 'build' ? 'btn-primary' : ''}`, id: `act-${a.id}`, onclick: () => a.open(app) }, a.label)));
$('place-cancel').addEventListener('click', () => app.stopPlacing());
$('place-ok').addEventListener('click', () => app.confirmPlace());
$('settings-btn').addEventListener('click', () => openSettings(app));
$('scrim').addEventListener('click', closeSheet);

setupInstall($<HTMLButtonElement>('install-btn'), (text) => app.modal({ title: 'Install Pak RT', body: text, tone: 'info' }));
setupUpdates($('update-banner'), $<HTMLButtonElement>('update-btn'));
app.refresh();

// ?debug exposes the app for play-testing from the console.
if (new URLSearchParams(location.search).has('debug')) (window as unknown as { pakrt: App }).pakrt = app;
