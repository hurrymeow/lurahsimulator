// Urusan Pribadi: staff ask for things (decisions/staff-requests.md section 2). From level 2, each staff member brings
// a request about every 24 weeks, at most two open at a time, each with a deadline. Yes costs something and earns a
// heart of Akrab (+3 to the work stat); no, or letting the deadline pass, takes one away and makes a poach likelier.
// Loans come back, or don't, on the borrower's Jujur. Requests never block a star.
import { t, type Key } from '../i18n';
import { rupiah } from '../format';
import { roleDef, STAT_MAX, traitDef } from '../data/staff';
import { gain, type Fx } from './gain';
import { price } from './state';
import { release } from './staff';
import { rand } from './rng';
import type { CheckResult, GameState, RequestKind, Staff } from './types';

export const REQUEST = {
  /** Weeks between one person's requests. */
  every: 24,
  /** Open requests across the whole staff. */
  maxOpen: 2,
  /** Weeks to answer before it counts as a no. */
  deadline: 4,
  /** A level-2 hire or above asks; new hires settle in first. */
  fromLevel: 2,
  /** Work stat each heart adds, and the most hearts. */
  perHeart: 3,
  maxHearts: 3,
  /** Weeks a loan takes to come back or fail, and what a good one returns. */
  loanWeeks: 12,
  loanReturn: 1.3,
  /** A loan's chance to come back: base plus Jujur over 200 (Jujur 50 is 50%). */
  loanBase: 0.25,
  /** Rupiah a loan or a course asks for, before inflation, and the share of the kas it may never pass. */
  amount: 1_500_000,
  kasShare: 0.2,
  cutiWeeks: [2, 3, 4] as const,
  /** What the resource asks cost. */
  orangDalam: 1,
  viral: 5,
  sabar: 3,
};

/** Lines in the bank for each kind (`req.<kind>.<n>`). */
export const REQUEST_LINES: Record<RequestKind, number> = { cuti: 7, loan: 7, bimtek: 2, orangDalam: 1, viral: 1, sabar: 1 };
const KINDS: RequestKind[] = ['cuti', 'loan', 'bimtek', 'orangDalam', 'viral', 'sabar'];

/** Traits tilt the asks: Healing Mulu wants cuti, Si Paling Grup WA Viral, Titipan Orang Dalam "for Pak Camat". */
function kindFor(s: GameState, x: Staff): RequestKind {
  if (x.trait === 'healingMulu' && rand(s) < 0.6) return 'cuti';
  if (x.trait === 'siPalingWa' && rand(s) < 0.6) return 'viral';
  if (x.trait === 'titipan' && rand(s) < 0.6) return 'orangDalam';
  // Cuti and loans are the common asks; a resource is rarer.
  const weights = [3, 3, 1, 1, 1, 1];
  let r = rand(s) * weights.reduce((a, b) => a + b, 0);
  for (let i = 0; i < KINDS.length; i++) if ((r -= weights[i]) < 0) return KINDS[i];
  return 'cuti';
}

/** Rupiah for a loan or a course: scaled by prices, never more than a fifth of the kas. */
const amountFor = (s: GameState): number => Math.max(100_000, Math.min(price(s, REQUEST.amount), Math.round((Math.max(0, s.res.rupiah) * REQUEST.kasShare) / 1000) * 1000));

export const openRequests = (s: GameState): Staff[] => (s.staff ?? []).filter((x) => x.request);

/** The request line as the person says it. */
export const requestLine = (x: Staff): string => {
  const r = x.request!;
  return t(`req.${r.kind}.${r.line}` as Key, { x: r.weeks ?? 0, amt: rupiah(r.amt ?? 0) });
};

/** What a yes costs, said in a few words on the button. */
export function yesLabel(x: Staff): string {
  const r = x.request!;
  const n = r.kind === 'cuti' ? r.weeks ?? 0 : r.kind === 'orangDalam' ? REQUEST.orangDalam : r.kind === 'viral' ? REQUEST.viral : REQUEST.sabar;
  return t(`req.yes.${r.kind}` as Key, { n, amt: rupiah(r.amt ?? 0) });
}

export function checkYes(s: GameState, x: Staff): CheckResult {
  const r = x.request;
  if (!r) return { ok: false, missing: [] };
  if ((r.kind === 'loan' || r.kind === 'bimtek') && s.res.rupiah < (r.amt ?? 0)) return { ok: false, missing: [t('req.short')] };
  if (r.kind === 'orangDalam' && s.res.orangDalam < REQUEST.orangDalam) return { ok: false, missing: [t('req.short')] };
  if (r.kind === 'viral' && s.res.viral < REQUEST.viral) return { ok: false, missing: [t('req.short')] };
  return { ok: true };
}

const heart = (x: Staff, d: 1 | -1): void => {
  const before = x.akrab ?? 0;
  const after = Math.max(0, Math.min(REQUEST.maxHearts, before + d));
  if (after === before) return;
  x.akrab = after;
  // Each heart is +3 to the work stat, and it goes again with the heart.
  const st = roleDef(x.role).stat;
  x.stats[st] = Math.max(1, Math.min(STAT_MAX, x.stats[st] + d * REQUEST.perHeart));
};

/** Says yes: pays what was asked, and the bond grows. */
export function answerYes(s: GameState, x: Staff): boolean {
  if (!checkYes(s, x).ok) return false;
  const r = x.request!;
  const pay = (amt: number) => {
    s.res.rupiah -= amt;
    s.stats.spent += amt;
  };
  if (r.kind === 'cuti') x.away = Math.max(x.away ?? 0, r.weeks ?? 2);
  if (r.kind === 'loan') {
    pay(r.amt ?? 0);
    x.loan = { amt: r.amt ?? 0, due: s.month + REQUEST.loanWeeks, line: r.line };
  }
  if (r.kind === 'bimtek') {
    pay(r.amt ?? 0);
    const st = roleDef(x.role).stat;
    x.stats[st] = Math.min(STAT_MAX, x.stats[st] + REQUEST.perHeart);
  }
  if (r.kind === 'orangDalam') s.res.orangDalam -= REQUEST.orangDalam;
  if (r.kind === 'viral') s.res.viral -= REQUEST.viral;
  if (r.kind === 'sabar') s.res.sabar -= REQUEST.sabar;
  delete x.request;
  heart(x, 1);
  return true;
}

/** Says no (or lets it lapse): a heart goes, a poach gets likelier, and a Baperan leaves at once. True if they left. */
export function answerNo(s: GameState, x: Staff): boolean {
  delete x.request;
  heart(x, -1);
  if (x.trait && traitDef(x.trait).leavesOnRefuse) {
    release(s, x);
    return true;
  }
  x.refused = true;
  return false;
}

/** Weekly: new asks, lapsed deadlines and loans that come due. */
export function requestSystem(s: GameState, fx: Fx): void {
  for (const x of [...(s.staff ?? [])]) {
    if (x.loan && s.month >= x.loan.due) {
      const { amt } = x.loan;
      delete x.loan;
      const back = rand(s) < REQUEST.loanBase + x.stats.jujur / 200;
      if (back) {
        const total = Math.round((amt * REQUEST.loanReturn) / 1000) * 1000;
        gain(s, fx, 'rupiah', total);
        fx.push({ kind: 'notice', title: t('req.loanBackTitle', { name: x.name }), body: t(`req.loanBack.${rand(s) < 0.5 ? 0 : 1}` as Key, { amt: rupiah(total - amt) }), tone: 'good' });
      } else {
        fx.push({ kind: 'notice', title: t('req.loanGoneTitle', { name: x.name }), body: t(`req.loanGone.${rand(s) < 0.5 ? 0 : 1}` as Key), tone: 'bad' });
      }
    }
    if (x.request && s.month >= x.request.due) {
      const left = answerNo(s, x);
      fx.push({ kind: 'notice', title: t(left ? 'req.lapsedLeftTitle' : 'req.lapsedTitle', { name: x.name }), body: t('req.no'), tone: 'bad' });
    }
  }
  if (openRequests(s).length >= REQUEST.maxOpen) return;
  for (const x of s.staff ?? []) {
    if (x.inem || x.request || x.away || x.level < REQUEST.fromLevel) continue;
    if (s.month - (x.lastRequest ?? x.hiredAt) < REQUEST.every) continue;
    if (openRequests(s).length >= REQUEST.maxOpen) return;
    const kind = kindFor(s, x);
    x.lastRequest = s.month;
    x.request = {
      kind,
      line: Math.floor(rand(s) * REQUEST_LINES[kind]),
      due: s.month + REQUEST.deadline,
      ...(kind === 'cuti' ? { weeks: REQUEST.cutiWeeks[Math.floor(rand(s) * REQUEST.cutiWeeks.length)] } : {}),
      ...(kind === 'loan' || kind === 'bimtek' ? { amt: amountFor(s) } : {}),
    };
    fx.push({ kind: 'notice', title: t('req.title', { name: x.name }), body: requestLine(x), tone: 'info', card: true, open: 'staff' });
    // One new ask a week at most, so two never land on the same card stack.
    return;
  }
}
