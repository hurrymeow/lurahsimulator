import { cEffect, cHint, cName, cStory, jBlurb, jName, t, wLine, wName } from '../i18n';
import { LEVEL_MONTHS, jobDef } from '../data/jobs';
import { WACANA } from '../data/wacana';
import type { App } from '../app';
import { rupiah } from '../format';
import { bookCombos, comboMemberNames } from '../sim/combos';
import { checkAssign, assign, levelOf, liveJobs, slots, used } from '../sim/jobs';
import { checkRepair, repair, repairCost } from '../sim/events';
import { checkRestart, restart, restartCost, VIRAL_REPAIR_AT } from '../sim/projects';
import { announce, checkAnnounce, wacanaCost } from '../sim/wacana';
import type { Building, JobId } from '../sim/types';
import { actionButton } from './inspect';
import { h } from './dom';
import { openSheet } from './sheet';

// ---------- Warga ----------
/** focus: the resident just edited. The list opens scrolled to their row instead of the top. */
export function openResidents(app: App, focus?: number): void {
  const s = app.s;
  const rows = s.residents.map((r) =>
    h('button', { class: 'card-btn slim', 'data-rid': String(r.id), onclick: () => openResident(app, r.id) },
      h('div', { class: 'card-text' },
        h('div', { class: 'card-title' }, h('strong', {}, r.name), h('span', { class: 'meta' }, `${jobDef(r.job) ? jName(jobDef(r.job)!) : t('res.noJob')} · ${t('res.level', { n: levelOf(r) })}`)),
        r.job === 'pns' ? h('p', { class: 'meta' }, t('res.pensiun', { n: Math.round(r.pensiun) })) : null,
        r.job === 'buzzer' ? h('p', { class: 'meta' }, t('res.fake', { n: Math.round(r.fake) })) : null,
      ),
    ),
  );
  const summary = liveJobs(s).map((j) => `${jName(j)} ${used(s, j.id)}/${slots(s, j.id)}`).join(' · ');
  openSheet(t('menu.warga'), [h('p', { class: 'meta' }, t('res.slots', { summary })), ...rows]);
  const row = focus === undefined ? null : document.querySelector<HTMLElement>(`#sheet [data-rid="${focus}"]`);
  if (row) {
    row.scrollIntoView({ block: 'center' });
    row.focus({ preventScroll: true });
  }
}

function openResident(app: App, id: number): void {
  const r = app.s.residents.find((x) => x.id === id);
  if (!r) return openResidents(app);
  const choices = (['none', ...liveJobs(app.s).map((j) => j.id)] as JobId[]).map((job) => {
    const check = checkAssign(app.s, r, job);
    const label = job === 'none' ? t('res.noJob') : jName(jobDef(job)!);
    return h('div', { class: 'action' },
      h('button', { class: `btn ${r.job === job ? 'btn-primary' : ''}`, disabled: !check.ok, 'aria-pressed': String(r.job === job), onclick: () => { assign(app.s, r, job, true); app.save(); app.refresh(); openResidents(app, r.id); } }, r.job === job ? t('res.current', { label }) : label),
      job !== 'none' ? h('p', { class: 'meta' }, jBlurb(jobDef(job)!)) : null,
      check.ok ? null : h('ul', { class: 'missing' }, ...check.missing.map((m) => h('li', {}, m))),
    );
  });
  const lv = levelOf(r);
  const next = LEVEL_MONTHS[lv];
  openSheet(r.name, [h('p', { class: 'meta' }, next === undefined ? t('res.levelMax', { n: lv }) : t('res.levelNext', { n: lv, left: next - (r.xp ?? 0) })), ...choices]);
}

// ---------- Wacana ----------
export function openWacana(app: App): void {
  const s = app.s;
  const rows = WACANA.map((w) => {
    const state = s.wacana.find((x) => x.id === w.id);
    const check = checkAnnounce(s, w.id);
    return h('div', { class: 'card-btn static' },
      h('div', { class: 'card-text' },
        h('div', { class: 'card-title' }, h('strong', {}, wName(w)), h('span', { class: 'meta' }, state ? t('wac.approval', { n: Math.round(state.power * 10) }) : t('wac.none'))),
        h('p', {}, wLine(w)),
        state?.times ? h('p', { class: 'meta' }, t('wac.times', { n: state.times })) : null,
        h('div', { class: 'meter', 'aria-hidden': 'true' }, h('div', { style: `width:${Math.min(100, (state?.power ?? 0) * 10)}%` })),
        actionButton(t('wac.announce', { cost: rupiah(wacanaCost(s)) }), check, () => {
          announce(s, w.id);
          app.view.pop(s.buildings.find((b) => b.def === 'kantorRT')!.x, s.buildings.find((b) => b.def === 'kantorRT')!.y, 'rupiah', -wacanaCost(s));
          app.tap(10);
          app.save();
          app.refresh();
          openWacana(app);
        }),
      ),
    );
  });
  openSheet(t('menu.wacana'), [h('p', { class: 'meta' }, t('wac.intro')), ...rows]);
}

// ---------- Buku Combo ----------
export function openBukuCombo(app: App): void {
  const s = app.s;
  const combos = bookCombos(s);
  const found = combos.filter((c) => s.discovered.includes(c.id)).length;
  const rows = combos.map((c) => {
    const known = s.discovered.includes(c.id);
    return h('div', { class: `card-btn static ${known ? '' : 'locked'}` },
      h('div', { class: 'card-text' },
        h('div', { class: 'card-title' }, h('strong', {}, known ? cName(c) : '???'), h('span', { class: 'meta' }, known ? t('combo.discovered') : t('combo.hidden'))),
        h('p', {}, known ? cStory(c) : cHint(c)),
        known ? h('p', { class: 'meta' }, t('combo.needs', { names: comboMemberNames(c).join(' + '), r: c.radius >= 99 ? t('combo.anywhere') : c.radius > 1 ? t('combo.tileN', { n: c.radius }) : t('combo.tile1') })) : null,
        known ? h('p', {}, cEffect(c)) : null,
      ),
    );
  });
  openSheet(t('menu.combo'), [h('p', { class: 'meta' }, t('combo.count', { found, total: combos.length })), ...rows]);
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
