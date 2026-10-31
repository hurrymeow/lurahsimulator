import { describe, it } from 'vitest';
import { GROUPS, runAndCache } from './plan';

describe.skipIf(!process.env.SCORECARD)('scorecard runs, group 1', () => {
  it('plays every seed and caches the timelines', () => runAndCache(GROUPS[1]), 1_800_000);
});
