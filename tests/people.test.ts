import { describe, expect, it } from 'vitest';
import { Crowd } from '../src/render/people';

const project = (fx: number, fy: number) => ({ x: fx * 10, y: fy * 10 });

function crowdWith(fx: number, fy: number, id = 7) {
  const c = new Crowd();
  (c as unknown as { people: unknown }).people = [{ id, kind: 'none', shirt: '', fx, fy, path: [], wait: 0, face: 1, stride: 0 }];
  return c;
}

describe('walker tap', () => {
  it('hits a sprite and ignores VIP walkers', () => {
    const c = crowdWith(5, 5);
    expect(c.hit(50, 50, project, 2)?.id).toBe(7);
    expect(c.hit(50, 40, project, 2)?.id).toBe(7);
    expect(c.hit(0, 0, project, 2)).toBeNull();
    const vip = crowdWith(5, 5, -1);
    expect(vip.hit(50, 50, project, 2)).toBeNull();
  });

  it('only the sprite counts, so the ground beside and below the walker stays free', () => {
    // A walker sprite at scale 2 is 18px wide and 24px tall, feet 4px below the ground point (50, 50).
    const c = crowdWith(5, 5);
    expect(c.hit(50, 54, project, 2)?.id).toBe(7);
    expect(c.hit(50, 60, project, 2)).toBeNull();
    expect(c.hit(62, 50, project, 2)).toBeNull();
    expect(c.hit(38, 50, project, 2)).toBeNull();
  });
});
