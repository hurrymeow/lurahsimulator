import { describe, expect, it } from 'vitest';
import { layoutPoles, SPAN_MAX } from '../src/render/poles';
import { newGame } from '../src/sim/state';

const key = (x: number, y: number) => `${x},${y}`;

/** Every wire hangs over path tiles only, between two poles on one straight run (UI.md rule 17). */
function checkSpans(paths: { uid: number; x: number; y: number }[]): number {
  const on = new Set(paths.map((p) => key(p.x, p.y)));
  const { poles, spans } = layoutPoles(paths);
  for (const p of poles) {
    expect(on.has(key(p.x, p.y))).toBe(true);
    // The foot stays inside its own tile.
    expect(p.a).toBeGreaterThan(p.x);
    expect(p.a).toBeLessThan(p.x + 1);
    expect(p.b).toBeGreaterThan(p.y);
    expect(p.b).toBeLessThan(p.y + 1);
  }
  for (const s of spans) {
    const [p, q] = [poles[s.from], poles[s.to]];
    if (s.axis === 'x') expect(p.y).toBe(q.y);
    else expect(p.x).toBe(q.x);
    expect(s.tiles.length - 1).toBeLessThanOrEqual(SPAN_MAX);
    for (const t of s.tiles) expect(on.has(key(t.x, t.y))).toBe(true);
    // The feet sit across the run within its strip of tiles, so the wire runs over the path.
    if (s.axis === 'x') for (const f of [p, q]) expect(Math.floor(f.b)).toBe(p.y);
    else for (const f of [p, q]) expect(Math.floor(f.a)).toBe(p.x);
  }
  return spans.length;
}

describe('poles and cables', () => {
  it('wire the starter lanes only along the paths, never across the houses', () => {
    const s = newGame(1);
    const paths = s.buildings.filter((b) => b.def === 'jalan');
    expect(checkSpans(paths)).toBeGreaterThan(0);
  });

  it('never wire two poles across a gap, a corner or a diagonal', () => {
    let rnd = 12345;
    const next = () => (rnd = (rnd * 1103515245 + 12345) % 2147483648) / 2147483648;
    for (let run = 0; run < 40; run++) {
      const paths: { uid: number; x: number; y: number }[] = [];
      const seen = new Set<string>();
      let [x, y] = [6, 8];
      for (let uid = 1; paths.length < 60 && uid < 400; uid++) {
        if (!seen.has(key(x, y))) {
          seen.add(key(x, y));
          paths.push({ uid, x, y });
        }
        const r = next();
        if (r < 0.25) x++;
        else if (r < 0.5) x--;
        else if (r < 0.75) y++;
        else y--;
        // Now and then jump, so runs have gaps.
        if (next() < 0.05) [x, y] = [Math.floor(next() * 13), Math.floor(next() * 17)];
      }
      checkSpans(paths);
    }
  });
});
