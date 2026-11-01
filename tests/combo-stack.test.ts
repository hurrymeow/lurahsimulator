import { describe, expect, it } from 'vitest';
import { activeCombos, COMBO_STACK_MAX, comboSystem } from '../src/sim/combos';
import { addBuilding, newGame } from '../src/sim/state';

describe('combo stacking', () => {
  it('a pile of price wars drains Popularitas at most COMBO_STACK_MAX times', () => {
    const s = newGame(4);
    s.buildings = [];
    for (let i = 0; i < 12; i++) {
      const b = addBuilding(s, 'wifi', 2 + (i % 4) * 2, 2 + Math.floor(i / 4) * 2, 'active');
      b.status = 'active';
    }
    const wars = activeCombos(s).filter((a) => a.combo.id === 'perangKuota').length;
    expect(wars).toBeGreaterThan(COMBO_STACK_MAX);
    s.res.sabar = 80;
    comboSystem(s, []);
    expect(80 - s.res.sabar).toBeLessThanOrEqual(COMBO_STACK_MAX);
  });
});
