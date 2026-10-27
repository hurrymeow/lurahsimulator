// Console frame: the rail beside the map, with Build and Wacana. The map takes the rest of the
// screen. Every control opens a panel the Menu already has. Settings picks a light or dark frame.
import { t } from '../i18n';
import type { App } from '../app';
import { h } from './dom';
import './console.css';

const open = (app: App, id: string) => app.actions.find((a) => a.id === id)?.open(app);

export function setupConsole(app: App): void {
  const stage = document.getElementById('stage')!;

  // ---------- rail ----------
  const railTab = (id: string) => h('button', { class: 'cs-rail-tab', id: `cs-rail-${id}`, type: 'button', onclick: () => open(app, id) }, h('span', {}, ''));
  const build = railTab('build');
  const policy = railTab('wacana');
  stage.append(h('nav', { class: 'cs-rail cs', id: 'cs-rail' }, policy, h('span', { class: 'cs-rail-swap', 'aria-hidden': 'true' }, '⇕'), build));

  // Labels follow the language.
  app.refreshers.push(() => {
    build.firstElementChild!.textContent = t('menu.build');
    policy.firstElementChild!.textContent = t('menu.wacana');
  });
  app.refresh();
}
