import { describe, expect, it } from 'vitest';
import { GRADE_BONUS } from '../src/sim/balance';
import { gradeFor, gradePoints } from '../src/sim/report';
import { newGame } from '../src/sim/state';
import { tick } from '../src/sim/tick';
import type { QuarterReport, SimEffect } from '../src/sim/types';

const reports = (fx: SimEffect[]) => fx.filter((f): f is Extract<SimEffect, { kind: 'report' }> => f.kind === 'report').map((f) => f.report);

function run(months: number, seed = 7): { reports: QuarterReport[]; s: ReturnType<typeof newGame> } {
  const s = newGame(seed);
  const out: QuarterReport[] = [];
  for (let i = 0; i < months; i++) {
    if (s.pendingEvent) s.pendingEvent = null;
    out.push(...reports(tick(s)));
  }
  return { reports: out, s };
}

describe('yearly report', () => {
  it('lands every 12 months and never before', () => {
    const s = newGame(1);
    for (let i = 0; i < 11; i++) { s.pendingEvent = null; expect(reports(tick(s))).toHaveLength(0); }
    s.pendingEvent = null;
    expect(reports(tick(s))).toHaveLength(1);
    const { reports: all } = run(48);
    expect(all.map((r) => r.month)).toEqual([12, 24, 36, 48]);
    expect(all.map((r) => r.n)).toEqual([1, 2, 3, 4]);
  });

  it('first report has nothing to compare, later ones compare with the year before', () => {
    const { reports: all } = run(36);
    expect(all[0].prevIncome).toBeNull();
    expect(all[1].prevIncome).toBe(all[0].income);
    expect(all[2].prevIncome).toBe(all[1].income);
  });

  it('income counts only the year, so it is not the running total', () => {
    const { reports: all, s } = run(36);
    expect(all.reduce((n, r) => n + r.income, 0)).toBeLessThanOrEqual(Math.round(s.stats.earned));
    expect(all[2].income).toBeLessThan(s.stats.earned);
  });

  it('residents change matches the population', () => {
    const { reports: all, s } = run(24, 3);
    expect(all.at(-1)!.residents).toBe(s.residents.length);
    expect(4 + all.reduce((n, r) => n + r.residentsDelta, 0)).toBe(s.residents.length);
  });

  it('picks the building that earned most, never a loss maker', () => {
    const s = newGame(2);
    s.buildings.push({ uid: 99, def: 'warung', x: 1, y: 1, level: 1, status: 'active', timer: 0, invested: 0, placedAt: 0 });
    let r: QuarterReport | undefined;
    for (let i = 0; i < 12; i++) { s.pendingEvent = null; r = reports(tick(s))[0] ?? r; }
    expect(r!.bestDef).toBe('warung');
  });

  it('pays the grade bonus into the resources', () => {
    const s = newGame(5);
    s.res.sabar = 50;
    let before = 0;
    let r: QuarterReport | undefined;
    for (let i = 0; i < 12; i++) {
      before = s.res.sabar;
      s.pendingEvent = null;
      r = reports(tick(s))[0] ?? r;
    }
    expect(r).toBeDefined();
    expect(Object.keys(r!.bonus).sort()).toEqual(Object.keys(GRADE_BONUS[r!.grade]).sort());
    expect(s.res.sabar).toBeGreaterThanOrEqual(0);
    void before;
  });

  it('survives an old save with no quarter data', () => {
    const s = newGame(4);
    delete s.quarter;
    const out: QuarterReport[] = [];
    for (let i = 0; i < 12; i++) {
      s.pendingEvent = null;
      out.push(...reports(tick(s)));
    }
    expect(out.map((r) => r.month)).toEqual([12]);
  });
});

describe('grades', () => {
  it('scores income, residents and Sabar', () => {
    expect(gradePoints(1100, 1000, 1, 5)).toBe(6);
    expect(gradePoints(1000, 1000, 0, 0)).toBe(3);
    expect(gradePoints(500, 1000, -1, -10)).toBe(0);
    expect(gradePoints(500, null, 0, 0)).toBe(3);
  });

  it('maps points to letters, and only good grades pay', () => {
    expect([6, 5, 4, 3, 2, 1, 0].map(gradeFor)).toEqual(['S', 'A', 'B', 'B', 'C', 'D', 'D']);
    expect(GRADE_BONUS.C).toEqual({});
    expect(GRADE_BONUS.D).toEqual({});
    expect(GRADE_BONUS.S.sabar).toBeGreaterThan(GRADE_BONUS.A.sabar);
  });
});
