import { REALISASI } from '../data/realisasi';
import { checkRealisasi, realisasiCost, startRealisasi } from '../sim/realisasi';
import { rEffect, rLine, rName } from '../i18n';
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
/** The real version of a policy under its announcement: what it does, its state, and the button to do it. */
function realisasiPart(app: App, wacanaId: string): Node[] {
  const s = app.s;
  const d = REALISASI.find((r) => r.wacana === wacanaId);
  if (!d) return [];
  const run = (s.realisasi ?? []).filter((r) => r.id === d.id).at(-1);
  const state = !run || s.month >= run.endsAt ? null : run.landsAt > s.month ? t('wac.landsIn', { n: run.landsAt - s.month }) : run.endsAt === Infinity ? t('wac.lasting') : t('wac.workingFor', { n: run.endsAt - s.month });
  return [
    h('div', { class: 'realisasi' },
      h('p', {}, h('strong', {}, t('wac.realHead', { name: rName(d) }))),
      h('p', { class: 'meta' }, rLine(d)),
      h('p', { class: 'meta' }, rEffect(d)),
      state ? h('p', { class: 'meta good' }, state) : null,
      actionButton(t('wac.realisasi', { cost: rupiah(realisasiCost(s, d)) }), checkRealisasi(s, d.id), () => {
        startRealisasi(s, d.id);
        app.tap(15);
        app.save();
        app.refresh();
        openWacana(app);
      }, true),
    ),
  ];
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

export function openWacana(app: App): void {
  const s = app.s;
  const rows = availableWacana(s).map((w) => {
    const state = s.wacana.find((x) => x.id === w.id);
    const check = checkAnnounce(s, w.id);
    return h('div', { class: 'card-btn static' },
      h('div', { class: 'card-text' },
        h('div', { class: 'card-title' }, h('strong', {}, wName(w)), h('span', { class: 'meta' }, state ? t('wac.approval', { n: Math.round(state.power * 10) }) : t('wac.none'))),
        h('p', {}, wLine(w)),
        h('p', { class: 'meta' }, wTrade(w)),
        state?.times ? h('p', { class: 'meta' }, t('wac.times', { n: state.times })) : null,
        h('div', { class: 'meter', 'aria-hidden': 'true' }, h('div', { style: `width:${Math.min(100, (state?.power ?? 0) * 10)}%` })),
        actionButton(t('wac.announce', { cost: rupiah(wacanaCost(s, w.id)) }), check, () => {
          const paid = wacanaCost(s, w.id);
          announce(s, w.id);
          app.view.pop(s.buildings.find((b) => b.def === 'kantorRT')!.x, s.buildings.find((b) => b.def === 'kantorRT')!.y, 'rupiah', -paid);
          app.tap(10);
          app.save();
          app.refresh();
          openWacana(app);
        }),
        ...realisasiPart(app, w.id),
      ),
    );
  });
  openSheet(t('menu.wacana'), [h('p', { class: 'meta' }, t('wac.intro')), ...raziaPart(app), ...rows]);
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
