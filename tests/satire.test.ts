import { afterEach, describe, expect, it } from 'vitest';
import { BUILDINGS } from '../src/data/buildings';
import { activeCombos } from '../src/sim/combos';
import { def } from '../src/sim/content';
import { assign, checkAssign, slots } from '../src/sim/jobs';
import { checkRestart, checkRestartODn, RESTART_ODN, restart, restartCost } from '../src/sim/projects';
import { checkDemolish, checkUpgrade, upgrade } from '../src/sim/rules';
import { addBuilding, addResident, byUid, count, emptyTiles, newGame } from '../src/sim/state';
import { checkTertibkan, parkirSystem, spawnParkir, tertibkan } from '../src/sim/parkir';
import { PARKIR } from '../src/sim/balance';
import { ensureStaff } from '../src/sim/staff';
import type { Fx } from '../src/sim/gain';
import { tick } from '../src/sim/tick';
import { announce } from '../src/sim/wacana';
import type { GameState } from '../src/sim/types';

const run = (s: GameState, n: number) => {
  const fx = [];
  for (let i = 0; i < n; i++) {
    fx.push(...tick(s));
    s.pendingEvent = null;
  }
  return fx;
};
const add = (s: GameState, id: string, x: number, y: number) => addBuilding(s, id, x, y, 'active');
/** Keep Sabar healthy so residents do not leave mid-test. */
const calm = (s: GameState) => {
  s.res.sabar = 80;
};

describe('combos', () => {
  it('finds Tongkrongan in a row and logs it once with fanfare', () => {
    const s = newGame(1);
    add(s, 'warung', 0, 0);
    add(s, 'posRonda', 1, 0);
    add(s, 'wifi', 2, 0);
    expect(activeCombos(s).map((a) => a.combo.id)).toContain('tongkrongan');
    const fx = tick(s);
    expect(s.discovered).toContain('tongkrongan');
    expect(fx.some((f) => f.kind === 'notice' && f.fanfare && f.title.includes('Tongkrongan'))).toBe(true);
    const again = tick(s);
    expect(again.some((f) => f.kind === 'notice' && f.fanfare && f.title.includes('Tongkrongan'))).toBe(false);
  });

  it('does not fire when buildings are too far apart', () => {
    const s = newGame(2);
    add(s, 'warung', 0, 0);
    add(s, 'posRonda', 4, 4);
    add(s, 'wifi', 8, 8);
    expect(activeCombos(s).some((a) => a.combo.id === 'tongkrongan')).toBe(false);
  });

  it('boosts warung income x1.5 and gives Sabar and Viral', () => {
    const base = newGame(3);
    const combo = newGame(3);
    for (const s of [base, combo]) {
      add(s, 'warung', 0, 0);
      add(s, 'posRonda', 5, 5);
      add(s, 'wifi', 7, 9);
    }
    combo.buildings.find((b) => b.def === 'posRonda')!.x = 1;
    combo.buildings.find((b) => b.def === 'posRonda')!.y = 0;
    combo.buildings.find((b) => b.def === 'wifi')!.x = 2;
    combo.buildings.find((b) => b.def === 'wifi')!.y = 0;
    const a = base.res.rupiah;
    const b = combo.res.rupiah;
    tick(base);
    tick(combo);
    expect(combo.res.rupiah - b).toBeGreaterThan(base.res.rupiah - a);
    expect(combo.res.viral).toBeGreaterThan(base.res.viral);
  });

  it('Rivalitas Abadi earns more and drains Sabar', () => {
    const s = newGame(4);
    add(s, 'indomaret', 0, 0);
    add(s, 'alfamart', 1, 0);
    const sabar = s.res.sabar;
    tick(s);
    expect(s.discovered).toContain('rivalitas');
    expect(s.res.sabar).toBeLessThan(sabar);
  });
});

describe('tukang parkir liar', () => {
  it('appears next to a new shop, cannot be removed, can be upgraded', () => {
    const s = newGame(5);
    const shop = addBuilding(s, 'warung', 0, 0, 'building');
    shop.timer = 1;
    const fx = tick(s);
    expect(count(s, 'parkir')).toBe(1);
    const p = s.buildings.find((b) => b.def === 'parkir')!;
    expect(Math.abs(p.x - shop.x)).toBeLessThanOrEqual(1);
    expect(p.owner).toBe(shop.uid);
    expect(fx.some((f) => f.kind === 'notice' && f.title.includes('tukang parkir'))).toBe(true);
    expect(checkDemolish(s, p).ok).toBe(false);
    s.res.rupiah = 5_000_000;
    expect(upgrade(s, p).ok).toBe(true);
    expect(p.level).toBe(2);
    expect(checkUpgrade(s, p).ok).toBe(true);
  });

  it('after the first, only some shops draw one; never past the cap or beside the Kantor', () => {
    let drawn = 0;
    for (let seed = 1; seed <= 20; seed++) {
      const s = newGame(seed);
      s.parkirSeen = true;
      const spot = emptyTiles(s).find((t) => !s.buildings.some((k) => k.def === 'kantorRT' && Math.abs(k.x - t.x) <= 2 && Math.abs(k.y - t.y) <= 2))!;
      const shop = addBuilding(s, 'warung', spot.x, spot.y, 'building');
      shop.timer = 1;
      tick(s);
      drawn += count(s, 'parkir');
    }
    expect(drawn).toBeGreaterThan(0);
    expect(drawn).toBeLessThan(12);
    const s = newGame(3);
    const fx: Fx = [];
    const shop = s.buildings.find((b) => b.def === 'kantorRT')!;
    for (let i = 0; i < 10; i++) spawnParkir(s, fx, shop, true);
    expect(count(s, 'parkir')).toBe(PARKIR.cap);
    for (const p of s.buildings.filter((b) => b.def === 'parkir')) expect(Math.abs(p.x - shop.x) > 1 || Math.abs(p.y - shop.y) > 1).toBe(true);
  });

  it('can be tertibkan by a Hansip for free or for Orang Dalam, and may come back', () => {
    const s = newGame(5);
    const shop = addBuilding(s, 'warung', 0, 0, 'active');
    const p = spawnParkir(s, [], shop, true)!;
    s.res.orangDalam = 0;
    expect(checkTertibkan(s, p).ok).toBe(false);
    s.res.orangDalam = PARKIR.orangDalam;
    expect(tertibkan(s, p)).toBe(true);
    expect(s.res.orangDalam).toBe(0);
    expect(count(s, 'parkir')).toBe(0);
    // With a Hansip on duty it costs nothing.
    ensureStaff(s);
    s.staff!.push({ id: 99, name: 'Pak Hansip', role: 'hansip', stars: 2, stats: { rajin: 50, lobi: 30, jujur: 50, gaul: 30 }, salary: 300_000, xp: 0, level: 1, hiredAt: 0 });
    const q = spawnParkir(s, [], shop, true)!;
    expect(tertibkan(s, q)).toBe(true);
    expect(s.res.orangDalam).toBe(0);
    // A comeback is due: he returns beside the same shop.
    s.parkirBack = [{ shop: shop.uid, at: s.month + 1 }];
    s.month++;
    const fx: Fx = [];
    parkirSystem(s, fx);
    expect(count(s, 'parkir')).toBe(1);
    expect(s.parkirBack).toHaveLength(0);
  });

  it('spawns one per shop, not for non-shops', () => {
    const s = newGame(6);
    for (const id of ['biopori', 'posRonda']) addBuilding(s, id, 0, id === 'biopori' ? 0 : 1, 'building').timer = 1;
    run(s, 1);
    expect(count(s, 'parkir')).toBe(0);
  });
});

describe('jobs', () => {
  it('has no slots until the building exists and says what is missing', () => {
    const s = newGame(7);
    const r = s.residents[0];
    expect(slots(s, 'ojol')).toBe(0);
    const c = checkAssign(s, r, 'ojol');
    expect(c.ok).toBe(false);
    if (!c.ok) expect(c.missing[0]).toBe('No Ojol slots. Needs a working Wifi Tower or Bengkel Motor');
    add(s, 'wifi', 0, 0);
    expect(slots(s, 'ojol')).toBe(3);
    expect(assign(s, r, 'ojol').ok).toBe(true);
  });

  it('caps slots', () => {
    const s = newGame(8);
    for (let i = 0; i < 4; i++) addResident(s);
    add(s, 'wifi', 0, 0);
    const rs = s.residents.slice(0, 4);
    rs.slice(0, 3).forEach((r) => assign(s, r, 'ojol'));
    expect(assign(s, rs[3], 'ojol').ok).toBe(false);
  });

  it('ojol pay komisi and cost Sabar', () => {
    const s = newGame(9);
    add(s, 'wifi', 0, 0);
    for (const r of s.residents) r.manual = true;
    assign(s, s.residents[0], 'ojol');
    const without = newGame(9);
    for (const r of without.residents) r.manual = true;
    add(without, 'wifi', 0, 0);
    tick(s);
    tick(without);
    expect(s.res.rupiah).toBeGreaterThan(without.res.rupiah);
  });

  it('PNS only fill Pensiun, then retire and cost a payout', () => {
    const s = newGame(10);
    const r = s.residents[0];
    assign(s, r, 'pns');
    calm(s);
    r.pensiun = 99.5;
    const before = s.res.rupiah;
    const fx = tick(s);
    expect(r.job).toBe('none');
    expect(fx.some((f) => f.kind === 'notice' && f.title.includes('pensiun'))).toBe(true);
    expect(s.res.rupiah).toBeLessThan(before);
  });

  it('influencers make Viral', () => {
    const s = newGame(11);
    add(s, 'wifi', 0, 0);
    assign(s, s.residents[0], 'influencer');
    tick(s);
    expect(s.res.viral).toBeGreaterThan(2);
  });

  it('buzzers make fake Viral that collapses', () => {
    const s = newGame(12);
    add(s, 'wifi', 0, 0);
    const r = s.residents[0];
    assign(s, r, 'buzzer');
    let exposed = false;
    for (let i = 0; i < 40 && !exposed; i++) {
      calm(s);
      exposed = run(s, 1).some((f) => f.kind === 'notice' && f.title.includes('exposed'));
    }
    expect(exposed).toBe(true);
    expect(r.job).toBe('none');
    expect(r.fake).toBe(0);
  });
});

describe('wacana', () => {
  it('raises Sabar briefly, decays, and builds nothing', () => {
    const s = newGame(13);
    const built = () => s.buildings.filter((b) => b.def !== 'rumah').length;
    const buildings = built();
    expect(announce(s, 'digital').ok).toBe(true);
    s.res.sabar = 40;
    tick(s);
    const afterOne = s.res.sabar;
    expect(afterOne).toBeGreaterThan(40);
    run(s, 25);
    expect(s.wacana[0].power).toBe(0);
    expect(built()).toBe(buildings);
  });

  it('re-announcing restores power and says what is missing when broke', () => {
    const s = newGame(14);
    announce(s, 'gotong');
    run(s, 6);
    const weak = s.wacana[0].power;
    announce(s, 'gotong');
    expect(s.wacana[0].power).toBeGreaterThan(weak);
    s.res.rupiah = 0;
    const r = announce(s, 'gotong');
    expect(r.ok).toBe(false);
  });
});

describe('proyek mangkrak', () => {
  const chanceOf = def('wifi');
  afterEach(() => {
    chanceOf.mangkrakChance = 0.25;
  });

  const freeze = (s: GameState) => {
    chanceOf.mangkrakChance = 1;
    const b = addBuilding(s, 'wifi', 0, 0, 'building');
    b.timer = 1;
    b.invested = 3_500_000;
    tick(s);
    return b;
  };

  it('never freezes in year 1', () => {
    const s = newGame(15);
    expect(freeze(s).status).toBe('active');
  });

  it('freezes at 80 percent later and costs Sabar', () => {
    const s = newGame(16);
    s.month = 12;
    const b = freeze(s);
    expect(b.status).toBe('mangkrak');
    calm(s);
    const sabar = s.res.sabar;
    tick(s);
    expect(s.res.sabar).toBeLessThan(sabar + 1);
  });

  it('restart costs double, or normal price at 30 Viral, and never freezes twice', () => {
    const s = newGame(17);
    s.month = 12;
    const b = freeze(s);
    const normal = def('wifi').cost * s.inflation;
    expect(restartCost(s, b)).toBeGreaterThanOrEqual(normal * 1.9);
    s.res.viral = 0;
    s.res.rupiah = 100_000;
    expect(checkRestart(s, b).ok).toBe(false);
    s.res.rupiah = 20_000_000;
    s.res.viral = 40;
    const cheap = restartCost(s, b);
    expect(cheap).toBeLessThan(normal * 1.1);
    expect(restart(s, b).ok).toBe(true);
    chanceOf.mangkrakChance = 1;
    s.pendingEvent = null;
    tick(s);
    expect(byUid(s, b.uid)!.status).toBe('active');
  });

  it('restarts a frozen project for Orang Inside instead of money', () => {
    const s = newGame(17);
    s.month = 12;
    const b = freeze(s);
    s.res.orangDalam = 1;
    expect(checkRestartODn(s, b).ok).toBe(false);
    s.res.orangDalam = RESTART_ODN;
    const cash = s.res.rupiah;
    expect(restart(s, b, true).ok).toBe(true);
    expect(s.res.orangDalam).toBe(0);
    expect(s.res.rupiah).toBe(cash);
    expect(byUid(s, b.uid)!.status).toBe('building');
  });
});

describe('content rules', () => {
  it('every building moves at least one number', () => {
    for (const b of BUILDINGS) {
      const moves = b.income || b.upkeep || b.perMonth || b.attract || b.housing || b.jobSlots || b.pathIncome || b.boost;
      expect(Boolean(moves), b.id).toBe(true);
    }
  });
});
