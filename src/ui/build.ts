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

/** "2 owned", or "1/1 owned" for a building with a cap. Paths count tiles. */
function ownedLabel(s: GameState, d: { id: string; maxCount?: number }): string {
  const n = s.buildings.filter((b) => b.def === d.id).length;
  return d.maxCount ? t('build.ownedOf', { n, max: d.maxCount }) : t('build.owned', { n });
}

/** The card's short count, "×2" or "×1/1"; the words wait in the detail and the label. */
function ownedShort(s: GameState, d: { id: string; maxCount?: number }): string {
  const n = s.buildings.filter((b) => b.def === d.id).length;
  return d.maxCount ? `×${n}/${d.maxCount}` : `×${n}`;
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

/** Marks buildings as seen on the Build screen, so their NEW tag stops (UI.md checklist item 4). */
function markSeen(ids: string[]): void {
  const seen = loadSeen() ?? new Set<string>();
  for (const id of ids) seen.add(id);
  storage.set(SEEN_KEY, JSON.stringify([...seen]));
}

/** How long a card must be at least half on screen before its NEW counts as seen. */
const SEEN_AFTER_MS = 2000;

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
  // The very first look counts the starter set as seen, so a new game opens with no NEW tags.
  if (!seen) markSeen(visible.map((d) => d.id));
  const fresh = new Set(seen ? visible.filter((d) => !seen.has(d.id)).map((d) => d.id) : []);
  // A card's NEW clears once it has been at least half on screen for 2s, or when it is tapped. Opening the sheet alone
  // clears nothing, and the tab and dock badges stay while any card under them is unseen.
  const sheetEl = document.getElementById('sheet') as HTMLElement;
  const timers = new Map<string, number>();
  const seenNow = (id: string) => {
    if (!fresh.has(id)) return;
    fresh.delete(id);
    markSeen([id]);
    document.querySelector(`#sheet .build-row[data-def="${id}"] .new-tag`)?.remove();
    for (const b of bar.querySelectorAll<HTMLElement>('.tab')) {
      if (!visible.some((d) => categoryOf(d) === b.dataset.tab && fresh.has(d.id))) b.querySelector('.new-tag')?.remove();
    }
    app.refresh();
  };
  const watch = typeof IntersectionObserver === 'undefined' ? null : new IntersectionObserver((entries) => {
    for (const e of entries) {
      const id = (e.target as HTMLElement).dataset.def!;
      if (e.isIntersecting && e.intersectionRatio >= 0.5) {
        if (!timers.has(id)) timers.set(id, window.setTimeout(() => seenNow(id), SEEN_AFTER_MS));
      } else {
        clearTimeout(timers.get(id));
        timers.delete(id);
      }
    }
  }, { root: sheetEl, threshold: [0, 0.5, 1] });
  const unwatch = () => {
    watch?.disconnect();
    for (const id of timers.keys()) clearTimeout(timers.get(id));
    timers.clear();
  };
  const card = (d: (typeof visible)[number]): HTMLElement => {
    const cost = buildCost(s, d);
    const missing = requirementGaps(s, d);
    if (s.res.rupiah < cost) missing.push(t('build.needMore', { amt: rupiah(cost - s.res.rupiah) }));
    const ok = missing.length === 0;
    // One line per card: what it is, what it costs, how many you have. The rest waits behind the info button.
    const house = d.housing ? h('span', { class: 'card-house' }, h('img', { src: menuIconURL('build') ?? '', alt: '', width: 16, height: 16, class: 'pixel' }), String(d.housing)) : null;
    const cardBtn = h('button', { class: `card-btn ${ok ? '' : 'locked'}`, 'aria-disabled': String(!ok), onclick: () => {
      seenNow(d.id);
      if (ok) app.startPlacing(d.id);
    } },
      spriteImg(d.sprite),
      h('div', { class: 'card-text' },
        h('div', { class: 'card-title' }, h('strong', {}, bName(d), fresh.has(d.id) ? newTag() : null), h('span', { class: 'cost' }, rupiah(cost))),
        h('p', { class: 'card-sub' }, h('span', { class: 'owned', 'aria-label': ownedLabel(s, d) }, ownedShort(s, d)), house),
        // One reason on the card; the detail lists them all. A full cap says so in two words.
        ok ? null : missingList([missing[0] === t('sim.limit', { n: d.maxCount ?? 0 }) ? t('build.atLimit') : missing[0]]),
      ),
    );
    const infoBtn = h('button', { class: 'btn btn-icon build-info', type: 'button', 'aria-label': t('build.info', { name: bName(d) }), onclick: () => {
      seenNow(d.id);
      showDetail(d);
    } }, 'i');
    const row = h('div', { class: 'build-row', 'data-def': d.id }, cardBtn, infoBtn);
    if (fresh.has(d.id)) watch?.observe(row);
    return row;
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
    unwatch();
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
    unwatch();
    app.refresh();
  };
  // The Combo book is not a building tab: it opens from the header and swaps the sheet body.
  // It is never remembered, so the next Build still opens on buildings.
  let buildTop = 0;
  const showBuild = () => {
    openSheet(t('build.title'), [...head, bar, list], onClosed, comboButton());
    sheetEl.scrollTop = buildTop;
    // Back from a detail or the Combo book: watch the unseen cards again.
    for (const row of list.querySelectorAll<HTMLElement>('.build-row')) if (fresh.has(row.dataset.def!)) watch?.observe(row);
  };
  const showCombos = () => {
    unwatch();
    buildTop = sheetEl.scrollTop;
    try {
      storage.set(COMBO_SEEN_KEY, JSON.stringify(s.discovered));
    } catch { /* storage may be unavailable */ }
    const back = h('button', { class: 'btn head-action', id: 'combo-back', onclick: showBuild }, '‹ ', t('build.title'));
    openSheet(t('menu.combo'), comboBook(app), onClosed, back);
  };
  // The detail behind a card's info button: the blurb, size, permit and effects, then Place or what is missing.
  const showDetail = (d: (typeof visible)[number]) => {
    unwatch();
    buildTop = sheetEl.scrollTop;
    const cost = buildCost(s, d);
    const missing = requirementGaps(s, d);
    if (s.res.rupiah < cost) missing.push(t('build.needMore', { amt: rupiah(cost - s.res.rupiah) }));
    const instant = d.permitMonths <= 0 && d.buildMonths <= 0;
    const effects = [d.housing ? t('build.houses', { n: d.housing }) : '', d.attract ? t('build.attracts', { n: d.attract }) : ''].filter(Boolean);
    const body: (Node | null)[] = [
      h('div', { class: 'build-detail-pic' }, spriteImg(d.sprite, 64)),
      h('p', {}, rupiah(cost), ' · ', ownedLabel(s, d)),
      h('p', {}, bBlurb(d)),
      h('p', { class: 'meta' }, t('build.size', { w: sizeFor(d.id)[0], h: sizeFor(d.id)[1] }), ' · ', instant ? t('build.noPermit') : t('build.permit', { permit: d.permitMonths, build: d.buildMonths })),
      effects.length ? h('p', { class: 'meta' }, effects.join(' · ')) : null,
      missing.length ? missingList(missing) : h('div', { class: 'action' }, h('button', { class: 'btn btn-primary', id: 'build-place', type: 'button', onclick: () => app.startPlacing(d.id) }, t('page.place'))),
    ];
    const back = h('button', { class: 'btn head-action', id: 'build-back', onclick: showBuild }, '‹ ', t('build.title'));
    openSheet(bName(d), body.filter((x): x is Node => !!x), onClosed, back);
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
