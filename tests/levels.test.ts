import { describe, expect, it } from 'vitest';
import { LEVEL_MONTHS, MAX_LEVEL, levelFor, levelMult } from '../src/data/jobs';
import { assign, jobsSystem, levelOf } from '../src/sim/jobs';
import { addBuilding, addResident, newGame } from '../src/sim/state';
import type { SimEffect } from '../src/sim/types';

const setup = (job: 'ojol' | 'influencer' | 'pns' | 'buzzer', xp: number) => {
  const s = newGame(1);
  addBuilding(s, 'kantorRT', 0, 0, 'active');
  addBuilding(s, 'wifi', 1, 0, 'active');
  const r = addResident(s);
  r.manual = true;
  r.job = job;
  r.xp = xp;
  return { s, r };
};
const month = (s: ReturnType<typeof newGame>) => {
  const fx: SimEffect[] = [];
  const before = { ...s.res };
  jobsSystem(s, fx);
  return { fx, d: (k: keyof typeof before) => s.res[k] - before[k] };
};

describe('resident levels', () => {
  it('maps months worked to levels and caps at the top', () => {
    expect(levelFor(0)).toBe(1);
    expect(levelFor(LEVEL_MONTHS[1])).toBe(2);
    expect(levelFor(LEVEL_MONTHS[1] - 1)).toBe(1);
    expect(levelFor(9999)).toBe(MAX_LEVEL);
  });

  it('gains one xp per employed month and none when unemployed', () => {
    const { s, r } = setup('ojol', 0);
    const idle = addResident(s);
    idle.manual = true;
    month(s);
    expect(r.xp).toBe(1);
    expect(idle.xp ?? 0).toBe(0);
  });

  it('pops a level-up once at the threshold', () => {
    const { s, r } = setup('influencer', LEVEL_MONTHS[1] - 1);
    const { fx } = month(s);
    expect(levelOf(r)).toBe(2);
    expect(fx.filter((f) => f.kind === 'level')).toHaveLength(1);
    expect(month(s).fx.some((f) => f.kind === 'level')).toBe(false);
  });

  it('keeps xp when the job changes', () => {
    const { s, r } = setup('ojol', 20);
    assign(s, r, 'none', true);
    expect(r.xp).toBe(20);
  });

  it('raises ojol income and influencer viral with level but not sabar cost', () => {
    const lo = setup('ojol', 0);
    const hi = setup('ojol', 100);
    const a = month(lo.s);
    const b = month(hi.s);
    expect(b.d('rupiah')).toBeGreaterThan(a.d('rupiah'));
    expect(b.d('sabar')).toBeCloseTo(a.d('sabar'));
    const il = setup('influencer', 0);
    const ih = setup('influencer', 100);
    expect(month(ih.s).d('viral')).toBeGreaterThan(month(il.s).d('viral'));
  });

  it('pays higher golongan PNS a bigger pension', () => {
    const payout = (xp: number) => {
      const { s, r } = setup('pns', xp);
      r.pensiun = 99.99;
      return -month(s).d('rupiah');
    };
    expect(payout(100)).toBeGreaterThan(payout(0));
    expect(levelMult(0.3, 1)).toBe(1);
  });

  it('makes high-level buzzers pump fake Viral faster', () => {
    const lo = setup('buzzer', 0);
    const hi = setup('buzzer', 100);
    lo.s.rng = hi.s.rng = 1;
    month(lo.s);
    month(hi.s);
    if (lo.r.job === 'buzzer' && hi.r.job === 'buzzer') expect(hi.r.fake).toBeGreaterThan(lo.r.fake);
  });

  it('treats old saves without xp as level 1', () => {
    const { r } = setup('ojol', 0);
    delete r.xp;
    expect(levelOf(r)).toBe(1);
  });
});
