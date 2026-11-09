import { describe, expect, it } from 'vitest';
import { PIC } from '../src/data/staff';
import { t } from '../src/i18n';
import { ensureStaff, inem, output, picCandidates, realisasiDelay, wacanaPicMult } from '../src/sim/staff';
import { announce } from '../src/sim/wacana';
import { realisasiSystem, startRealisasi } from '../src/sim/realisasi';
import { newGame } from '../src/sim/state';
import type { GameState, Staff } from '../src/sim/types';

const game = (seed = 1): GameState => {
  const s = newGame(seed);
  ensureStaff(s);
  s.res.rupiah = 100_000_000;
  return s;
};

const hand = (s: GameState, over: Partial<Staff> = {}): Staff => {
  const x: Staff = {
    id: s.nextStaffId!++,
    name: 'Pak Test',
    role: 'penagih',
    stars: 3,
    stats: { rajin: 60, lobi: 40, jujur: 60, gaul: 40 },
    salary: 450_000,
    xp: 0,
    level: 1,
    hiredAt: s.month,
    ...over,
  };
  s.staff!.push(x);
  return x;
};

const gaulPower = (gaul: number): number => {
  const s = game();
  const x = hand(s, { stats: { rajin: 50, lobi: 40, jujur: 60, gaul } });
  announce(s, 'hijau', x.id);
  return s.wacana.find((w) => w.id === 'hijau')!.power;
};

const leakRun = (seed: number, jujur: number): boolean => {
  const s = game(seed);
  const x = hand(s, { stats: { rajin: 60, lobi: 40, jujur, gaul: 40 } });
  startRealisasi(s, 'bansos', x.id);
  s.month = s.realisasi![0].landsAt;
  const fx: Parameters<typeof realisasiSystem>[1] = [];
  realisasiSystem(s, fx);
  return fx.some((e) => e.kind === 'notice' && e.tone === 'bad' && e.body === t('real.leakBody'));
};

describe('a PIC for every program', () => {
  it('gives Gaul 80 1.3 times the wacana power of Gaul 50', () => {
    expect(wacanaPicMult(hand(game(), { stats: { rajin: 50, lobi: 40, jujur: 60, gaul: 80 } }))).toBeCloseTo(1.3);
    expect(gaulPower(80) / gaulPower(50)).toBeCloseTo(1.3);
  });

  it('turns a 3-week delay into 2 at Rajin 80, and 4 at Rajin 20', () => {
    const s = game();
    const fast = hand(s, { stats: { rajin: 80, lobi: 40, jujur: 60, gaul: 40 } });
    const slow = hand(s, { stats: { rajin: 20, lobi: 40, jujur: 60, gaul: 40 } });
    expect(realisasiDelay(3, fast)).toBe(2);
    expect(realisasiDelay(3, slow)).toBe(4);
  });

  it('works a lead at half output until the program lands, then returns to full', () => {
    const s = game();
    const x = hand(s, { role: 'hansip', stats: { rajin: 70, lobi: 40, jujur: 70, gaul: 40 } });
    const before = output(x);
    const rajin = x.stats.rajin;
    expect(startRealisasi(s, 'wifiGratis', x.id).ok).toBe(true);
    expect(x.leading).toBe('wifiGratis');
    expect(output(x)).toBeCloseTo(before * PIC.busyOutput);
    s.month = s.realisasi!.find((r) => r.id === 'wifiGratis')!.landsAt;
    realisasiSystem(s, []);
    expect(x.leading).toBeUndefined();
    expect(output(x)).toBeCloseTo(before * ((rajin + 1) / rajin));
  });

  it('does not offer a busy lead for a second Realisasi', () => {
    const s = game();
    const x = hand(s, { stats: { rajin: 80, lobi: 40, jujur: 60, gaul: 40 } });
    expect(startRealisasi(s, 'wifiGratis', x.id).ok).toBe(true);
    expect(x.leading).toBe('wifiGratis');
    expect(picCandidates(s, 'rajin')).not.toContain(x);
    expect(picCandidates(s, 'gaul')).toContain(x);
  });

  it('always offers Inem, even while she leads', () => {
    const s = game();
    const me = inem(s)!;
    me.leading = 'wifiGratis';
    expect(picCandidates(s, 'rajin')).toContain(me);
    expect(picCandidates(s, 'gaul')).toContain(me);
  });

  it('leaks for a Jujur 10 lead on some seed, and never for Jujur 70', () => {
    const seeds = Array.from({ length: 50 }, (_, i) => i);
    expect(seeds.some((seed) => leakRun(seed, 10))).toBe(true);
    expect(seeds.some((seed) => leakRun(seed, 70))).toBe(false);
  });

  it('raises the lead Rajin by 1 when the program lands', () => {
    const s = game();
    const x = hand(s, { stats: { rajin: 50, lobi: 40, jujur: 70, gaul: 40 } });
    const before = x.stats.rajin;
    expect(startRealisasi(s, 'bansos', x.id).ok).toBe(true);
    s.month = s.realisasi![0].landsAt;
    realisasiSystem(s, []);
    expect(x.stats.rajin).toBe(before + 1);
  });
});
