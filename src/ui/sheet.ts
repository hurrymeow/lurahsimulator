import { t } from '../i18n';
import { h } from './dom';

const sheet = () => document.getElementById('sheet') as HTMLElement;
let onClose: (() => void) | null = null;

/** Bottom sheet. Close button sits at the top right, 48px. An optional action sits just left of it. */
export function openSheet(title: string | Node, body: Node[], closed?: () => void, action?: Node): void {
  const el = sheet();
  el.replaceChildren(
    h('div', { class: 'sheet-head' }, h('h2', {}, title), ...(action ? [action] : []), h('button', { class: 'btn btn-icon', 'aria-label': t('page.close'), onclick: closeSheet }, '✕')),
    ...body,
  );
  el.hidden = false;
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
