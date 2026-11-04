import { describe, expect, it } from 'vitest';
import { BOTS, runBot } from './driver';
import { takeover } from './takeover';
import { lintTraitsCombos, simText } from './scorecard';
import { TRAITS } from '../../src/data/staff';

// Fast checks that the harness itself works. The full scorecard runs with `npm run scorecard`.
describe('scorecard harness', () => {
  it('every bot plays a short game and logs a clean timeline', () => {
    for (const bot of BOTS) {
      const tl = runBot(bot, 3, 40);
      expect(tl.rows.length, bot).toBe(40);
      for (const r of tl.rows) for (const v of Object.values(r)) expect(Number.isFinite(v) || typeof v === 'string', `${bot} row ${r.t}`).toBe(true);
    }
  }, 30_000);

  it('the same bot and seed give the same timeline', () => {
    const a = runBot('builder', 5, 60);
    const b = runBot('builder', 5, 60);
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });

  it('a builder that takes over an idle game still progresses', () => {
    const t = takeover(2, 'idle', 60, 80);
    expect(t.gained, t.detail).toBe(true);
  }, 30_000);

  it('data lint: every trait and combo does something (scorecard item 2)', () => {
    const sim = simText();
    expect(lintTraitsCombos(sim)).toEqual({ traits: [], combos: [] });
    // Canary: a trait with no effect that the sim never names is caught.
    TRAITS.push({ id: 'canaryTrait' as never, name: 'Canary', effect: 'Nothing.' });
    try {
      expect(lintTraitsCombos(sim).traits).toEqual(['canaryTrait']);
    } finally {
      TRAITS.pop();
    }
  });
});
