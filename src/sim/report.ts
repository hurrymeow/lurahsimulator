import { GRADE_BONUS, QUARTER_MONTHS } from './balance';
import { gain, type Fx } from './gain';
import { population } from './state';
import type { Grade, GameState, QuarterReport, QuarterTrack, ResourceId } from './types';

export const snapshot = (s: GameState, count = 0, prevIncome: number | null = null): QuarterTrack => ({
  count,
  earned: s.stats.earned,
  residents: population(s),
  res: { ...s.res },
  prevIncome,
  net: {},
});

/** Called by the income step so the best building can be picked at quarter end. */
export function noteNet(s: GameState, uid: number, net: number): void {
  if (s.quarter) s.quarter.net[uid] = (s.quarter.net[uid] ?? 0) + net;
}

/** 0 to 6 points from income, residents and Sabar. */
export function gradePoints(income: number, prevIncome: number | null, residentsDelta: number, sabarDelta: number): number {
  const money = prevIncome === null ? 1 : income >= prevIncome * 1.1 ? 2 : income >= prevIncome * 0.95 ? 1 : 0;
  const people = residentsDelta >= 1 ? 2 : residentsDelta === 0 ? 1 : 0;
  const calm = sabarDelta >= 5 ? 2 : sabarDelta >= -2 ? 1 : 0;
  return money + people + calm;
}

export function gradeFor(points: number): Grade {
  return points >= 6 ? 'S' : points === 5 ? 'A' : points >= 3 ? 'B' : points === 2 ? 'C' : 'D';
}

function bestBuilding(s: GameState, q: QuarterTrack): string | null {
  let best: { def: string; net: number } | null = null;
  for (const b of s.buildings) {
    const net = q.net[b.uid] ?? 0;
    if (net > 0 && (!best || net > best.net)) best = { def: b.def, net };
  }
  return best?.def ?? null;
}

/** Every QUARTER_MONTHS months: sum up the quarter, pay the grade bonus, queue the report card. */
export function quarterSystem(s: GameState, fx: Fx): void {
  const q = s.quarter;
  if (!q || s.month % QUARTER_MONTHS !== 0) return;
  const income = Math.round(s.stats.earned - q.earned);
  const residentsDelta = population(s) - q.residents;
  const sabarDelta = s.res.sabar - q.res.sabar;
  const grade = gradeFor(gradePoints(income, q.prevIncome, residentsDelta, sabarDelta));
  const report: QuarterReport = {
    n: q.count + 1,
    month: s.month,
    income,
    prevIncome: q.prevIncome,
    residents: population(s),
    residentsDelta,
    sabarDelta: Math.round(sabarDelta * 10) / 10,
    orangDalamDelta: Math.round((s.res.orangDalam - q.res.orangDalam) * 10) / 10,
    viralDelta: Math.round((s.res.viral - q.res.viral) * 10) / 10,
    bestDef: bestBuilding(s, q),
    grade,
    bonus: { ...GRADE_BONUS[grade] },
  };
  const hq = s.buildings.find((b) => b.def === 'kantorRT');
  for (const [res, v] of Object.entries(report.bonus) as [ResourceId, number][]) gain(s, fx, res, v, res === 'orangDalam' ? undefined : hq);
  fx.push({ kind: 'report', report });
  s.quarter = snapshot(s, report.n, income);
  s.lastNovelty = s.month;
}
