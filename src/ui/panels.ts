import { COMBOS } from '../data/combos';
import { JOBS, jobDef } from '../data/jobs';
import { WACANA } from '../data/wacana';
import type { App } from '../app';
import { rupiah } from '../format';
import { comboMemberNames } from '../sim/combos';
import { checkAssign, assign, slots, used } from '../sim/jobs';
import { checkRepair, repair, repairCost } from '../sim/events';
import { checkRestart, restart, restartCost, VIRAL_REPAIR_AT } from '../sim/projects';
import { announce, checkAnnounce, wacanaCost } from '../sim/wacana';
import type { Building, JobId } from '../sim/types';
import { actionButton } from './inspect';
import { h } from './dom';
import { openSheet } from './sheet';

// ---------- Warga ----------
export function openResidents(app: App): void {
  const s = app.s;
  const rows = s.residents.map((r) =>
    h('button', { class: 'card-btn slim', onclick: () => openResident(app, r.id) },
      h('div', { class: 'card-text' },
        h('div', { class: 'card-title' }, h('strong', {}, r.name), h('span', { class: 'meta' }, jobDef(r.job)?.name ?? 'No job')),
        r.job === 'pns' ? h('p', { class: 'meta' }, `Pensiun ${Math.round(r.pensiun)}%`) : null,
        r.job === 'buzzer' ? h('p', { class: 'meta' }, `Fake Viral pumped: ${Math.round(r.fake)}`) : null,
      ),
    ),
  );
  const summary = JOBS.map((j) => `${j.name} ${used(s, j.id)}/${slots(s, j.id)}`).join(' · ');
  openSheet('Warga', [h('p', { class: 'meta' }, `Job slots: ${summary}. Employed residents add 0.2 Sabar a month.`), ...rows]);
}

function openResident(app: App, id: number): void {
  const r = app.s.residents.find((x) => x.id === id);
  if (!r) return openResidents(app);
  const choices = (['none', ...JOBS.map((j) => j.id)] as JobId[]).map((job) => {
    const check = checkAssign(app.s, r, job);
    const label = job === 'none' ? 'No job' : jobDef(job)!.name;
    return h('div', { class: 'action' },
      h('button', { class: `btn ${r.job === job ? 'btn-primary' : ''}`, disabled: !check.ok, 'aria-pressed': String(r.job === job), onclick: () => { assign(app.s, r, job); app.save(); app.refresh(); openResidents(app); } }, r.job === job ? `${label} (current)` : label),
      job !== 'none' ? h('p', { class: 'meta' }, jobDef(job)!.blurb) : null,
      check.ok ? null : h('ul', { class: 'missing' }, ...check.missing.map((m) => h('li', {}, m))),
    );
  });
  openSheet(r.name, choices);
}

// ---------- Wacana ----------
export function openWacana(app: App): void {
  const s = app.s;
  const rows = WACANA.map((w) => {
    const state = s.wacana.find((x) => x.id === w.id);
    const check = checkAnnounce(s, w.id);
    return h('div', { class: 'card-btn static' },
      h('div', { class: 'card-text' },
        h('div', { class: 'card-title' }, h('strong', {}, w.name), h('span', { class: 'meta' }, state ? `Approval ${Math.round(state.power * 10)}%` : 'Not announced')),
        h('p', {}, w.line),
        state?.times ? h('p', { class: 'meta' }, `Announced ${state.times}x. Built: 0.`) : null,
        h('div', { class: 'meter', 'aria-hidden': 'true' }, h('div', { style: `width:${Math.min(100, (state?.power ?? 0) * 10)}%` })),
        actionButton(`Announce · ${rupiah(wacanaCost(s))}`, check, () => {
          announce(s, w.id);
          app.view.pop(s.buildings.find((b) => b.def === 'kantorRT')!.x, s.buildings.find((b) => b.def === 'kantorRT')!.y, 'rupiah', -wacanaCost(s));
          app.haptic(10);
          app.save();
          app.refresh();
          openWacana(app);
        }),
      ),
    );
  });
  openSheet('Wacana', [h('p', { class: 'meta' }, 'Announce a policy for approval. Approval gives Sabar each month and decays 20% a month unless you announce it again. Nothing else happens.'), ...rows]);
}

// ---------- Buku Combo ----------
export function openBukuCombo(app: App): void {
  const s = app.s;
  const found = COMBOS.filter((c) => s.discovered.includes(c.id)).length;
  const rows = COMBOS.map((c) => {
    const known = s.discovered.includes(c.id);
    return h('div', { class: `card-btn static ${known ? '' : 'locked'}` },
      h('div', { class: 'card-text' },
        h('div', { class: 'card-title' }, h('strong', {}, known ? c.name : '???'), h('span', { class: 'meta' }, known ? 'Discovered' : 'Hidden')),
        h('p', {}, known ? c.story : c.hint),
        known ? h('p', { class: 'meta' }, `Needs ${comboMemberNames(c).join(' + ')} within ${c.radius} tile${c.radius > 1 ? 's' : ''}.`) : null,
        known ? h('p', {}, c.effect) : null,
      ),
    );
  });
  openSheet('Buku Combo', [h('p', { class: 'meta' }, `${found} of ${COMBOS.length} discovered. Combos log themselves when they first work.`), ...rows]);
}

// ---------- Inspector extras ----------
export function mangkrakExtras(app: App, b: Building): Node[] {
  if (b.status !== 'mangkrak') return [];
  const s = app.s;
  const cost = restartCost(s, b);
  const cheap = s.res.viral >= VIRAL_REPAIR_AT;
  return [
    h('p', { class: 'meta' }, cheap ? `Viral is high enough. Restart at normal price: ${rupiah(cost)}.` : `Restart costs double: ${rupiah(cost)}. Reach ${VIRAL_REPAIR_AT} Viral (have ${Math.floor(s.res.viral)}) for the normal price.`),
    actionButton(`Restart · ${rupiah(cost)}`, checkRestart(s, b), () => {
      restart(s, b);
      app.haptic(15);
      app.save();
      app.refresh();
      app.inspect(b.uid);
    }, true),
  ];
}

export function parkirExtras(app: App, b: Building): Node[] {
  if (b.def !== 'parkir') return [];
  const owner = app.s.buildings.find((o) => o.uid === b.owner);
  return [h('p', { class: 'meta' }, `Guards the ${owner ? 'shop' : 'old shop'} nobody asked him to guard. Level ${b.level}: more retribusi, more Sabar lost.`)];
}

export function damagedExtras(app: App, b: Building): Node[] {
  if (b.status !== 'damaged') return [];
  const s = app.s;
  const cost = repairCost(s, b);
  return [
    h('p', { class: 'meta' }, cost === 0 ? 'Viral is high enough that the kelurahan fixes it for free.' : `Repair costs ${rupiah(cost)}. Free once Viral reaches ${VIRAL_REPAIR_AT} (have ${Math.floor(s.res.viral)}).`),
    actionButton(cost === 0 ? 'Repair · free (viral)' : `Repair · ${rupiah(cost)}`, checkRepair(s, b), () => {
      repair(s, b);
      app.view.burst(b.x, b.y);
      app.haptic(15);
      app.save();
      app.refresh();
      app.inspect(b.uid);
    }, true),
  ];
}
