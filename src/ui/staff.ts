// The Staff panel: one card per person with one main action, as in Kairosoft's staff screens. Tapping a card
// opens that person's detail view, where the rare actions sit (stats, refuse a raise, mutasi, let go). Posting a
// lowongan is one button per role; the channel is picked in the next view. Inem's dream sits at the bottom.
import { chBlurb, chName, getLang, gName, gNeeds, gReward, roleBlurb, roleName, spType, t, traitEffect, traitName, type Key } from '../i18n';
import type { App } from '../app';
import { rupiah } from '../format';
import { inemURL } from '../render/inem';
import { portraitURL } from '../render/portraits';
import { BIMTEK, CHANNELS, GIGS, RAISE, SPECIALS, STATS, STAT_ICON, STAT_MAX, roleDef, traitDef, type RoleId, type StatId } from '../data/staff';
import {
  answerRaise, bimtek, bimtekCost, cancelLowongan, checkBimtek, checkFire, checkHire, checkMutasi, checkPost, ensureStaff, fire, grupWaShift, hire,
  lowonganCost, mishapChance, mutasi, openRoles, pesangon, postLowongan, roleGain, staffSlots, type InRole,
} from '../sim/staff';
import { iconURL } from '../render/sprites';
import { price } from '../sim/state';
import type { Applicant, Staff } from '../sim/types';
import { actionButton } from './inspect';
import { h } from './dom';
import { openSheet } from './sheet';

/** Which view of the panel is open: the list, one person, or picking a channel for a role. */
type View = { kind: 'list' } | { kind: 'person'; id: number } | { kind: 'post'; role: RoleId };

const stars = (n: number) => t('staff.stars', { stars: n });

/** A number as the player reads it: one decimal at most, with a comma in Bahasa Indonesia. */
const num = (n: number) => {
  const r = String(Math.round(n * 10) / 10);
  return getLang() === 'id' ? r.replace('.', ',') : r;
};
const statName = (st: StatId) => t(`staff.stat.${st}` as Key);
const statIcon = (st: StatId) => h('img', { src: iconURL(STAT_ICON[st], 2), alt: '', width: 20, height: 20, class: 'pixel staff-stat-icon' });

/** What this person's work stat buys in their role, in the role's own unit. */
const workFx = (x: InRole) => t(`staff.fx.${x.role}` as Key, { n: num(roleGain(x)) });
/** What their risk stat risks: the weekly chance and what goes wrong, or no risk at all. */
const riskFx = (x: InRole) => {
  const p = mishapChance(x);
  return p > 0 ? t('staff.risk', { n: num(p * 100), what: t(`staff.mishapWhat.${x.role}` as Key) }) : t('staff.riskNone');
};

/**
 * The four stats, each with its icon and what it always controls. In a role, the work stat and the risk stat say
 * what they buy in numbers; the other two are greyed, since this job does not use them.
 */
function statBars(stats: Applicant['stats'], x?: InRole): HTMLElement {
  const role = x && roleDef(x.role);
  return h('div', { class: 'staff-stats' },
    ...STATS.map((st) => {
      const kind = !role ? '' : st === role.stat ? 'main' : st === role.risk ? 'risk' : 'other';
      const note = kind === 'main' ? `${t('staff.statMain')}: ${workFx(x!)}` : kind === 'risk' ? `${t('staff.statRisk')}: ${riskFx(x!)}` : kind === 'other' ? t('staff.statOther') : t(`staff.statVerb.${st}` as Key);
      return h('div', { class: `staff-stat${kind ? ` staff-stat-${kind}` : ''}`, 'data-stat': st },
        statIcon(st),
        h('span', { class: 'staff-stat-name' }, statName(st)),
        h('div', { class: 'meter', 'aria-hidden': 'true' }, h('div', { style: `width:${(stats[st] / STAT_MAX) * 100}%` })),
        h('span', { class: 'staff-stat-value' }, String(stats[st])),
        h('span', { class: 'staff-stat-note meta' }, note),
      );
    }),
  );
}

/** The trait as chips: which stats it bends, and by how much. */
function traitChips(a: Applicant): Node | null {
  if (!a.trait) return null;
  const tr = traitDef(a.trait);
  const chips: Node[] = Object.entries(tr.stats ?? {}).map(([st, v]) =>
    h('span', { class: 'trait-chip' }, statIcon(st as StatId), ` ${statName(st as StatId)} ${v! > 0 ? '+' : '−'}${Math.abs(v!)}`));
  if (tr.output && tr.output !== 1) chips.push(h('span', { class: 'trait-chip' }, t('staff.traitOutput', { n: num(tr.output) })));
  if (tr.xp) chips.push(h('span', { class: 'trait-chip' }, t('staff.traitXp', { n: num(tr.xp) })));
  return chips.length ? h('p', { class: 'trait-chips' }, ...chips) : null;
}

/** Who they are: a special's type, their trait. */
function aboutLines(a: Applicant): Node[] {
  const out: Node[] = [];
  const sp = a.special ? SPECIALS.find((p) => p.id === a.special) : undefined;
  if (sp) out.push(h('p', { class: 'meta' }, spType(sp)));
  if (a.trait) out.push(h('p', { class: 'meta' }, h('strong', {}, traitName(traitDef(a.trait))), ` · ${traitEffect(traitDef(a.trait))}`));
  const chips = traitChips(a);
  if (chips) out.push(chips);
  return out;
}

/** Inem's face, a special's portrait, or a star badge for everyone else. */
const face = (x: Applicant & { inem?: boolean }) => {
  const url = x.inem ? inemURL() : portraitURL(x.special);
  return url ? h('img', { src: url, alt: '', width: 44, height: 60, class: 'pixel staff-face' }) : h('span', { class: 'staff-badge', 'aria-hidden': 'true' }, stars(x.stars));
};

/** Lines that need the player's eye, shown on the card and in the detail view. */
function flags(x: Staff): Node[] {
  const out: Node[] = [];
  if (x.away) out.push(h('p', { class: 'meta warn' }, t('staff.awayNow', { n: x.away })));
  if (x.refused) out.push(h('p', { class: 'meta warn' }, t('staff.refused')));
  return out;
}

function staffCard(app: App, x: Staff, done: () => void): HTMLElement {
  const s = app.s;
  // The one main action: answer a raise when asked, else train them. Inem has none; her card opens her view.
  let main: Node | null = null;
  if (x.raiseAsked) {
    main = h('div', { class: 'action' }, h('button', { class: 'btn btn-primary', onclick: () => { answerRaise(s, x, true); app.tap(10); done(); } }, t('staff.accept')));
  } else if (!x.inem) {
    main = actionButton(t('staff.bimtek', { cost: rupiah(bimtekCost(s)) }), checkBimtek(s, x), () => { bimtek(s, x); app.tap(15); done(); }, true);
  }
  return h('div', { class: `card-btn static staff-card${x.inem ? ' inem' : ''}`, 'data-staff': String(x.id) },
    face(x),
    h('div', { class: 'card-text' },
      h('button', { class: 'staff-open', type: 'button', 'aria-label': t('staff.details', { name: x.name }), onclick: () => openStaff(app, { kind: 'person', id: x.id }) },
        h('span', { class: 'card-title' }, h('strong', {}, x.name), h('span', { class: 'meta' }, t('staff.level', { n: x.level }))),
        h('span', { class: 'meta' }, t('staff.roleLine', { role: roleName(roleDef(x.role)), stars: x.stars })),
        h('span', { class: 'meta staff-work' }, statIcon(roleDef(x.role).stat), ` ${statName(roleDef(x.role).stat)} ${x.stats[roleDef(x.role).stat]} → ${workFx(x)}`),
        h('span', { class: 'meta' }, t('staff.salary', { amt: rupiah(price(s, x.salary)) })),
      ),
      ...flags(x),
      x.raiseAsked ? h('p', { class: 'meta' }, t('staff.raiseAsk', { amt: rupiah(price(s, Math.round(x.salary * (1 + RAISE)))) })) : null,
      main,
    ),
  );
}

/** One person: everything about them, and the actions a player needs now and then. */
function personView(app: App, x: Staff, done: () => void): Node[] {
  const s = app.s;
  const role = roleDef(x.role);
  const parts: Node[] = [
    h('div', { class: 'card-title' }, h('strong', {}, x.name), h('span', { class: 'meta' }, t('staff.level', { n: x.level }))),
    h('p', { class: 'meta' }, t('staff.roleLine', { role: roleName(role), stars: x.stars })),
    h('p', {}, roleBlurb(role)),
    ...aboutLines(x),
    statBars(x.stats, x),
    h('p', { class: 'meta' }, t('staff.salary', { amt: rupiah(price(s, x.salary)) })),
    ...flags(x),
  ];
  if (x.raiseAsked) {
    parts.push(h('p', { class: 'meta' }, t('staff.raiseAsk', { amt: rupiah(price(s, Math.round(x.salary * (1 + RAISE)))) })));
    parts.push(h('div', { class: 'row staff-actions' },
      h('button', { class: 'btn btn-primary', onclick: () => { answerRaise(s, x, true); app.tap(10); done(); } }, t('staff.accept')),
      h('button', { class: 'btn', onclick: () => { answerRaise(s, x, false); app.tap(10); done(); } }, t('staff.refuse')),
    ));
  }
  if (!x.inem) {
    if (!x.raiseAsked) {
      parts.push(h('p', { class: 'meta' }, t('staff.courses')));
      const own = roleDef(x.role).stat;
      for (const st of [own, ...STATS.filter((q) => q !== own)])
        parts.push(h('div', { class: 'staff-course', 'data-course': st },
          actionButton([statIcon(st), ` ${t('staff.course', { course: t(`staff.course.${st}` as Key), stat: statName(st), n: BIMTEK.gain, cost: rupiah(bimtekCost(s, st)) })}`], checkBimtek(s, x, st), () => { bimtek(s, x, st); app.tap(15); done(); }, st === own)));
    }
    const mut = checkMutasi(s, x);
    if (mut.ok) {
      s.neighbours.forEach((_n, i) => parts.push(actionButton(t('staff.mutasi', { name: `RT ${i + 2}` }), mut, () => {
        mutasi(s, x, i);
        app.notice({ title: t('staff.mutasiDone', { name: x.name }), body: '', tone: 'good' });
        app.tap(15);
        openStaff(app);
      })));
    } else parts.push(actionButton(t('staff.mutasi', { name: 'RT' }), mut, () => undefined));
    parts.push(h('div', { class: 'staff-fire' }, actionButton(t('staff.fire', { cost: rupiah(pesangon(s, x)) }), checkFire(s, x), () => { fire(s, x); app.tap(15); openStaff(app); })));
  }
  return [h('div', { class: `staff-detail${x.inem ? ' inem' : ''}`, 'data-staff': String(x.id) }, face(x), h('div', { class: 'card-text' }, ...parts))];
}

/** Picking where to post a lowongan for one role: each channel, its price and its catch. */
function postView(app: App, role: RoleId): Node[] {
  const s = app.s;
  const r = roleDef(role);
  return [
    h('p', {}, h('strong', {}, roleName(r)), ` · ${roleBlurb(r)}`),
    h('p', { class: 'meta' }, t('staff.pickChannel')),
    ...CHANNELS.map((c) => {
      const cost = lowonganCost(s, c.id);
      return h('div', { class: 'staff-channel', 'data-channel': c.id },
        actionButton(t('staff.postVia', { channel: chName(c), cost: cost ? rupiah(cost) : t('staff.free') }), checkPost(s, role, c.id), () => { postLowongan(s, role, c.id); app.tap(15); app.save(); app.refresh(); openStaff(app); }),
        h('p', { class: 'meta' }, chBlurb(c)),
        c.local && grupWaShift(s) ? h('p', { class: 'meta staff-gaul' }, statIcon('gaul'), ` ${t('staff.channelGaul', { stat: statName('gaul'), n: grupWaShift(s)!.x.stats.gaul, sign: grupWaShift(s)!.pts >= 0 ? '+' : '−', pct: Math.abs(grupWaShift(s)!.pts) })}`) : null,
      );
    }),
  ];
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

function lowongan(app: App, done: () => void): HTMLElement {
  const s = app.s;
  const lw = s.lowongan;
  if (lw) {
    const ch = CHANNELS.find((c) => c.id === lw.channel)!;
    const head = h('p', { class: 'meta' }, t('staff.waiting', { role: roleName(roleDef(lw.role)), channel: chName(ch), n: Math.max(0, lw.arriveAt - s.month) }));
    const req = h('p', { class: 'meta staff-req' }, t('staff.reqHead', { line: t(`staff.req.${lw.req}` as Key) }));
    const apps = lw.applicants.map((a) => h('div', { class: 'card-btn static staff-applicant', 'data-applicant': String(a.id) },
      face(a),
      h('div', { class: 'card-text' },
        h('div', { class: 'card-title' }, h('strong', {}, a.name), h('span', { class: 'meta' }, stars(a.stars))),
        ...aboutLines(a),
        statBars(a.stats, { ...a, role: lw.role }),
        h('p', { class: 'meta staff-if' }, t('staff.ifHired', { role: roleName(roleDef(lw.role)), fx: workFx({ ...a, role: lw.role }), risk: riskFx({ ...a, role: lw.role }) })),
        actionButton(t('staff.hire', { amt: rupiah(price(s, a.salary)) }), checkHire(s, a.id), () => { hire(s, a.id); app.tap(15); done(); }, true),
      ),
    ));
    return h('section', { class: 'staff-lowongan' }, h('h3', {}, t('staff.post')), head, req, ...apps,
      h('div', { class: 'action' }, h('button', { class: 'btn', onclick: () => { cancelLowongan(s); done(); } }, t('staff.cancel'))));
  }
  // One button per open role; the channels wait behind it.
  const roles = openRoles(s).map((r) => h('div', { class: 'card-btn static staff-role', 'data-role': r.id },
    h('div', { class: 'card-text' },
      h('strong', {}, roleName(r)),
      h('p', {}, roleBlurb(r)),
      h('div', { class: 'action' }, h('button', { class: 'btn', type: 'button', onclick: () => openStaff(app, { kind: 'post', role: r.id }) }, t('staff.postRole'))),
    ),
  ));
  return h('section', { class: 'staff-lowongan' }, h('h3', {}, t('staff.post')), ...roles);
}

export function openStaff(app: App, view: View = { kind: 'list' }): void {
  const s = app.s;
  ensureStaff(s);
  const done = () => {
    app.save();
    app.refresh();
    openStaff(app, view);
  };
  const back = h('div', { class: 'action' }, h('button', { class: 'btn staff-back', type: 'button', onclick: () => openStaff(app) }, t('staff.back')));
  if (view.kind === 'person') {
    const x = s.staff!.find((p) => p.id === view.id);
    if (x) return openSheet(x.name, [back, ...personView(app, x, done)]);
  } else if (view.kind === 'post') {
    return openSheet(t('staff.post'), [back, ...postView(app, view.role)]);
  }
  const wages = s.staff!.reduce((n, x) => n + price(s, x.salary), 0);
  openSheet(t('menu.staff'), [
    h('p', { class: 'meta' }, t('staff.intro')),
    h('p', { class: 'meta', id: 'staff-slots' }, t('staff.slots', { n: s.staff!.length, max: staffSlots(s), wages: rupiah(wages) })),
    ...s.staff!.map((x) => staffCard(app, x, done)),
    lowongan(app, done),
    dream(app),
  ]);
}
