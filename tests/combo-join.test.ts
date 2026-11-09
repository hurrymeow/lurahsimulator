import { describe, expect, it } from 'vitest';
import { comboJoinTiles } from '../src/sim/combos';
import { addBuilding, newGame } from '../src/sim/state';
import { GRID_W } from '../src/sim/types';

const key = (x: number, y: number) => y * GRID_W + x;

describe('combo join tiles', () => {
  it('shows where a posRonda would join a kantorRT', () => {
    const s = newGame(1);
    addBuilding(s, 'kantorRT', 5, 5, 'permit');
    const join = comboJoinTiles(s, 'posRonda', [{ x: 6, y: 5 }, { x: 12, y: 12 }]);
    expect(join.has(key(6, 5))).toBe(true);
    expect(join.has(key(12, 12))).toBe(false);
  });

  it('shows nothing when the combo has no partner in town', () => {
    const s = newGame(1);
    // The starter kantorRT is the only partner a posRonda has here; without it nothing joins.
    s.buildings = s.buildings.filter((b) => b.def !== 'kantorRT');
    expect(comboJoinTiles(s, 'posRonda', [{ x: 6, y: 5 }, { x: 5, y: 5 }]).size).toBe(0);
  });

  it('a rumah never gets tiles unless a combo needs it', () => {
    const s = newGame(1);
    // No combo lists a rumah, so it joins nothing even beside the starter kantorRT.
    expect(comboJoinTiles(s, 'rumah', [{ x: 6, y: 7 }, { x: 5, y: 9 }]).size).toBe(0);
    // A posRonda does not pair with a rumah either.
    expect(comboJoinTiles(s, 'posRonda', [{ x: 4, y: 9 }]).size).toBe(0);
  });
});
