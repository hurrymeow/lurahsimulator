import { bBlurb, bName, t, type Key } from '../i18n';
import type { App } from '../app';
import { rupiah } from '../format';
import { CATEGORIES, categoryOf } from '../data/categories';
import { isoURL } from '../render/iso';
import { placeableDefs } from '../sim/content';
import { requirementGaps } from '../sim/rules';
import { attractTarget, buildCost, footprintOf, housing, population } from '../sim/state';
import { nextStarChecklist } from '../sim/stages';
import type { BuildCategory, GameState } from '../sim/types';
import { h, missingList } from './dom';
import { storage } from '../storage';
import { openSheet } from './sheet';

function spriteImg(name: string, size = 40, level = 1): HTMLImageElement {
  return h('img', { src: isoURL(name, 3, level), alt: '', width: size, height: size, class: 'pixel' });
}

/** "Houses 3 · Attracts 1", so the population effect is visible before buying. */
/** "2 owned", or "1/1 owned" for a building with a cap. Paths count tiles. */
function ownedLabel(s: GameState, d: { id: string; maxCount?: number }): string {
  const n = s.buildings.filter((b) => b.def === d.id).length;
  return d.maxCount ? t('build.ownedOf', { n, max: d.maxCount }) : t('build.owned', { n });
}

function populationBits(d: { housing?: number; attract?: number }): string[] {
  const bits: string[] = [];
  if (d.housing) bits.push(t('build.houses', { n: d.housing }));
  if (d.attract) bits.push(t('build.attracts', { n: d.attract }));
  return bits;
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

/** New game: the next Build screen counts everything on it as already seen. */
export function resetBuildSeen(): void {
  storage.remove(SEEN_KEY);
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
    const instant = d.permitMonths <= 0 && d.buildMonths <= 0;
    const meta = [t('build.size', { n: footprintOf(d.id) }), instant ? t('build.noPermit') : t('build.permit', { permit: d.permitMonths, build: d.buildMonths }), ...populationBits(d)];
    return h('button', { class: `card-btn ${ok ? '' : 'locked'}`, 'aria-disabled': String(!ok), onclick: () => (ok ? app.startPlacing(d.id) : undefined) },
      spriteImg(d.sprite),
      h('div', { class: 'card-text' },
        h('div', { class: 'card-title' }, h('strong', {}, bName(d), fresh.has(d.id) ? newTag() : null), h('span', { class: 'cost' }, rupiah(cost))),
        h('p', { class: 'owned' }, ownedLabel(s, d)),
        h('p', {}, bBlurb(d)),
        ok ? h('p', { class: 'meta' }, meta.join(' · ')) : missingList(missing),
      ),
    );
  };
  const tabs = CATEGORIES.filter((c) => visible.some((d) => categoryOf(d) === c));
  let tab = lastTab && tabs.includes(lastTab) ? lastTab : tabs[0];
  const list = h('div', { class: 'build-list' });
  const bar = h('div', { class: 'tabs', role: 'group', 'aria-label': t('build.cat.tabs') });
  const show = (c: BuildCategory) => {
    tab = c;
    lastTab = c;
    // Jalan Setapak leads the first tab and its own, since nothing works without a path.
    const here = visible.filter((d) => categoryOf(d) === c);
    const path = visible.find((d) => d.id === 'jalan');
    const rows = path && c === tabs[0] && !here.includes(path) ? [path, ...here] : here.sort((a, b) => Number(b.id === 'jalan') - Number(a.id === 'jalan'));
    list.replaceChildren(...rows.map(card));
    bar.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.tab === c)));
  };
  for (const c of tabs) bar.append(h('button', { class: 'btn tab', 'data-tab': c, 'aria-pressed': 'false', onclick: () => show(c) }, t(`build.cat.${c}` as Key), visible.some((d) => categoryOf(d) === c && fresh.has(d.id)) ? newTag(true) : null));
  if (tab) show(tab);
  // The two population levers, and what the next star wants, right where the player acts.
  const goal = nextStarChecklist(s)?.find((l) => !l.done);
  const head: Node[] = [
    h('p', { class: 'meta' }, t('pop.line', { pop: population(s), housing: housing(s), attract: attractTarget(s) })),
  ];
  if (goal) head.push(h('p', { class: 'meta' }, t('stage.next', { goal: goal.text })));
  openSheet(t('build.title'), [...head, bar, list], () => {
    storage.set(SEEN_KEY, JSON.stringify(visible.map((d) => d.id)));
    app.refresh();
  });
}

export { spriteImg };
