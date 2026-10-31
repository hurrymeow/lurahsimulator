import { describe, it } from 'vitest';
import type { BotId } from './driver';
import { runAndCache } from './plan';

// One bot on a few seeds, for the nightly matrix: BOT=shopkeeper SEEDS=3,4 SCORECARD=1 npx vitest run tests/scorecard/run-one
describe.skipIf(!process.env.SCORECARD || !process.env.BOT)('scorecard run, one bot', () => {
  it('plays the seeds and caches the timelines', () => {
    const seeds = (process.env.SEEDS ?? '').split(',').map(Number).filter(Boolean);
    runAndCache([process.env.BOT as BotId], seeds.length ? seeds : undefined);
  }, 3_000_000);
});
