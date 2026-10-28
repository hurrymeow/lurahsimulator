// PROTOTYPE: three looks for the Buku Combo and the Warga list, picked with ?list=a|b|c.
// a: cards with icons. b: a collection grid and job groups. c: a ledger with filters and totals.
// Icons are the game's own art: building sprites, resource icons and a job's workplace sprite.
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

export type ListLook = 'a' | 'b' | 'c';
export const listLook = (): ListLook | null => (['a', 'b', 'c'] as const).find((k) => new URLSearchParams(location.search).get('list') === k) ?? null;

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
const resIcon = (id: ResourceId, size = 16) => h('img', { src: iconURL(id, 2), alt: '', class: 'pixel', width: size, height: size });

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
const amount = (res: ResourceId, v: number) => (res === 'rupiah' ? rupiahShort(v) : `${v > 0 ? '+' : ''}${Math.round(v * 10) / 10}`);
const outChips = (pairs: [ResourceId, number][]) =>
  h('span', { class: 'ls-out' }, ...pairs.map(([res, v]) => h('span', { class: `ls-amt ${v < 0 ? 'neg' : ''}`, style: `--c:var(--${res === 'orangDalam' ? 'orang' : res})` }, resIcon(res), amount(res, v))));
const stars = (lv: number) => h('span', { class: 'ls-stars', 'aria-label': t('res.level', { n: lv }) }, '★'.repeat(lv), h('span', { class: 'off' }, '★'.repeat(Math.max(0, MAX_LEVEL - lv))));

// ---------- combo pieces ----------
const STATE_ICON: Record<ComboStatus['state'], string> = { active: '✓', found: '★', todo: '?' };
const badge = (st: ComboStatus) => h('span', { class: `ls-badge ${st.state}` }, h('b', { 'aria-hidden': 'true' }, STATE_ICON[st.state]), t(`combo.state.${st.state}` as 'combo.state.active'));
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
const comboRes = (c: ComboDef) => outChips(Object.entries(c.perMonth ?? {}) as [ResourceId, number][]);

// ---------- Buku Combo ----------
export function openComboLook(app: App, look: ListLook): void {
  const s = app.s;
  const combos = bookCombos(s);
  const found = combos.filter((c) => s.discovered.includes(c.id)).length;
  const head = h('div', { class: 'ls-progress' }, h('span', {}, t('combo.count', { found, total: combos.length })), h('div', { class: 'meter', 'aria-hidden': 'true' }, h('div', { style: `width:${(found / Math.max(1, combos.length)) * 100}%` })));
  if (look === 'a') {
    const rows = combos.map((c) => {
      const st = comboStatus(s, c);
      const known = s.discovered.includes(c.id);
      return h('article', { class: `ls-card ${st.state}` },
        h('div', { class: 'ls-card-head' }, h('strong', {}, cName(c)), badge(st)),
        h('div', { class: 'ls-card-row' }, members(c, st, 40), comboRes(c)),
        h('p', {}, cEffect(c)),
        h('p', { class: 'meta' }, comboConditions(c)),
        st.missing.length ? h('p', { class: 'missing-line' }, comboStatusText(st)) : null,
        known ? h('p', { class: 'meta story' }, cStory(c)) : null,
      );
    });
    openSheet(t('menu.combo'), [head, ...rows]);
  } else if (look === 'b') {
    const detail = h('div', { class: 'ls-detail', hidden: true });
    const tiles = combos.map((c) => {
      const st = comboStatus(s, c);
      const tile = h('button', { class: `ls-tile ${st.state}`, type: 'button', 'aria-label': cName(c) },
        h('span', { class: 'ls-corner', 'aria-hidden': 'true' }, STATE_ICON[st.state]),
        members(c, st, 28),
        h('strong', {}, cName(c)),
      );
      tile.addEventListener('click', () => {
        detail.hidden = false;
        detail.replaceChildren(h('div', { class: 'ls-card-head' }, h('strong', {}, cName(c)), badge(st)), h('p', {}, cEffect(c)), h('p', { class: 'meta' }, comboConditions(c)), h('p', { class: 'meta' }, comboStatusText(st)), ...(s.discovered.includes(c.id) ? [h('p', { class: 'meta story' }, cStory(c))] : []));
        tile.after(detail);
        detail.scrollIntoView({ block: 'nearest' });
      });
      return tile;
    });
    openSheet(t('menu.combo'), [head, h('div', { class: 'ls-grid' }, ...tiles)]);
  } else {
    let filter: ComboStatus['state'] | 'all' = 'all';
    const list = h('div', { class: 'ls-ledger' });
    const draw = () => {
      list.replaceChildren(...combos.map((c) => ({ c, st: comboStatus(s, c) })).filter((x) => filter === 'all' || x.st.state === filter).map(({ c, st }) => {
        const ready = c.needs.length - st.missing.filter((m) => c.needs.some((id) => bName(def(id)) === m)).length;
        return h('div', { class: `ls-line ${st.state}` },
          h('span', { class: `ls-dot ${st.state}`, 'aria-hidden': 'true' }, STATE_ICON[st.state]),
          h('div', { class: 'ls-line-main' }, h('strong', {}, cName(c)), h('span', { class: 'meta' }, cEffect(c))),
          h('div', { class: 'ls-line-side' }, members(c, st, 24), h('span', { class: 'ls-ready' }, `${ready}/${c.needs.length}`)),
        );
      }));
    };
    const tabs = (['all', 'active', 'found', 'todo'] as const).map((k) => {
      const n = k === 'all' ? combos.length : combos.filter((c) => comboStatus(s, c).state === k).length;
      const b = h('button', { class: 'btn tab', type: 'button', 'aria-pressed': String(k === filter) }, k === 'all' ? `${t('combo.count', { found, total: combos.length }).split('.')[0]}` : `${STATE_ICON[k]} ${n}`);
      b.addEventListener('click', () => {
        filter = k;
        bar.querySelectorAll('.tab').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
        draw();
      });
      return b;
    });
    const bar = h('div', { class: 'tabs' }, ...tabs);
    draw();
    openSheet(t('menu.combo'), [bar, list]);
  }
}

// ---------- Warga ----------
export function openWargaLook(app: App, look: ListLook, openOne: (id: number) => void): void {
  const s = app.s;
  const row = (r: Resident) => {
    const lv = levelOf(r);
    return h('button', { class: `ls-person ${r.job === 'none' ? 'idle' : ''}`, type: 'button', 'data-rid': String(r.id), onclick: () => openOne(r.id) },
      h('span', { class: 'ls-avatar' }, sprite(jobPlace(r.job), 36)),
      h('span', { class: 'ls-who' }, h('strong', {}, r.name), h('span', { class: 'ls-job' }, jobLabel(r.job)), stars(lv)),
      outChips(output(r)),
    );
  };
  if (look === 'a') {
    openSheet(t('menu.warga'), [h('p', { class: 'meta' }, t('res.hint')), ...s.residents.map(row)]);
  } else if (look === 'b') {
    const jobs = [...new Set(s.residents.map((r) => r.job))].sort((a, b) => (a === 'none' ? -1 : b === 'none' ? 1 : jobLabel(a).localeCompare(jobLabel(b))));
    const groups = jobs.map((job) => {
      const people = s.residents.filter((r) => r.job === job);
      const total = new Map<ResourceId, number>();
      for (const r of people) for (const [res, v] of output(r)) total.set(res, (total.get(res) ?? 0) + v);
      return h('section', { class: `ls-group ${job === 'none' ? 'idle' : ''}` },
        h('div', { class: 'ls-group-head' }, sprite(jobPlace(job), 40), h('span', { class: 'ls-who' }, h('strong', {}, `${jobLabel(job)} · ${people.length}`), outChips([...total.entries()]))),
        h('div', { class: 'ls-chips' }, ...people.map((r) => h('button', { class: 'ls-chip', type: 'button', 'data-rid': String(r.id), onclick: () => openOne(r.id) }, h('span', {}, r.name), stars(levelOf(r))))),
      );
    });
    openSheet(t('menu.warga'), [h('p', { class: 'meta' }, t('res.hint')), ...groups]);
  } else {
    const total = new Map<ResourceId, number>();
    for (const r of s.residents) for (const [res, v] of output(r)) total.set(res, (total.get(res) ?? 0) + v);
    const sum = h('div', { class: 'ls-sum' }, h('span', { class: 'ls-sum-n' }, resIcon('people' as ResourceId, 18), String(s.residents.length)), outChips(RES.filter((r) => total.has(r)).map((r) => [r, total.get(r)!])));
    let sort: 'job' | 'level' | 'idle' = 'idle';
    const list = h('div', { class: 'ls-ledger' });
    const draw = () => {
      const rs = [...s.residents].sort((a, b) =>
        sort === 'level' ? levelOf(b) - levelOf(a) : sort === 'job' ? jobLabel(a.job).localeCompare(jobLabel(b.job)) : Number(b.job === 'none') - Number(a.job === 'none'));
      list.replaceChildren(...rs.map((r) =>
        h('button', { class: `ls-line person ${r.job === 'none' ? 'idle' : ''}`, type: 'button', 'data-rid': String(r.id), onclick: () => openOne(r.id) },
          sprite(jobPlace(r.job), 28),
          h('div', { class: 'ls-line-main' }, h('strong', {}, r.name), h('span', { class: 'meta' }, `${jobLabel(r.job)} · ${t('res.level', { n: levelOf(r) })}`)),
          outChips(output(r)),
        )));
    };
    const tabs = (['idle', 'job', 'level'] as const).map((k) => {
      const b = h('button', { class: 'btn tab', type: 'button', 'aria-pressed': String(k === sort) }, k === 'idle' ? t('res.noJob') : k === 'job' ? t('ls.byJob') : t('ls.byLevel'));
      b.addEventListener('click', () => {
        sort = k;
        bar.querySelectorAll('.tab').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
        draw();
      });
      return b;
    });
    const bar = h('div', { class: 'tabs' }, ...tabs);
    draw();
    openSheet(t('menu.warga'), [sum, bar, list]);
  }
}
