import { readFileSync, writeFileSync } from 'node:fs';
import { afterEach, describe, expect, it } from 'vitest';
import { seedGame, type SeedId } from './seed-bot';
import { deserialize, serialize } from '../src/sim/save';
import { setGrid } from '../src/sim/types';

afterEach(() => setGrid('rt'));

const file = (id: SeedId) => new URL(`../src/sim/seeds/${id}.json`, import.meta.url);
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
});
