import { describe, expect, it } from 'vitest';
import { ring } from '../src/sim/access';
import { handBack, promote } from '../src/sim/grow';
import { inCell, viewOf } from '../src/sim/neighbourView';
import { programScore, score } from '../src/sim/ranking';
import { newGame } from '../src/sim/state';
import { announce, wacanaSystem } from '../src/sim/wacana';

/** Builds the state as tests/grow.test.ts does for its scoreParts test. */
const grown = () => {
  const s = newGame(7);
  s.stage.current = 'rt';
  s.stage.stars.rt = 3;
  promote(s, []);
  return s;
};

const aiNextDoor = (s: ReturnType<typeof newGame>) => {
  const n = s.neighbours[0];
  n.absorbed = false;
  const touches = (p: { x: number; y: number }, id: string) => s.buildings.some((o) => o.def === id && inCell(n, o) && ring(o).some(([x, y]) => x === p.x && y === p.y));
  s.buildings = s.buildings.filter((b) => !(b.def === 'jalan' && inCell(n, b) && !(touches(b, 'kantorRT') && touches(b, 'rumah'))));
  handBack(s, n);
  return s;
};
const withAi = () => aiNextDoor(grown());

describe('wacana in the quarterly ranking', () => {
  it('raises the score when the player announces', () => {
    const s = withAi();
    s.res.rupiah = 1_000_000_000;
    const before = score(s);
    announce(s, 'hijau');
    expect(score(s)).toBeGreaterThan(before);
  });

  it('drops the gain back to 0 as the approval decays', () => {
    const s = withAi();
    s.res.rupiah = 1_000_000_000;
    announce(s, 'hijau');
    expect(programScore(s)).toBeGreaterThan(0);
    for (let i = 0; i < 30; i++) wacanaSystem(s, []);
    expect(programScore(s)).toBe(0);
  });

  it("leaves an AI RT's score the same when the player announces", () => {
    const s = withAi();
    s.res.rupiah = 1_000_000_000;
    const before = score(viewOf(s, s.neighbours[0]));
    announce(s, 'hijau');
    expect(score(viewOf(s, s.neighbours[0]))).toBe(before);
  });
});
