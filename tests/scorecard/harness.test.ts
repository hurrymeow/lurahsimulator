import { describe, expect, it } from 'vitest';
import { BOTS, runBot } from './driver';
import { takeover } from './takeover';
import { buildScorecard, lintTraitsCombos, simText } from './scorecard';
import { TRAITS } from '../../src/data/staff';
import type { GameState } from '../../src/sim/types';
import { parseT2Report, t2Verdict, type T2Result } from './t2';

// Fast checks that the harness itself works. The full scorecard runs with `npm run scorecard`.
describe('scorecard harness', () => {
  it('every bot plays a short game and logs a clean timeline', () => {
    for (const bot of BOTS) {
      const tl = runBot(bot, 3, 40);
      expect(tl.rows.length, bot).toBe(40);
      for (const r of tl.rows) for (const v of Object.values(r)) expect(Number.isFinite(v) || typeof v === 'string', `${bot} row ${r.t}`).toBe(true);
    }
  }, 30_000);

  it('a builder hires an Asisten once the desk hint shows', () => {
    const out: { s?: GameState } = {};
    runBot('builder', 3, 400, { out });
    const asisten = (out.s?.staff ?? []).filter((x) => x.role === 'asisten');
    expect(asisten.length).toBeGreaterThanOrEqual(2);
    expect(asisten.some((x) => x.inem)).toBe(true);
  }, 30_000);

  it('the same bot and seed give the same timeline', () => {
    const a = runBot('builder', 5, 60);
    const b = runBot('builder', 5, 60);
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });

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
    // Row 27: a passing spec that records the progress as hidden reads Fail in the scorecard.
    const r27 = [
      ...parseT2Report({ specs: [{ title: 'row 27: coming back', tests: ['id', 'en'].map((l) => ({ projectName: `phone-412-${l}`, status: 'expected', annotations: [{ type: 'progress-on-screen', description: 'false' }] })) }] }),
    ];
    expect(r27[0].notes).toEqual({ 'progress-on-screen': 'false' });
    const runs = { builder: [runBot('builder', 1, 20)] };
    const row = (t2: T2Result[]) => buildScorecard(runs, [], '', t2).find((r) => r.n === 27)!;
    expect(row(r27).verdict).toBe('Fail');
    expect(row(r27.map((x) => ({ ...x, notes: { 'progress-on-screen': 'true' } }))).verdict).toBe('Pass');
    expect(row(r27.map((x) => ({ ...x, notes: undefined }))).verdict).toBe('Unknown');
  });
});
