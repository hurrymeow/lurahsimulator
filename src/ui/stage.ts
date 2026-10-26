import { cName, t } from '../i18n';
import { COMBOS } from '../data/combos';
import { RW_COMBOS } from '../data/higher/rw';
import { comboConditions, comboStatus, comboStatusText } from '../sim/combos';
import type { App } from '../app';
import { canPromote, currentStage, declineSK, nextStarChecklist, reofferSK, stageTitle, starsOf } from '../sim/stages';
import { h } from './dom';
import { closeSheet, openSheet } from './sheet';

export const starRow = (n: number) => '★'.repeat(n) + '☆'.repeat(3 - n);

/** Menu header: stage title with its stars, and the next line of the checklist. Tap for the full list. */
export function stageHeader(app: App): HTMLElement {
  const s = app.s;
  const stars = starsOf(s);
  const title = stageTitle(s.stage.current, stars, s.stage.path);
  const open = nextStarChecklist(s)?.find((l) => !l.done);
  return h(
    'button',
    { class: 'stage-head', id: 'stage-btn', 'aria-label': t('stage.aria', { title, n: stars }), onclick: () => openStage(app) },
    h('span', { class: 'stage-title' }, title),
    h('span', { class: 'stage-stars', 'aria-hidden': 'true' }, starRow(stars)),
    h('span', { class: 'stage-next' }, open ? t('stage.next', { goal: open.text }) : s.stage.sk === 'offered' ? t('stage.skWaiting') : t('stage.maxed')),
  );
}

export function openStage(app: App): void {
  const s = app.s;
  const stars = starsOf(s);
  const lines = nextStarChecklist(s);
  const body: Node[] = [h('p', { class: 'stage-stars big', 'aria-hidden': 'true' }, starRow(stars))];
  if (lines) {
    body.push(
      h('h3', {}, t('stage.goalTitle', { title: stageTitle(s.stage.current, stars + 1, s.stage.path) })),
      h('ul', { class: 'checklist' }, ...lines.map((l) => h('li', { class: l.done ? 'done' : '' }, h('span', { 'aria-hidden': 'true' }, l.done ? '✓' : '○'), ' ', l.text, comboList(app, l.goal.kind)))),
    );
  }
  if (s.stage.sk) {
    const next = currentStage(s).next;
    body.push(h('h3', {}, t('stage.skTitle')), h('p', {}, t('stage.skBody')));
    if (s.stage.sk === 'offered') {
      body.push(
        ...(next === 'kelurahan'
          ? [
              h('p', { class: 'meta' }, t('stage.pathBody')),
              h('button', { class: 'btn', id: 'sk-accept-kelurahan', disabled: !canPromote(s), onclick: () => (closeSheet(), app.accept('kelurahan')) }, t('stage.acceptKelurahan')),
              h('button', { class: 'btn', id: 'sk-accept-desa', disabled: !canPromote(s), onclick: () => (closeSheet(), app.accept('desa')) }, t('stage.acceptDesa')),
            ]
          : [h('button', { class: 'btn', id: 'sk-accept', disabled: !canPromote(s), onclick: () => (closeSheet(), app.accept()) }, t('stage.accept'))]),
        h('button', { class: 'btn', id: 'sk-decline', onclick: () => (declineSK(s), openStage(app)) }, t('stage.decline')),
      );
      if (!canPromote(s) && next) body.push(h('p', { class: 'meta' }, t('stage.soon')));
    } else {
      body.push(h('button', { class: 'btn', id: 'sk-reoffer', onclick: () => (reofferSK(s), openStage(app)) }, t('stage.reoffer')));
    }
  }
  openSheet(stageTitle(s.stage.current, stars, s.stage.path), body);
}

/** Under a combo goal: every combo of that kind, what it needs, and whether it is active in town. */
function comboList(app: App, kind: string): Node | null {
  const list = kind === 'combos' ? COMBOS : kind === 'rwCombos' ? RW_COMBOS : null;
  if (!list) return null;
  return h('ul', { class: 'combo-list' }, ...list.map((c) => {
    const st = comboStatus(app.s, c);
    return h('li', { class: st.state }, h('strong', {}, `${st.state === 'active' ? '✓' : '○'} ${cName(c)}`), ' ', h('span', { class: 'meta' }, `${comboConditions(c)} ${comboStatusText(st)}`));
  }));
}
