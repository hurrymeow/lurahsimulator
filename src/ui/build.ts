import { bBlurb, bName, t, type Key } from '../i18n';
import type { App } from '../app';
import { rupiah } from '../format';
import { CATEGORIES, categoryOf } from '../data/categories';
import { isoURL } from '../render/iso';
import { placeableDefs, sizeFor } from '../sim/content';
import { requirementGaps } from '../sim/rules';
import { attractTarget, buildCost, housing, population } from '../sim/state';
import { nextStarChecklist } from '../sim/stages';
import type { BuildCategory, GameState } from '../sim/types';
import { h, missingList } from './dom';
import { storage } from '../storage';
import { openSheet } from './sheet';
import { comboBook } from './lists';
import { bookCombos } from '../sim/combos';
import { menuIconURL } from './icons';

function spriteImg(name: string, size = 40, level = 1): HTMLImageElement {
  return h('img', { src: isoURL(name, 3, level), alt: '', width: size, height: size, class: 'pixel' });
}

/** "Houses 3 · Attracts 1", so the population effect is visible before buying. */
/** "2 owned", or "1/1 owned" for a building with a cap. Paths count tiles. */
function ownedLabel(s: GameState, d: { id: string; maxCount?: number }): string {
  const n = s.buildings.filter((b) => b.def === d.id).length;
  return d.maxCount ? t('build.ownedOf', { n, max: d.maxCount }) : t('build.owned', { n });
}

const SEEN_KEY = 'pakrt.buildSeen';

function loadSeen(): Set<string> | null {
  try {
    const v = JSON.parse(storage.get(SEEN_KEY) ?? 'null');
    return Array.isArray(v) ? new Set(v) : null;
  } catch {
    return null;
  }
}

const COMBO_SEEN_KEY = 'pakrt.comboSeen';

function comboSeen(): Set<string> {
  try {
    const v = JSON.parse(storage.get(COMBO_SEEN_KEY) ?? 'null');
    return new Set(Array.isArray(v) ? v : []);
  } catch {
    return new Set();
  }
}

/** True when a combo was found since the player last viewed the Combo book. */
export function hasUnseenCombo(s: GameState): boolean {
  const seen = comboSeen();
  return s.discovered.some((id) => !seen.has(id));
}

/** New game: the next Build screen counts everything on it as already seen. */
export function resetBuildSeen(): void {
  storage.remove(SEEN_KEY);
  storage.remove(COMBO_SEEN_KEY);
}

/** Buildings the player can place now that they have not seen on the Build screen yet. */
export function unseenBuildings(s: GameState): string[] {
  const seen = loadSeen();
  if (!seen) return [];
  return placeableDefs().filter((d) => !seen.has(d.id) && requirementGaps(s, d, { ignoreLimit: true }).length === 0).map((d) => d.id);
}

/** The animated pixel NEW tag, for build cards, Build tabs and the dock's Build button. */
export const newTag = (small = false): HTMLElement => h('span', { class: `new-tag${small ? ' small' : ''}`, 'data-new': '1' }, t('build.new'));

/** The tab the player last used, so a second build opens where the first left off. */
let lastTab: BuildCategory | null = null;

export function openBuild(app: App): void {
  const s = app.s;
  // Anything still locked (stars, population, a missing building, a year) stays out of sight. The header says what the next star wants.
  const visible = placeableDefs().filter((d) => requirementGaps(s, d, { ignoreLimit: true }).length === 0);
  // Buildings that opened since the player last looked carry a New tag. The first look marks the starter set as seen.
  const seen = loadSeen();
  const fresh = new Set(seen ? visible.filter((d) => !seen.has(d.id)).map((d) => d.id) : []);
  const card = (d: (typeof visible)[number]): HTMLElement => {
    const cost = buildCost(s, d);
    const missing = requirementGaps(s, d);
    if (s.res.rupiah < cost) missing.push(t('build.needMore', { amt: rupiah(cost - s.res.rupiah) }));
    const ok = missing.length === 0;
    const cardBtn = h('button', { class: `card-btn ${ok ? '' : 'locked'}`, 'aria-disabled': String(!ok), onclick: () => (ok ? app.startPlacing(d.id) : undefined) },
      spriteImg(d.sprite),
      h('div', { class: 'card-text' },
        h('div', { class: 'card-title' }, h('strong', {}, bName(d), fresh.has(d.id) ? newTag() : null), h('span', { class: 'cost' }, rupiah(cost))),
        h('p', { class: 'owned' }, ownedLabel(s, d), d.housing ? h('img', { src: menuIconURL('build') ?? '', alt: '', width: 16, height: 16, class: 'pixel' }) : null, d.housing ? String(d.housing) : null),
        ok ? null : missingList(missing.slice(0, 1)),
      ),
    );
    const infoBtn = h('button', { class: 'btn-icon build-info', type: 'button', 'aria-label': t('build.info', { name: bName(d) }), onclick: () => showDetail(d) }, 'i');
    return h('div', { class: 'build-row' }, cardBtn, infoBtn);
  };
  const tabs = CATEGORIES.filter((c) => visible.some((d) => categoryOf(d) === c));
  let tab = lastTab && tabs.includes(lastTab) ? lastTab : tabs[0];
  const list = h('div', { class: 'build-list' });
  const bar = h('div', { class: 'tabs build-tabs', role: 'group', 'aria-label': t('build.cat.tabs') });
  const press = (key: string) => bar.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.tab === key)));
  const show = (c: BuildCategory) => {
    tab = c;
    lastTab = c;
    // Jalan Setapak leads the Decor tab it lives on, since nothing works without a path.
    const rows = visible.filter((d) => categoryOf(d) === c).sort((a, b) => Number(b.id === 'jalan') - Number(a.id === 'jalan'));
    list.replaceChildren(...rows.map(card));
    press(c);
  };
  for (const c of tabs) bar.append(h('button', { class: 'btn tab', 'data-tab': c, 'aria-pressed': 'false', onclick: () => show(c) }, t(`build.cat.${c}` as Key), visible.some((d) => categoryOf(d) === c && fresh.has(d.id)) ? newTag(true) : null));
  if (tab) show(tab);
  // The two population levers, and what the next star wants, right where the player acts.
  const goal = nextStarChecklist(s)?.find((l) => !l.done);
  const head: Node[] = [
    h('p', { class: 'meta' }, t('pop.line', { pop: population(s), housing: housing(s), attract: attractTarget(s) })),
  ];
  if (goal) head.push(h('p', { class: 'meta' }, t('stage.next', { goal: goal.text })));
  const onClosed = () => {
    storage.set(SEEN_KEY, JSON.stringify(visible.map((d) => d.id)));
    app.refresh();
  };
  const sheetEl = document.getElementById('sheet') as HTMLElement;
  // The Combo book is not a building tab: it opens from the header and swaps the sheet body.
  // It is never remembered, so the next Build still opens on buildings.
  let buildTop = 0;
  const showBuild = () => {
    openSheet(t('build.title'), [...head, bar, list], onClosed, comboButton());
    sheetEl.scrollTop = buildTop;
  };
  const showCombos = () => {
    buildTop = sheetEl.scrollTop;
    try {
      storage.set(COMBO_SEEN_KEY, JSON.stringify(s.discovered));
    } catch { /* storage may be unavailable */ }
    const back = h('button', { class: 'btn head-action', id: 'combo-back', onclick: showBuild }, '‹ ', t('build.title'));
    openSheet(t('menu.combo'), comboBook(app), onClosed, back);
  };
  const showDetail = (d: (typeof visible)[number]) => {
    buildTop = sheetEl.scrollTop;
    const cost = buildCost(s, d);
    const missing = requirementGaps(s, d);
    if (s.res.rupiah < cost) missing.push(t('build.needMore', { amt: rupiah(cost - s.res.rupiah) }));
    const instant = d.permitMonths <= 0 && d.buildMonths <= 0;
    const body: Node[] = [
      spriteImg(d.sprite, 64),
      h('p', {}, rupiah(cost), ' · ', ownedLabel(s, d)),
      h('p', {}, bBlurb(d)),
      h('p', { class: 'meta' }, t('build.size', { w: sizeFor(d.id)[0], h: sizeFor(d.id)[1] }), ' · ', instant ? t('build.noPermit') : t('build.permit', { permit: d.permitMonths, build: d.buildMonths })),
    ];
    const bits: string[] = [];
    if (d.housing) bits.push(t('build.houses', { n: d.housing }));
    if (d.attract) bits.push(t('build.attracts', { n: d.attract }));
    if (bits.length) body.push(h('p', { class: 'meta' }, bits.join(' · ')));
    if (missing.length) body.push(missingList(missing));
    else body.push(h('button', { class: 'btn btn-primary', id: 'build-place', type: 'button', onclick: () => app.startPlacing(d.id) }, t('page.place')));
    const back = h('button', { class: 'btn head-action', onclick: showBuild }, '‹ ', t('build.title'));
    openSheet(bName(d), body, onClosed, back);
  };
  function comboButton(): HTMLElement {
    const total = bookCombos(s).length;
    const found = bookCombos(s).filter((c) => s.discovered.includes(c.id)).length;
    const url = menuIconURL('combo');
    return h('button', { class: 'btn head-action', id: 'combo-open', 'aria-label': t('combo.open'), onclick: showCombos },
      url ? h('img', { src: url, alt: '', width: 20, height: 20, class: 'pixel' }) : null,
      h('span', {}, `${found}/${total}`),
      hasUnseenCombo(s) ? newTag(true) : null);
  }
  showBuild();
}

export { spriteImg };
