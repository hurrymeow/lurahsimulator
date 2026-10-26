// Small harness for tests/rw.test.ts: runs a single system and reports what it changed.
import { buildingIncome } from '../src/sim/tick';
import { jobsSystem } from '../src/sim/jobs';
import { tick } from '../src/sim/tick';
import type { GameState, Resources } from '../src/sim/types';

export { buildingIncome, tick };

/** Runs the jobs system once and returns the change in each resource. */
export function jobsSystemForTest(s: GameState, _noop = false): Resources {
  const before = { ...s.res };
  jobsSystem(s, []);
  return { rupiah: s.res.rupiah - before.rupiah, sabar: s.res.sabar - before.sabar, orangDalam: s.res.orangDalam - before.orangDalam, viral: s.res.viral - before.viral };
}
