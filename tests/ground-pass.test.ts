import { describe, expect, it } from 'vitest';
import { groundFirst } from '../src/render/map';

describe('ground pass', () => {
  it('draws paths, fields and ponds before anything standing, so walkers are never under them', () => {
    const order = [{ def: 'rumah' }, { def: 'jalan' }, { def: 'sawah' }, { def: 'warung' }, { def: 'kolamLele' }, { def: 'taman' }];
    const { ground, standing } = groundFirst(order);
    expect(ground.map((b) => b.def)).toEqual(['jalan', 'sawah', 'kolamLele', 'taman']);
    expect(standing.map((b) => b.def)).toEqual(['rumah', 'warung']);
  });
});
