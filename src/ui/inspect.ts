import type { App } from '../app';
import { rupiah } from '../format';
import { def } from '../sim/content';
import { checkDemolish, checkSkipPermit, checkUpgrade, demolish, skipPermit, upgrade } from '../sim/rules';
import { REFUND } from '../sim/balance';
import { byUid, levelMult, upgradeCost } from '../sim/state';
import { buildingIncome, buildingUpkeep } from '../sim/tick';
import type { Building, CheckResult } from '../sim/types';
import { spriteImg } from './build';
import { h, missingList } from './dom';
import { closeSheet, openSheet } from './sheet';

const STATUS: Record<Building['status'], string> = {
  permit: 'Waiting for permit',
  building: 'Under construction',
  active: 'Working',
  mangkrak: 'Mangkrak at 80%',
  damaged: 'Damaged',
};

/** Extra rows and buttons later systems add to the inspector. */
export type InspectExtra = (app: App, b: Building) => Node[];
export const inspectExtras: InspectExtra[] = [];

export function actionButton(label: string, check: CheckResult, run: () => void, primary = false): Node {
  return h('div', { class: 'action' },
    h('button', { class: `btn ${primary ? 'btn-primary' : ''}`, disabled: !check.ok, onclick: run }, label),
    check.ok ? null : missingList(check.missing),
  );
}

export function inspect(app: App, uid: number): void {
  const s = app.s;
  const b = byUid(s, uid);
  if (!b) return;
  const d = def(b.def);
  app.view.selected = uid;
  const done = () => {
    app.save();
    app.refresh();
    inspect(app, uid);
  };
  const lines: Node[] = [
    h('div', { class: 'inspect-head' }, spriteImg(d.sprite), h('div', {},
      h('p', { class: 'meta' }, `${STATUS[b.status]}${b.timer > 0 && (b.status === 'permit' || b.status === 'building') ? ` · ${b.timer} mo left` : ''} · Level ${b.level}/${d.maxLevel}`),
      h('p', {}, d.blurb),
    )),
  ];
  const income = buildingIncome(s, b);
  const upkeep = buildingUpkeep(s, b);
  if (income || upkeep) lines.push(h('p', { class: 'meta' }, `Income ${rupiah(income)} · upkeep ${rupiah(upkeep)} a month`));
  if (d.perMonth) {
    const bits = Object.entries(d.perMonth).map(([k, v]) => `${k === 'orangDalam' ? 'Orang Dalam' : k[0].toUpperCase() + k.slice(1)} +${Math.round(v * levelMult(b.level) * 100) / 100}`);
    lines.push(h('p', { class: 'meta' }, `${bits.join(' · ')} a month`));
  }
  for (const extra of inspectExtras) lines.push(...extra(app, b));
  if (b.status === 'permit') {
    lines.push(actionButton('Skip queue · 1 Orang Dalam', checkSkipPermit(s, b), () => {
      skipPermit(s, b);
      app.haptic(15);
      done();
    }, true));
  }
  if (d.maxLevel > 1) {
    lines.push(actionButton(b.level >= d.maxLevel ? 'Max level' : `Upgrade · ${rupiah(upgradeCost(s, b))}`, checkUpgrade(s, b), () => {
      upgrade(s, b);
      app.view.burst(b.x, b.y);
      app.haptic(15);
      done();
    }, b.status === 'active'));
  }
  const dem = checkDemolish(s, b);
  lines.push(actionButton(dem.ok ? `Demolish · refund ${rupiah(Math.round((b.invested * REFUND) / 1000) * 1000)}` : "Demolish", dem, () => {
    demolish(s, b);
    app.save();
    app.refresh();
    closeSheet();
  }));
  openSheet(d.name, lines, () => {
    app.view.selected = null;
  });
}
