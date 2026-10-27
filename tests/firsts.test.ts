import { describe, expect, it } from 'vitest';
import { deserialize, serialize } from '../src/sim/save';
import { addBuilding, newGame } from '../src/sim/state';
import { advanceConstruction } from '../src/sim/tick';
import { stageSystem } from '../src/sim/stages';
import type { SimEffect } from '../src/sim/types';

const firsts = (fx: SimEffect[]) => fx.filter((f) => f.kind === 'first').map((f) => (f as { what: string }).what);

describe('first-win celebrations', () => {
  it('fires for the first finished house only', () => {
    const s = newGame(1);
    const a = addBuilding(s, 'rumah', 1, 1, 'building');
    a.timer = 1;
    const fx: SimEffect[] = [];
    advanceConstruction(s, fx);
    expect(firsts(fx)).toEqual(['house']);
    const b = addBuilding(s, 'rumah', 3, 1, 'building');
    b.timer = 1;
    const fx2: SimEffect[] = [];
    advanceConstruction(s, fx2);
    expect(firsts(fx2)).toEqual([]);
  });

  it('stays quiet for a warung, and for a save that already reached the milestones', () => {
    const s = newGame(1);
    const w = addBuilding(s, 'warung', 1, 1, 'building');
    w.timer = 1;
    const fx: SimEffect[] = [];
    advanceConstruction(s, fx);
    expect(firsts(fx)).toEqual([]);
    const old = newGame(1);
    expect(deserialize(serialize(old))!.firsts).toEqual([]);
    old.stats.arrived = 3;
    delete old.firsts;
    expect(deserialize(serialize(old))!.firsts).toEqual(['house', 'resident']);
  });

  it('fires once for the first star', () => {
    const s = newGame(1);
    s.discovered.push('tongkrongan');
    s.residents.push(...Array.from({ length: 8 }, (_, i) => ({ ...s.residents[0], id: 100 + i })));
    const fx: SimEffect[] = [];
    stageSystem(s, fx);
    expect(firsts(fx)).toEqual(['star']);
    stageSystem(s, fx);
    expect(firsts(fx)).toEqual(['star']);
  });
});
