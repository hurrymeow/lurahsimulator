import type { App } from './app';
import { inspectExtras } from './ui/inspect';
import { damagedExtras, mangkrakExtras, openBukuCombo, openResidents, openWacana, parkirExtras } from './ui/panels';

/** Wires satire systems into the app: extra action buttons and inspector rows. */
export function registerSystems(app: App): void {
  app.actions.push(
    { id: 'warga', label: 'Warga', open: openResidents },
    { id: 'wacana', label: 'Wacana', open: openWacana },
    { id: 'combo', label: 'Buku Combo', group: 'records', open: openBukuCombo },
  );
  inspectExtras.push(mangkrakExtras, parkirExtras, damagedExtras);
}
