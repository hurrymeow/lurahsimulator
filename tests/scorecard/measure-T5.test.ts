import { afterAll, describe, it } from 'vitest';
import { writeFileSync } from 'node:fs';
import { runBot, SECONDS_PER_TICK } from './driver';
import { STAGES } from '../../src/data/stages';
import { def } from '../../src/sim/content';

// Local measure for T5: item 15's RT to RW income-growth to cost-growth ratio, and builder RW star minutes.
// MEASURE=1 npx vitest run tests/scorecard/measure-T5
const median = (xs: number[]): number => {
  const a = [...xs].sort((p, q) => p - q);
  return a.length % 2 ? a[(a.length - 1) / 2] : (a[a.length / 2 - 1] + a[a.length / 2]) / 2;
};
const SEEDS = [1, 2, 3];
let text = '';
describe.skipIf(!process.env.MEASURE)('measure T5', () => {
  it('prints the item 15 ratio and RW star minutes', () => {
    const builder = SEEDS.map((seed) => runBot('builder', seed, 700));
    // The item 15 code: income over the median cost of the stage's star unlocks, then the growth from stage to stage.
    const ratios = (['rt', 'rw', 'kelurahan'] as const).map((id) => {
      const net = median(builder.flatMap((tl) => tl.rows.filter((r) => r.stage === id).map((r) => r.net)));
      const cost = median((STAGES.find((st) => st.id === id)?.stars.flatMap((st) => st.unlocks) ?? []).map((u) => def(u).cost));
      return net / cost;
    });
    const growth = ratios.slice(1).map((r, i) => r / ratios[i]);
    const m = (t?: number) => (t === undefined ? null : +((t * SECONDS_PER_TICK) / 60).toFixed(1));
    // Star index 3 is RW 1★, 4 is RW 2★, 5 is RW 3★.
    const rwStars = [3, 4, 5].map((i) => SEEDS.map((_, k) => m(builder[k].starTicks[i])));
    text = JSON.stringify({ seeds: SEEDS, ratios, growth, rwStars });
    process.stdout.write(`MEASURE T5 ${text}\n`);
  }, 3_000_000);
});
afterAll(() => {
  if (text) writeFileSync('/tmp/measure-T5.json', text);
});
