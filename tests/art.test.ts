import { describe, expect, it } from 'vitest';
import { INK, Painter, TOP, TH } from '../src/render/iso';

/** Opaque pixels in one row, left to right, as brightness. */
function row(p: Painter, data: Uint8ClampedArray, y: number): number[] {
  const out: number[] = [];
  for (let x = 0; x < p.w; x++) {
    const k = (y * p.w + x) * 4;
    if (data[k + 3] === 255) out.push(data[k] + data[k + 1] + data[k + 2]);
  }
  return out;
}

const wall = (n: number) => (TOP + TH / 2 - 4) * n;
const box = () => {
  const p = new Painter();
  p.box(3, 8, 's');
  return p;
};

describe('big building art', () => {
  for (const n of [2, 3]) {
    it(`keeps a 1px outline on a ${n}x${n} sprite instead of scaling it to ${n}px`, () => {
      const big = box().upscale(n);
      const r = row(big, big.pixels(), wall(n));
      expect(r.length).toBeGreaterThan(10 * n);
      // The outline pixel is dark, and the very next one is already wall.
      expect(r[0]).toBeLessThan(r[1] * 0.6);
      expect(r[r.length - 1]).toBeLessThan(r[r.length - 2] * 0.6);
    });
  }

  it('a plain scale of a finished sprite would have doubled the outline', () => {
    const small = box();
    small.pixels();
    const naive = small.upscale(2);
    naive.bare = true;
    // Bare thinning only looks at the silhouette band of bare art, and this one was inked first.
    const r = row(naive, naive.data, wall(2));
    expect(r[1]).toBe(r[0]);
  });

  it("thins a bare ground sprite's own border band to the width it has on one tile", () => {
    const p = new Painter();
    p.bare = true;
    p.ground((a, b) => (a < 0.06 || a > 0.94 || b < 0.06 || b > 0.94 ? INK : 'g'));
    const small = p.pixels();
    const lead = (q: Painter, data: Uint8ClampedArray, y: number) => {
      const r = row(q, data, y);
      let k = 0;
      while (k < r.length && r[k] === r[0]) k++;
      return k;
    };
    // A row a quarter of the way down the diamond, on one tile and at the same spot on a 3x3.
    const y = TOP + TH / 4;
    const one = lead(p, small, y);
    const big = p.upscale(3);
    const three = lead(big, big.pixels(), y * 3 + 1);
    expect(one).toBeGreaterThan(0);
    expect(three).toBeLessThanOrEqual(one + 1);
  });
});
