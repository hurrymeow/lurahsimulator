import { t } from '../i18n';
import type { App } from '../app';
import { rupiah } from '../format';
import { NEIGHBOUR } from '../sim/balance';
import { autoFloor, autoMonthly, boostOf, cellName, checkFund, fundCost, fundNeighbour, setAutoFund } from '../sim/grow';
import { viewOf } from '../sim/neighbourView';
import { starChecklist } from '../sim/stages';
import type { Neighbour } from '../sim/types';
import { h } from './dom';
import { openSheet } from './sheet';

/** What the RT still lacks for its next star, the same checklist the player's own RT uses. */
function missing(app: App, n: Neighbour): Node {
  const lines = starChecklist(viewOf(app.s, n), 'rt', n.stars);
  if (!lines) return h('p', { class: 'meta' }, t('grow.maxStars'));
  return h('div', {},
    h('p', { class: 'meta' }, t('grow.nextStar', { n: n.stars + 1 })),
    h('ul', { class: 'checklist' }, ...lines.map((l) => h('li', { class: l.done ? 'done' : '' }, h('span', { 'aria-hidden': 'true' }, l.done ? '✓' : '○'), ' ', l.text))),
  );
}

/** Auto-dana: off, or keep the bank topped up to 3, 6 or 12 builds. */
function autoRow(app: App, n: Neighbour): Node {
  const s = app.s;
  const keep = n.autoKeep ?? 0;
  const btns = [0, ...NEIGHBOUR.autoLevels].map((k) =>
    h('button', {
      class: `btn ${keep === k ? 'btn-primary' : ''}`,
      type: 'button',
      'data-auto': String(k),
      'aria-pressed': String(keep === k),
      onclick: () => {
        setAutoFund(n, k);
        app.tap(10);
        app.save();
        openNeighbours(app);
      },
    }, k ? t('grow.autoKeep', { n: k }) : t('grow.autoOff')),
  );
  return h('div', { class: 'lang-row nb-auto' },
    h('strong', {}, t('grow.auto')),
    h('div', { class: 'row' }, ...btns),
    h('p', { class: 'meta' }, keep ? t('grow.autoOn', { amt: rupiah(autoMonthly(s, n)), floor: rupiah(autoFloor(s)) }) : t('grow.autoHelp')),
  );
}

/** The AI-run RTs: their stars, what each still lacks, and Dana by hand or on auto. */
export function openNeighbours(app: App): void {
  const s = app.s;
  const fund = (n: Neighbour, k: number) => {
    fundNeighbour(s, n, k);
    app.tap(15);
    app.save();
    app.refresh();
    openNeighbours(app);
  };
  const rows = s.neighbours.map((n) => {
    const boost = Math.round(boostOf(n) * 100);
    const one = checkFund(s, n, 1);
    const bulk = checkFund(s, n, NEIGHBOUR.fundBulk);
    const bulkN = Math.min(NEIGHBOUR.fundBulk, NEIGHBOUR.fundMax - n.funded) || NEIGHBOUR.fundBulk;
    return h('div', { class: 'action nb-row', 'data-rt': cellName(n) },
      h('strong', {}, cellName(n)),
      h('p', { class: 'meta' }, t('grow.row', { cell: cellName(n), stars: n.stars, pop: n.pop, n: n.buildings.length })),
      h('p', { class: 'meta' }, t(`grow.trait.${n.trait}`)),
      h('p', { class: `meta nb-status${boost ? ' boosted' : ''}` }, n.funded > 0 ? t('grow.funded', { n: n.funded }) : t('grow.stalled'), boost ? h('strong', { class: 'nb-boost' }, ` ${t('grow.boost', { n: boost })}`) : null),
      missing(app, n),
      h('div', { class: 'row nb-fund' },
        h('button', { class: 'btn', 'data-fund': '1', disabled: !!one, onclick: () => fund(n, 1) }, t('grow.fund', { n: 1 }), ' ', h('span', { class: 'price' }, rupiah(fundCost(s)))),
        h('button', { class: 'btn', 'data-fund': String(NEIGHBOUR.fundBulk), disabled: !!bulk, onclick: () => fund(n, NEIGHBOUR.fundBulk) }, t('grow.fund', { n: bulkN }), ' ', h('span', { class: 'price' }, rupiah(fundCost(s) * bulkN))),
      ),
      one ? h('p', { class: 'meta' }, one) : null,
      autoRow(app, n),
    );
  });
  openSheet(t('grow.title'), [
    h('p', { class: 'meta' }, t('grow.intro')),
    h('p', { class: 'meta' }, t('grow.boostHelp')),
    h('p', { class: 'meta' }, t('grow.combosShared')),
    ...(rows.length ? rows : [h('p', { class: 'meta' }, t('grow.none'))]),
  ]);
}
