import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { decide, tintSpots, type Card } from './e2e/screen-bot';
import { score } from './e2e/screen-bot-score';
import { setLang } from '../src/i18n';
import { addBuilding, newGame } from '../src/sim/state';

const card = (name: string, o: Partial<Card> = {}): Card => ({ name, locked: false, owned: 0, ...o });

describe('screen-only bot', () => {
  it('the player never touches the debug handle or the sim state', () => {
    const src = readFileSync('tests/e2e/screen-bot.ts', 'utf8');
    expect(src).not.toMatch(/pakrt|\.evaluate\(\(\) => .*\.s\b/);
    expect(src).not.toMatch(/from '\.\.\/\.\.\/src\/sim\/(state|tick|stages|save)'/);
  });

  it('decides from text only', () => {
    setLang('en');
    expect(decide({ goal: 'Goal: build your first Rumah', rows: [] }, [card('Rumah')])).toMatchObject({ kind: 'build', name: 'Rumah' });
    expect(decide({ goal: 'Goal: build your first Rumah', rows: [] }, [card('Rumah', { locked: true })])).toMatchObject({ kind: 'wait' });
    expect(decide({ goal: 'Goal: Warung opens soon', rows: [] }, [card('Warung')])).toMatchObject({ kind: 'wait' });
    expect(decide({ goal: 'Goal: accept your SK', rows: [] }, [])).toMatchObject({ kind: 'sk' });
    expect(decide({ goal: 'Goal: reach 25 residents', rows: [] }, [card('Rumah')])).toMatchObject({ kind: 'cant-tell' });
    expect(decide({ goal: '', rows: [] }, [])).toMatchObject({ kind: 'cant-tell' });
  });

  it('waits for a locked building the goal names instead of building another', () => {
    setLang('en');
    const screen = { goal: '', rows: ['Kantor RT, Pos Ronda'] };
    expect(decide(screen, [card('Kantor RT', { locked: true }), card('Pos Ronda', { owned: 1 })])).toMatchObject({
      kind: 'wait',
      why: 'saving for: Kantor RT',
    });
    expect(decide(screen, [card('Kantor RT'), card('Pos Ronda', { owned: 1 })])).toMatchObject({ kind: 'build', name: 'Kantor RT' });
  });

  it('scores a checkpoint by whether a star line moved', () => {
    const a = newGame(1);
    const b = structuredClone(a);
    expect(score('cant-tell', a, b).verdict).toBe('cant-tell');
    expect(score('build', a, b).verdict).toBe('wrong');
    addBuilding(b, 'rumah', 3, 3, 'active');
    b.residents.push(...structuredClone(a.residents).slice(0, 2));
    expect(score('build', a, b).verdict).toBe('right');
    const waiting = structuredClone(a);
    addBuilding(waiting, 'rumah', 3, 3, 'permit');
    expect(score('wait', waiting, structuredClone(waiting)).verdict).toBe('right');
    expect(score('wait', a, structuredClone(a)).verdict).toBe('wrong');
  });

  it('scores a wait the player could not afford as right', () => {
    const a = newGame(1);
    const b = structuredClone(a);
    expect(score('wait', a, b, true)).toEqual({ verdict: 'right', reason: 'saving: could not afford the named building' });
    expect(score('build', a, b, true).verdict).toBe('wrong');
  });
  it('taps a gold patch that came with the building in hand, not stray gold', () => {
    // A 10 x 10 cell bitmap (6px cells), the column count last, as goldCells returns it.
    const grid = (on: (x: number, y: number) => boolean): number[] => [...Array.from({ length: 100 }, (_, i) => (on(i % 10, Math.floor(i / 10)) ? 1 : 0)), 10];
    const field = (_x: number, y: number): boolean => y === 9; // a yellow field along the edge, there before and after
    const before = grid(field);
    const after = grid((x, y) => field(x, y) || (x >= 2 && x <= 4 && y >= 2 && y <= 4) || (x === 8 && y === 1));
    const spots = tintSpots(before, after, { x: 100, y: 200 });
    expect(spots[0]).toEqual([100 + 3.5 * 6, 200 + 3.5 * 6]);
    expect(spots.every(([x, y]) => x < 100 + 5 * 6 && y < 200 + 5 * 6)).toBe(true);
    expect(tintSpots(before, before, { x: 0, y: 0 })).toEqual([]);
  });
});
