// The staff: hiring through a Lowongan, levels, raises, Bimtek, firing, mutasi to a neighbouring RT, what
// each role does, and Inem's gigs. Rolls hash the seed, month and ids, so staff never shift the shared random
// stream that events and arrivals draw from.
import { atMonth } from './calendar';
import { gName, gReward, t, type Key } from '../i18n';
import { rupiah } from '../format';
import {
  APPLICANTS, BIMTEK, CHANNELS, COURSE_COST, LEVEL_STAT_GAIN, RISK, GIGS, INEM, MUTASI, PESANGON_MONTHS, POACH_CHANCE, RAISE, REQUIREMENTS, ROLE_FX, ROLES, SLOTS,
  SPECIAL_CHANCE, SPECIALS, STAFF_CAP, STAFF_LEVEL_MONTHS, STAR_SALARY, STAR_TOTAL, STAT_MAX, STATS, TRAITS, roleDef, traitDef,
  type ChannelId, type RoleDef, type RoleId, type StatId, type TraitId,
} from '../data/staff';
import { NAMES, TITLES } from '../data/names';
import { IURAN } from './balance';
import { gain, type Fx } from './gain';
import { isWorking, population, price } from './state';
import type { Applicant, Building, CheckResult, GameState, Resident, RtTrait, Staff, StaffStats } from './types';

const ORDER = ['rt', 'rw', 'kelurahan', 'kecamatan'];

/** A 0..1 roll from the seed and some salts. */
function roll(s: GameState, ...salt: number[]): number {
  let h = Math.imul(s.seed ^ 0x51ed270b, 0x85ebca6b);
  for (const x of salt) {
    h = Math.imul(h ^ (x * 0x9e3779b1), 0xc2b2ae35);
    h ^= h >>> 15;
  }
  h = Math.imul(h ^ (h >>> 13), 0x27d4eb2f);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}
const pickN = (r: number, n: number) => Math.min(n - 1, Math.floor(r * n));

export function newInem(): Staff {
  return { id: 1, name: INEM.name, role: 'asisten', inem: true, stars: 3, stats: { ...INEM.stats }, salary: INEM.salary, xp: 0, level: 1, hiredAt: 0 };
}

/** Every game has Inem. Old saves get her on load. */
export function ensureStaff(s: GameState): void {
  s.staff ??= [newInem()];
  if (!s.staff.some((x) => x.inem)) s.staff.unshift(newInem());
  s.nextStaffId ??= Math.max(1, ...s.staff.map((x) => x.id)) + 1;
  s.lowongan ??= null;
  s.gigs ??= [];
}

export const inem = (s: GameState): Staff | undefined => s.staff?.find((x) => x.inem);

const reached = (s: GameState, stage: string, stars: number) =>
  ORDER.indexOf(s.stage.current) > ORDER.indexOf(stage) || (s.stage.current === stage && s.stage.stars[s.stage.current] >= stars);

/** Staff the player may hold now, Inem included. */
export function staffSlots(s: GameState): number {
  let n = 1;
  for (const row of SLOTS) if (reached(s, row.stage, row.stars)) n = Math.max(n, row.slots);
  return Math.min(STAFF_CAP, n);
}

/** Roles that can be posted now. */
export const openRoles = (s: GameState): RoleDef[] => ROLES.filter((r) => !r.inemOnly && reached(s, r.opens.stage, r.opens.stars));

// ---------- what staff do ----------

/** One staff member's weight in their role: level, their main stat around 50, trait and special. */
export function output(x: Staff): number {
  if (x.away) return 0;
  const stat = x.stats[roleDef(x.role).stat] / 50;
  const tr = x.trait ? traitDef(x.trait) : undefined;
  let m = tr?.output ?? 1;
  if (x.trait === 'mantanPreman' && x.role === 'hansip') m = 2;
  const sp = x.special ? SPECIALS.find((p) => p.id === x.special) : undefined;
  if (sp && sp.role === x.role) m *= sp.output ?? 1;
  return x.level * stat * m;
}

export const roleOutput = (s: GameState, role: RoleId): number => (s.staff ?? []).filter((x) => x.role === role).reduce((n, x) => n + output(x), 0);

/** Share of a permit Inem's paperwork saves. */
/** Folders the Kantor's desks clear in a month: every Asisten's output, never less than the floor. */
export const deskCapacity = (s: GameState): number => {
  // A new game has Inem before the staff system first runs.
  const desk = (s.staff ?? [newInem()]).filter((x) => x.role === 'asisten').reduce((n, x) => n + output(x), 0);
  return Math.max(ROLE_FX.asisten.floor, desk * ROLE_FX.asisten.berkasPerOutput);
};

/** Buildings waiting for a permit, in the order the desks take them: first placed, first stamped. */
export const permitQueue = (s: GameState): Building[] =>
  s.buildings.filter((b) => b.status === 'permit').sort((a, b) => a.placedAt - b.placedAt || a.uid - b.uid);

/** Folders still in the queue. */
export const queueBerkas = (s: GameState): number => permitQueue(s).reduce((n, b) => n + Math.max(0, b.timer), 0);

/** Months until this building's permit is through, at today's desk speed. Counts the folders ahead of it too. */
export function permitEta(s: GameState, b: Building): number {
  let ahead = 0;
  for (const o of permitQueue(s)) {
    ahead += Math.max(0, o.timer);
    if (o.uid === b.uid) break;
  }
  return Math.max(1, Math.ceil((ahead - (s.deskCarry ?? 0)) / deskCapacity(s)));
}

/** Months until the whole queue is through. */
export const queueMonths = (s: GameState): number => {
  const q = permitQueue(s);
  return q.length ? permitEta(s, q[q.length - 1]) : 0;
};

/** The desks clear the queue in order, whole folders only; what is left of a folder carries to next month. Returns the buildings whose permit came through. */
export function clearPermits(s: GameState): Building[] {
  const queue = permitQueue(s);
  if (!queue.length) {
    s.deskCarry = 0;
    return [];
  }
  let cap = deskCapacity(s) + (s.deskCarry ?? 0);
  const done: Building[] = [];
  for (const b of queue) {
    while (cap >= 1 && b.timer > 0) {
      b.timer--;
      cap--;
    }
    if (b.timer <= 0) done.push(b);
    if (cap < 1) break;
  }
  s.deskCarry = done.length === queue.length ? 0 : Math.min(1, cap);
  return done;
}
export const hansipAman = (s: GameState): number => roleOutput(s, 'hansip') * ROLE_FX.hansip.amanPerLevel;
/** Aman the Satpol PP adds to a razia, on top of the razia's own. */
export const satpolRaziaAman = (s: GameState): number => roleOutput(s, 'satpol') * ROLE_FX.satpol.raziaAmanPerLevel;
export const buildBoost = (s: GameState): number => roleOutput(s, 'supir') * ROLE_FX.supir.buildBoostPerLevel;
export const upkeepCut = (s: GameState): number => Math.min(ROLE_FX.bendahara.upkeepCutMax, roleOutput(s, 'bendahara') * ROLE_FX.bendahara.upkeepCutPerLevel);

/** Extra iuran a week from the Tukang Tagih. What a low-Jujur one keeps comes as a mishap, named. */
export function iuranBonus(s: GameState): number {
  const f = ROLE_FX.penagih;
  const share = Math.min(f.iuranMax, roleOutput(s, 'penagih') * f.iuranPerLevel);
  if (!share) return 0;
  return Math.round(population(s) * IURAN * s.inflation * share);
}

// ---------- what each stat buys ----------

/** A person in a role as the stat lines see them: a hire on the staff, or an applicant for a posted role. */
export type InRole = Pick<Staff, 'role' | 'stats' | 'trait' | 'special'> & { level?: number };

/** Chance a week that this person has a mishap: zero once their risk stat reaches RISK.safeFrom. */
export function mishapChance(x: InRole): number {
  const stat = x.stats[roleDef(x.role).risk];
  return RISK.base * Math.max(0, (RISK.safeFrom - stat) / RISK.safeFrom);
}

/** What one person adds in their role, in the role's own unit: folders, Aman, percent of iuran, and so on. */
export function roleGain(x: InRole): number {
  const o = output({ ...x, level: x.level ?? 1, away: 0 } as Staff);
  switch (x.role) {
    case 'asisten': return o * ROLE_FX.asisten.berkasPerOutput;
    case 'hansip': return o * ROLE_FX.hansip.amanPerLevel;
    case 'penagih': return Math.min(ROLE_FX.penagih.iuranMax, o * ROLE_FX.penagih.iuranPerLevel) * 100;
    case 'pu': return o * ROLE_FX.pu.repairsPerLevel;
    case 'adminWa': return o * ROLE_FX.adminWa.viralPerLevel;
    case 'supir': return o * ROLE_FX.supir.buildBoostPerLevel * 100;
    case 'bendahara': return Math.min(ROLE_FX.bendahara.upkeepCutMax, o * ROLE_FX.bendahara.upkeepCutPerLevel) * 100;
    case 'sekretaris': return o * ROLE_FX.sekretaris.orangDalamPerLevel;
    case 'satpol': return o * ROLE_FX.satpol.raziaAmanPerLevel;
  }
}

/** A mishap: the role's risk stat let something slip. It costs what the role's mishap says, and names who and why. */
function mishap(s: GameState, fx: Fx, x: Staff, site?: Building): void {
  const role = roleDef(x.role);
  const stat = role.risk;
  const what = t(`staff.mishapWhat.${x.role}` as Key);
  if (role.mishap.res === 'sabar') gain(s, fx, 'sabar', -role.mishap.amount, site);
  else gain(s, fx, 'rupiah', -price(s, role.mishap.amount), site);
  fx.push({ kind: 'notice', title: t('staff.mishapTitle', { name: x.name, stat: t(`staff.stat.${stat}` as Key), n: x.stats[stat], what }), body: t('staff.mishapBody', { stat: t(`staff.stat.${stat}` as Key) }), tone: 'bad' });
}

// ---------- hiring ----------

export const lowonganCost = (s: GameState, channel: ChannelId): number => price(s, CHANNELS.find((c) => c.id === channel)!.cost);

export function checkPost(s: GameState, role: RoleId, channel: ChannelId): CheckResult {
  const missing: string[] = [];
  if (s.lowongan) missing.push(t('staff.oneAtATime'));
  if ((s.staff?.length ?? 0) >= staffSlots(s)) missing.push(t('staff.full', { n: staffSlots(s) }));
  if (!openRoles(s).some((r) => r.id === role)) missing.push(t('staff.roleClosed'));
  const cost = lowonganCost(s, channel);
  if (s.res.rupiah < cost) missing.push(t('sim.moneyGap', { amt: rupiah(cost - s.res.rupiah), cost: rupiah(cost) }));
  return missing.length ? { ok: false, missing } : { ok: true };
}

export function postLowongan(s: GameState, role: RoleId, channel: ChannelId): CheckResult {
  const check = checkPost(s, role, channel);
  if (!check.ok) return check;
  const ch = CHANNELS.find((c) => c.id === channel)!;
  const cost = lowonganCost(s, channel);
  s.res.rupiah -= cost;
  s.stats.spent += cost;
  s.lowongan = { role, channel, req: pickN(roll(s, s.month, 7), REQUIREMENTS), postedAt: s.month, arriveAt: s.month + ch.wait, applicants: [] };
  return check;
}

/** Splits a star total over the four stats, leaning toward the role's own stat. */
function rollStats(s: GameState, total: number, lean: StatId, salt: number): StaffStats {
  const w = STATS.map((st, i) => (st === lean ? 1.4 : 1) * (0.7 + 0.6 * roll(s, salt, i)));
  const sum = w.reduce((a, b) => a + b, 0);
  const out = {} as StaffStats;
  STATS.forEach((st, i) => (out[st] = Math.max(1, Math.min(STAT_MAX, Math.round((total * w[i]) / sum)))));
  return out;
}

function applyTrait(stats: StaffStats, trait?: TraitId): StaffStats {
  if (!trait) return stats;
  const ch = traitDef(trait).stats ?? {};
  const out = { ...stats };
  for (const [k, v] of Object.entries(ch) as [StatId, number][]) out[k] = Math.max(1, Math.min(STAT_MAX, out[k] + v));
  return out;
}

/** Jobless warga, longest idle first: who answers the Grup WA. */
const jobless = (s: GameState): Resident[] => s.residents.filter((r) => r.job === 'none' && r.staffId === undefined).sort((a, b) => (b.idle ?? 0) - (a.idle ?? 0));

/**
 * A Grup WA posting goes out through your Admin Grup WA, if you have one: their Gaul moves points of the odds
 * between 2-star and 3-star applicants, up to 20 better or 10 worse.
 */
export function grupWaShift(s: GameState): { x: Staff; pts: number } | null {
  const x = (s.staff ?? []).filter((p) => p.role === 'adminWa' && !p.away).sort((a, b) => b.stats.gaul - a.stats.gaul)[0];
  return x ? { x, pts: Math.max(-10, Math.min(20, Math.round((x.stats.gaul - 50) * 0.4))) } : null;
}

export function rollApplicants(s: GameState): Applicant[] {
  const lw = s.lowongan!;
  const base = CHANNELS.find((c) => c.id === lw.channel)!;
  const shift = base.local ? grupWaShift(s) : null;
  const shifted = shift ? { ...base, odds: { ...base.odds, 2: base.odds[2] - shift.pts, 3: base.odds[3] + shift.pts } } : base;
  // In the Kecamatan, 5-star applicants open: 5 points of the outside channel's 4-star odds.
  const ch = s.stage.current === 'kecamatan' && !base.local ? { ...shifted, odds: { ...shifted.odds, 4: shifted.odds[4] - 5, 5: 5 } } : shifted;
  const role = roleDef(lw.role);
  const n = APPLICANTS.min + pickN(roll(s, s.month, 1), APPLICANTS.max - APPLICANTS.min + 1);
  const locals = ch.local ? jobless(s) : [];
  const hired = new Set((s.staff ?? []).map((x) => x.special).filter(Boolean));
  const out: Applicant[] = [];
  for (let i = 0; i < n; i++) {
    if (ch.local && i >= locals.length) break;
    const r = roll(s, s.month, 100 + i);
    let acc = 0;
    let stars = 2;
    for (const [st, pct] of Object.entries(ch.odds)) {
      acc += pct / 100;
      if (r < acc) {
        stars = Number(st);
        break;
      }
    }
    const id = s.nextStaffId!++;
    const local = ch.local ? locals[i] : undefined;
    const special = !ch.local && stars === 4 && roll(s, s.month, 200 + i) < SPECIAL_CHANCE ? SPECIALS.find((p) => p.role === role.id && !hired.has(p.id)) : undefined;
    if (special) {
      hired.add(special.id);
      out.push({ id, name: special.name, stars: 4, stats: { ...special.stats }, special: special.id, salary: STAR_SALARY[4] });
      continue;
    }
    let trait: TraitId | undefined;
    if (local?.preman) trait = 'mantanPreman';
    else if (i === 0 && roll(s, s.month, 300) < ch.titipan) trait = 'titipan';
    else if (roll(s, s.month, 400 + i) < 0.45) {
      const pool = TRAITS.filter((x) => x.id !== 'titipan' && x.id !== 'mantanPreman');
      trait = pool[pickN(roll(s, s.month, 500 + i), pool.length)].id;
    }
    const name = local?.name ?? `${TITLES[pickN(roll(s, s.month, 600 + i), TITLES.length)]} ${NAMES[pickN(roll(s, s.month, 700 + i), NAMES.length)]}`;
    const stats = applyTrait(rollStats(s, STAR_TOTAL[stars], role.stat, s.month * 31 + i), trait);
    out.push({ id, name, stars, stats, trait, salary: STAR_SALARY[stars], fromResident: local?.id });
  }
  return out;
}

export function checkHire(s: GameState, id: number): CheckResult {
  const a = s.lowongan?.applicants.find((x) => x.id === id);
  if (!a) return { ok: false, missing: [t('staff.gone')] };
  if ((s.staff?.length ?? 0) >= staffSlots(s)) return { ok: false, missing: [t('staff.full', { n: staffSlots(s) })] };
  return { ok: true };
}

export function hire(s: GameState, id: number): Staff | null {
  if (!checkHire(s, id).ok) return null;
  const lw = s.lowongan!;
  const a = lw.applicants.find((x) => x.id === id)!;
  const x: Staff = { ...a, role: lw.role, xp: 0, level: 1, hiredAt: s.month, lastRaise: s.month };
  s.staff!.push(x);
  if (a.fromResident !== undefined) {
    const r = s.residents.find((q) => q.id === a.fromResident);
    if (r) {
      r.staffId = x.id;
      r.job = 'none';
      r.idle = 0;
      r.preman = false;
    }
  }
  // One hire closes the posting; the other applicants go home.
  s.lowongan = null;
  return x;
}

export const cancelLowongan = (s: GameState): void => {
  s.lowongan = null;
};

// ---------- managing ----------

const release = (s: GameState, x: Staff) => {
  s.staff = s.staff!.filter((o) => o !== x);
  for (const r of s.residents) if (r.staffId === x.id) delete r.staffId;
};

export const pesangon = (s: GameState, x: Staff): number => price(s, x.salary * PESANGON_MONTHS);

export function checkFire(s: GameState, x: Staff): CheckResult {
  if (x.inem) return { ok: false, missing: [t('staff.inemStays')] };
  if (x.trait && traitDef(x.trait).noFire) return { ok: false, missing: [t('staff.titipanStays')] };
  const cost = pesangon(s, x);
  return s.res.rupiah >= cost ? { ok: true } : { ok: false, missing: [t('sim.moneyGap', { amt: rupiah(cost - s.res.rupiah), cost: rupiah(cost) })] };
}

export function fire(s: GameState, x: Staff): boolean {
  if (!checkFire(s, x).ok) return false;
  const cost = pesangon(s, x);
  s.res.rupiah -= cost;
  s.stats.spent += cost;
  release(s, x);
  return true;
}

export const bimtekCost = (s: GameState, stat?: StatId): number => price(s, BIMTEK.cost * (stat ? COURSE_COST[stat] : 1));

export function checkBimtek(s: GameState, x: Staff, stat: StatId = roleDef(x.role).stat): CheckResult {
  if (x.away) return { ok: false, missing: [t('staff.away', { n: x.away })] };
  const st = stat;
  if (x.stats[st] >= STAT_MAX) return { ok: false, missing: [t('staff.maxed')] };
  const cost = bimtekCost(s, stat);
  return s.res.rupiah >= cost ? { ok: true } : { ok: false, missing: [t('sim.moneyGap', { amt: rupiah(cost - s.res.rupiah), cost: rupiah(cost) })] };
}

/** Training at a hotel: a little more of the role's stat, a month away. */
/** Bimtek picks the stat: a course for each, the role's own stat by default. */
export function bimtek(s: GameState, x: Staff, stat: StatId = roleDef(x.role).stat): boolean {
  if (!checkBimtek(s, x, stat).ok) return false;
  const cost = bimtekCost(s, stat);
  s.res.rupiah -= cost;
  s.stats.spent += cost;
  const st = stat;
  x.stats[st] = Math.min(STAT_MAX, x.stats[st] + BIMTEK.gain);
  x.away = BIMTEK.away;
  return true;
}

/** Answers a raise request. Refused: a Baperan leaves at once, anyone else may be poached. */
export function answerRaise(s: GameState, x: Staff, accept: boolean): void {
  x.raiseAsked = false;
  if (accept) {
    x.salary = Math.round(x.salary * (1 + RAISE));
    x.refused = false;
    x.lastRaise = s.month;
    return;
  }
  if (x.trait && traitDef(x.trait).leavesOnRefuse) release(s, x);
  else x.refused = true;
}

/** AI RTs that can take a Ketua RT. */
export const mutasiTargets = (s: GameState) => s.neighbours.map((n, i) => ({ n, i }));

export function checkMutasi(s: GameState, x: Staff): CheckResult {
  const missing: string[] = [];
  if (x.inem) missing.push(t('staff.inemStays'));
  if (x.stars < MUTASI.stars || x.level < MUTASI.level) missing.push(t('staff.mutasiNeeds', { stars: MUTASI.stars, level: MUTASI.level }));
  if (!s.neighbours.length) missing.push(t('staff.mutasiNoRt'));
  return missing.length ? { ok: false, missing } : { ok: true };
}

/** The neighbour trait a promoted staff member brings: their strongest habit. */
export function traitFrom(x: Staff): RtTrait {
  if (x.stats.rajin < 40) return 'jarang';
  return x.stats.gaul > x.stats.rajin ? 'hobi' : 'rajin';
}

/** Promotes a trained staff member to Ketua RT of a neighbour. The neighbour takes their habit; the slot frees. */
export function mutasi(s: GameState, x: Staff, neighbour: number): RtTrait | null {
  if (!checkMutasi(s, x).ok || !s.neighbours[neighbour]) return null;
  const trait = traitFrom(x);
  s.neighbours[neighbour].trait = trait;
  release(s, x);
  return trait;
}

export const levelForStaff = (xp: number): number => STAFF_LEVEL_MONTHS.reduce((lv, m, i) => (xp >= m ? i + 1 : lv), 1);

/** After an event, a Healing Mulu staff member takes a month off. */
export function afterEventStaff(s: GameState): void {
  for (const x of s.staff ?? []) if (x.trait && traitDef(x.trait).healing) x.away = Math.max(x.away ?? 0, 1);
}

// ---------- the month ----------

export function staffSystem(s: GameState, fx: Fx): void {
  ensureStaff(s);
  const kantor = s.buildings.find((b) => b.def.startsWith('kantor'));
  // Applicants arrive when the posting has waited long enough, as a card with a button to the Staff panel.
  // They wait there until the player hires one or cancels.
  const lw = s.lowongan;
  if (lw && s.month === lw.arriveAt) {
    lw.applicants = rollApplicants(s);
    if (lw.applicants.length) fx.push({ kind: 'notice', title: t('staff.applicantsTitle', { n: lw.applicants.length }), body: t('staff.applicantsBody'), tone: 'good', card: true, open: 'staff' });
    else {
      fx.push({ kind: 'notice', title: t('staff.noApplicants'), body: t('staff.noApplicantsBody'), tone: 'bad' });
      s.lowongan = null;
    }
  }

  let wages = 0;
  for (const x of [...s.staff!]) {
    wages += price(s, x.salary);
    if (x.away) {
      x.away--;
      continue;
    }
    const tr = x.trait ? traitDef(x.trait) : undefined;
    if (tr?.orangDalam) gain(s, fx, 'orangDalam', tr.orangDalam);
    // A low risk stat leaves a gap: now and then something slips, and the notice says who and which stat.
    if (roll(s, s.month, x.id, 13) < mishapChance(x)) mishap(s, fx, x, kantor);
    if (x.inem) continue;
    const before = x.level;
    x.xp += tr?.xp ?? 1;
    x.level = levelForStaff(x.xp);
    // People get better at what they do: each level-up raises the role's main stat.
    if (x.level > before) {
      const st = roleDef(x.role).stat;
      x.stats[st] = Math.min(STAT_MAX, x.stats[st] + LEVEL_STAT_GAIN);
    }
    if (x.level > before && !tr?.noRaise) {
      x.raiseAsked = true;
      fx.push({ kind: 'notice', title: t('staff.raiseTitle', { name: x.name, n: x.level }), body: t('staff.raiseBody'), tone: 'info' });
    }
    if (x.refused && roll(s, s.month, x.id, 9) < POACH_CHANCE && !tr?.noFire) {
      release(s, x);
      fx.push({ kind: 'notice', title: t('staff.poachedTitle', { name: x.name }), body: t('staff.poachedBody'), tone: 'bad' });
      continue;
    }
    if (tr?.quitsUnpaidAfter && s.month - (x.lastRaise ?? x.hiredAt) >= tr.quitsUnpaidAfter) {
      release(s, x);
      fx.push({ kind: 'notice', title: t('staff.quitTitle', { name: x.name }), body: t('staff.quitBody'), tone: 'bad' });
      continue;
    }
    if (tr?.retireAfter && s.month - x.hiredAt >= tr.retireAfter) {
      release(s, x);
      fx.push({ kind: 'notice', title: t('staff.retireTitle', { name: x.name }), body: t('staff.retireBody'), tone: 'info' });
    }
  }
  if (wages) {
    s.res.rupiah -= wages;
    s.stats.spent += wages;
  }
  const bonus = iuranBonus(s);
  if (bonus) gain(s, fx, 'rupiah', bonus, kantor);
  const viral = roleOutput(s, 'adminWa') * ROLE_FX.adminWa.viralPerLevel;
  if (viral) gain(s, fx, 'viral', viral);
  const od = roleOutput(s, 'sekretaris') * ROLE_FX.sekretaris.orangDalamPerLevel;
  if (od) gain(s, fx, 'orangDalam', od);
  let fixes = Math.floor(roleOutput(s, 'pu') * ROLE_FX.pu.repairsPerLevel);
  for (const b of s.buildings) {
    if (fixes <= 0) break;
    if (b.status !== 'damaged') continue;
    b.status = 'active';
    fixes--;
  }
  // A Hansip on the beat finds a preman work: one a month, at most, per Hansip level.
  const beat = Math.floor(roleOutput(s, 'hansip'));
  for (const r of s.residents.filter((q) => q.preman).slice(0, beat)) {
    r.preman = false;
    r.idle = 0;
    fx.push({ kind: 'notice', title: t('staff.hansipTitle', { name: r.name }), body: t('staff.hansipBody'), tone: 'good' });
  }
  gigSystem(s, fx);
}

// ---------- Inem's dream ----------

/** Inem headlined the 17 Agustus dangdut stage: her Panggung 17 Agustus gig, if not done yet. */
export function inemHeadlined(s: GameState, fx: Fx): void {
  ensureStaff(s);
  if (!s.gigs!.includes('agustus')) gigDone(s, 'agustus', fx, 2);
}

function gigDone(s: GameState, id: string, fx: Fx, level: number): void {
  s.gigs!.push(id);
  const me = inem(s);
  if (me) me.level = Math.max(me.level, level);
  const g = GIGS.find((x) => x.id === id)!;
  fx.push({ kind: 'notice', title: t('gig.doneTitle', { name: gName(g) }), body: gReward(g), tone: 'good', fanfare: true, inem: true });
}

/** Monthly: Inem's sub-goals. They never gate stars. */
export function gigSystem(s: GameState, fx: Fx): void {
  const done = (id: string) => s.gigs!.includes(id);
  if (!done('agustus') && atMonth(s.month, 7) && s.buildings.some((b) => b.def === 'lapangan' && isWorking(b)) && s.res.sabar >= 50) {
    gain(s, fx, 'viral', 5);
    gigDone(s, 'agustus', fx, 2);
  }
  if (!done('hajatan') && ORDER.indexOf(s.stage.current) >= 1 && s.res.viral >= 30) gigDone(s, 'hajatan', fx, 3);
  if (done('hajatan')) gain(s, fx, 'rupiah', price(s, 100_000));
  if (!done('lomba') && s.ranking.some((r) => r.tier === 'kelurahan' && r.won)) {
    gain(s, fx, 'sabar', 10);
    gigDone(s, 'lomba', fx, 4);
  }
}

export { CHANNELS, ROLES };
