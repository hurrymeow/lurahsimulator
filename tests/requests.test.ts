import { afterEach, describe, expect, it } from 'vitest';
import { answerNo, answerYes, openRequests, REQUEST, REQUEST_LINES, requestSystem } from '../src/sim/requests';
import { roleDef } from '../src/data/staff';
import { newGame } from '../src/sim/state';
import { EN } from '../src/i18n/en';
import { ID } from '../src/i18n/id';
import { setLang, t, type Key } from '../src/i18n';
import type { GameState, Staff } from '../src/sim/types';
import type { Fx } from '../src/sim/gain';

const words = (s: string) => s.split(/\s+/).filter((w) => /\p{L}/u.test(w)).length;

/** A game with three level-3 hires who have worked long enough to ask. */
function staffed(seed = 5): GameState {
  const s = newGame(seed);
  s.res.rupiah = 50_000_000;
  s.res.orangDalam = 10;
  s.res.viral = 50;
  s.month = 100;
  const base = (id: number, role: Staff['role']): Staff => ({ id, name: `Staf ${id}`, stars: 2, stats: { rajin: 40, lobi: 40, jujur: 50, gaul: 40 }, salary: 1_000_000, role, xp: 30, level: 3, hiredAt: 0 });
  s.staff = [base(11, 'hansip'), base(12, 'asisten'), base(13, 'pu')];
  return s;
}
const week = (s: GameState, fx: Fx = []) => {
  requestSystem(s, fx);
  s.month++;
  return fx;
};

afterEach(() => setLang('en'));

describe('Urusan Pribadi', () => {
  it('a hire asks after 24 weeks from level 2, at most two open, one new ask a week, as a card', () => {
    const s = staffed();
    const fx = week(s);
    expect(openRequests(s)).toHaveLength(1);
    expect(fx.some((f) => f.kind === 'notice' && f.card && f.open === 'staff')).toBe(true);
    week(s);
    week(s);
    expect(openRequests(s)).toHaveLength(REQUEST.maxOpen);
    // A level-1 hire and Inem never ask.
    const t2 = staffed();
    for (const x of t2.staff!) x.level = 1;
    for (let i = 0; i < 30; i++) week(t2);
    expect(openRequests(t2)).toHaveLength(0);
  });

  it('yes adds a heart, +3 to the work stat, up to 3 hearts; no takes one away', () => {
    const s = staffed();
    const x = s.staff![0];
    const st = roleDef(x.role).stat;
    const before = x.stats[st];
    for (let i = 0; i < 4; i++) {
      x.request = { kind: 'cuti', line: 0, due: s.month + 4, weeks: 2 };
      expect(answerYes(s, x)).toBe(true);
    }
    expect(x.akrab).toBe(3);
    expect(x.stats[st]).toBe(before + 3 * REQUEST.perHeart);
    x.request = { kind: 'viral', line: 0, due: s.month + 4 };
    expect(answerNo(s, x)).toBe(false);
    expect(x.akrab).toBe(2);
    expect(x.stats[st]).toBe(before + 2 * REQUEST.perHeart);
    expect(x.refused).toBe(true);
  });

  it('a Baperan leaves at once on a no, and a lapsed deadline counts as a no', () => {
    const s = staffed();
    const x = s.staff![0];
    x.trait = 'baperan';
    x.request = { kind: 'cuti', line: 1, due: s.month + 4, weeks: 3 };
    expect(answerNo(s, x)).toBe(true);
    expect(s.staff!.includes(x)).toBe(false);
    const y = s.staff![0];
    y.request = { kind: 'sabar', line: 0, due: s.month };
    y.lastRequest = s.month;
    const fx = week(s);
    expect(y.request).toBeUndefined();
    expect(fx.some((f) => f.kind === 'notice' && f.tone === 'bad')).toBe(true);
  });

  it('a loan comes back with interest or is lost, on Jujur', () => {
    const outcomes = { back: 0, gone: 0 };
    for (let seed = 1; seed <= 40; seed++) {
      const s = staffed(seed);
      const x = s.staff![0];
      x.stats.jujur = 90;
      x.request = { kind: 'loan', line: 0, due: s.month + 4, amt: 1_000_000 };
      const kas = s.res.rupiah;
      answerYes(s, x);
      expect(s.res.rupiah).toBe(kas - 1_000_000);
      for (const o of s.staff!) o.lastRequest = s.month + 1000;
      s.month = x.loan!.due;
      week(s);
      expect(x.loan).toBeUndefined();
      if (s.res.rupiah > kas) outcomes.back++;
      else outcomes.gone++;
    }
    // Jujur 90 brings most loans back (70%), but not all.
    expect(outcomes.back).toBeGreaterThan(outcomes.gone);
    expect(outcomes.gone).toBeGreaterThan(0);
  });

  it('every line exists in both languages and fits one paragraph (UI.md rule 13: 20 words)', () => {
    for (const [kind, n] of Object.entries(REQUEST_LINES))
      for (let i = 0; i < n; i++) {
        const k = `req.${kind}.${i}` as Key;
        expect(EN[k], k).toBeTruthy();
        expect(ID[k], k).toBeTruthy();
        for (const lang of ['en', 'id'] as const) {
          setLang(lang);
          expect(words(t(k, { x: 3, amt: 'Rp 1.500.000' })), `${lang} ${k}`).toBeLessThanOrEqual(20);
        }
      }
  });
});
