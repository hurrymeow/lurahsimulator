import { t } from './i18n';
import type { App } from './app';
import { inspectExtras } from './ui/inspect';
import { openStaff } from './ui/staff';
import { openLomba } from './ui/lomba';
import { lombaPrep } from './sim/lomba';
import { boardWaiting } from './sim/board';
import { openBoard } from './ui/board';
import { damagedExtras, mangkrakExtras, openResidents, openWacana, parkirExtras } from './ui/panels';

/** Wires satire systems into the app: extra action buttons and inspector rows. */
export function registerSystems(app: App): void {
  app.actions.push(
    { id: 'warga', label: () => t('dock.warga'), open: openResidents },
    { id: 'wacana', label: () => t('menu.wacana'), open: openWacana },
    { id: 'staff', label: () => t('menu.staff'), open: openStaff, badge: (app) => app.s.lowongan?.applicants.length ?? 0 },
    // The panitia's panel shows from May to the day.
    { id: 'lomba', label: () => t('lomba.title'), open: openLomba, show: (app) => !!lombaPrep(app.s) },
    // Pak Camat's board opens at RT 1★. Its count is goals that are new or done and unclaimed.
    { id: 'board', label: () => t('board.title'), open: openBoard, show: (app) => !!app.s.board, badge: (app) => boardWaiting(app.s) },
  );
  inspectExtras.push(mangkrakExtras, parkirExtras, damagedExtras);
}
