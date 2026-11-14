import { describe, expect, it } from 'vitest';
import { buildScorecard } from './scorecard';
import type { Row, Timeline } from './driver';

// T4: item 1 counts a stall only while no goal-moving action is affordable. Synthetic rows keep the check on the
// item's own rule; `npm run scorecard` runs it over the real bots.
const row = (t: number, useful: boolean): Row => ({
  t, stage: 'rt', stars: 0, rupiah: 1_000_000, sabar: 50, viral: 0, odn: 0, dana: 0, stempel: 0, anggaran: 0,
  pop: 3, beds: 8, buildings: 1, aman: 50, sejahtera: 50, laporan: 0, net: 100_000, nextKey: 0, useful,
  goalsDone: 0, goalsTotal: 3, acts: 0,
});

const timeline = (rows: Row[]): Timeline => ({
  bot: 'builder', seed: 1, rows, events: [], ticks: rows.length,
  end: { stage: 'rt', stars: 0, sejahtera: 50, laporan: 0, discovered: [] }, starTicks: [], stageTicks: { rt: 0 },
});

const item1 = (rows: Row[]) => buildScorecard({ builder: [timeline(rows)] }, [], '').find((r) => r.n === 1)!;

describe('scorecard item 1: a useful next move', () => {
  it('counts a stall while no goal-moving action is affordable', () => {
    // Eight ticks is 64s at 1x, past the 60s bar.
    const r = item1(Array.from({ length: 8 }, (_, t) => row(t, false)));
    expect(r.verdict).toBe('Fail');
    expect(r.evidence).toContain('64s');
  });

  it('does not count a tick that has a useful action', () => {
    const r = item1(Array.from({ length: 10 }, (_, t) => row(t, t % 2 === 1)));
    expect(r.verdict).toBe('Pass');
    expect(r.evidence).toContain('8s');
  });
});
