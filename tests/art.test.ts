import { describe, expect, it } from 'vitest';
import { INK, Painter, paint, TOP, TH, TW } from '../src/render/iso';
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
const box = (n = 1) => {
  const p = new Painter(n);
  p.box(3, 8, 's');
  return p;
};
/** First opaque column in each row, from top to bottom, where the row has any. */
const leftEdge = (p: Painter, data: Uint8ClampedArray) => {
  const out: number[] = [];
  for (let y = 0; y < p.h; y++)
    for (let x = 0; x < p.w; x++)
      if (data[(y * p.w + x) * 4 + 3] === 255) {
        out.push(x);
        break;
      }
  return out;
};

describe('big building art', () => {
  for (const n of [2, 3]) {
    it(`keeps a 1px outline on a ${n}x${n} sprite instead of scaling it to ${n}px`, () => {
      const big = box(n);
      const r = row(big, big.pixels(), wall(n));
      expect(r.length).toBeGreaterThan(10 * n);
      // The outline pixel is dark, and the very next one is already wall.
      expect(r[0]).toBeLessThan(r[1] * 0.6);
      expect(r[r.length - 1]).toBeLessThan(r[r.length - 2] * 0.6);
    });

    it(`draws a ${n}x${n} sprite's diagonals as smooth 2:1 lines, not scaled-up stair steps`, () => {
      const big = box(n);
      const edge = leftEdge(big, big.pixels());
      // Down the roof's left slope the edge moves at most 2px a row, as on a one-tile sprite.
      // A one-tile sprite scaled up would jump 2n px every n rows.
      const steps = edge.slice(1).map((x, k) => Math.abs(x - edge[k]));
      expect(Math.max(...steps.slice(0, 6 * n))).toBeLessThanOrEqual(2);
    });
  }

  it('a ground border measured in pixels stays the same width on a big lot', () => {
    const band = (n: number) => {
      const p = new Painter(n);
      p.bare = true;
      p.ground((a, b, px) => (a < 1.5 * px || a > 1 - 1.5 * px || b < 1.5 * px || b > 1 - 1.5 * px ? INK : 'g'));
      const r = row(p, p.pixels(), (TOP + TH / 4) * n + 1);
      let k = 0;
      while (k < r.length && r[k] === r[0]) k++;
      return k;
    };
    expect(band(1)).toBeGreaterThan(0);
    expect(band(3)).toBeLessThanOrEqual(band(1) + 1);
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

describe('rumah roof shapes', () => {
  const draw = (v: string, level = 1) => {
    const p = new Painter();
    paint(p, 'rumah', v, level);
    return p.pixels();
  };
  const top = (d: Uint8ClampedArray) => {
    for (let k = 0; k < d.length / 4; k++) if (d[k * 4 + 3] === 255) return Math.floor(k / TW);
    return 0;
  };

  it('at every level, every roof shape draws differently, and none is taller than the hipped house', () => {
    for (const level of [1, 2, 3]) {
      const hip = draw('oht', level);
      const seen = new Set<string>();
      for (const shape of ['h', 'g', 'y', 's', 'f']) {
        const d = draw(`o${shape}t`, level);
        seen.add(d.join(','));
        expect(top(d), `${shape} level ${level}`).toBeGreaterThanOrEqual(top(hip));
      }
      expect(seen.size).toBe(5);
    }
  });

  it('a one-letter variant still means a hipped roof in that colour, as old saves and icons use it', () => {
    expect(draw('G').join(',')).toBe(draw('Ght').join(','));
  });
});
