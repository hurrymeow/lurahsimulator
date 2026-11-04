import { describe, expect, it } from 'vitest';
import { LONG_ART, paint, Painter, TH, TOP, TW } from '../src/render/iso';
import { allDefs, sizeFor } from '../src/sim/content';

/**
 * UI.md rule 17: map art stays in its footprint. A building draws only over its own tiles and the space above them,
 * never over the tiles in front of it. The canvas is exactly as wide as the footprint, so the sides cannot spill;
 * what can spill is anything drawn below the footprint's two front edges, onto the tiles and roads in front.
 */
const SLACK = 1.5;

// Sprites that spill today, capped at today's worst level in pixels so they can only get better. TODO.md:
// "Keep shop props inside their footprint". A fixed sprite has its entry deleted.
const SPILL_ALLOW: Record<string, number> = {
  alfamart: 14,
  baliho: 5,
  bankSampah: 8,
  bidan: 11,
  indomaret: 14,
  kantorRT: 8,
  portal: 3,
  posSatpam: 21,
  warung: 16,
};

function spill(name: string, fa: number, fb: number, level: number): string[] {
  const n = fa === fb ? fa : 1;
  const [a, b] = fa === fb ? [1, 1] : [fa, fb];
  // The same painting iso() does, read straight from the painter (no DOM in unit tests).
  const p = new Painter(n, a, b);
  if (a === b) paint(p, name, undefined, level);
  else if (LONG_ART[name]) LONG_ART[name](p, undefined, level);
  else
    for (let d = 0; d < a + b - 1; d++)
      for (let u = 0; u < a; u++) {
        const v = d - u;
        if (v < 0 || v >= b) continue;
        p.at(u, v);
        paint(p, name, undefined, level);
      }
  const data = p.pixels();
  const { w, h } = p;
  // Corners in canvas pixels: the left corner sits at x 0, the bottom one at the far end of the fa side.
  const left = (TOP + (b * TH) / 2) * n;
  const bottomX = ((a * TW) / 2) * n;
  const out: string[] = [];
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      if (data[(y * w + x) * 4 + 3] !== 255) continue;
      const cx = x + 0.5;
      const edge = cx <= bottomX ? left + cx / 2 : h - (cx - bottomX) / 2;
      // SLACK px: the 2:1 edge lands between pixel rows, and the ink outline sits one pixel outside a shape.
      if (y + 0.5 > edge + SLACK) out.push(`${x},${y}`);
    }
  return out;
}

describe('UI.md rule 17: map art stays in its footprint', () => {
  const defs = allDefs().filter((d) => d.sprite);
  it.each(defs.map((d) => [d.id, d] as const))('%s draws nothing over the tiles in front of it', (_id, d) => {
    const [fa, fb] = sizeFor(d.id);
    let worst = 0;
    for (let level = 1; level <= Math.max(1, d.maxLevel ?? 1); level++) worst = Math.max(worst, spill(d.sprite, fa, fb, level).length);
    if (process.env.SPILL_OUT && worst) console.log(`SPILL ${d.id} ${worst}`);
    expect(worst, `${d.id}: pixels below the front edges (cap ${SPILL_ALLOW[d.id] ?? 0})`).toBeLessThanOrEqual(SPILL_ALLOW[d.id] ?? 0);
  });
});
