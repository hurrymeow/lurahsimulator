import { describe, it } from 'vitest';
import { runBot, SECONDS_PER_TICK } from './driver';
import { takeover } from './takeover';

// Local measure for T4: how often and how fast the random bot reaches RT 1★, and whether it leaves a game a builder can take over.
// MEASURE=1 npx vitest run tests/scorecard/measure-T4
describe.skipIf(!process.env.MEASURE)('measure random bot paths', () => {
  it('prints RT 1★ minutes and takeover gains', () => {
    let reached = 0;
    const stars: string[] = [];
    for (let seed = 1; seed <= 10; seed++) {
      const tl = runBot('random', seed, 450);
      const star = tl.events.find((e) => e.kind === 'star' && e.stage === 'rt' && e.n === 1);
      if (star) reached++;
      stars.push(`${seed}: ${star ? ((star.t * SECONDS_PER_TICK) / 60).toFixed(1) : 'never'}`);
    }
    process.stdout.write(`MEASURE random RT 1★ ${reached}/10 ${stars.join(' | ')}\n`);
    const gains: string[] = [];
    for (let seed = 1; seed <= 5; seed++) gains.push(`${seed}: ${takeover(seed, 'random', 100).gained}`);
    process.stdout.write(`MEASURE takeover random gained ${gains.join(' | ')}\n`);
  }, 3_000_000);
});
