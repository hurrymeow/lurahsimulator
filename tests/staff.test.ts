import { describe, expect, it } from 'vitest';
import { SLOTS, STAFF_CAP, STAR_TOTAL } from '../src/data/staff';
import {
  answerRaise, bimtek, cancelLowongan, checkFire, checkPost, ensureStaff, fire, hire, inem, iuranBonus, mutasi, postLowongan, rollApplicants, staffSlots, staffSystem, traitFrom,
} from '../src/sim/staff';
import { deserialize, serialize } from '../src/sim/save';
import { newGame } from '../src/sim/state';
import type { GameState, Staff } from '../src/sim/types';

const game = (seed = 1): GameState => {
  const s = newGame(seed);
  ensureStaff(s);
  s.res.rupiah = 100_000_000;
  return s;
};

const hand = (s: GameState, over: Partial<Staff> = {}): Staff => {
  const x: Staff = { id: s.nextStaffId!++, name: 'Pak Test', role: 'penagih', stars: 3, stats: { rajin: 60, lobi: 40, jujur: 60, gaul: 40 }, salary: 450_000, xp: 0, level: 1, hiredAt: s.month, ...over };
  s.staff!.push(x);
  return x;
};

describe('staff', () => {
  it('starts with Inem, who cannot be let go, and grows to a cap of 10', () => {
    const s = game();
    expect(s.staff!.map((x) => x.name)).toEqual(['Inem']);
    expect(checkFire(s, inem(s)!).ok).toBe(false);
    expect(staffSlots(s)).toBe(1);
    s.stage.stars.rt = 1;
    expect(staffSlots(s)).toBe(3);
    expect(Math.max(...SLOTS.map((r) => r.slots))).toBeLessThanOrEqual(STAFF_CAP);
  });

  it('posts a lowongan, brings 3 to 5 applicants after the wait, and hires one', () => {
    const s = game(4);
    expect(checkPost(s, 'hansip', 'online').ok).toBe(false);
    s.stage.stars.rt = 1;
    expect(postLowongan(s, 'hansip', 'online').ok).toBe(true);
    expect(checkPost(s, 'penagih', 'online').ok).toBe(false);
    s.month = s.lowongan!.arriveAt;
    staffSystem(s, []);
    const apps = s.lowongan!.applicants;
    expect(apps.length).toBeGreaterThanOrEqual(3);
    expect(apps.length).toBeLessThanOrEqual(5);
    for (const a of apps) expect(a.stars).toBeLessThanOrEqual(4);
    const x = hire(s, apps[0].id)!;
    expect(x.role).toBe('hansip');
    expect(s.lowongan).toBeNull();
  });

  it('brings applicants as a card that opens Staff, and keeps them until the player hires or cancels', () => {
    const s = game(4);
    s.stage.stars.rt = 1;
    postLowongan(s, 'hansip', 'online');
    s.month = s.lowongan!.arriveAt;
    const fx: Parameters<typeof staffSystem>[1] = [];
    staffSystem(s, fx);
    const n = s.lowongan!.applicants.length;
    expect(fx).toContainEqual(expect.objectContaining({ kind: 'notice', card: true, open: 'staff' }));
    for (let i = 0; i < 24; i++) {
      s.month++;
      staffSystem(s, []);
    }
    expect(s.lowongan!.applicants).toHaveLength(n);
    cancelLowongan(s);
    expect(s.lowongan).toBeNull();
  });

  it('fills the Grup WA posting from the longest-idle warga, who then count as in work', () => {
    const s = game(5);
    s.stage.stars.rt = 1;
    s.residents.forEach((r, i) => { r.job = 'none'; r.idle = 10 + i; });
    postLowongan(s, 'penagih', 'grupWa');
    s.month = s.lowongan!.arriveAt;
    s.lowongan!.applicants = rollApplicants(s);
    const longest = [...s.residents].sort((a, b) => (b.idle ?? 0) - (a.idle ?? 0))[0];
    expect(s.lowongan!.applicants[0].fromResident).toBe(longest.id);
    hire(s, s.lowongan!.applicants[0].id);
    expect(longest.staffId).toBeDefined();
  });

  it('stars set the stat total, and a Tukang Tagih brings in more iuran', () => {
    const s = game(6);
    expect(iuranBonus(s)).toBe(0);
    hand(s, { stats: { rajin: 80, lobi: 40, jujur: 60, gaul: 40 }, level: 3 });
    expect(iuranBonus(s)).toBeGreaterThan(0);
    s.stage.stars.rt = 1;
    postLowongan(s, 'hansip', 'online');
    s.month = s.lowongan!.arriveAt;
    for (const a of rollApplicants(s)) {
      const sum = a.stats.rajin + a.stats.lobi + a.stats.jujur + a.stats.gaul;
      if (!a.trait && !a.special) expect(Math.abs(sum - STAR_TOTAL[a.stars])).toBeLessThanOrEqual(4);
    }
  });

  it('asks for a raise at a level up; a refused Baperan walks out', () => {
    const s = game(7);
    const x = hand(s, { trait: 'baperan' });
    for (let m = 0; m < 6; m++) { s.month++; staffSystem(s, []); }
    expect(x.level).toBe(2);
    expect(x.raiseAsked).toBe(true);
    answerRaise(s, x, false);
    expect(s.staff!.includes(x)).toBe(false);
  });

  it('Bimtek raises the role stat and sends them away a month; firing pays pesangon', () => {
    const s = game(8);
    const x = hand(s);
    const before = x.stats.rajin;
    expect(bimtek(s, x)).toBe(true);
    expect(x.stats.rajin).toBe(before + 5);
    expect(x.away).toBe(1);
    const cash = s.res.rupiah;
    expect(fire(s, x)).toBe(true);
    expect(s.res.rupiah).toBeLessThan(cash);
  });

  it('mutasi makes a trained staff member Ketua RT of a neighbour, with their habit', () => {
    const s = game(9);
    s.neighbours.push({ cx: 1, cy: 0, trait: 'jarang', buildings: [], pop: 2, stars: 0, funded: 0, everFunded: false, lastBuild: 0, turns: 0, discovered: [], ranking: [] });
    const x = hand(s, { level: 3, stats: { rajin: 80, lobi: 40, jujur: 60, gaul: 40 } });
    expect(traitFrom(x)).toBe('rajin');
    expect(mutasi(s, x, 0)).toBe('rajin');
    expect(s.neighbours[0].trait).toBe('rajin');
    expect(s.staff!.includes(x)).toBe(false);
  });

  it('survives a save and load, and old saves get Inem', () => {
    const s = game(10);
    hand(s);
    const back = deserialize(serialize(s))!;
    expect(back.staff!.length).toBe(2);
    const old = JSON.parse(serialize(newGame(11)));
    delete old.staff;
    expect(deserialize(JSON.stringify(old))!.staff![0].inem).toBe(true);
  });

  it("Inem's first gig plays in August with a Lapangan and Popularitas 50", () => {
    const s = game(12);
    s.buildings.push({ uid: 9999, def: 'lapangan', x: 1, y: 1, level: 1, status: 'active', timer: 0, invested: 0, placedAt: 0 });
    s.res.sabar = 60;
    s.month = 7;
    staffSystem(s, []);
    expect(s.gigs).toContain('agustus');
    expect(inem(s)!.level).toBe(2);
  });
});
