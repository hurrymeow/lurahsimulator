import { describe, expect, it } from 'vitest';
import { cornerHeight, layoutWorld } from '../src/render/scenery';
import { GRID_H, GRID_W, setGrid } from '../src/sim/types';

describe('ground level', () => {
  for (const stage of ['rt', 'rw', 'kelurahan'] as const)
    it(`keeps the kampung and its ring road at height 0 at ${stage}, so the painted tile grid sits under the paths and buildings`, () => {
      setGrid(stage);
      layoutWorld();
      for (let y = -1; y <= GRID_H + 1; y++) for (let x = -1; x <= GRID_W + 1; x++) expect(cornerHeight(x, y), `corner ${x},${y}`).toBe(0);
    });
});
