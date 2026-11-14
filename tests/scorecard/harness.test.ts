import { describe, expect, it } from 'vitest';
import { BOTS, runBot, type Row, type Timeline, type TLEvent } from './driver';
import { takeover } from './takeover';
import { buildScorecard, lintTraitsCombos, longestSystemRun, simText, starKindRows, starKinds, type StarKindRow } from './scorecard';
import { TRAITS } from '../../src/data/staff';
import { STAGES } from '../../src/data/stages';
import { EVENTS, type EventDef } from '../../src/data/events';
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

  it('item 12 counts reward kinds by category and a system every 2 stars', () => {
    // A star that opens a shop and a decor, and pays a resource, gives three kinds.
    expect(starKinds('rt', 0, { goals: [], unlocks: ['kosan', 'pohonRindang'], reward: { orangDalam: 1 } }).sort()).toEqual(['building', 'decor', 'reward', 'system']);
    // A stage building with an `fx` block is a new system, even with no decor and no reward.
    expect(starKinds('rw', 0, { goals: [], unlocks: ['posyandu'] }).sort()).toEqual(['building', 'system']);
    // Two plain buildings are one kind.
    expect(starKinds('kecamatan', 0, { goals: [], unlocks: ['baliho', 'tamanKota'] })).toEqual(['building']);
    // The bar: a run of 2 stars without a new system fails, a run of 1 passes.
    const rows = (systems: boolean[]): StarKindRow[] => systems.map((on, i) => ({ stage: 'rt', star: i, kinds: on ? ['system'] : ['building'] }));
    expect(longestSystemRun(rows([true, false, true]))).toBe(1);
    expect(longestSystemRun(rows([false, false, true]))).toBe(2);
    // Every star of the ladder is covered.
    expect(starKindRows()).toHaveLength(STAGES.length * 3);
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

  it('item 16 reads the spend share per kind per band', () => {
    const rows: Row[] = Array.from({ length: 101 }, (_, t) => ({
      t, stage: 'rt', stars: 0, rupiah: 0, sabar: 0, viral: 0, odn: 0, dana: 0, stempel: 0, anggaran: 0, pop: 0, beds: 0, buildings: 0,
      aman: 0, sejahtera: 0, laporan: 0, net: 0, nextKey: 0, dearKey: 0, useful: true, goalsDone: 0, goalsTotal: 1, acts: 0,
    }));
    const timeline = (events: TLEvent[]): Timeline => ({ bot: 'builder', seed: 1, rows, events, ticks: rows.length, end: { stage: 'rt', stars: 0, sejahtera: 0, laporan: 0, discovered: [] }, starTicks: [], stageTicks: { rt: 0 } });
    const built = (t: number, id: string): TLEvent => ({ t, kind: 'built', id });
    const rowOf = (events: TLEvent[]) => buildScorecard({ builder: [timeline(events)] }, [], '', []).find((r) => r.n === 16)!;
    // Ticks map to bands: 15 B1, 60 B2, 150 B3, 300 B4, 500 B5.
    // Two bands each for posRonda and wifi: no kind leads more than 2 bands.
    const balanced = [built(15, 'posRonda'), built(15, 'biopori'), built(60, 'posRonda'), built(60, 'biopori'), built(150, 'wifi'), built(150, 'posRonda'), built(300, 'wifi'), built(300, 'posRonda')];
    const pass = rowOf(balanced);
    expect(pass.verdict).toBe('Pass');
    expect(pass.evidence).toContain('proxy: spend share, not star time saved');
    expect(pass.evidence).toContain('B1 posRonda 67%');
    expect(pass.evidence).toContain('B3 wifi 76%');
    // A third band for posRonda is a Fail.
    const fail = rowOf([...balanced, built(500, 'posRonda'), built(500, 'biopori')]);
    expect(fail.verdict).toBe('Fail');
    expect(fail.evidence).toContain('Top in more than 2 bands: posRonda 3');
    // The basics are exempt, so a band that only builds Rumah and Jalan Setapak has no top kind.
    expect(rowOf([built(3, 'rumah'), built(3, 'jalan'), built(3, 'warung')]).evidence).toContain('no counted builds');
  });

  it('item 24 reads the old map five minutes after each promotion', () => {
    const rows: Row[] = Array.from({ length: 10 }, (_, t) => ({
      t, stage: 'rt', stars: 0, rupiah: 0, sabar: 0, viral: 0, odn: 0, dana: 0, stempel: 0, anggaran: 0, pop: 0, beds: 0, buildings: 0,
      aman: 0, sejahtera: 0, laporan: 0, net: 0, nextKey: 0, dearKey: 0, useful: true, goalsDone: 0, goalsTotal: 1, acts: 0,
    }));
    // Two promotions per seed, each with a reading five minutes later.
    const timeline = (seed: number, readings: number[]): Timeline => ({
      bot: 'builder', seed, rows, ticks: rows.length,
      events: [
        { t: 0, kind: 'promote', to: 'rw' as StageId },
        { t: 2, kind: 'promote', to: 'kelurahan' as StageId },
        ...readings.map((income, i) => ({ t: 40 + i, kind: 'oldMap' as const, to: (i === 0 ? 'rw' : 'kelurahan') as StageId, income })),
      ],
      end: { stage: 'kelurahan', stars: 0, sejahtera: 0, laporan: 0, discovered: [] },
      starTicks: [0, 1, 2, 3, 4, 5, 6, 7, 8],
      stageTicks: { rt: 0, rw: 0, kelurahan: 2 },
    });
    const seeds = (readings: (i: number) => number[]) => Array.from({ length: 10 }, (_, i) => timeline(i + 1, readings(i)));
    const rowOf = (tls: Timeline[]) => buildScorecard({ builder: tls }, [], '', []).find((r) => r.n === 24)!;
    const pass = rowOf(seeds(() => [120_000, 90_000]));
    expect(pass.verdict).toBe('Pass');
    expect(pass.evidence).toContain('above 0 in 10 of 10 seeds');
    expect(pass.evidence).not.toContain('T2');
    // A seed whose old map earns nothing fails, and the stage is named.
    const quiet = rowOf(seeds((i) => (i === 9 ? [0, 90_000] : [120_000, 90_000])));
    expect(quiet.verdict).toBe('Fail');
    expect(quiet.evidence).toContain('old map earns nothing after rw');
    // A promotion with no reading five minutes later cannot pass either.
    const unread = seeds(() => [120_000, 90_000]);
    unread[0].events = unread[0].events.filter((e) => !(e.kind === 'oldMap' && e.to === 'rw'));
    expect(rowOf(unread).evidence).toContain('1 promotion(s) unread after 5 min');
    // A seed that never promotes does not demonstrate the old map paying.
    const still = seeds(() => [120_000, 90_000]);
    still[0].events = [];
    still[0].stageTicks = { rt: 0 };
    still[0].starTicks = [];
    expect(rowOf(still).verdict).toBe('Fail');
  });

  it('item 8 reads the short and mid goals from the known future', () => {
    const rows: Row[] = Array.from({ length: 101 }, (_, t) => ({
      t, stage: 'rt', stars: 0, rupiah: 0, sabar: 0, viral: 0, odn: 0, dana: 0, stempel: 0, anggaran: 0, pop: 0, beds: 0, buildings: 0,
      aman: 0, sejahtera: t, laporan: 0, net: 0, nextKey: 0, dearKey: 0, useful: true, goalsDone: 0, goalsTotal: 1, acts: 0,
    }));
    const goal = (t: number): TLEvent => ({ t, kind: 'goal' });
    const star = (t: number): TLEvent => ({ t, kind: 'star', stage: 'rt', n: 1 });
    const lomba = (t: number): TLEvent => ({ t, kind: 'lomba' });
    const timeline = (events: TLEvent[]): Timeline => ({ bot: 'builder', seed: 1, rows, events, ticks: rows.length, end: { stage: 'rt', stars: 0, sejahtera: 0, laporan: 0, discovered: [] }, starTicks: [], stageTicks: { rt: 0 } });
    const rowOf = (events: TLEvent[]) => buildScorecard({ builder: [timeline(events)] }, [], '', []).find((r) => r.n === 8)!;
    const every = (n: number, make: (t: number) => TLEvent): TLEvent[] => Array.from({ length: 101 / n + 1 }, (_, i) => make(i * n));
    // A checklist line every 80s and a star every 160s; the Emas bar (Sejahtera) moves between stops.
    expect(rowOf([...every(10, goal), ...every(20, star)]).verdict).toBe('Pass');
    // No goal line met: the short horizon is missing on every tick.
    expect(rowOf(every(20, star)).verdict).toBe('Fail');
    // The Lomba counts as the mid goal, with no stars.
    expect(rowOf([...every(10, goal), ...every(20, lomba)]).verdict).toBe('Pass');
  });

  it('item 18 compares rolled outcomes on their mean and reads Pass or Fail', () => {
    const runs = { builder: [runBot('builder', 1, 20)] };
    const rowOf = () => buildScorecard(runs, [], '', []).find((r) => r.n === 18)!;
    const withEvents = (events: EventDef[], fn: () => void): void => {
      const saved = EVENTS.splice(0, EVENTS.length, ...events);
      try { fn(); } finally { EVENTS.splice(0, EVENTS.length, ...saved); }
    };
    const canary = (choices: EventDef['choices']): EventDef => ({ id: 'canaryDom', name: 'Canary', body: '', when: { chance: 0 }, choices });
    // A rolled option that is worse on average than a fixed one is named, and the row fails.
    withEvents([canary([
      { label: 'Risky', outcomes: [{ weight: 1, res: { sabar: 1 }, result: '' }, { weight: 1, res: { sabar: -3 }, result: '' }], result: '' },
      { label: 'Safe', res: { sabar: 2 }, result: '' },
    ])], () => {
      const row = rowOf();
      expect(row.verdict).toBe('Fail');
      expect(row.evidence).toContain('canaryDom#0 "Risky"');
    });
    // Equal means and equal costs: neither dominates, so Pass, never Unknown.
    withEvents([canary([
      { label: 'Coin', outcomes: [{ weight: 1, res: { sabar: 2 }, result: '' }, { weight: 1, res: { sabar: -2 }, result: '' }], result: '' },
      { label: 'Flat', res: { sabar: 0 }, result: '' },
    ])], () => expect(rowOf().verdict).toBe('Pass'));
    // The shipped content never reads Unknown either.
    expect(rowOf().verdict).not.toBe('Unknown');
  });
});
