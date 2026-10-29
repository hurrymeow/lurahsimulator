import { t } from '../i18n';
import type { App, ActionButton, MenuGroup } from '../app';
import { iconURL } from '../render/sprites';
import { h } from './dom';
import { ICON_PX, menuIconURL } from './icons';
import { openSheet } from './sheet';
import { stageHeader } from './stage';

const GROUPS: { id: MenuGroup; title: () => string }[] = [
  { id: 'kampung', title: () => t('menu.kampung') },
  { id: 'records', title: () => t('menu.records') },
  { id: 'game', title: () => t('menu.game') },
];

function tileIcon(a: ActionButton): HTMLImageElement {
  const plate = menuIconURL(a.icon ?? a.id);
  if (plate) return h('img', { src: plate, alt: '', width: ICON_PX, height: ICON_PX, class: 'pixel' });
  return h('img', { src: iconURL(a.icon ?? 'people'), alt: '', width: 32, height: 32, class: 'pixel' });
}

/** A count of things waiting in a panel, in the same pixel tag as New. */
export const countTag = (n: number): HTMLElement => h('span', { class: 'new-tag small count-tag', 'data-count': String(n), 'aria-label': t('menu.waiting', { n }) }, String(n));

/** One menu button opens every panel, sorted into categories. */
export function openMenu(app: App, extra: Node[] = []): void {
  const body = GROUPS.map((g) => {
    // Docked panels (Build, Warga) have their own bottom button and are not listed twice.
    const items = app.actions.filter((a) => !a.dock && (a.group ?? 'kampung') === g.id && (a.show?.(app) ?? true));
    const tiles: Node[] = items.map((a) => {
      const n = a.badge?.(app) ?? 0;
      return h('button', { class: 'tile', id: `act-${a.id}`, onclick: () => a.open(app) }, tileIcon(a), h('span', {}, a.label()), n ? countTag(n) : null);
    });
    if (g.id === 'game') tiles.push(...extra);
    if (!tiles.length) return null;
    return h('section', { class: 'menu-group', 'aria-label': g.title() }, h('h3', {}, g.title()), h('div', { class: 'tile-grid' }, ...tiles));
  }).filter((n): n is HTMLElement => n !== null);
  openSheet(t('page.menu'), [stageHeader(app), ...body]);
}
