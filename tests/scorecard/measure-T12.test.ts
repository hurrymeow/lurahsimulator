import { describe, it } from 'vitest';
import { runBot } from './driver';

// Local measure for T12: old map weekly income 5 min after each promotion. MEASURE=1 npx vitest run tests/scorecard/measure-T12
describe.skipIf(!process.env.MEASURE)('measure item 24 old map', () => {
  it('prints the old map income after each promotion', () => {
    const seeds = (process.env.SEEDS ?? '1,2,3,4,5,6,7,8,9,10').split(',').map(Number);
    for (const seed of seeds) {
      const tl = runBot('builder', seed, Number(process.env.TICKS ?? 600), { stopStars: 9 });
      const promos = tl.events.filter((e) => e.kind === 'promote').length;
      const readings = tl.events.flatMap((e) => (e.kind === 'oldMap' ? [`${e.to}@${e.t}:${e.income}`] : []));
      process.stdout.write(`MEASURE T12 seed ${seed} promotions ${promos} readings ${readings.length} ${readings.join(' ')}\n`);
    }
  }, 3_000_000);
});
