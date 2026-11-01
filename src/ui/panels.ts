import { REALISASI } from '../data/realisasi';
import { checkRealisasi, realisasiCost, startRealisasi } from '../sim/realisasi';
import { rEffect, rName } from '../i18n';
import { jBlurb, jName, t, wLine, wName, wTrade } from '../i18n';
import { LEVEL_MONTHS, PNS_PAYOUT_PER_LEVEL, jobDef } from '../data/jobs';
import { RAZIA } from '../data/higher/kecamatan';
import type { SimEffect } from '../sim/types';
import { checkRazia, startRazia } from '../sim/kec';
import type { App } from '../app';
import { rupiah } from '../format';
import { checkAssign, assign, levelOf, liveJobs } from '../sim/jobs';
import { checkRepair, repair, repairCost } from '../sim/events';
import { checkRestart, checkRestartODn, RESTART_ODN, restart, restartCost, VIRAL_REPAIR_AT } from '../sim/projects';
import { announce, availableWacana, checkAnnounce, wacanaCost } from '../sim/wacana';
import { iconURL } from '../render/sprites';
import type { Building, JobId, Resident } from '../sim/types';
import { actionButton } from './inspect';
import { h } from './dom';
import { openSheet } from './sheet';
import { openWargaList } from './lists';

// ---------- Warga ----------
/** focus: the resident just edited. The list opens scrolled to their row instead of the top. */
/** Experience in plain words: months in the job and the bonus it brings. No stars: those are for staff. */
function experienceLine(r: Resident, lv: number, next: number | undefined): string {
  const j = jobDef(r.job);
  if (!j) return t('res.xpNone');
  const pct = Math.round((r.job === 'pns' ? PNS_PAYOUT_PER_LEVEL : j.perLevel.boost) * (lv - 1) * 100);
  const months = r.xp ?? 0;
  const base = pct ? t('res.xp', { months, pct }) : t('res.xpNew', { months });
  return next === undefined ? `${base} ${t('res.xpTop')}` : `${base} ${t('res.xpNext', { left: next - months })}`;
}

export function openResidents(app: App, focus?: number): void {
  openWargaList(app, (id) => openResident(app, id));
  const row = focus === undefined ? null : document.querySelector<HTMLElement>(`#sheet [data-rid="${focus}"]`);
  if (row) {
    row.scrollIntoView({ block: 'center' });
    row.focus({ preventScroll: true });
  }
}

export function openResident(app: App, id: number): void {
  const r = app.s.residents.find((x) => x.id === id);
  if (!r) return openResidents(app);
  const choices = (['none', ...liveJobs(app.s).map((j) => j.id)] as JobId[]).map((job) => {
    const check = checkAssign(app.s, r, job);
    const label = job === 'none' ? t('res.noJob') : jName(jobDef(job)!);
    return h('div', { class: 'action' },
      h('button', { class: 'btn btn-choice', disabled: !check.ok, 'aria-pressed': String(r.job === job), onclick: () => { assign(app.s, r, job, true); app.save(); app.refresh(); openResidents(app, r.id); } }, r.job === job ? t('res.current', { label }) : label),
      job !== 'none' ? h('p', { class: 'meta' }, jBlurb(jobDef(job)!)) : null,
      check.ok ? null : h('ul', { class: 'missing' }, ...check.missing.map((m) => h('li', {}, m))),
    );
  });
  const lv = levelOf(r);
  const next = LEVEL_MONTHS[lv];
  openSheet(r.name, [h('p', { class: 'meta', id: 'res-xp' }, experienceLine(r, lv, next)), ...choices]);
}

// ---------- Wacana and Realisasi ----------
/** What a running Realisasi says about itself, or null when it is not running. */
function realisasiState(app: App, wacanaId: string): string | null {
  const s = app.s;
  const d = REALISASI.find((r) => r.wacana === wacanaId);
  if (!d) return null;
  const run = (s.realisasi ?? []).filter((r) => r.id === d.id).at(-1);
  if (!run || s.month >= run.endsAt) return null;
  return run.landsAt > s.month ? t('wac.landsIn', { n: run.landsAt - s.month }) : run.endsAt === Infinity ? t('wac.lasting') : t('wac.workingFor', { n: run.endsAt - s.month });
}

/** The razia, offered in the Kecamatan above the policies. */
function raziaPart(app: App): Node[] {
  const s = app.s;
  if (s.stage.current !== 'kecamatan' || !s.kec) return [];
  const left = s.kec.razia ? s.kec.razia.until - s.month : 0;
  return [
    h('div', { class: 'card-btn static' },
      h('div', { class: 'card-text' },
        h('div', { class: 'card-title' }, h('strong', {}, t('razia.head'))),
        h('p', {}, t('razia.line')),
        left > 0 ? h('p', { class: 'meta good' }, t('razia.until', { n: left })) : null,
        actionButton(t('razia.button', { n: RAZIA.orangDalam }), checkRazia(s), () => {
          const fx: SimEffect[] = [];
          startRazia(s, fx);
          app.handleFx(fx);
          app.tap(15);
          app.save();
          app.refresh();
          openWacana(app);
        }, true),
      ),
    ),
  ];
}

/** The list: one row per policy. A tap opens the detail, where announcing and doing it sit side by side. */
export function openWacana(app: App): void {
  const s = app.s;
  const rows = availableWacana(s).map((w) => {
    const state = s.wacana.find((x) => x.id === w.id);
    const running = realisasiState(app, w.id);
    return h('button', { class: 'card-btn wac-row', type: 'button', 'data-wacana': w.id, onclick: () => openWacanaDetail(app, w.id) },
      h('div', { class: 'card-text' },
        h('div', { class: 'card-title' }, h('strong', {}, wName(w)), h('span', { class: 'meta' }, state ? t('wac.approval', { n: Math.round(state.power * 10) }) : t('wac.none'))),
        h('div', { class: 'meter', 'aria-hidden': 'true' }, h('div', { style: `width:${Math.min(100, (state?.power ?? 0) * 10)}%` })),
        running ? h('p', { class: 'meta good' }, running) : null,
      ),
      h('span', { class: 'wac-chevron', 'aria-hidden': 'true' }, '›'),
    );
  });
  openSheet(t('menu.wacana'), [h('p', { class: 'meta' }, t('wac.intro')), ...raziaPart(app), ...rows]);
}

/** One policy: the joke line, then Umumkan (secondary) beside Kerjakan (primary). It stays open after announcing. */
function openWacanaDetail(app: App, id: string): void {
  const s = app.s;
  const w = availableWacana(s).find((x) => x.id === id);
  if (!w) return openWacana(app);
  const d = REALISASI.find((r) => r.wacana === id);
  const state = s.wacana.find((x) => x.id === id);
  const running = realisasiState(app, id);
  const redo = () => {
    app.save();
    app.refresh();
    openWacanaDetail(app, id);
  };
  const back = h('button', { class: 'btn btn-icon', type: 'button', 'aria-label': t('page.back'), onclick: () => openWacana(app) }, '‹');
  const announceCol = h('div', { class: 'wac-col', 'data-col': 'announce' },
    h('strong', {}, t('wac.announceHead')),
    h('p', { class: 'meta' }, wTrade(w)),
    h('p', { class: 'meta' }, state ? t('wac.approval', { n: Math.round(state.power * 10) }) : t('wac.none')),
    state?.times ? h('p', { class: 'meta' }, t('wac.times', { n: state.times })) : null,
    actionButton(t('wac.announce', { cost: rupiah(wacanaCost(s, id)) }), checkAnnounce(s, id), () => {
      const paid = wacanaCost(s, id);
      announce(s, id);
      const k = s.buildings.find((b) => b.def === 'kantorRT')!;
      app.view.pop(k.x, k.y, 'rupiah', -paid);
      app.tap(10);
      redo();
    }),
  );
  const doCol = d
    ? h('div', { class: 'wac-col', 'data-col': 'realisasi' },
        h('strong', {}, rName(d)),
        h('p', { class: 'meta' }, rEffect(d)),
        h('p', { class: running ? 'meta good' : 'meta' }, running ?? t('wac.delay', { n: d.delay })),
        actionButton(t('wac.realisasi', { cost: rupiah(realisasiCost(s, d)) }), checkRealisasi(s, d.id), () => {
          startRealisasi(s, d.id);
          app.tap(15);
          redo();
        }, true),
      )
    : null;
  openSheet(wName(w), [h('p', {}, wLine(w)), h('div', { class: 'wac-cols' }, announceCol, doCol)], undefined, back);
}

// ---------- Inspector extras ----------
export function mangkrakExtras(app: App, b: Building): Node[] {
  if (b.status !== 'mangkrak') return [];
  const s = app.s;
  const cost = restartCost(s, b);
  const cheap = s.res.viral >= VIRAL_REPAIR_AT;
  return [
    h('p', { class: 'meta' }, cheap ? t('insp.mangkrakCheap', { cost: rupiah(cost) }) : t('insp.mangkrakDear', { cost: rupiah(cost), at: VIRAL_REPAIR_AT, have: Math.floor(s.res.viral) })),
    actionButton(t('insp.restart', { cost: rupiah(cost) }), checkRestart(s, b), () => {
      restart(s, b);
      app.tap(15);
      app.save();
      app.refresh();
      app.inspect(b.uid);
    }, true),
    actionButton([t('insp.restartODn', { n: RESTART_ODN }), ' ', h('img', { src: iconURL('orangDalam'), alt: t('res.orangDalam'), width: 18, height: 18, class: 'inline-icon' })], checkRestartODn(s, b), () => {
      restart(s, b, true);
      app.tap(15);
      app.save();
      app.refresh();
      app.inspect(b.uid);
    }),
  ];
}

export function parkirExtras(app: App, b: Building): Node[] {
  if (b.def !== 'parkir') return [];
  const owner = app.s.buildings.find((o) => o.uid === b.owner);
  return [h('p', { class: 'meta' }, t('insp.parkir', { shop: owner ? t('insp.parkirShop') : t('insp.parkirOld'), level: b.level }))];
}

export function damagedExtras(app: App, b: Building): Node[] {
  if (b.status !== 'damaged') return [];
  const s = app.s;
  const cost = repairCost(s, b);
  return [
    h('p', { class: 'meta' }, cost === 0 ? t('insp.repairFree') : t('insp.repairCost', { cost: rupiah(cost), at: VIRAL_REPAIR_AT, have: Math.floor(s.res.viral) })),
    actionButton(cost === 0 ? t('insp.repairBtnFree') : t('insp.repairBtn', { cost: rupiah(cost) }), checkRepair(s, b), () => {
      repair(s, b);
      app.view.burst(b.x, b.y);
      app.tap(15);
      app.save();
      app.refresh();
      app.inspect(b.uid);
    }, true),
  ];
}
