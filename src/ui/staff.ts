// The Staff panel: Inem's dream, every staff member with their stats and what can be done with them, and the
// Lowongan (post one, wait, pick an applicant).
import { chBlurb, chName, gName, gNeeds, gReward, roleBlurb, roleName, spType, t, traitEffect, traitName, type Key } from '../i18n';
import type { App } from '../app';
import { rupiah } from '../format';
import { inemURL } from '../render/inem';
import { CHANNELS, GIGS, RAISE, SPECIALS, STATS, STAT_MAX, roleDef, traitDef } from '../data/staff';
import {
  answerRaise, bimtek, bimtekCost, cancelLowongan, checkBimtek, checkFire, checkHire, checkMutasi, checkPost, ensureStaff, fire, hire,
  lowonganCost, mutasi, openRoles, pesangon, postLowongan, staffSlots,
} from '../sim/staff';
import { price } from '../sim/state';
import type { Applicant, Staff } from '../sim/types';
import { actionButton } from './inspect';
import { h } from './dom';
import { openSheet } from './sheet';

const stars = (n: number) => t('staff.stars', { stars: n });

function statBars(stats: Applicant['stats']): HTMLElement {
  return h('div', { class: 'staff-stats' },
    ...STATS.map((st) => h('div', { class: 'staff-stat' },
      h('span', { class: 'staff-stat-name' }, t(`staff.stat.${st}` as Key)),
      h('div', { class: 'meter', 'aria-hidden': 'true' }, h('div', { style: `width:${(stats[st] / STAT_MAX) * 100}%` })),
      h('span', { class: 'staff-stat-value' }, String(stats[st])),
    )),
  );
}

/** Who they are: a special's type, their trait. */
function aboutLines(a: Applicant): Node[] {
  const out: Node[] = [];
  const sp = a.special ? SPECIALS.find((p) => p.id === a.special) : undefined;
  if (sp) out.push(h('p', { class: 'meta' }, spType(sp)));
  if (a.trait) out.push(h('p', { class: 'meta' }, h('strong', {}, traitName(traitDef(a.trait))), ` · ${traitEffect(traitDef(a.trait))}`));
  return out;
}

function staffCard(app: App, x: Staff): HTMLElement {
  const s = app.s;
  const done = () => {
    app.save();
    app.refresh();
    openStaff(app);
  };
  const role = roleDef(x.role);
  const parts: Node[] = [
    h('div', { class: 'card-title' }, h('strong', {}, x.name), h('span', { class: 'meta' }, t('staff.level', { n: x.level }))),
    h('p', { class: 'meta' }, t('staff.roleLine', { role: roleName(role), stars: x.stars, level: x.level })),
    h('p', {}, roleBlurb(role)),
    ...aboutLines(x),
    statBars(x.stats),
    h('p', { class: 'meta' }, t('staff.salary', { amt: rupiah(price(s, x.salary)) })),
  ];
  if (x.away) parts.push(h('p', { class: 'meta warn' }, t('staff.awayNow', { n: x.away })));
  if (x.refused) parts.push(h('p', { class: 'meta warn' }, t('staff.refused')));
  if (x.raiseAsked) {
    parts.push(h('p', { class: 'meta' }, t('staff.raiseAsk', { amt: rupiah(price(s, Math.round(x.salary * (1 + RAISE)))) })));
    parts.push(h('div', { class: 'row staff-actions' },
      h('button', { class: 'btn btn-primary', onclick: () => { answerRaise(s, x, true); app.tap(10); done(); } }, t('staff.accept')),
      h('button', { class: 'btn', onclick: () => { answerRaise(s, x, false); app.tap(10); done(); } }, t('staff.refuse')),
    ));
  }
  if (!x.inem) {
    parts.push(actionButton(t('staff.bimtek', { cost: rupiah(bimtekCost(s)) }), checkBimtek(s, x), () => { bimtek(s, x); app.tap(15); done(); }));
    const mut = checkMutasi(s, x);
    if (mut.ok) {
      s.neighbours.forEach((_n, i) => parts.push(actionButton(t('staff.mutasi', { name: `RT ${i + 2}` }), mut, () => {
        mutasi(s, x, i);
        app.notice({ title: t('staff.mutasiDone', { name: x.name }), body: '', tone: 'good' });
        app.tap(15);
        done();
      })));
    } else parts.push(actionButton(t('staff.mutasi', { name: 'RT' }), mut, () => undefined));
    parts.push(actionButton(t('staff.fire', { cost: rupiah(pesangon(s, x)) }), checkFire(s, x), () => { fire(s, x); app.tap(15); done(); }));
  }
  return h('div', { class: `card-btn static staff-card${x.inem ? ' inem' : ''}`, 'data-staff': String(x.id) },
    x.inem ? h('img', { src: inemURL(), alt: '', width: 44, height: 60, class: 'pixel staff-face' }) : h('span', { class: 'staff-badge', 'aria-hidden': 'true' }, stars(x.stars)),
    h('div', { class: 'card-text' }, ...parts),
  );
}

function dream(app: App): HTMLElement {
  const gigs = app.s.gigs ?? [];
  return h('section', { class: 'staff-dream' },
    h('h3', {}, t('staff.dream')),
    ...GIGS.map((g) => h('div', { class: `staff-gig${gigs.includes(g.id) ? ' done' : ''}` },
      h('p', {}, h('strong', {}, gName(g)), gigs.includes(g.id) ? ` · ${t('staff.gigDone')}` : ''),
      h('p', { class: 'meta' }, gNeeds(g)),
      h('p', { class: 'meta' }, gReward(g)),
    )),
  );
}

function lowongan(app: App): HTMLElement {
  const s = app.s;
  const done = () => {
    app.save();
    app.refresh();
    openStaff(app);
  };
  const lw = s.lowongan;
  if (lw) {
    const ch = CHANNELS.find((c) => c.id === lw.channel)!;
    const head = h('p', { class: 'meta' }, t('staff.waiting', { role: roleName(roleDef(lw.role)), channel: chName(ch), n: Math.max(0, lw.arriveAt - s.month) }));
    const req = h('p', { class: 'meta staff-req' }, t('staff.reqHead', { line: t(`staff.req.${lw.req}` as Key) }));
    const apps = lw.applicants.map((a) => h('div', { class: 'card-btn static staff-applicant', 'data-applicant': String(a.id) },
      h('span', { class: 'staff-badge', 'aria-hidden': 'true' }, stars(a.stars)),
      h('div', { class: 'card-text' },
        h('div', { class: 'card-title' }, h('strong', {}, a.name), h('span', { class: 'meta' }, stars(a.stars))),
        ...aboutLines(a),
        statBars(a.stats),
        actionButton(t('staff.hire', { amt: rupiah(price(s, a.salary)) }), checkHire(s, a.id), () => { hire(s, a.id); app.tap(15); done(); }, true),
      ),
    ));
    return h('section', { class: 'staff-lowongan' }, h('h3', {}, t('staff.post')), head, req, ...apps,
      h('div', { class: 'action' }, h('button', { class: 'btn', onclick: () => { cancelLowongan(s); done(); } }, t('staff.cancel'))));
  }
  const roles = openRoles(s).map((r) => h('div', { class: 'card-btn static staff-role', 'data-role': r.id },
    h('div', { class: 'card-text' },
      h('strong', {}, roleName(r)),
      h('p', {}, roleBlurb(r)),
      ...CHANNELS.map((c) => {
        const cost = lowonganCost(s, c.id);
        return h('div', {},
          actionButton(t('staff.postVia', { channel: chName(c), cost: cost ? rupiah(cost) : t('staff.free') }), checkPost(s, r.id, c.id), () => { postLowongan(s, r.id, c.id); app.tap(15); done(); }),
          h('p', { class: 'meta' }, chBlurb(c)),
        );
      }),
    ),
  ));
  return h('section', { class: 'staff-lowongan' }, h('h3', {}, t('staff.post')), ...roles);
}

export function openStaff(app: App): void {
  const s = app.s;
  ensureStaff(s);
  const wages = s.staff!.reduce((n, x) => n + price(s, x.salary), 0);
  openSheet(t('menu.staff'), [
    h('p', { class: 'meta' }, t('staff.intro')),
    h('p', { class: 'meta', id: 'staff-slots' }, t('staff.slots', { n: s.staff!.length, max: staffSlots(s), wages: rupiah(wages) })),
    ...s.staff!.map((x) => staffCard(app, x)),
    lowongan(app),
    dream(app),
  ]);
}
