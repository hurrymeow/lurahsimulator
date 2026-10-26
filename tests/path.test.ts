import { describe, expect, it } from 'vitest';
import { doorsOf, findPath } from '../src/render/path';

const open = () => true;

describe('walker pathfinding', () => {
  it('finds the shortest 4-way path, excluding the start', () => {
    const p = findPath(5, 5, open, { x: 0, y: 0 }, { x: 2, y: 1 });
    expect(p).toHaveLength(3);
    expect(p!.at(-1)).toEqual({ x: 2, y: 1 });
  });

  it('walks around a wall of buildings', () => {
    const wall = (x: number, y: number) => !(x === 1 && y < 4);
    const p = findPath(3, 5, wall, { x: 0, y: 0 }, { x: 2, y: 0 })!;
    expect(p.every((t) => wall(t.x, t.y))).toBe(true);
    expect(p).toHaveLength(10);
  });

  it('returns null when the target is sealed off', () => {
    const sealed = (x: number) => x !== 1;
    expect(findPath(3, 3, sealed, { x: 0, y: 0 }, { x: 2, y: 2 })).toBeNull();
  });

  it('lists only free tiles inside the grid as doors', () => {
    const busy = (x: number, y: number) => !(x === 1 && y === 0);
    expect(doorsOf(3, 3, busy, { x: 0, y: 0 })).toEqual([{ x: 0, y: 1 }]);
  });
});
