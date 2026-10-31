import { describe, expect, it } from 'vitest';
import { deserialize, serialize } from '../src/sim/save';
import { newGame } from '../src/sim/state';

// TESTING.md item 10. No save migrations: a save that cannot load must come back null, never half-loaded.
describe('incompatible saves', () => {
  const fresh = () => JSON.parse(serialize(newGame(7)));
  const load = (o: unknown) => deserialize(JSON.stringify(o));

  it('loads a current save', () => expect(load(fresh())).not.toBeNull());
  it('rejects an unknown version', () => expect(load({ ...fresh(), version: 99 })).toBeNull());
  it('rejects an unknown building id', () => {
    const s = fresh();
    s.buildings[0].def = 'no-such-building';
    expect(load(s)).toBeNull();
  });
  it('rejects corrupt JSON, empty and missing saves', () => {
    expect(deserialize('{not json')).toBeNull();
    expect(deserialize('')).toBeNull();
    expect(deserialize(null)).toBeNull();
  });
  it('rejects a save missing its core fields', () => expect(load({ version: 2 })).toBeNull());
});
