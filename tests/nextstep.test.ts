import { describe, expect, it } from 'vitest';
import { COMBO_HINT_MONTH, shortGoal } from '../src/sim/nextstep';
import { addBuilding, newGame } from '../src/sim/state';

describe('short goal', () => {
  it('starts with the first house, then residents in steps of 3', () => {
    const s = newGame(1);
    if (!s.buildings.some((b) => b.def === 'rumah')) expect(shortGoal(s)).toBe('Now: build your first Rumah.');
    addBuilding(s, 'rumah', 5, 5, 'active');
    expect(shortGoal(s)).toMatch(/^Now: (reach \d+ residents|build a Rumah for more beds)\.$/);
  });

  it('names the easiest combo once it is time and none is found', () => {
    const s = newGame(1);
    addBuilding(s, 'rumah', 5, 5, 'active');
    s.month = COMBO_HINT_MONTH - 1;
    expect(shortGoal(s)).not.toMatch(/combo/);
    s.month = COMBO_HINT_MONTH;
    expect(shortGoal(s)).toMatch(/^Now: try combo \S.* side by side\.$/);
    s.discovered.push('tongkrongan');
    expect(shortGoal(s)).not.toMatch(/combo/);
  });

  it('says what to wait for while a build is under way', () => {
    const s = newGame(1);
    addBuilding(s, 'rumah', 5, 5, 'active');
    addBuilding(s, 'warung', 6, 5, 'permit').timer = 1;
    expect(shortGoal(s)).toBe('Now: wait for Warung Sembako to open.');
  });
});
