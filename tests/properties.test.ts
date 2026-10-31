import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { placeableDefs } from '../src/sim/content';
import { checkRepair, repair, resolveEvent } from '../src/sim/events';
import { checkPlace, place, skipPermit, upgrade } from '../src/sim/rules';
import { deserialize, serialize } from '../src/sim/save';
import { emptyTiles, newGame } from '../src/sim/state';
import { tick } from '../src/sim/tick';
import type { GameState } from '../src/sim/types';

// TESTING.md item 6. 200 games per rule in `npm test`; the nightly run sets PROP_RUNS=1000.
const RUNS = Number(process.env.PROP_RUNS ?? 200);
/** Ticks per game: 2 years at 12 ticks a year. The weekly calendar raises this with the year length. */
const TICKS = 24;
const DEFS = placeableDefs().map((d) => d.id);

type Act = { kind: 'place' | 'upgrade' | 'repair' | 'skip'; def: number; at: number } | { kind: 'event'; choice: number };
const act = fc.oneof(
  fc.record({ kind: fc.constantFrom('place', 'upgrade', 'repair', 'skip'), def: fc.nat(DEFS.length - 1), at: fc.nat(500) }),
  fc.record({ kind: fc.constant('event' as const), choice: fc.nat(3) }),
);
/** One tick's worth of random actions. */
const turn = fc.array(act, { maxLength: 4 });
const game = fc.record({ seed: fc.integer({ min: 1, max: 2_147_483_646 }), turns: fc.array(turn, { minLength: TICKS, maxLength: TICKS }) });

function apply(s: GameState, a: Act): void {
  if (a.kind === 'event') {
    if (s.pendingEvent) resolveEvent(s, [], a.choice);
    return;
  }
  if (a.kind === 'place') {
    const spots = emptyTiles(s);
    const spot = spots[a.at % Math.max(1, spots.length)];
    if (spot && checkPlace(s, DEFS[a.def], spot.x, spot.y).ok) place(s, DEFS[a.def], spot.x, spot.y);
    return;
  }
  const b = s.buildings[a.at % Math.max(1, s.buildings.length)];
  if (!b) return;
  if (a.kind === 'upgrade') upgrade(s, b);
  else if (a.kind === 'repair') { if (checkRepair(s, b).ok) repair(s, b); }
  else if (b.status === 'permit') skipPermit(s, b);
}

/** Plays a random game, calling `each` after every tick. */
function run(g: { seed: number; turns: Act[][] }, each: (s: GameState, prev: GameState) => void): GameState {
  const s = newGame(g.seed);
  for (const t of g.turns) {
    const prev = structuredClone(s);
    for (const a of t) apply(s, a);
    tick(s);
    each(s, prev);
  }
  return s;
}

const opts = { numRuns: RUNS };

// Many random plays each: slow when the whole suite runs at once, so every test here gets 30 seconds.
describe('sim rules hold for any play', { timeout: 30_000 }, () => {
  it('stars never drop', () => {
    fc.assert(
      fc.property(game, (g) => {
        run(g, (s, prev) => {
          for (const id of ['rt', 'rw', 'kelurahan'] as const) expect(s.stage.stars[id]).toBeGreaterThanOrEqual(prev.stage.stars[id]);
        });
      }),
      opts,
    );
    // Many random plays: slow when the whole suite runs at once.
  }, 30_000);

  it('no count goes below zero', () => {
    fc.assert(
      fc.property(game, (g) => {
        run(g, (s) => {
          for (const k of ['sabar', 'orangDalam', 'viral'] as const) expect(s.res[k], k).toBeGreaterThanOrEqual(0);
          expect(s.residents.length).toBeGreaterThanOrEqual(0);
          for (const k of ['stock', 'backlog', 'clear'] as const) expect(s.stempel[k], `stempel.${k}`).toBeGreaterThanOrEqual(0);
          expect(Number.isFinite(s.res.rupiah)).toBe(true);
        });
      }),
      opts,
    );
  });

  it('never soft-locks: time moves and a pending event can always be answered', () => {
    fc.assert(
      fc.property(game, (g) => {
        const s = run(g, () => {});
        for (let i = 0; i < 12; i++) {
          if (s.pendingEvent) {
            const ok = [0, 1, 2, 3].some((c) => resolveEvent(s, [], c).ok);
            expect(ok, `event ${s.pendingEvent} has no choice the player can take`).toBe(true);
          }
          const before = s.month;
          tick(s);
          expect(s.month).toBeGreaterThan(before);
        }
      }),
      opts,
    );
  });

  it('a save round-trips to an identical state', () => {
    fc.assert(
      fc.property(game, (g) => {
        const s = run(g, () => {});
        const back = deserialize(serialize(s));
        expect(back).not.toBeNull();
        expect(serialize(back!)).toBe(serialize(s));
      }),
      opts,
    );
  });

  it('the same seed and the same play give the same game', () => {
    fc.assert(fc.property(game, (g) => { expect(serialize(run(g, () => {}))).toBe(serialize(run(g, () => {}))); }), { numRuns: Math.min(RUNS, 50) });
  });
});
