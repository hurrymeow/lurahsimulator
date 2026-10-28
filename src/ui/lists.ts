// The Buku Combo and the Warga list. Both open on a row of filter buttons over a picture-first view:
// the Buku Combo is a column of cards, the Warga list groups people by job. Icons are the game's own
// art: building sprites, resource icons, and a job's workplace sprite.
import { bName, cEffect, cName, cStory, jName, t } from '../i18n';
import { jobDef, levelMult, MAX_LEVEL } from '../data/jobs';
import type { App } from '../app';
import { rupiahShort } from '../format';
import { bookCombos, comboConditions, comboStatus, comboStatusText, type ComboStatus } from '../sim/combos';
import { allDefs, def } from '../sim/content';
import { levelOf } from '../sim/jobs';
import { isoURL } from '../render/iso';
import { iconURL } from '../render/sprites';
import type { ComboDef } from '../data/combos';
import type { JobId, Resident, ResourceId } from '../sim/types';
import { h } from './dom';
import { openSheet } from './sheet';
import './lists.css';

const RES: ResourceId[] = ['rupiah', 'sabar', 'orangDalam', 'viral'];

// ---------- icons ----------
const sprite = (id: string, size = 32) => {
  let src = '';
  try {
    src = isoURL(def(id).sprite, 2);
  } catch {
    src = isoURL('rumah', 2);
  }
  return h('img', { src, alt: '', class: 'pixel ls-sprite', width: size, height: size });
};
const resIcon = (id: ResourceId | 'people', size = 16) => h('img', { src: iconURL(id as ResourceId, 2), alt: '', class: 'pixel', width: size, height: size });

/** A job's picture is its workplace: the first building that gives it slots. No job shows a house. */
const jobPlace = (job: JobId): string => (job === 'none' ? 'rumah' : allDefs().find((d) => d.jobSlots && (d.jobSlots as Record<string, number>)[job])?.id ?? 'kantorRT');
const jobLabel = (job: JobId) => (jobDef(job) ? jName(jobDef(job)!) : t('res.noJob'));

/** What a resident makes per month at their level, by resource. */
function output(r: Resident): [ResourceId, number][] {
  const j = jobDef(r.job);
  if (!j) return [];
  const lv = levelOf(r);
  return (Object.entries(j.perMonth) as [ResourceId, number][]).map(([res, v]) => [res, v * (j.perLevel.resources.includes(res) ? levelMult(j.perLevel.boost, lv) : 1)]);
}
function totals(people: Resident[]): [ResourceId, number][] {
  const sum = new Map<ResourceId, number>();
  for (const r of people) for (const [res, v] of output(r)) sum.set(res, (sum.get(res) ?? 0) + v);
  return RES.filter((r) => sum.has(r)).map((r) => [r, sum.get(r)!]);
}
const amount = (res: ResourceId, v: number) => (res === 'rupiah' ? rupiahShort(v) : `${v > 0 ? '+' : ''}${Math.round(v * 10) / 10}`);
/** Resource amounts, icon first, on one standard 8px spacing. */
const outChips = (pairs: [ResourceId, number][]) =>
  h('span', { class: 'ls-out' }, ...pairs.map(([res, v]) => h('span', { class: `ls-amt ${v < 0 ? 'neg' : ''}`, style: `--c:var(--${res === 'orangDalam' ? 'orang' : res})` }, resIcon(res), amount(res, v))));
const stars = (lv: number) => h('span', { class: 'ls-stars', 'aria-label': t('res.level', { n: lv }) }, '★'.repeat(lv), h('span', { class: 'off' }, '★'.repeat(Math.max(0, MAX_LEVEL - lv))));

/** A row of filter buttons. One is pressed; pressing another redraws the list. */
function filterBar<K extends string>(keys: readonly K[], start: K, label: (k: K) => string, aria: (k: K) => string, pick: (k: K) => void): HTMLElement {
  const bar = h('div', { class: 'tabs ls-tabs' });
  for (const k of keys) {
    const b = h('button', { class: 'btn tab', type: 'button', 'data-filter': k, 'aria-pressed': String(k === start), 'aria-label': aria(k) }, label(k));
    b.addEventListener('click', () => {
      bar.querySelectorAll('.tab').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      pick(k);
    });
    bar.append(b);
  }
  return bar;
}

// ---------- Buku Combo ----------
const STATE_ICON: Record<ComboStatus['state'], string> = { active: '✓', found: '★', todo: '?' };
const stateName = (st: ComboStatus['state']) => t(`combo.state.${st}` as 'combo.state.active');
const badge = (st: ComboStatus) => h('span', { class: `ls-badge ${st.state}` }, h('b', { 'aria-hidden': 'true' }, STATE_ICON[st.state]), stateName(st.state));
const members = (c: ComboDef, st: ComboStatus, size = 32) => {
  const missing = new Set(st.missing);
  const parts: Node[] = [];
  c.needs.forEach((id, i) => {
    if (i) parts.push(h('span', { class: 'ls-plus', 'aria-hidden': 'true' }, '+'));
    const img = sprite(id, size);
    if (missing.has(bName(def(id)))) img.classList.add('missing');
    parts.push(h('span', { class: 'ls-member', title: bName(def(id)) }, img));
  });
  return h('span', { class: 'ls-members' }, ...parts);
};

type ComboFilter = 'all' | ComboStatus['state'];

/** A list of combo cards under filter buttons, one per row. A card shows the name, the buildings, a state
 * mark and the effect in two lines; tapping it opens the whole entry below it. */
export function openComboBook(app: App): void {
  const s = app.s;
  const combos = bookCombos(s).map((c) => ({ c, st: comboStatus(s, c) }));
  const found = combos.filter(({ c }) => s.discovered.includes(c.id)).length;
  const count = (k: ComboFilter) => (k === 'all' ? combos.length : combos.filter((x) => x.st.state === k).length);
  const head = h('div', { class: 'ls-progress' }, h('span', {}, t('combo.count', { found, total: combos.length })), h('div', { class: 'meter', 'aria-hidden': 'true' }, h('div', { style: `width:${(found / Math.max(1, combos.length)) * 100}%` })));
  const grid = h('div', { class: 'ls-grid' });
  const detail = h('div', { class: 'ls-detail', hidden: true });
  let open: string | null = null;

  const tile = ({ c, st }: (typeof combos)[number]) => {
    const b = h('button', { class: `ls-tile ${st.state}`, type: 'button', 'data-combo': c.id, 'aria-expanded': 'false' },
      h('span', { class: 'ls-tile-top' }, h('strong', { class: 'ls-tile-name' }, cName(c)), members(c, st, 24), h('span', { class: `ls-corner ${st.state}`, title: stateName(st.state) }, STATE_ICON[st.state])),
      h('span', { class: 'ls-desc', 'data-clamp': '2' }, cEffect(c)),
    );
    b.addEventListener('click', () => show(b, c, st));
    return b;
  };
  const show = (b: HTMLElement, c: ComboDef, st: ComboStatus) => {
    grid.querySelectorAll('.ls-tile').forEach((x) => x.setAttribute('aria-expanded', 'false'));
    if (open === c.id) {
      open = null;
      detail.hidden = true;
      return;
    }
    open = c.id;
    b.setAttribute('aria-expanded', 'true');
    detail.hidden = false;
    detail.replaceChildren(
      h('div', { class: 'ls-detail-head' }, h('strong', {}, cName(c)), badge(st)),
      h('p', {}, cEffect(c)),
      h('p', { class: 'meta' }, comboConditions(c)),
      h('p', { class: st.missing.length ? 'missing-line' : 'meta' }, comboStatusText(st)),
      ...(s.discovered.includes(c.id) ? [h('p', { class: 'meta story' }, cStory(c))] : []),
    );
    b.after(detail);
    detail.scrollIntoView({ block: 'nearest' });
  };
  const draw = (k: ComboFilter) => {
    open = null;
    detail.hidden = true;
    const shown = combos.filter((x) => k === 'all' || x.st.state === k);
    grid.replaceChildren(...shown.map(tile), detail);
    if (!shown.length) grid.prepend(h('p', { class: 'meta ls-empty' }, t('ls.empty')));
  };
  const bar = filterBar<ComboFilter>(['all', 'active', 'found', 'todo'], 'all',
    (k) => (k === 'all' ? `${t('ls.all')} ${count(k)}` : `${STATE_ICON[k]} ${count(k)}`),
    (k) => `${k === 'all' ? t('ls.all') : stateName(k)}: ${count(k)}`, draw);
  draw('all');
  openSheet(t('menu.combo'), [head, bar, grid]);
}

// ---------- Warga ----------
type WargaFilter = 'job' | 'idle' | 'level';

/** People grouped by job under a summary line and filter buttons. Each group shows the workplace, the
 * headcount and what the group makes a month; each person is a chip with their name and level stars. */
export function openWargaList(app: App, openOne: (id: number) => void): void {
  const s = app.s;
  const idle = s.residents.filter((r) => r.job === 'none');
  const sum = h('div', { class: 'ls-sum' }, h('span', { class: 'ls-sum-n', 'aria-label': t('res.pop') }, resIcon('people', 18), String(s.residents.length)), outChips(totals(s.residents)));
  const list = h('div', { class: 'ls-groups' });
  const chip = (r: Resident, sub: Node) => h('button', { class: 'ls-chip', type: 'button', 'data-rid': String(r.id), onclick: () => openOne(r.id) }, h('span', {}, r.name), sub);
  const group = (key: string, icon: Node, title: string, people: Resident[], sub: (r: Resident) => Node, warn = false) =>
    h('section', { class: `ls-group ${warn ? 'idle' : ''}`, 'data-group': key },
      h('div', { class: 'ls-group-head' }, icon, h('strong', { class: 'ls-group-name' }, `${title} · ${people.length}`), outChips(totals(people))),
      h('div', { class: 'ls-chips' }, ...people.map((r) => chip(r, sub(r)))),
    );
  const draw = (k: WargaFilter) => {
    if (k === 'level') {
      const lvs = [...new Set(s.residents.map(levelOf))].sort((a, b) => b - a);
      list.replaceChildren(...lvs.map((lv) => group(`lv${lv}`, stars(lv), t('res.level', { n: lv }), s.residents.filter((r) => levelOf(r) === lv), (r) => h('span', { class: 'ls-job' }, jobLabel(r.job)))));
      return;
    }
    const jobs = k === 'idle' ? (idle.length ? ['none' as JobId] : []) : [...new Set(s.residents.map((r) => r.job))].sort((a, b) => (a === 'none' ? -1 : b === 'none' ? 1 : jobLabel(a).localeCompare(jobLabel(b))));
    list.replaceChildren(...jobs.map((job) => group(job, sprite(jobPlace(job), 40), jobLabel(job), s.residents.filter((r) => r.job === job), (r) => stars(levelOf(r)), job === 'none')));
    if (!jobs.length) list.append(h('p', { class: 'meta ls-empty' }, t('ls.allWork')));
  };
  const bar = filterBar<WargaFilter>(['job', 'idle', 'level'], 'job',
    (k) => (k === 'job' ? t('ls.byJob') : k === 'idle' ? `${t('res.noJob')} ${idle.length}` : t('ls.byLevel')),
    (k) => (k === 'idle' ? `${t('res.noJob')}: ${idle.length}` : k === 'job' ? t('ls.byJob') : t('ls.byLevel')), draw);
  draw('job');
  openSheet(t('menu.warga'), [sum, bar, h('p', { class: 'meta' }, t('res.hint')), list]);
}
