import { describe, expect, it } from 'vitest';
import { autoBlend, baseOf, blendOf, encodeControl, heightBlend, isAuto, overlayOf, pickMaterial } from '../src/render/terrain';

describe('terrain control map', () => {
  it('packs fields at the bits Terrain3D uses', () => {
    const c = encodeControl(31, 5, 200, true);
    expect(baseOf(c)).toBe(31);
    expect(overlayOf(c)).toBe(5);
    expect(blendOf(c)).toBe(200);
    expect(isAuto(c)).toBe(true);
    // Base id in the top five bits, overlay in the next five, blend at bit 14, auto in bit 0.
    expect(encodeControl(1, 0, 0)).toBe(1 << 27);
    expect(encodeControl(0, 1, 0)).toBe(1 << 22);
    expect(encodeControl(0, 0, 1)).toBe(1 << 14);
    expect(c).toBeGreaterThan(0);
  });

  it('ramps the autoshader with slope', () => {
    expect(autoBlend(4, 8, 14)).toBe(0);
    expect(autoBlend(11, 8, 14)).toBe(0.5);
    expect(autoBlend(20, 8, 14)).toBe(1);
  });

  const flat = () => 0;

  it('shows one material when every corner holds it', () => {
    const c = encodeControl(3, 3, 0);
    for (const [fa, fb] of [[0, 0], [0.5, 0.5], [0.99, 0.2]]) expect(pickMaterial(c, c, c, c, fa, fb, flat, 0.5)).toBe(3);
  });

  it('weights corners bilinearly', () => {
    const a = encodeControl(1, 1, 0);
    const b = encodeControl(2, 2, 0);
    // Left corners hold 1, right corners hold 2: the border runs down the middle.
    expect(pickMaterial(a, b, b, a, 0.3, 0.5, flat, 0.5)).toBe(1);
    expect(pickMaterial(a, b, b, a, 0.7, 0.5, flat, 0.5)).toBe(2);
  });

  it('splits a corner between base and overlay by its blend', () => {
    const c = encodeControl(1, 2, 255);
    expect(pickMaterial(c, c, c, c, 0.5, 0.5, flat, 0.5)).toBe(2);
    const d = encodeControl(1, 2, 0);
    expect(pickMaterial(d, d, d, d, 0.5, 0.5, flat, 0.5)).toBe(1);
  });

  it('lets the taller texture push a border, but only where it has weight', () => {
    const a = encodeControl(1, 1, 0);
    const b = encodeControl(2, 2, 0);
    const tall = (id: number) => (id === 2 ? 1 : 0);
    // Just left of the middle, material 2's height carries it over.
    expect(pickMaterial(a, b, b, a, 0.4, 0.5, tall, 0.5)).toBe(2);
    // Deep on the left side its weight is gone, so it cannot reach.
    expect(pickMaterial(a, b, b, a, 0, 0.5, tall, 0.5)).toBe(1);
  });
});

describe('height blend over a field', () => {
  it('picks the heaviest zone unless a taller texture pushes through', () => {
    expect(heightBlend([0.6, 0.4], [0, 0], 0.5)).toBe(0);
    expect(heightBlend([0.6, 0.4], [0, 1], 0.5)).toBe(1);
    // No weight, no reach.
    expect(heightBlend([1, 0], [0, 1], 0.5)).toBe(0);
  });
});
