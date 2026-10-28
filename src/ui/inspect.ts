import { bBlurb, bName, t, type Key } from '../i18n';
import type { App } from '../app';
import { iconURL } from '../render/sprites';
import { rupiah } from '../format';
import { def } from '../sim/content';
import { checkDemolish, checkSkipPermit, checkUpgrade, demolish, rotateBuilding, skipPermit, upgrade } from '../sim/rules';
import { REFUND } from '../sim/balance';
import { byUid, levelMult, pathMult, upgradeCost } from '../sim/state';
import { brandKind, brandOf, displayName, hasBrand, hasOwnName, kanibal, nextBrand, rename, sisterOutlets } from '../sim/brands';
import { FRANCHISE, KANIBAL, NAME_MAX } from '../data/brands';
import { premanTake } from '../sim/needs';
import { buildingIncome, buildingUpkeep } from '../sim/tick';
import type { Building, CheckResult } from '../sim/types';
import { spriteImg } from './build';
import { h, missingList } from './dom';
import { closeSheet, openSheet } from './sheet';

/** Extra rows and buttons later systems add to the inspector. */
export type InspectExtra = (app: App, b: Building) => Node[];
export const inspectExtras: InspectExtra[] = [];

export function actionButton(label: string | (string | Node)[], check: CheckResult, run: () => void, primary = false): Node {
  return h('div', { class: 'action' },
    h('button', { class: `btn ${primary ? 'btn-primary' : ''}`, disabled: !check.ok, onclick: run }, ...(typeof label === 'string' ? [label] : label)),
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
    h('div', { class: 'inspect-head' }, spriteImg(d.sprite, 40, b.level), h('div', {},
      h('p', { class: 'meta' }, t('insp.status', { status: t(`status.${b.status}`), left: b.timer > 0 && (b.status === 'permit' || b.status === 'building') ? t('insp.left', { n: b.timer }) : '', level: b.level, max: d.maxLevel })),
      h('p', {}, bBlurb(d)),
    )),
  ];
  // Every level side by side, like a building card: what it looks like now and what the next upgrade brings.
  if (d.maxLevel > 1)
    lines.push(h('div', { class: 'level-strip', role: 'list', 'aria-label': t('insp.levels') },
      ...Array.from({ length: d.maxLevel }, (_, k) => k + 1).map((lv) =>
        h('figure', { class: `lv${lv === b.level ? ' current' : ''}`, role: 'listitem', 'aria-current': lv === b.level ? 'true' : undefined }, spriteImg(d.sprite, 48, lv), h('figcaption', {}, t('res.level', { n: lv })))),
    ));
  // A chain shows its brand and what the brand does here; any building can be given a name.
  if (hasBrand(b.def)) {
    const k = sisterOutlets(s, b);
    lines.push(h('div', { class: 'row action-row brand-row' },
      h('p', { class: 'meta' }, t('insp.brand', { brand: brandOf(b)! })),
      h('button', { class: 'btn', onclick: () => {
        nextBrand(b);
        app.tap(10);
        done();
      } }, t('insp.changeBrand')),
    ));
    if (brandKind(b.def) === 'franchise') lines.push(h('p', { class: 'meta' }, k ? t('insp.franchise', { n: k, pct: Math.round(Math.min(FRANCHISE.max, FRANCHISE.perOutlet * k) * 100), royalty: Math.round(FRANCHISE.royalty * 100) }) : t('insp.franchiseNone')));
  }
  const take = premanTake(s, b);
  if (take) lines.push(h('p', { class: 'meta warn' }, t('insp.premanTake', { pct: Math.round(take * 100) })));
  if (kanibal(s, b)) lines.push(h('p', { class: 'meta warn' }, t('insp.kanibal', { pct: Math.round((1 - KANIBAL.mult) * 100) })));
  const nameInput = h('input', { type: 'text', class: 'name-input', maxlength: String(NAME_MAX), value: b.name ?? '', placeholder: displayName(b), 'aria-label': t('insp.nameLabel') }) as HTMLInputElement;
  lines.push(h('form', { class: 'row action-row name-row', onsubmit: (e: Event) => {
    e.preventDefault();
    rename(b, nameInput.value);
    app.tap(10);
    done();
  } }, nameInput, h('button', { class: 'btn', type: 'submit' }, t('insp.rename'))));
  const income = buildingIncome(s, b);
  const upkeep = buildingUpkeep(s, b);
  if (income || upkeep) lines.push(h('p', { class: 'meta' }, t('insp.money', { income: rupiah(income), upkeep: rupiah(upkeep) })));
  if (d.perMonth) {
    const bits = Object.entries(d.perMonth).map(([k, v]) => `${t(`res.${k}` as Key)} +${Math.round(v * levelMult(b.level) * 100) / 100}`);
    lines.push(h('p', { class: 'meta' }, t('insp.perMonth', { bits: bits.join(' · ') })));
  }
  const popBits: string[] = [];
  if (d.housing) popBits.push(t('insp.houses', { n: d.housing }));
  if (d.attract) popBits.push(t('insp.attracts', { n: Math.round(d.attract * levelMult(b.level) * 10) / 10 }));
  if (popBits.length) lines.push(h('p', { class: 'meta' }, popBits.join(' · ')));
  const pm = pathMult(s, b);
  if (b.noRoad) lines.push(h('p', { class: 'meta warn' }, t('insp.noRoad')));
  if (pm > 1 && b.status === 'active') lines.push(h('p', { class: 'meta' }, t('insp.pathBonus', { pct: Math.round((pm - 1) * 100) })));
  for (const extra of inspectExtras) lines.push(...extra(app, b));
  if (b.status === 'permit') {
    lines.push(actionButton([t('insp.skip'), ' ', h('img', { src: iconURL('orangDalam'), alt: t('res.orangDalam'), width: 18, height: 18, class: 'inline-icon' })], checkSkipPermit(s, b), () => {
      skipPermit(s, b);
      app.tap(15);
      done();
    }, true));
  }
  if (d.maxLevel > 1) {
    lines.push(actionButton(b.level >= d.maxLevel ? t('insp.maxLevel') : t('insp.upgrade', { cost: rupiah(upgradeCost(s, b)) }), checkUpgrade(s, b), () => {
      upgrade(s, b);
      app.view.burst(b.x, b.y);
      app.tap(15);
      done();
    }, b.status === 'active'));
  }
  // Moving and turning a building cost nothing. Paths are tiles, so they just get demolished.
  if (!d.pathIncome) {
    lines.push(h('div', { class: 'row action-row' },
      h('button', { class: 'btn', onclick: () => app.startMoving(uid) }, t('insp.move')),
      h('button', { class: 'btn', onclick: () => {
        rotateBuilding(b);
        app.tap(15);
        done();
      } }, t('insp.rotate')),
    ));
  }
  const dem = checkDemolish(s, b);
  lines.push(actionButton(dem.ok ? t('insp.demolishRefund', { amt: rupiah(Math.round((b.invested * REFUND) / 1000) * 1000) }) : t('insp.demolish'), dem, () => {
    demolish(s, b);
    app.save();
    app.refresh();
    closeSheet();
  }));
  // A named building leads with its name; the type line under it keeps what it is.
  if (hasOwnName(b)) lines.unshift(h('p', { class: 'meta insp-type' }, bName(d)));
  openSheet(hasOwnName(b) ? displayName(b) : bName(d), lines, () => {
    app.view.selected = null;
  });
}
