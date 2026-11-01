import { readFileSync, writeFileSync } from 'node:fs';
import { afterEach, describe, expect, it } from 'vitest';
import { seedGame, type SeedId } from './seed-bot';
import { refreshAccess } from '../src/sim/access';
import { deserialize, serialize } from '../src/sim/save';
import { acceptSK, canPromote, nextStarChecklist } from '../src/sim/stages';
import { setGrid } from '../src/sim/types';

afterEach(() => setGrid('rt'));

const file = (id: SeedId) => new URL(`../src/sim/seeds/${id}.json`, import.meta.url);
/** Fewest different building kinds a seed must show, so no seed is many copies of a few. */
const MIN_KINDS = { rt3: 10, rw: 18, kel: 20 } as const;
const STAGE = { rt3: 'rt', rw: 'rw', kel: 'kelurahan' } as const;

describe('developer seeds', () => {
  // SEED_WRITE=1 rebuilds the files. Slow, so it is off in normal runs.
  if (process.env.SEED_WRITE) {
    for (const id of Object.keys(STAGE) as SeedId[]) {
      it(`writes ${id}`, () => {
        writeFileSync(file(id), serialize(seedGame(id)));
      }, 120_000);
    }
  }
  for (const id of Object.keys(STAGE) as SeedId[]) {
    it(`${id} loads with buildings and stars`, () => {
      const s = deserialize(readFileSync(file(id), 'utf8'));
      expect(s?.stage.current).toBe(STAGE[id]);
      expect(s?.stage.stars.rt).toBe(3);
      expect(s!.buildings.length).toBeGreaterThan(50);
      expect(s!.res.rupiah).toBeGreaterThan(1_000_000);
    });
  }
  for (const id of Object.keys(STAGE) as SeedId[]) {
    it(`${id} is a planned town: every building has a road and the mix is wide`, () => {
      const s = deserialize(readFileSync(file(id), 'utf8'))!;
      refreshAccess(s);
      expect(s.buildings.filter((b) => b.noRoad).map((b) => b.def)).toEqual([]);
      expect(new Set(s.buildings.filter((b) => b.def !== 'jalan').map((b) => b.def)).size).toBeGreaterThanOrEqual(MIN_KINDS[id]);
    });
  }
});

describe('developer seeds can advance', () => {
  for (const id of ['rt3', 'rw'] as const) {
    it(`${id} offers the SK and accepting it promotes`, () => {
      const s = deserialize(readFileSync(file(id), 'utf8'))!;
      expect(s.stage.sk).toBe('offered');
      expect(canPromote(s)).toBe(true);
      const from = s.stage.current;
      expect(acceptSK(s)).toBe(true);
      expect(s.stage.current).not.toBe(from);
      expect(s.stage.sk).toBeUndefined();
    });
  }
  it('kel has a next-star checklist to work toward', () => {
    const s = deserialize(readFileSync(file('kel'), 'utf8'))!;
    expect(s.stage.stars.kelurahan).toBeLessThan(3);
    expect(nextStarChecklist(s)?.length).toBeGreaterThan(0);
  });
});
