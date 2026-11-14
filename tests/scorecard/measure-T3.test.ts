import { describe, it } from 'vitest';
import { runBot, SECONDS_PER_TICK, type BotId } from './driver';

// Local measure for the T3 item 21 count. MEASURE=1 npx vitest run tests/scorecard/measure-T3
describe.skipIf(!process.env.MEASURE)('measure item 21', () => {
  it('prints combo counts for random, builder and hint', () => {
    const seeds = Array.from({ length: 10 }, (_, i) => i + 1);
    const bots: BotId[] = ['random', 'builder', 'hint'];
    for (const bot of bots) {
      const rows = seeds.map((seed) => {
        const tl = runBot(bot, seed, 600, { stopStars: 9 });
        const combos = tl.events.filter((e) => e.kind === 'combo');
        const early = combos.filter((e) => (e.t * SECONDS_PER_TICK) / 60 < 15);
        const first = tl.starTicks[0];
        return `${seed}: early=${early.length} total=${combos.length} end=${tl.end.discovered.length} rt1=${first === undefined ? 'never' : ((first * SECONDS_PER_TICK) / 60).toFixed(1)} [${combos.map((e) => `${(e as { id: string }).id}@${((e.t * SECONDS_PER_TICK) / 60).toFixed(1)}`).join(' ')}]`;
      });
      process.stdout.write(`MEASURE ${bot}\n  ${rows.join('\n  ')}\n`);
    }
  }, 3_000_000);
});
