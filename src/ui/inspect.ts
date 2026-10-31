import { bBlurb, bName, t, type Key } from '../i18n';
import type { App } from '../app';
import { iconURL } from '../render/sprites';
import { rupiah } from '../format';
import { def } from '../sim/content';
import { checkDemolish, checkRotate, checkSkipPermit, checkUpgrade, demolish, rotateBuilding, skipPermit, upgrade } from '../sim/rules';
import { PARKIR, REFUND } from '../sim/balance';
import { checkTertibkan, tertibkan, tertibkanFree } from '../sim/parkir';
import { bedsOf, byUid, levelMult, occupants, pathMult, upgradeCost } from '../sim/state';
import { brandKind, brandOf, displayName, hasBrand, hasOwnName, kanibal, nextBrand, rename, sisterOutlets } from '../sim/brands';
import { FRANCHISE, KANIBAL, NAME_MAX, RENAMABLE } from '../data/brands';
import { premanTake } from '../sim/needs';
import { buildingIncome, buildingUpkeep } from '../sim/tick';
import type { Building, BuildingDef, CheckResult } from '../sim/types';
import { spriteImg } from './build';
import { h } from './dom';
import { levelBadge, type BadgeState } from './levelBadge';
import { closeSheet, openSheet } from './sheet';

/** Extra rows and buttons later systems add to the inspector. */
export type InspectExtra = (app: App, b: Building) => Node[];
export const inspectExtras: InspectExtra[] = [];

export function actionButton(label: string | (string | Node)[], check: CheckResult, run: () => void, primary = false): Node {
  return h('div', { class: 'action' },
    h('button', { class: `btn ${primary ? 'btn-primary' : ''}`, disabled: !check.ok, onclick: run }, ...(typeof label === 'string' ? [label] : label)),
    check.ok ? null : reasonLine(check.missing),
  );
}

/** Why a button is disabled: one grey line, not a red list. */
export const reasonLine = (missing: string[]): HTMLElement => h('p', { class: 'meta reason' }, missing.join(' · '));

/** What the building does at a level, from that level's numbers: the one source for the panel's description. */
function effectLine(d: BuildingDef, b: Building): string {
  const bits: string[] = [];
  if (d.housing) bits.push(t('insp.houses', { n: bedsOf(b) }));
  if (d.attract) bits.push(t('insp.attracts'));
  return bits.join(' · ');
}

/** The gains of the next level, as "now → next" pairs. */
function upgradeDiff(d: BuildingDef, b: Building): string {
  const next = { ...b, level: b.level + 1 };
  const bits: string[] = [];
  if (d.housing) bits.push(t('insp.diffBeds', { a: bedsOf(b), b: bedsOf(next) }));
  if (d.income) bits.push(t('insp.diffIncome', { a: rupiah(Math.round(d.income * levelMult(b.level))), b: rupiah(Math.round(d.income * levelMult(b.level + 1))) }));
  for (const [k, v] of Object.entries(d.perMonth ?? {})) {
    const at = (lv: number) => {
      const n = Math.round(v * levelMult(lv) * 100) / 100;
      return `${n >= 0 ? '+' : ''}${n}`;
    };
    bits.push(t('insp.diffRes', { res: t(`res.${k}` as Key), a: at(b.level), b: at(b.level + 1) }));
  }
  return bits.join(' · ');
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
  // Status shows only when the building is not working: a dot and a word, never colour alone.
  const left = b.timer > 0 && (b.status === 'permit' || b.status === 'building') ? t('insp.left', { n: b.timer }) : '';
  const effect = effectLine(d, b);
  const lines: Node[] = [
    h('div', { class: 'inspect-head' }, spriteImg(d.sprite, 40, b.level), h('div', {},
      b.status === 'active' ? null : h('p', { class: `meta status status-${b.status}` }, h('span', { class: 'status-dot', 'aria-hidden': 'true' }), `${t(`status.${b.status}`)}${left}`),
      effect ? h('p', { class: 'effect' }, effect) : null,
      d.housing ? h('p', { class: 'meta occupancy' }, t('insp.occupancy', { n: occupants(s, b), max: bedsOf(b) })) : null,
      // Housing says it all in numbers; other buildings keep their blurb for what the numbers do not say.
      d.housing ? null : h('p', {}, bBlurb(d)),
    )),
  ];
  // A building waiting for a permit leads with the way out: Orang Dalam skips the queue. Above the fold.
  if (b.status === 'permit') {
    lines.push(actionButton([t('insp.skip'), ' ', h('img', { src: iconURL('orangDalam'), alt: t('res.orangDalam'), width: 18, height: 18, class: 'inline-icon' })], checkSkipPermit(s, b), () => {
      skipPermit(s, b);
      app.tap(15);
      done();
    }, true));
    lines.push(h('p', { class: 'meta' }, t('insp.skipHelp')));
  }
  // The tukang parkir cannot be demolished, but he can be tertibkan: that action leads his panel too.
  if (b.def === 'parkir') {
    lines.push(actionButton(tertibkanFree(s) ? t('insp.tertibkan') : [t('insp.tertibkan'), ' ', h('img', { src: iconURL('orangDalam'), alt: t('res.orangDalam'), width: 18, height: 18, class: 'inline-icon' })], checkTertibkan(s, b), () => {
      tertibkan(s, b);
      app.notice({ title: t('parkir.cleared'), body: t('parkir.clearedBody'), tone: 'good' });
      app.tap(15);
      app.save();
      app.refresh();
      closeSheet();
    }, true));
    lines.push(h('p', { class: 'meta' }, tertibkanFree(s) ? t('insp.tertibkanHansip') : t('insp.tertibkanOd', { n: PARKIR.orangDalam })));
  }
  // A chain shows its brand and what the brand does here; any building can be given a name.
  if (hasBrand(b.def)) {
    const k = sisterOutlets(s, b);
    lines.push(h('div', { class: 'row brand-row' },
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
  const nameForm = h('form', { class: 'row name-row', hidden: true, onsubmit: (e: Event) => {
    e.preventDefault();
    rename(b, nameInput.value);
    app.tap(10);
    done();
  } }, nameInput, h('button', { class: 'btn', type: 'submit' }, t('insp.rename')));
  if (RENAMABLE.has(b.def)) lines.push(nameForm);
  const income = buildingIncome(s, b);
  const upkeep = buildingUpkeep(s, b);
  if (income || upkeep) lines.push(h('p', { class: 'meta' }, t('insp.money', { income: rupiah(income), upkeep: rupiah(upkeep) })));
  if (d.perMonth) {
    const bits = Object.entries(d.perMonth).map(([k, v]) => {
      const n = Math.round(v * levelMult(b.level) * 100) / 100;
      return `${t(`res.${k}` as Key)} ${n >= 0 ? '+' : ''}${n}`;
    });
    lines.push(h('p', { class: 'meta' }, t('insp.perMonth', { bits: bits.join(' · ') })));
  }
  const pm = pathMult(s, b);
  if (b.noRoad) lines.push(h('p', { class: 'meta warn' }, t('insp.noRoad')));
  if (pm > 1 && b.status === 'active') lines.push(h('p', { class: 'meta' }, t('insp.pathBonus', { pct: Math.round((pm - 1) * 100) })));
  for (const extra of inspectExtras) lines.push(...extra(app, b));
  // The top level needs no button and no message: the gold badge says it.
  const upCheck = checkUpgrade(s, b);
  if (b.level < d.maxLevel) {
    lines.push(actionButton(t('insp.upgradeTo', { n: b.level + 1, cost: rupiah(upgradeCost(s, b)) }), upCheck, () => {
      upgrade(s, b);
      app.view.burst(b.x, b.y);
      app.tap(15);
      done();
    }, b.status === 'active'));
    const diff = upgradeDiff(d, b);
    if (diff) lines.push(h('p', { class: 'meta upgrade-diff' }, diff));
  }
  // Moving and turning a building cost nothing. Paths are tiles, so they just get demolished.
  if (!d.pathIncome) {
    // A long building swings round its top corner when turned, so it needs the room; say what is in the way.
    const turn = checkRotate(s, b);
    lines.push(h('div', { class: 'row action-row' },
      h('button', { class: 'btn', onclick: () => app.startMoving(uid) }, t('insp.move')),
      h('button', { class: 'btn', disabled: !turn.ok, onclick: () => {
        if (!rotateBuilding(s, b).ok) return;
        app.tap(15);
        done();
      } }, t('insp.rotate')),
    ));
    if (!turn.ok) lines.push(reasonLine(turn.missing));
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
  // Only the pencil opens the name field, so a stray tap on the title cannot start a rename.
  const pencil = RENAMABLE.has(b.def) ? h('button', { class: 'insp-pencil', 'aria-label': t('insp.rename'), onclick: () => {
    nameForm.hidden = false;
    nameInput.focus();
  } }, h('img', { src: iconURL('scroll', 2), alt: '', width: 16, height: 16, class: 'pixel' })) : null;
  const badge: BadgeState = b.level >= d.maxLevel ? 'max' : upCheck.ok ? 'up' : 'normal';
  const title = h('span', { class: 'insp-title' }, hasOwnName(b) ? displayName(b) : bName(d), d.maxLevel > 1 ? levelBadge(b.level, badge) : null, pencil);
  openSheet(title, lines, () => {
    app.view.selected = null;
  });
}
