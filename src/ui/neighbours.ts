import { t, type Key } from '../i18n';
import type { App } from '../app';
import { NEIGHBOUR } from '../sim/balance';
import { aiGoals, cellName, checkFund, checkTakeover, fundNeighbour, handBack, setAutoFund, takeover } from '../sim/grow';
import { viewOf } from '../sim/neighbourView';
import { starChecklist, type ChecklistLine } from '../sim/stages';
import { DISTRICT_PACE, DISTRICT_STAR_WEEKS } from '../sim/kec';
import type { DistrictId } from '../render/scenery';
import type { District, Neighbour } from '../sim/types';
import { h } from './dom';
import { openSheet } from './sheet';
import { starRow } from './stage';

/** The star goals an AI RT chases: the ranking wins are the player's own. */
function aiLines(app: App, n: Neighbour): ChecklistLine[] {
  const lines = starChecklist(viewOf(app.s, n), 'rt', n.stars) ?? [];
  const keep = new Set(aiGoals(lines.map((l) => l.goal)));
  return lines.filter((l) => keep.has(l.goal));
}

/** The one goal still blocking the RT, or Max at 3 stars. */
function blocking(app: App, n: Neighbour): string {
  const lines = aiLines(app, n);
  return lines.find((l) => !l.done)?.text ?? (n.stars === 3 ? t('grow.chipMax') : lines[0]?.text ?? t('grow.chipMax'));
}

/** The row's one status chip: who runs it, then its stars and banked Dana. */
function chipOf(n: Neighbour): { key: Key; cls: string } {
  if (n.run === 'player') return { key: 'grow.chipYours', cls: 'nb-yours' };
  if (n.stars === 3) return { key: 'grow.chipMax', cls: 'nb-max' };
  if ((n.funded ?? 0) > 0) return { key: 'grow.chipBuilding', cls: 'nb-building' };
  return { key: 'grow.chipStalled', cls: 'nb-stalled' };
}

/** Off, 3, 6, 12, then back to off. */
const AUTOS = [0, ...NEIGHBOUR.autoLevels];
const nextAuto = (keep: number): number => AUTOS[(AUTOS.indexOf(keep) + 1) % AUTOS.length];

/** One chip, showing the level it is on. */
function autoChip(keep: number, onclick: () => void): Node {
  return h('div', { class: 'nb-auto' },
    h('button', { class: 'btn', type: 'button', 'data-auto': String(keep), 'aria-pressed': String(!!keep), onclick },
      `${t('grow.auto')} · ${keep ? t('grow.autoKeep', { n: keep }) : t('grow.autoOff')}`),
  );
}

/** A modelled Kelurahan of the Kecamatan: its stars, how it leans, and its pinjol and Aman. */
function districtCard(d: District): Node {
  const left = d.stars < 3 ? Math.max(1, Math.ceil((DISTRICT_STAR_WEEKS[d.stars] - d.progress) / DISTRICT_PACE[d.trait])) : 0;
  return h('div', { class: 'action nb-row', 'data-district': d.id },
    h('strong', {}, t(`kec.district.${d.id}` as Key), ' ', h('span', { class: 'stage-stars', 'aria-hidden': 'true' }, starRow(d.stars))),
    h('p', { class: 'meta' }, t(`kec.trait.${d.trait}` as Key)),
    h('p', { class: 'meta' }, t('kec.district.stats', { pinjol: Math.round(d.pinjol), aman: Math.round(d.aman) })),
    h('p', { class: 'meta' }, left ? t('kec.district.next', { n: left }) : t('kec.district.max')),
  );
}

/** Tapping a district block on the map: the same card the Neighbours sheet lists. */
export function openDistrict(app: App, id: DistrictId): void {
  const d = app.s.kec?.districts.find((x) => x.id === id);
  if (!d) return;
  openSheet(t(`kec.district.${id}` as Key), [districtCard(d), h('p', { class: 'meta' }, t('kec.district.help'))]);
}

type View = { kind: 'list' } | { kind: 'detail'; i: number } | { kind: 'help' };

const backButton = (app: App): Node => h('button', { class: 'btn head-action', type: 'button', onclick: () => openNeighbours(app) }, '‹ ', t('page.back'));

/** One RT: its unmet goals, Dana by hand or on auto, and the way to take it over or hand it back. */
function detail(app: App, view: { kind: 'detail'; i: number }): void {
  const s = app.s;
  const n = s.neighbours[view.i];
  if (!n) return;
  const reopen = () => {
    app.tap(15);
    app.save();
    app.refresh();
    openNeighbours(app, view);
  };
  const body: Node[] = [];
  const unmet = aiLines(app, n).filter((l) => !l.done);
  if (n.stars === 3) body.push(h('p', { class: 'meta' }, t('grow.maxStars')));
  else if (unmet.length) body.push(h('ul', { class: 'checklist' }, ...unmet.map((l) => h('li', {}, l.text))));
  if (n.run === 'player') {
    body.push(h('div', { class: 'nb-take' },
      h('button', { class: 'btn', type: 'button', 'data-handback': '1', onclick: () => {
        handBack(s, n);
        // Say what happens next: building resumes only with Dana banked.
        app.notice({ title: t('grow.handedBack', { cell: cellName(n) }), body: n.autoKeep ? t('grow.handedBackAuto', { n: n.autoKeep }) : t('grow.handedBackFund'), tone: 'info' });
        app.tap(15);
        app.save();
        app.refresh();
        openNeighbours(app);
      } }, t('grow.handBack')),
      h('p', { class: 'meta' }, t('grow.handBackHelp', { n: NEIGHBOUR.takeoverOd })),
    ));
  } else {
    const one = checkFund(s, n, 1);
    const bulk = checkFund(s, n, NEIGHBOUR.fundBulk);
    const fund = (k: number) => {
      fundNeighbour(s, n, k);
      reopen();
    };
    const take = checkTakeover(s, n);
    body.push(
      h('div', { class: 'row nb-fund' },
        h('button', { class: 'btn btn-primary', type: 'button', 'data-fund': String(NEIGHBOUR.fundBulk), disabled: !!bulk, onclick: () => fund(NEIGHBOUR.fundBulk) }, t('grow.fund', { n: NEIGHBOUR.fundBulk })),
        h('button', { class: 'btn', type: 'button', 'data-fund': '1', disabled: !!one, onclick: () => fund(1) }, t('grow.fund', { n: 1 })),
      ),
    );
    const why = one ?? bulk;
    if (why) body.push(h('p', { class: 'meta' }, why));
    body.push(
      autoChip(n.autoKeep ?? 0, () => {
        setAutoFund(n, nextAuto(n.autoKeep ?? 0));
        app.tap(10);
        app.save();
        openNeighbours(app, view);
      }),
      h('div', { class: 'nb-take' },
        h('button', { class: 'btn', type: 'button', 'data-takeover': '1', disabled: !!take, onclick: () => {
          takeover(s, n);
          app.notice({ title: t('grow.tookOver', { cell: cellName(n) }), body: t('grow.playerRun'), tone: 'good' });
          app.tap(15);
          app.save();
          app.refresh();
          openNeighbours(app);
        } }, t('grow.takeover', { n: NEIGHBOUR.takeoverOd })),
        h('p', { class: 'meta' }, take ?? t('grow.takeoverHelp')),
      ),
    );
  }
  openSheet(cellName(n), body, undefined, backButton(app));
}

/** The rules, kept off the list and behind the "?" in the sheet head. */
function openHelp(app: App): void {
  openSheet(t('grow.title'), [
    h('p', { class: 'meta' }, t('grow.intro')),
    h('p', { class: 'meta' }, t('grow.modes')),
    h('p', { class: 'meta' }, t('grow.boostHelp')),
    h('p', { class: 'meta' }, t('grow.autoHelp')),
    h('p', { class: 'meta' }, t('grow.combosShared')),
    h('p', { class: 'meta' }, t('grow.rankHelp')),
  ], undefined, backButton(app));
}

/** The AI-run RTs: one row each, Stalled first, then its detail. */
export function openNeighbours(app: App, view: View = { kind: 'list' }): void {
  const s = app.s;
  if (view.kind === 'help') return openHelp(app);
  if (view.kind === 'detail') return detail(app, view);
  const help = h('button', { class: 'btn head-action', type: 'button', 'aria-label': t('grow.help'), onclick: () => openNeighbours(app, { kind: 'help' }) }, '?');
  const isStalled = (n: Neighbour) => chipOf(n).cls === 'nb-stalled';
  const ordered = s.neighbours.map((n, i) => ({ n, i })).sort((a, b) => Number(isStalled(b.n)) - Number(isStalled(a.n)));
  const rows = ordered.map(({ n, i }) => {
    const chip = chipOf(n);
    return h('button', {
      class: `btn nb-list-row${n.run === 'player' ? ' nb-mine' : ''}`,
      type: 'button',
      'data-nb-row': cellName(n),
      onclick: () => openNeighbours(app, { kind: 'detail', i }),
    },
    h('span', { class: 'nb-name' }, cellName(n), ' ', h('span', { class: 'stage-stars', 'aria-hidden': 'true' }, starRow(n.stars))),
    h('span', { class: `nb-chip ${chip.cls}` }, t(chip.key)),
    h('span', { class: 'nb-need' }, blocking(app, n)),
    );
  });
  const ai = s.neighbours.filter((n) => n.run !== 'player');
  const keep = ai[0]?.autoKeep ?? 0;
  const all = h('button', { class: 'btn', type: 'button', id: 'nb-auto-all', 'data-auto': String(keep), onclick: () => {
    for (const n of ai) setAutoFund(n, nextAuto(keep));
    app.tap(10);
    app.save();
    openNeighbours(app);
  } }, `${t('grow.autoAll')} · ${keep ? t('grow.autoKeep', { n: keep }) : t('grow.autoOff')}`);
  openSheet(t('grow.title'), [
    ...(ai.length ? [h('div', { class: 'action-row' }, all)] : []),
    ...(rows.length ? rows : [h('p', { class: 'meta' }, t('grow.none'))]),
    ...(s.kec ? [h('h3', {}, t('kec.district.head')), ...s.kec.districts.map(districtCard)] : []),
  ], undefined, help);
}
