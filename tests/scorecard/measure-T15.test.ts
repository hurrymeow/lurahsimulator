import { describe, it } from 'vitest';
import { runBot, SECONDS_PER_TICK, type BotId } from './driver';

// Local measure for T15/T2: RT stars and RW 2★ gap, in minutes. BOTS=builder,shopkeeper,safety SEEDS=1,2,3 MEASURE=1 npx vitest run tests/scorecard/measure-T15
describe.skipIf(!process.env.MEASURE)('measure combo bots', () => {
  it('prints star minutes', () => {
    const bots = (process.env.BOTS ?? 'builder,shopkeeper,safety').split(',') as BotId[];
    const seeds = (process.env.SEEDS ?? '1,2,3').split(',').map(Number);
    for (const bot of bots) {
      const out = seeds.map((seed) => {
        const tl = runBot(bot, seed, Number(process.env.TICKS ?? 200));
        const m = (t?: number) => (t === undefined ? 'never' : ((t * SECONDS_PER_TICK) / 60).toFixed(1));
        return `${seed}: ${[0, 1, 2, 3, 4, 5].map((i) => m(tl.starTicks[i])).join('/')}`;
      });
      process.stdout.write(`MEASURE ${bot} stars 1..6 ${out.join(' | ')}\n`);
    }
  }, 3_000_000);
});
