import { describe, it } from 'vitest';
import { GROUPS, runAndCache } from './plan';

describe.skipIf(!process.env.SCORECARD)('scorecard runs, group 0', () => {
  it('plays every seed and caches the timelines', () => runAndCache(GROUPS[0]), 1_800_000);
});
