import { describe, expect, it } from 'vitest';
import { BRANDS, FRANCHISE, KANIBAL, RENAMABLE } from '../src/data/brands';
import { BUILDINGS } from '../src/data/buildings';
import { activeCombos } from '../src/sim/combos';
import { brandMult, brandOf, displayName, kanibal, nextBrand, rename, sisterOutlets } from '../src/sim/brands';
import { problemSystem, JOBLESS_MONTHS } from '../src/sim/problems';
import { checkPlace } from '../src/sim/rules';
import { addBuilding, newGame } from '../src/sim/state';
import { buildingIncome, checkUnlocks } from '../src/sim/tick';
import type { Fx } from '../src/sim/gain';

describe('brands', () => {
  it('gives chains a brand from their list, and keeps it stable', () => {
    const s = newGame(1);
    const w = addBuilding(s, 'rumahMakan', 5, 5, 'active');
    const b = brandOf(w)!;
    expect(BRANDS.rumahMakan.names).toContain(b);
    expect(brandOf(w)).toBe(b);
    expect(displayName(w)).toBe(b);
    expect(brandOf(addBuilding(s, 'warung', 6, 5, 'active'))).toBeNull();
  });

  it('names non-chains locally, and a rename never changes the brand', () => {
    const s = newGame(1);
    const warung = addBuilding(s, 'warung', 5, 5, 'active');
    expect(displayName(warung)).toMatch(/^Warung (Bu|Pak|Mbak) /);
    const rm = addBuilding(s, 'rumahMakan', 6, 5, 'active');
    const brand = brandOf(rm);
    expect(rename(rm, '  Warung   Kenangan  ')).toBe('Warung Kenangan');
    expect(brandOf(rm)).toBe(brand);
    expect(rename(rm, '')).toBe(brand);
  });

  it('lifts franchise outlets of one brand, up to the cap', () => {
    const s = newGame(1);
    const outlets = [0, 1, 2, 3, 4].map((i) => addBuilding(s, 'rumahMakan', 2 + i * 2, 2, 'active'));
    for (const o of outlets) o.brand = 'Sadarhina';
    expect(sisterOutlets(s, outlets[0])).toBe(4);
    expect(brandMult(s, outlets[0])).toBeCloseTo(1 + FRANCHISE.max);
    outlets[1].brand = 'Mie Gacor';
    expect(sisterOutlets(s, outlets[1])).toBe(0);
    expect(brandMult(s, outlets[1])).toBe(1);
  });

  it('makes two of the same minimarket close together eat each other', () => {
    const s = newGame(1);
    const a = addBuilding(s, 'indomaret', 3, 3, 'active');
    const solo = buildingIncome(s, a);
    addBuilding(s, 'indomaret', 3 + KANIBAL.radius, 3, 'active');
    expect(kanibal(s, a)).toBe(true);
    expect(buildingIncome(s, a)).toBe(Math.round(solo * KANIBAL.mult));
  });

  it('starts a price war between two wifi providers, never one provider twice', () => {
    const s = newGame(1);
    const a = addBuilding(s, 'wifi', 4, 4, 'active');
    const b = addBuilding(s, 'wifi', 5, 4, 'active');
    a.brand = 'Telkomkesel';
    b.brand = 'Telkomkesel';
    expect(activeCombos(s).some((c) => c.combo.id === 'perangKuota')).toBe(false);
    nextBrand(b);
    expect(brandOf(b)).not.toBe('Telkomkesel');
    expect(activeCombos(s).some((c) => c.combo.id === 'perangKuota')).toBe(true);
  });
});

describe('problem unlocks', () => {
  it('opens the Selokan only after a banjir, and says why', () => {
    const s = newGame(2);
    s.month = 10;
    expect(checkPlace(s, 'biopori', 0, 0).ok).toBe(false);
    s.problems = ['banjir'];
    const fx: Fx = [];
    checkUnlocks(s, fx);
    expect(s.unlocked).toContain('biopori');
    expect(fx.some((f) => f.kind === 'notice' && /banjir/i.test(f.body))).toBe(true);
  });

  it('counts jobless only after residents sit idle for half a year', () => {
    const s = newGame(3);
    for (const r of s.residents) r.job = 'none';
    for (let m = 1; m < JOBLESS_MONTHS; m++) problemSystem(s);
    expect(s.problems).not.toContain('jobless');
    problemSystem(s);
    expect(s.problems).toContain('jobless');
  });

  it('opens a third of the old menu by the first star', () => {
    const s = newGame(4);
    s.month = 2;
    checkUnlocks(s, []);
    const start = s.unlocked.length;
    s.stage.stars.rt = 1;
    checkUnlocks(s, []);
    expect(start).toBeLessThanOrEqual(7);
    expect(s.unlocked.length).toBeLessThanOrEqual(16);
  });
});

describe('renaming', () => {
  it('lists only shops and building-like facilities, each a real building', () => {
    const ids = new Set(BUILDINGS.map((d) => d.id));
    for (const id of RENAMABLE) expect(ids.has(id), id).toBe(true);
    for (const id of ['posSatpam', 'lapangan', 'kolamLele', 'portal', 'bankSampah', 'parkir', 'gudangMaterial']) {
      expect(RENAMABLE.has(id), id).toBe(false);
    }
    for (const id of ['warung', 'rumahMakan', 'apotek', 'bengkel', 'barbershop', 'kosan', 'paud', 'balaiWarga']) {
      expect(RENAMABLE.has(id), id).toBe(true);
    }
  });
});
