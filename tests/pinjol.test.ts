import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it } from 'vitest';
import { JUDOL, PINJOL } from '../src/data/higher/kecamatan';
import { collectorAman, debtHouseholds, fed, fedBase, households, judolHouseholds, meters } from '../src/sim/needs';
import { judolIncomeCut, judolShare, judolStartChance, pinjolShare, pinjolSystem } from '../src/sim/pinjol';
import { deserialize } from '../src/sim/save';
import { acceptSK } from '../src/sim/stages';
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
