import { t } from '../i18n';
import { h } from './dom';

const sheet = () => document.getElementById('sheet') as HTMLElement;
let onClose: (() => void) | null = null;
let openedAt = 0;

/** Bottom sheet. Close button sits at the top right, 48px. An optional action sits just left of it. */
export function openSheet(title: string | Node, body: Node[], closed?: () => void, action?: Node): void {
  const el = sheet();
  el.replaceChildren(
    h('div', { class: 'sheet-head' }, h('h2', {}, title), ...(action ? [action] : []), h('button', { class: 'btn btn-icon', 'aria-label': t('page.close'), onclick: closeSheet }, '✕')),
    ...body,
  );
  el.hidden = false;
  openedAt = Date.now();
  onClose = closed ?? null;
  document.getElementById('scrim')!.hidden = false;
}

export function closeSheet(): void {
  sheet().hidden = true;
  document.getElementById('scrim')!.hidden = true;
  const cb = onClose;
  onClose = null;
  cb?.();
}

export const sheetOpen = () => !sheet().hidden;

/**
 * A tap on the map opens a sheet on pointerup, and the browser then fires the tap's click on whatever is
 * under the finger: the scrim that just appeared. That click must not close the sheet it opened.
 */
export function scrimTap(): void {
  if (Date.now() - openedAt < 400) return;
  closeSheet();
}
