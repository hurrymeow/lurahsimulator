import { describe, it } from 'vitest';
import { runBot, SECONDS_PER_TICK } from './driver';
import { buildScorecard } from './scorecard';

// Local measure for T9: item 8's short, mid and long horizons. MEASURE=1 SEEDS=1,2,3 npx vitest run tests/scorecard/measure-T9
describe.skipIf(!process.env.MEASURE)('measure item 8', () => {
  it('prints the three horizons', () => {
    const seeds = (process.env.SEEDS ?? '1,2,3').split(',').map(Number);
    const ticks = Number(process.env.TICKS ?? 600);
    const tls = seeds.map((seed) => runBot('builder', seed, ticks, { stopStars: 9 }));
    for (const tl of tls) {
      const goals = tl.events.filter((e) => e.kind === 'goal').map((e) => e.t);
      const mids = tl.events.filter((e) => e.kind === 'star' || e.kind === 'sk' || e.kind === 'lomba').map((e) => e.t);
      const soon = (ts: number[], t: number, withinS: number) => ts.some((x) => x >= t && (x - t) * SECONDS_PER_TICK <= withinS);
      let n = 0;
      let shortOk = 0;
      let midOk = 0;
      let both = 0;
      for (const r of tl.rows) {
        if ((r.t * SECONDS_PER_TICK) / 60 <= 2) continue;
        n++;
        const s = soon(goals, r.t, 120);
        const m = soon(mids, r.t, 900);
        if (s) shortOk++;
        if (m) midOk++;
        if (s && m) both++;
      }
      const stops = [...new Set(tl.events.filter((e) => e.kind === 'star' || e.kind === 'promote' || e.kind === 'report').map((e) => e.t))].sort((a, b) => a - b);
      let pairs = 0;
      let moved = 0;
      for (let i = 1; i < stops.length; i++) {
        pairs++;
        if (new Set(tl.rows.filter((r) => r.t >= stops[i - 1] && r.t <= stops[i]).map((r) => r.sejahtera)).size > 1) moved++;
      }
      process.stdout.write(`MEASURE seed ${tl.seed} ticks ${tl.ticks} after2 ${n} short ${shortOk} mid ${midOk} both ${both} (${((both / n) * 100).toFixed(0)}%) stopPairs ${pairs} sejahteraMoved ${moved}\n`);
    }
    const row = buildScorecard({ builder: tls }, [], '', []).find((r) => r.n === 8)!;
    process.stdout.write(`MEASURE item8 ${row.verdict}: ${row.evidence}\n`);
  }, 3_000_000);
});
