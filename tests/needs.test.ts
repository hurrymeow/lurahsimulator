import { afterEach, describe, expect, it } from 'vitest';
import { setPlayer, t } from '../src/i18n';
import { fed, households, laporan, meters, NEEDS, needsSystem, premanList, premanTake, sejahtera } from '../src/sim/needs';
import { checkRealisasi, realisasiSum, startRealisasi } from '../src/sim/realisasi';
import { announce } from '../src/sim/wacana';
import { addBuilding, newGame } from '../src/sim/state';
import { buildingIncome } from '../src/sim/tick';
import type { Fx } from '../src/sim/gain';

afterEach(() => setPlayer(undefined));

describe('warga needs', () => {
  it('feeds households from the Warung Sembako, and hungry ones cost Popularitas', () => {
    const s = newGame(1);
    expect(fed(s)).toBe(0);
    const before = s.res.sabar;
    needsSystem(s, []);
    expect(s.res.sabar).toBeCloseTo(before - households(s) * NEEDS.hungrySabar);
    addBuilding(s, 'warung', 3, 3, 'active');
    expect(fed(s)).toBe(NEEDS.feeds[0]);
    expect(meters(s).perut).toBe(100);
  });

  it('turns a long-idle resident preman only while Aman is low, and a Satpam post turns him back', () => {
    const s = newGame(2);
    for (let i = 0; i < 40; i++) s.residents.push({ ...s.residents[0], id: 500 + i, job: 'none', idle: 30 });
    expect(meters(s).aman).toBeLessThan(NEEDS.preman.belowAman);
    for (let m = 0; m < 80 && premanList(s).length === 0; m++) {
      s.month++;
      needsSystem(s, []);
    }
    expect(premanList(s).length).toBeGreaterThan(0);
    expect(s.problems).toContain('preman');
    const shop = addBuilding(s, 'warung', 2, 2, 'active');
    expect(premanTake(s, shop)).toBeGreaterThan(0);
    expect(buildingIncome(s, shop)).toBeLessThan(250_000);
    addBuilding(s, 'posSatpam', 4, 4, 'active');
    const fx: Fx = [];
    const had = premanList(s).length;
    needsSystem(s, fx);
    expect(premanList(s).length).toBe(had - 1);
    expect(fx.some((f) => f.kind === 'notice' && /Satpam/.test(f.title))).toBe(true);
  });
});

describe('Wacana or Realisasi', () => {
  it('a program lands after its delay and moves a meter; announcing only fills the Laporan', () => {
    const s = newGame(3);
    s.res.rupiah = 50_000_000;
    const kerja = meters(s).kerja;
    const lap = laporan(s);
    announce(s, 'warung');
    expect(laporan(s)).toBeGreaterThan(lap);
    expect(meters(s).kerja).toBe(kerja);
    expect(startRealisasi(s, 'pelatihanUmkm').ok).toBe(true);
    expect(checkRealisasi(s, 'pelatihanUmkm').ok).toBe(false);
    expect(realisasiSum(s, 'kerja')).toBe(0);
    s.month += 3;
    expect(realisasiSum(s, 'kerja')).toBe(8);
    expect(sejahtera(meters(s))).toBeGreaterThan(0);
  });
});

describe('player names in text', () => {
  it('fills {pt}, {pn} and {pk}, and Inem changes her tone for Bu', () => {
    setPlayer({ title: 'Pak', name: 'Budi', kampung: 'Kampung Melati' });
    expect(t('coach.menu')).toContain('Pak Budi');
    expect(t('coach.menu')).toContain('Kampung Melati');
    expect(t('coach.done')).toMatch(/good at this/);
    setPlayer({ title: 'Bu', name: 'Sari', kampung: 'Kampung Melati' });
    expect(t('coach.menu')).toContain('Bu Sari');
    expect(t('coach.done')).toMatch(/good team/);
  });
});
