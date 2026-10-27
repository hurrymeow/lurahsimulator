import { describe, expect, it } from 'vitest';
import { groundFirst } from '../src/render/map';

describe('ground pass', () => {
  it('draws paths, fields and ponds before anything standing, so walkers are never under them', () => {
    const order = [{ def: 'rumah' }, { def: 'jalan' }, { def: 'sawahIrigasi' }, { def: 'warung' }, { def: 'embung' }, { def: 'taman' }];
    const { ground, standing } = groundFirst(order);
    expect(ground.map((b) => b.def)).toEqual(['jalan', 'sawahIrigasi', 'embung', 'taman']);
    expect(standing.map((b) => b.def)).toEqual(['rumah', 'warung']);
  });
});
