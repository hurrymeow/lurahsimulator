import { describe, expect, it } from 'vitest';
import { addBuilding, addResident, decorMult, newGame, withinEdges } from '../src/sim/state';
import { tick } from '../src/sim/tick';
import { setRoadRule } from '../src/sim/access';
import type { Fx } from '../src/sim/gain';

const notices = (fx: Fx) => fx.filter((f): f is Extract<Fx[number], { kind: 'notice' }> => f.kind === 'notice');

describe('warnings', () => {
  it('names the shut warung when the 2045 meter drops 10 points or more', () => {
    setRoadRule(false);
    const s = newGame(2);
    const w = addBuilding(s, 'warung', 2, 2, 'active');
    addBuilding(s, 'rumah', 3, 2, 'active');
    for (let i = 0; i < 6; i++) addResident(s);
    s.pendingEvent = null;
    tick(s);
    w.status = 'damaged';
    s.pendingEvent = null;
    const fx = tick(s);
    setRoadRule(true);
    const toast = notices(fx).find((n) => /2045/.test(n.title));
    expect(toast, JSON.stringify(notices(fx).map((n) => n.title))).toBeDefined();
    expect(toast!.body).toMatch(/Perut fell: the .+ is damaged/);
  });

  it('warns once, with a cause, the first month Popularitas falls', () => {
    const s = newGame(3);
    s.res.rupiah = -5_000_000;
    s.month = 24;
    let seen = 0;
    for (let i = 0; i < 6; i++) {
      s.pendingEvent = null;
      s.res.rupiah = -5_000_000;
      seen += notices(tick(s)).filter((n) => n.title === 'Popularitas is falling').length;
    }
    expect(seen).toBe(1);
    expect(s.warned).toContain('sabar');
  });
});

describe('range from the nearest edge', () => {
  it('a 2x2 Taman Bermain boosts a shop beside its far edge, as combos already count', () => {
    setRoadRule(false);
    const s = newGame(1);
    addBuilding(s, 'tamanBermain', 4, 4, 'active');
    // Top corner (4,4) to (9,5) is 5 tiles; the far edge (5,5) to it is 4. Radius 3 misses either way.
    const far = addBuilding(s, 'warung', 9, 5, 'active');
    // From (8,5): 4 tiles from the top corner, 3 from the far edge. Only the edge rule reaches it.
    const near = addBuilding(s, 'warung', 8, 4, 'active');
    expect(decorMult(s, far)).toBe(1);
    expect(decorMult(s, near)).toBeGreaterThan(1);
    setRoadRule(true);
  });

  it('Kanibal counts minimarkets by the same edge rule', () => {
    const a = { def: 'indomaret', x: 0, y: 0 };
    expect(withinEdges(a, { def: 'indomaret', x: 2, y: 2 }, 2)).toBe(true);
    expect(withinEdges(a, { def: 'indomaret', x: 3, y: 0 }, 2)).toBe(false);
    expect(withinEdges({ def: 'lapangan', x: 0, y: 0 }, { def: 'warung', x: 4, y: 4 }, 2)).toBe(true);
  });
});
