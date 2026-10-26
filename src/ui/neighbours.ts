import { t } from '../i18n';
import type { App } from '../app';
import { rupiah } from '../format';
import { cellName, checkFund, fundCost, fundNeighbour } from '../sim/grow';
import { h } from './dom';
import { openSheet } from './sheet';

/** The AI-run RTs: their stars, what they are doing and a button to fund each one. */
export function openNeighbours(app: App): void {
  const s = app.s;
  const rows = s.neighbours.map((n) => {
    const why = checkFund(s, n);
    return h('div', { class: 'action' },
      h('strong', {}, cellName(n)),
      h('p', { class: 'meta' }, t('grow.row', { cell: cellName(n), stars: n.stars, pop: n.pop, n: n.buildings.length })),
      h('p', { class: 'meta' }, t(`grow.trait.${n.trait}`)),
      h('p', { class: 'meta' }, n.funded > 0 ? t('grow.funded', { n: n.funded }) : t('grow.stalled')),
      h('button', { class: 'btn', disabled: !!why, onclick: () => { fundNeighbour(s, n); app.save(); app.refresh(); openNeighbours(app); } }, t('grow.fund', { amt: rupiah(fundCost(s)) })),
      why ? h('p', { class: 'meta' }, why) : null,
    );
  });
  openSheet(t('grow.title'), [h('p', { class: 'meta' }, t('grow.intro')), ...(rows.length ? rows : [h('p', { class: 'meta' }, t('grow.none'))])]);
}
