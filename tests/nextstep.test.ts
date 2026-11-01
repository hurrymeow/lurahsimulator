import { describe, expect, it } from 'vitest';
import { COMBO_HINT_MONTH, nextStep, shortGoal } from '../src/sim/nextstep';
import { addBuilding, addResident, attractTarget, housing, newGame, population } from '../src/sim/state';

describe('short goal', () => {
  it('starts with the first house, and never says "reach N residents": the star list does', () => {
    const s = newGame(1);
    if (!s.buildings.some((b) => b.def === 'rumah')) expect(nextStep(s)).toEqual({ kind: 'house', text: 'build your first Rumah' });
    addBuilding(s, 'rumah', 5, 5, 'active');
    const step = nextStep(s);
    expect(step === null || step.kind === 'beds').toBe(true);
    expect(shortGoal(s) ?? '').not.toMatch(/reach/i);
  });

  it('names the easiest combo once it is time and none is found', () => {
    const s = newGame(1);
    addBuilding(s, 'rumah', 5, 5, 'active');
    s.month = COMBO_HINT_MONTH - 1;
    expect(shortGoal(s) ?? '').not.toMatch(/combo/);
    s.month = COMBO_HINT_MONTH;
    expect(shortGoal(s)).toMatch(/^make a combo: \S/);
    s.discovered.push('tongkrongan');
    expect(shortGoal(s) ?? '').not.toMatch(/combo/);
  });

  it('says what to wait for while a build is under way', () => {
    const s = newGame(1);
    addBuilding(s, 'rumah', 5, 5, 'active');
    addBuilding(s, 'warung', 6, 5, 'permit').timer = 1;
    expect(shortGoal(s)).toBe('wait for Warung Sembako to open');
  });

  it('leads with the combo before beds once the combo is all the star still needs', () => {
    const s = newGame(1);
    for (let i = 0; i < 3; i++) addBuilding(s, 'rumah', 3 + i, 12, 'active');
    while (population(s) < Math.max(10, housing(s))) addResident(s);
    // Full beds would say "build a Rumah", but 10 residents are in: the star waits only on a combo.
    expect(shortGoal(s)).toMatch(/^make a combo: /);
  });

  it('says what draws residents when beds are free but nobody comes', () => {
    const s = newGame(1);
    s.discovered.push('rapatMalam');
    for (let i = 0; i < 4; i++) addBuilding(s, 'rumah', 3 + i, 12, 'active');
    while (population(s) < attractTarget(s)) addResident(s);
    expect(population(s)).toBeLessThan(housing(s));
    expect(shortGoal(s)).toMatch(/^nobody new is coming, build a .+ to draw residents$/);
  });

  it('does not draw a Warung Sembako that is already built', () => {
    const s = newGame(1);
    s.discovered.push('rapatMalam');
    addBuilding(s, 'warung', 8, 12, 'active');
    for (let i = 0; i < 4; i++) addBuilding(s, 'rumah', 3 + i, 12, 'active');
    while (population(s) < attractTarget(s)) addResident(s);
    expect(population(s)).toBeLessThan(housing(s));
    const step = nextStep(s);
    expect(step?.kind === 'draw' && step.text.includes('Warung Sembako')).toBe(false);
  });
});
