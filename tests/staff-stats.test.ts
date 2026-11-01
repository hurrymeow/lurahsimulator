import { describe, expect, it } from 'vitest';
import { BIMTEK, COURSE_COST, LEVEL_STAT_GAIN, RISK, ROLES, STAFF_LEVEL_MONTHS, STATS } from '../src/data/staff';
import { eventDef } from '../src/data/events';
import { resolveEvent, sendCandidates, sendChance } from '../src/sim/events';
import { bimtek, bimtekCost, ensureStaff, grupWaShift, mishapChance, roleGain, staffSystem } from '../src/sim/staff';
import { newGame } from '../src/sim/state';
import type { GameState, Staff } from '../src/sim/types';

const game = (seed = 1): GameState => {
  const s = newGame(seed);
  ensureStaff(s);
  s.res.rupiah = 1e9;
  return s;
};

const hire = (s: GameState, over: Partial<Staff> = {}): Staff => {
  const x: Staff = { id: s.nextStaffId!++, name: 'Bu Sri', role: 'penagih', stars: 2, stats: { rajin: 50, lobi: 50, jujur: 50, gaul: 50 }, salary: 300_000, xp: 0, level: 1, hiredAt: 0, ...over };
  s.staff!.push(x);
  return x;
};

describe('two stats per role', () => {
  it('every role has a work stat and a different risk stat', () => {
    for (const r of ROLES) expect(r.risk, r.id).not.toBe(r.stat);
  });

  it('each stat is the work stat of two roles and the risk stat of two', () => {
    const roles = ROLES.filter((r) => r.opens.stage !== 'kecamatan');
    for (const stat of STATS) {
      expect(roles.filter((r) => r.stat === stat).length, stat).toBe(2);
      expect(roles.filter((r) => r.risk === stat).length, stat).toBe(2);
    }
  });

  it('a low risk stat brings mishaps that name the person and the stat; a safe one never does', () => {
    expect(mishapChance({ role: 'penagih', stats: { rajin: 50, lobi: 50, jujur: RISK.safeFrom, gaul: 50 } })).toBe(0);
    expect(mishapChance({ role: 'penagih', stats: { rajin: 50, lobi: 50, jujur: 30, gaul: 50 } })).toBeCloseTo(RISK.base / 2, 5);
    const s = game(3);
    const crook = hire(s, { stats: { rajin: 50, lobi: 50, jujur: 0, gaul: 50 } });
    const titles: string[] = [];
    for (let w = 0; w < 120; w++) {
      s.month = w;
      const fx: Parameters<typeof staffSystem>[1] = [];
      staffSystem(s, fx);
      for (const f of fx) if (f.kind === 'notice' && f.title.startsWith(crook.name)) titles.push(f.title);
    }
    expect(titles.length).toBeGreaterThan(3);
    expect(titles[0]).toContain('Jujur 0');
  });

  it('says what one person adds in their role, in its own unit', () => {
    const s = game();
    // Inem at level 1 clears about one folder a week.
    expect(roleGain(s.staff![0])).toBeCloseTo(1.02, 2);
    expect(roleGain({ role: 'hansip', stats: { rajin: 100, lobi: 0, jujur: 0, gaul: 0 } })).toBeGreaterThan(roleGain({ role: 'hansip', stats: { rajin: 50, lobi: 0, jujur: 0, gaul: 0 } }));
  });
});

describe('training and growth', () => {
  it('Bimtek picks the stat, and the anti-corruption course costs the most', () => {
    const s = game();
    const x = hire(s);
    expect(bimtekCost(s, 'jujur')).toBe(Math.round(bimtekCost(s, 'gaul') * COURSE_COST.jujur));
    expect(bimtek(s, x, 'gaul')).toBe(true);
    expect(x.stats.gaul).toBe(50 + BIMTEK.gain);
    expect(x.stats.rajin).toBe(50);
  });

  it('a level-up raises the role\'s work stat', () => {
    const s = game();
    const x = hire(s, { xp: STAFF_LEVEL_MONTHS[1] - 1 });
    staffSystem(s, []);
    expect(x.level).toBe(2);
    expect(x.stats.gaul).toBe(50 + LEVEL_STAT_GAIN);
  });
});

describe('who do you send?', () => {
  it('offers the best three for the stat, with odds that rise with it, and names who went', () => {
    const s = game(5);
    s.buildings[0].status = 'permit';
    s.buildings[0].timer = 6;
    const smooth = hire(s, { name: 'Pak Lobi', role: 'asisten', stats: { rajin: 50, lobi: 95, jujur: 60, gaul: 50 } });
    hire(s, { name: 'Pak Kaku', role: 'asisten', stats: { rajin: 50, lobi: 10, jujur: 60, gaul: 50 } });
    const e = eventDef('telponKecamatan')!;
    const c = e.choices[1];
    const list = sendCandidates(s, c);
    expect(list[0].id).toBe(smooth.id);
    expect(list.length).toBeLessThanOrEqual(3);
    expect(sendChance(c, list[0])).toBeGreaterThan(sendChance(c, list[list.length - 1]));
    s.pendingEvent = e.id;
    const out = resolveEvent(s, [], 1, smooth.id);
    expect(out.ok).toBe(true);
    expect(out.text.startsWith('Pak Lobi (Lobi')).toBe(true);
  });

  it('a Grup WA posting goes out through the Admin Grup WA, whose Gaul shifts the odds', () => {
    const s = game();
    expect(grupWaShift(s)).toBeNull();
    hire(s, { role: 'adminWa', stats: { rajin: 50, lobi: 50, jujur: 50, gaul: 90 } });
    expect(grupWaShift(s)!.pts).toBe(16);
  });
});
