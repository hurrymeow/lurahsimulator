import { describe, expect, it } from 'vitest';
import { INK, Painter, paint, TOP, TH } from '../src/render/iso';
import { allDefs } from '../src/sim/content';

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

describe('level progressions', () => {
  const height = (p: Painter) => {
    const d = p.pixels();
    for (let k = 0; k < d.length / 4; k++) if (d[k * 4 + 3] === 255) return TOP + TH / 2 - Math.floor(k / p.w);
    return 0;
  };
  const art = (name: string, level: number) => {
    const p = new Painter();
    paint(p, name, undefined, level);
    return p;
  };
  const levelled = allDefs().filter((d) => d.maxLevel > 1);

  it('every level of every building looks different from the one before', () => {
    for (const d of levelled.filter((x) => !['parkir', 'biopori', 'kebunSayur', 'sawah', 'kolamLele', 'taman', 'sawahIrigasi', 'embung'].includes(x.id)))
      for (let lv = 2; lv <= d.maxLevel; lv++) {
        const a = art(d.sprite, lv - 1).pixels();
        const b = art(d.sprite, lv).pixels();
        let diff = 0;
        for (let k = 0; k < a.length; k += 4) if (a[k] !== b[k] || a[k + 3] !== b[k + 3]) diff++;
        expect(diff, `${d.id} level ${lv}`).toBeGreaterThan(20);
      }
  });

  it('a higher level never grows tall enough to hide the buildings behind it', () => {
    for (const d of levelled) {
      const base = height(art(d.sprite, 1));
      for (let lv = 2; lv <= d.maxLevel; lv++) {
        const h = height(art(d.sprite, lv));
        // The wifi tower is a tower; everything else gains at most one storey.
        if (d.id === 'wifi') expect(h, 'wifi').toBeLessThanOrEqual(38);
        else {
          expect(h, `${d.id} level ${lv}`).toBeLessThanOrEqual(base + 8);
          expect(h, `${d.id} level ${lv}`).toBeLessThanOrEqual(28);
        }
      }
    }
  });
});
