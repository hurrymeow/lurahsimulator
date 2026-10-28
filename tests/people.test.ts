import { describe, expect, it } from 'vitest';
import { Crowd } from '../src/render/people';

const project = (fx: number, fy: number) => ({ x: fx * 10, y: fy * 10 });

function crowdWith(fx: number, fy: number, id = 7) {
  const c = new Crowd();
  (c as unknown as { people: unknown }).people = [{ id, kind: 'none', shirt: '', fx, fy, path: [], wait: 0, face: 1, stride: 0 }];
  return c;
}

describe('walker tap', () => {
  it('hits a sprite, ignores VIP walkers, and finds a walker by ground tile', () => {
    const c = crowdWith(5, 5);
    expect(c.hit(50, 50, project, 2)?.id).toBe(7);
    expect(c.hit(0, 0, project, 2)).toBeNull();
    expect(c.onTile(5, 5)?.id).toBe(7);
    expect(c.onTile(4, 5)).toBeNull();
    const vip = crowdWith(5, 5, -1);
    expect(vip.hit(50, 50, project, 2)).toBeNull();
    expect(vip.onTile(5, 5)).toBeNull();
  });
});
