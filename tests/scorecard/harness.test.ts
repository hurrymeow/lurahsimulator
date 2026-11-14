import { describe, expect, it } from 'vitest';
import { BOTS, runBot, type Row, type Timeline } from './driver';
import { takeover } from './takeover';
import { buildScorecard, lintTraitsCombos, simText } from './scorecard';
import { TRAITS } from '../../src/data/staff';
import { STAGES } from '../../src/data/stages';
import { def } from '../../src/sim/content';
import type { GameState, StageId } from '../../src/sim/types';
import { parseT2Report, t2Verdict, type T2Result } from './t2';

// Fast checks that the harness itself works. The full scorecard runs with `npm run scorecard`.
describe('scorecard harness', () => {
  it('every bot plays a short game and logs a clean timeline', () => {
    for (const bot of BOTS) {
      const tl = runBot(bot, 3, 40);
      expect(tl.rows.length, bot).toBe(40);
      for (const r of tl.rows) for (const v of Object.values(r)) expect(Number.isFinite(v) || typeof v === 'string' || typeof v === 'boolean', `${bot} row ${r.t}`).toBe(true);
    }
  }, 30_000);

  it('the same bot and seed give the same timeline', () => {
    const a = runBot('builder', 5, 60);
    const b = runBot('builder', 5, 60);
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });

  it('a builder hires an Asisten once it can afford one', () => {
    const out: { s?: GameState } = {};
    runBot('builder', 3, 400, { out });
    const asisten = (out.s?.staff ?? []).filter((x) => x.role === 'asisten');
    expect(asisten.length, `asisten: ${asisten.map((x) => x.name).join(', ')}`).toBeGreaterThanOrEqual(2);
    expect(asisten.some((x) => x.inem)).toBe(true);
  }, 60_000);

  it('a builder that takes over an idle game still progresses', () => {
    const t = takeover(2, 'idle', 60, 80);
    expect(t.gained, t.detail).toBe(true);
  }, 30_000);

  it('data lint: every trait and combo does something (scorecard item 2)', () => {
    const sim = simText();
    expect(lintTraitsCombos(sim)).toEqual({ traits: [], combos: [] });
    // Canary: a trait with no effect that the sim never names is caught.
    TRAITS.push({ id: 'canaryTrait' as never, name: 'Canary', effect: 'Nothing.' });
    try {
      expect(lintTraitsCombos(sim).traits).toEqual(['canaryTrait']);
    } finally {
      TRAITS.pop();
    }
  });

  it('rows 3, 6 and 27 read their verdict from the T2 Playwright report', () => {
    // The shape Playwright's json reporter writes: suites by file, specs by test title, one test per project.
    const spec = (title: string, ...tests: [string, string, string?][]) => ({
      title,
      tests: tests.map(([projectName, status, message]) => ({ projectName, status, results: [{ error: message ? { message: `[31m${message}[39m
  at x` } : undefined }] })),
    });
    const report = { suites: [{ title: 'scorecard-t2.spec.ts', specs: [
      spec('row 27: coming back', ['phone-412-id', 'expected'], ['phone-412-en', 'expected']),
      spec('row 6: a Popularitas fall names its cause', ['phone-412-id', 'unexpected', 'expected "x" to be visible']),
      spec('row 3: the map grows with each star', ['phone-412-en', 'flaky']),
      spec('not a row', ['phone-412-id', 'unexpected']),
    ] }] };
    const results = parseT2Report(report);
    expect(results).toHaveLength(4);
    expect(t2Verdict(27, results, '').verdict).toBe('Pass');
    const six = t2Verdict(6, results, '');
    expect(six.verdict).toBe('Fail');
    expect(six.evidence).toContain('expected "x" to be visible');
    expect(six.evidence).not.toContain('');
    // Passed only on retry is a Fail (TESTING.md item 2).
    expect(t2Verdict(3, results, '').verdict).toBe('Fail');
    // No report, a skipped run, or row 27 in one language only: Unknown, never Pass.
    expect(t2Verdict(3, [], '').verdict).toBe('Unknown');
    const oneLang: T2Result[] = [{ row: 27, lang: 'id', status: 'expected' }];
    expect(t2Verdict(27, oneLang, '').verdict).toBe('Unknown');
    expect(t2Verdict(3, [{ row: 3, lang: 'id', status: 'skipped' }], '').verdict).toBe('Unknown');
    // Row 27: the goal line on screen is the bar; progress one tap away still passes.
    const r27 = [
      ...parseT2Report({ specs: [{ title: 'row 27: coming back', tests: ['id', 'en'].map((l) => ({ projectName: `phone-412-${l}`, status: 'expected', annotations: [{ type: 'progress-on-screen', description: 'false' }] })) }] }),
    ];
    expect(r27[0].notes).toEqual({ 'progress-on-screen': 'false' });
    const runs = { builder: [runBot('builder', 1, 20)] };
    const row = (t2: T2Result[]) => buildScorecard(runs, [], '', t2).find((r) => r.n === 27)!;
    expect(row(r27).verdict).toBe('Pass');
    expect(row(r27.map((x) => ({ ...x, notes: { 'progress-on-screen': 'true' } }))).verdict).toBe('Pass');
    expect(row(r27.map((x) => ({ ...x, notes: undefined }))).verdict).toBe('Pass');
  });

  it('item 15 compares income growth with unlock cost growth per stage', () => {
    const medianOf = (xs: number[]): number => {
      const a = [...xs].sort((p, q) => p - q);
      return a.length % 2 ? a[(a.length - 1) / 2] : (a[a.length / 2 - 1] + a[a.length / 2]) / 2;
    };
    const costMedian = (id: StageId): number => medianOf((STAGES.find((s) => s.id === id)?.stars.flatMap((s) => s.unlocks) ?? []).map((u) => def(u).cost));
    const stageRow = (t: number, stage: StageId, net: number): Row => ({
      t, stage, stars: 0, rupiah: 0, sabar: 0, viral: 0, odn: 0, dana: 0, stempel: 0, anggaran: 0, pop: 0, beds: 0, buildings: 0,
      aman: 0, sejahtera: 0, laporan: 0, net, nextKey: 0, dearKey: net * 7.5, useful: true, goalsDone: 0, goalsTotal: 1, acts: 0,
    });
    const timeline = (net: Record<'rt' | 'rw' | 'kelurahan', number>): Timeline => {
      const stages = ['rt', 'rw', 'kelurahan'] as const;
      const rows = stages.flatMap((st, si) => Array.from({ length: 20 }, (_, i) => stageRow(5 + si * 20 + i, st, net[st])));
      return { bot: 'builder', seed: 1, rows, events: [], ticks: 65, end: { stage: 'kelurahan', stars: 0, sejahtera: 0, laporan: 0, discovered: [] }, starTicks: [], stageTicks: { rt: 0 } };
    };
    const rowOf = (net: Record<'rt' | 'rw' | 'kelurahan', number>) => buildScorecard({ builder: [timeline(net)] }, [], '', []).find((r) => r.n === 15)!;
    // Income as a fixed share of each stage's unlock cost: the growth ratio is 1.0 at both steps.
    const flat = { rt: costMedian('rt') * 0.1, rw: costMedian('rw') * 0.1, kelurahan: costMedian('kelurahan') * 0.1 };
    const pass = rowOf(flat);
    expect(pass.evidence).toContain('RT to RW 1.00x');
    expect(pass.evidence).toContain('RW to Kelurahan 1.00x');
    expect(pass.verdict).toBe('Pass');
    // Income that doubles against cost from RW to Kelurahan leaves the 0.7 to 1.5 band.
    expect(rowOf({ ...flat, kelurahan: flat.kelurahan * 2 }).verdict).toBe('Fail');
  });
});
