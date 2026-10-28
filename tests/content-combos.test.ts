import { describe, expect, it } from 'vitest';
import { COMBOS } from '../src/data/combos';
import { MORE_COMBOS } from '../src/data/combos-more';
import { BUILDINGS } from '../src/data/buildings';
import { STAGE_COMBOS } from '../src/data/higher';
import { activeCombos, comboConditions, comboIncomeMult, comboStatus, parseNeed } from '../src/sim/combos';
import { addBuilding, newGame } from '../src/sim/state';
import { tick } from '../src/sim/tick';

describe('playtest combos', () => {
  it('only name real buildings, with unique ids, and say what they do', () => {
    const ids = new Set(BUILDINGS.map((b) => b.id));
    const seen = new Set<string>();
    for (const c of MORE_COMBOS) {
      expect(seen.has(c.id), c.id).toBe(false);
      seen.add(c.id);
      for (const n of c.needs) expect(ids.has(parseNeed(n).id), `${c.id} needs ${n}`).toBe(true);
      expect(Boolean(c.incomeMult || c.perMonth || c.agustusMult || c.banjirProtect), c.id).toBe(true);
      for (const k of Object.keys(c.incomeMult ?? {})) expect(c.needs.map((n) => parseNeed(n).id), `${c.id} boosts ${k}`).toContain(k);
    }
    for (const c of STAGE_COMBOS) expect(seen.has(c.id), c.id).toBe(false);
    expect(COMBOS.length).toBeGreaterThanOrEqual(24);
  });
  it('a combo fires when its buildings stand together, and discovery is logged', () => {
    const s = newGame(1);
    addBuilding(s, 'kolamLele', 5, 5, 'active');
    const w = addBuilding(s, 'warteg', 6, 5, 'active');
    expect(activeCombos(s).some((a) => a.combo.id === 'pecelLele')).toBe(true);
    expect(comboIncomeMult(s, w)).toBeCloseTo(1.4);
    tick(s);
    expect(s.discovered).toContain('pecelLele');
  });
  it('a three-building combo needs all three in range', () => {
    const s = newGame(2);
    addBuilding(s, 'pohonRindang', 5, 5, 'active');
    addBuilding(s, 'bangku', 6, 5, 'active');
    expect(activeCombos(s).some((a) => a.combo.id === 'kafeTaman')).toBe(false);
    addBuilding(s, 'warkop', 5, 6, 'active');
    expect(activeCombos(s).some((a) => a.combo.id === 'kafeTaman')).toBe(true);
  });
});

describe('combo status and conditions', () => {
  const pecel = COMBOS.find((c) => c.id === 'pecelLele')!;
  it('lists what is missing, then active once the buildings stand together', () => {
    const s = newGame(1);
    addBuilding(s, 'kolamLele', 5, 5, 'active');
    expect(comboStatus(s, pecel)).toEqual({ state: 'todo', missing: ['Rumah Makan (level 3+)'] });
    // A level-2 Rumah Makan is not enough; level 3 is.
    const rm = addBuilding(s, 'rumahMakan', 6, 5, 'active');
    rm.level = 2;
    expect(comboStatus(s, pecel).state).toBe('todo');
    rm.level = 3;
    expect(comboStatus(s, pecel).state).toBe('active');
    // An old save's Warteg still counts as a level-3 Rumah Makan.
    s.buildings = s.buildings.filter((b) => b !== rm);
    addBuilding(s, 'warteg', 6, 5, 'active');
    expect(comboStatus(s, pecel).state).toBe('active');
  });
  it('writes every combo as plain text with its building names', () => {
    for (const c of COMBOS) expect(comboConditions(c).length, c.id).toBeGreaterThan(10);
  });
});
