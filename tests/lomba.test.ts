import { describe, expect, it } from 'vitest';
import { LOMBA, STAGES_17 } from '../src/data/lomba';
import { checkContest, climbBand, finishLomba, lombaPrep, mashTaps, rollChance, setKetua, setStage, toggleContest, turnout } from '../src/sim/lomba';
import { ensureStaff } from '../src/sim/staff';
import { addBuilding, newGame } from '../src/sim/state';
import { tick } from '../src/sim/tick';
import type { Fx } from '../src/sim/gain';
import type { GameState } from '../src/sim/types';

/** Runs months until the given month of the game, waving events through. */
const until = (s: GameState, month: number): Fx => {
  let fx: Fx = [];
  while (s.month < month) {
    s.pendingEvent = null;
    fx = tick(s);
  }
  return fx;
};

const prepared = (seed = 1) => {
  const s = newGame(seed);
  s.res.rupiah = 50_000_000;
  until(s, 20);
  return s;
};

describe('Lomba Agustusan', () => {
  it('the panitia forms in May (week 19) with a card that opens the panel', () => {
    const s = newGame(1);
    until(s, 10);
    expect(s.lomba).toBeUndefined();
    s.res.rupiah = 50_000_000;
    const fx = until(s, 19);
    expect(lombaPrep(s)).not.toBeNull();
    expect(fx).toContainEqual(expect.objectContaining({ kind: 'notice', card: true, open: 'lomba' }));
  });

  it('contests are paid for when picked, refunded when dropped, capped at three, and the pole needs a Lapangan', () => {
    const s = prepared();
    const kas = s.res.rupiah;
    expect(checkContest(s, 'panjatPinang')).toMatch(/Lapangan/);
    expect(toggleContest(s, 'balapKarung')).toBeNull();
    expect(s.res.rupiah).toBeLessThan(kas);
    toggleContest(s, 'balapKarung');
    expect(s.res.rupiah).toBe(kas);
    addBuilding(s, 'lapangan', 1, 1, 'active');
    for (const id of ['panjatPinang', 'balapKarung', 'makanKerupuk']) expect(toggleContest(s, id)).toBeNull();
    expect(toggleContest(s, 'tarikTambang')).toMatch(/3/);
  });

  it('a stage costs the difference and raises turnout', () => {
    const s = prepared();
    const kas = s.res.rupiah;
    const base = turnout(s);
    expect(setStage(s, 2)).toBeNull();
    expect(kas - s.res.rupiah).toBeGreaterThan(0);
    expect(turnout(s)).toBeCloseTo(base * STAGES_17[2].turnout);
    setStage(s, 0);
    expect(s.res.rupiah).toBe(kas);
  });

  it('the ketua panitia: Rajin widens the grip band, Gaul cuts the taps and lifts the odds', () => {
    const s = prepared();
    const band = climbBand(s);
    const taps = mashTaps(s);
    const odds = rollChance(s);
    ensureStaff(s);
    s.staff!.push({ id: 77, name: 'Pak Ketua', role: 'hansip', stars: 3, stats: { rajin: 90, lobi: 20, jujur: 50, gaul: 90 }, salary: 1, xp: 0, level: 1, hiredAt: 0 });
    setKetua(s, 77);
    expect(climbBand(s)).toBeGreaterThan(band);
    expect(mashTaps(s)).toBeLessThan(taps);
    expect(rollChance(s)).toBeGreaterThan(odds);
  });

  it('with nothing picked, 17 Agustus passes and Popularitas drops', () => {
    const s = prepared();
    const fx = until(s, 31);
    expect(s.lomba!.held).toBe(true);
    expect(fx).toContainEqual(expect.objectContaining({ title: 'No lomba this year' }));
  });

  it('with contests picked, time waits on 17 Agustus until the day is played', () => {
    const s = prepared();
    toggleContest(s, 'makanKerupuk');
    until(s, 31);
    expect(s.lomba!.due).toBe(true);
    const month = s.month;
    s.pendingEvent = null;
    tick(s);
    expect(s.month).toBe(month);
  });

  it('prizes scale with turnout; a clean sweep of two earns the trophy, the crowd and, on the dangdut stage, Inem’s gig', () => {
    const s = prepared();
    s.res.sabar = 60;
    toggleContest(s, 'balapKarung');
    toggleContest(s, 'makanKerupuk');
    setStage(s, 3);
    until(s, 31);
    const fx: Fx = [];
    const viral = s.res.viral;
    const r = finishLomba(s, { balapKarung: true, makanKerupuk: true }, fx);
    expect(r.trophy).toBe(true);
    expect(r.viral).toBeGreaterThan(6);
    expect(s.res.viral).toBeGreaterThan(viral);
    expect(s.pialaUntil).toBe(s.month + LOMBA.trophyMonths);
    expect(s.modifiers.some((m) => m.id === 'lombaCrowd')).toBe(true);
    expect(s.gigs).toContain('agustus');
    expect(s.lomba!.held).toBe(true);
    expect(s.lomba!.due).toBe(false);
  });

  it('a lost day earns nothing, and no trophy', () => {
    const s = prepared();
    toggleContest(s, 'balapKarung');
    toggleContest(s, 'makanKerupuk');
    until(s, 31);
    const r = finishLomba(s, { balapKarung: true, makanKerupuk: false }, []);
    expect(r.trophy).toBe(false);
    const t = finishLomba(s, {}, []);
    expect(t.viral + t.sabar + t.rupiah).toBe(0);
  });
});
