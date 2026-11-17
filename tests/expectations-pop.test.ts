import { describe, expect, it } from 'vitest';
import { expectations } from '../src/sim/tick';
import { addResident, newGame } from '../src/sim/state';
import type { Fx } from '../src/sim/gain';

describe('expectations', () => {
  it('shows its Popularitas drain as a heart pop at the Kantor, so a fall has a cause on the map', () => {
    const s = newGame(1);
    for (let i = 0; i < 30; i++) addResident(s);
    const fx: Fx = [];
    const before = s.res.sabar;
    expectations(s, fx);
    const k = s.buildings.find((b) => b.def.startsWith('kantor'))!;
    const pop = fx.find((f) => f.kind === 'pop' && f.res === 'sabar');
    expect(s.res.sabar).toBeLessThan(before);
    expect(pop).toMatchObject({ kind: 'pop', res: 'sabar', x: k.x, y: k.y });
    expect(pop && pop.kind === 'pop' ? pop.amount : 0).toBeCloseTo(s.res.sabar - before);
  });
});
