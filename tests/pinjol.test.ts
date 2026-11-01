import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it } from 'vitest';
import { JUDOL, PINJOL, RAZIA } from '../src/data/higher/kecamatan';
import { collectorAman, debtHouseholds, fed, fedBase, households, judolHouseholds, meters } from '../src/sim/needs';
import { judolIncomeCut, judolShare, judolStartChance, pinjolShare, pinjolSystem } from '../src/sim/pinjol';
import { deserialize } from '../src/sim/save';
import { acceptSK, nextStarChecklist } from '../src/sim/stages';
import { REALISASI } from '../src/data/realisasi';
import { checkRazia, startRazia } from '../src/sim/kec';
import { laporan, raziaAman } from '../src/sim/needs';
import { checkRealisasi, realisasiSum, startRealisasi } from '../src/sim/realisasi';
import { announce, availableWacana, checkAnnounce } from '../src/sim/wacana';
import { openRoles } from '../src/sim/staff';
import { addBuilding } from '../src/sim/state';
import { incomeMult } from '../src/sim/tick';
import { setGrid, type GameState } from '../src/sim/types';

afterEach(() => setGrid('rt'));

const kelSeed = (): GameState => deserialize(readFileSync(new URL('../src/sim/seeds/kel.json', import.meta.url), 'utf8'))!;

/** A Kecamatan game from the Kelurahan seed, with every resident idle so each household can borrow. */
function kec(): GameState {
  const s = kelSeed();
  s.stage.stars.kelurahan = 3;
  s.stage.sk = 'offered';
  acceptSK(s);
  for (const r of s.residents) r.idle = PINJOL.idleWeeks;
  return s;
}

const run = (s: GameState, weeks: number) => {
  for (let i = 0; i < weeks; i++) {
    s.month++;
    pinjolSystem(s, []);
  }
};

describe('pinjol', () => {
  it('spreads among idle households and the meter follows', () => {
    const s = kec();
    expect(pinjolShare(s)).toBe(0);
    run(s, 60);
    expect(debtHouseholds(s)).toBeGreaterThan(0);
    expect(s.kec!.pinjol).toBe(pinjolShare(s));
    expect(pinjolShare(s)).toBeLessThanOrEqual(100);
  });

  it('only lets hungry households borrow when no one is idle', () => {
    const s = kec();
    for (const r of s.residents) r.idle = 0;
    s.res.viral = 0;
    const hungry = Math.max(0, households(s) - fedBase(s));
    run(s, 200);
    expect(debtHouseholds(s)).toBeLessThanOrEqual(hungry);
  });

  it('does not make a household hungry when only one member in three is idle', () => {
    const s = kec();
    s.res.viral = 0;
    // Only whole households: a lone resident left over would be a household of one, and one idle of one is most of it.
    s.residents.length -= s.residents.length % PINJOL.household;
    s.residents.forEach((r, i) => { r.idle = i % PINJOL.household === 0 ? PINJOL.idleWeeks : 0; });
    const hungry = Math.max(0, households(s) - fedBase(s));
    run(s, 200);
    expect(debtHouseholds(s)).toBeLessThanOrEqual(hungry);
  });

  it('counts a household in debt as half unfed', () => {
    const s = kec();
    const before = fed(s);
    const groups = Math.min(before, 4);
    for (let i = 0; i < groups; i++) s.residents[i * PINJOL.household].debt = 0;
    expect(fed(s)).toBeLessThan(before);
    expect(fed(s)).toBe(Math.max(0, Math.floor(before - groups * PINJOL.unfedShare)));
  });

  it('sends the debt collector after 24 weeks and cuts Aman for a while', () => {
    const s = kec();
    s.residents[0].debt = PINJOL.collectAfter - 1;
    const aman = meters(s).aman;
    const fx: Parameters<typeof pinjolSystem>[1] = [];
    s.month++;
    pinjolSystem(s, fx);
    expect(fx.some((e) => e.kind === 'notice' && e.tone === 'bad')).toBe(true);
    expect(collectorAman(s)).toBe(PINJOL.collectorAman);
    expect(meters(s).aman).toBe(Math.max(0, aman - PINJOL.collectorAman));
    s.month += PINJOL.collectorWeeks;
    expect(collectorAman(s)).toBe(0);
  });
});

describe('judol', () => {
  it('starts with Viral: nothing at or under 20, one step per 10 above', () => {
    expect(judolStartChance(20)).toBe(0);
    expect(judolStartChance(29)).toBe(0);
    expect(judolStartChance(30)).toBeCloseTo(0.01);
    expect(judolStartChance(60)).toBeCloseTo(0.04);
  });

  it('spreads at high Viral and not at none', () => {
    const calm = kec();
    calm.res.viral = 0;
    run(calm, 100);
    expect(judolHouseholds(calm)).toBe(0);
    const loud = kec();
    loud.res.viral = 90;
    run(loud, 100);
    expect(judolHouseholds(loud)).toBeGreaterThan(0);
  });

  it('cuts shop income by 30% of the judol share', () => {
    const s = kec();
    const shop = s.buildings.find((b) => b.def === 'warung')!;
    const base = incomeMult(s, shop);
    for (const g of s.residents.filter((_, i) => i % PINJOL.household === 0)) g.judol = true;
    expect(judolShare(s)).toBe(100);
    expect(judolIncomeCut(s)).toBeCloseTo(JUDOL.incomeCut);
    expect(incomeMult(s, shop)).toBeCloseTo(base * (1 - JUDOL.incomeCut));
  });
});

describe('the gate', () => {
  it('runs nothing in a Kelurahan save', () => {
    const s = kelSeed();
    for (const r of s.residents) r.idle = 100;
    s.res.viral = 90;
    const rng = s.rng;
    run(s, 100);
    expect(s.rng).toBe(rng);
    expect(debtHouseholds(s)).toBe(0);
    expect(judolHouseholds(s)).toBe(0);
    expect(judolIncomeCut(s)).toBe(0);
  });

  it('runs nothing in an RT save', () => {
    const s = deserialize(readFileSync(new URL('../src/sim/seeds/rt3.json', import.meta.url), 'utf8'))!;
    for (const r of s.residents) r.idle = 100;
    run(s, 100);
    expect(debtHouseholds(s)).toBe(0);
    expect(s.kec).toBeUndefined();
  });
});

describe('Kecamatan buildings', () => {
  const add = (s: GameState, id: string, x: number) => addBuilding(s, id, x, 0, 'active');

  it('a Pos Satpol PP adds 4 Aman', () => {
    const s = kec();
    s.residents = s.residents.slice(0, 6);
    const before = meters(s).aman;
    add(s, 'posSatpol', 40);
    expect(meters(s).aman).toBe(Math.min(100, before + 4));
  });

  it('a Balai Latihan Kerja restarts one idle warga a week', () => {
    const s = kec();
    add(s, 'balaiLatihanKerja', 40);
    const idle = s.residents.filter((r) => r.job === 'none' && (r.idle ?? 0) > 0).length;
    run(s, 1);
    expect(s.residents.filter((r) => r.job === 'none' && (r.idle ?? 0) > 0).length).toBe(idle - 1);
  });

  it('Koperasi Simpan Pinjam cut new cases and Baliho feed judol', () => {
    const plain = kec();
    const helped = kec();
    add(helped, 'koperasiSP', 40);
    add(helped, 'koperasiSP', 44);
    run(plain, 80);
    run(helped, 80);
    expect(debtHouseholds(helped)).toBeLessThan(debtHouseholds(plain));
    expect(judolStartChance(0, 2)).toBeCloseTo(2 * JUDOL.balihoStart);
  });

  it('opens the Satpol PP post and 5-star applicants in the Kecamatan only', () => {
    const s = kec();
    expect(openRoles(s).map((r) => r.id)).toContain('satpol');
    expect(openRoles(kelSeed()).map((r) => r.id)).not.toContain('satpol');
  });
});

describe('responses', () => {
  const shaky = (): GameState => {
    const s = kec();
    s.res.orangDalam = 5;
    addBuilding(s, 'posSatpol', 40, 0, 'active');
    run(s, 80);
    return s;
  };

  it('a razia lifts Aman, costs Popularitas, and moves half the cases next door', () => {
    const s = shaky();
    s.res.viral = 90;
    run(s, 40);
    const debt = debtHouseholds(s);
    const judol = judolHouseholds(s);
    expect(debt + judol).toBeGreaterThan(2);
    const aman = meters(s).aman;
    const sabar = s.res.sabar;
    const od = s.res.orangDalam;
    const districts = s.kec!.districts.map((d) => d.pinjol);
    expect(startRazia(s, []).ok).toBe(true);
    expect(debtHouseholds(s)).toBe(debt - Math.floor(debt / 2));
    expect(judolHouseholds(s)).toBe(judol - Math.floor(judol / 2));
    expect(s.res.orangDalam).toBe(od - RAZIA.orangDalam);
    expect(s.res.sabar).toBeLessThan(sabar);
    expect(meters(s).aman).toBeGreaterThanOrEqual(aman);
    expect(raziaAman(s)).toBe(RAZIA.aman);
    expect(s.kec!.districts.reduce((n, d) => n + d.pinjol, 0)).toBeGreaterThan(districts.reduce((n, d) => n + d, 0));
    expect(s.kec!.lastRazia).toBe(s.month);
    // One at a time, and it ends.
    expect(checkRazia(s).ok).toBe(false);
    s.month += RAZIA.weeks;
    expect(raziaAman(s)).toBe(0);
  });

  it('a razia needs a working Pos Satpol PP and an Orang Inside', () => {
    const s = kec();
    s.res.orangDalam = 5;
    expect(checkRazia(s).ok).toBe(false);
    addBuilding(s, 'posSatpol', 40, 0, 'active');
    s.res.orangDalam = 0;
    expect(checkRazia(s).ok).toBe(false);
    s.res.orangDalam = 1;
    expect(checkRazia(s).ok).toBe(true);
  });

  it('the 3-star razia line reads the last 48 weeks', () => {
    const s = kec();
    s.res.orangDalam = 5;
    addBuilding(s, 'posSatpol', 40, 0, 'active');
    s.month += 60;
    const line = () => nextStarChecklist({ ...s, stage: { ...s.stage, stars: { ...s.stage.stars, kecamatan: 2 } } })!.find((l) => l.goal.kind === 'noRaziaWeeks')!;
    expect(line().done).toBe(true);
    startRazia(s, []);
    expect(line().done).toBe(false);
    s.month += 48;
    expect(line().done).toBe(true);
  });

  it('Spanduk Anti Judol only moves the Laporan, and only in the Kecamatan', () => {
    const s = kec();
    s.res.rupiah = 1e8;
    const pin = pinjolShare(s);
    const l = laporan(s);
    expect(announce(s, 'judol').ok).toBe(true);
    expect(laporan(s)).toBe(l + 5);
    expect(pinjolShare(s)).toBe(pin);
    expect(availableWacana(kelSeed()).some((w) => w.id === 'judol')).toBe(false);
    expect(checkAnnounce(kelSeed(), 'judol').ok).toBe(false);
  });

  it('Literasi Keuangan lands after 8 weeks and halves new cases for 48', () => {
    const plain = kec();
    const taught = kec();
    taught.res.rupiah = 1e8;
    expect(startRealisasi(taught, 'literasiKeuangan').ok).toBe(true);
    expect(realisasiSum(taught, 'pinjolCut')).toBe(0);
    taught.month += REALISASI.find((r) => r.id === 'literasiKeuangan')!.delay;
    plain.month = taught.month;
    expect(realisasiSum(taught, 'pinjolCut')).toBe(0.5);
    expect(checkRealisasi(kelSeed(), 'literasiKeuangan').ok).toBe(false);
    run(plain, 40);
    run(taught, 40);
    expect(debtHouseholds(taught)).toBeLessThan(debtHouseholds(plain));
    taught.month += 48;
    expect(realisasiSum(taught, 'pinjolCut')).toBe(0);
  });
});
