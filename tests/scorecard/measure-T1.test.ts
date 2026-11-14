import { afterAll, describe, it } from 'vitest';
import { writeFileSync } from 'node:fs';
import { runBot, SECONDS_PER_TICK } from './driver';

// Local measure for T1: builder star minutes on seeds 1 to 10, 700 ticks.
// MEASURE=1 npx vitest run tests/scorecard/measure-T1
const lines: string[] = [];

describe('measure builder combo-first', () => {
  afterAll(() => writeFileSync('progress/scorecard-bot-fixes-T1.md', lines.join('\n') + '\n'));

  it('prints star minutes and the stage reached', () => {
    for (let seed = 1; seed <= 10; seed++) {
      const tl = runBot('builder', seed, 700);
      const m = (t?: number) => (t === undefined ? 'never' : ((t * SECONDS_PER_TICK) / 60).toFixed(1));
      const stars = [0, 1, 2, 3, 4, 5].map((i) => m(tl.starTicks[i])).join(', ');
      lines.push(`seed ${seed}: ${stars} | end ${tl.end.stage} ${tl.end.stars}`);
    }
  }, 3_000_000);
});
