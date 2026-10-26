import { t } from '../i18n';
import type { App, ActionButton, MenuGroup } from '../app';
import { iconURL } from '../render/sprites';
import { h } from './dom';
import { glyphURL } from './glyphs';
import { openSheet } from './sheet';
import { stageHeader } from './stage';

const GROUPS: { id: MenuGroup; title: () => string }[] = [
  { id: 'kampung', title: () => t('menu.kampung') },
  { id: 'records', title: () => t('menu.records') },
  { id: 'game', title: () => t('menu.game') },
];

function tileIcon(a: ActionButton): HTMLImageElement {
  const src = glyphURL(a.icon ?? a.id) ?? iconURL(a.icon ?? 'people');
  return h('img', { src, alt: '', width: 32, height: 32, class: 'pixel' });
}

/** One menu button opens every panel, sorted into categories. */
export function openMenu(app: App, extra: Node[] = []): void {
  const body = GROUPS.map((g) => {
    const items = app.actions.filter((a) => (a.group ?? 'kampung') === g.id && (a.show?.(app) ?? true));
    const tiles: Node[] = items.map((a) =>
      h('button', { class: 'tile', id: `act-${a.id}`, onclick: () => a.open(app) }, tileIcon(a), h('span', {}, a.label())),
    );
    if (g.id === 'game') tiles.push(...extra);
    if (!tiles.length) return null;
    return h('section', { class: 'menu-group', 'aria-label': g.title() }, h('h3', {}, g.title()), h('div', { class: 'tile-grid' }, ...tiles));
  }).filter((n): n is HTMLElement => n !== null);
  openSheet(t('page.menu'), [stageHeader(app), ...body]);
}
