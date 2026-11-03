// Where the poles beside the jalan setapak stand and which of them are wired together. Pure, so the
// rule-17 test can check it without a canvas: a wire runs only along a straight path between two poles,
// so it hangs over path tiles and never across a house or an empty lot (UI.md rule 17).

export function poleHash(x: number, y: number): number {
  let h = (x * 374761393 + y * 668265263) ^ 0x51ed270b;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

export interface PoleSpot {
  /** The path tile it stands on. */
  x: number;
  y: number;
  /** Tile-space position of the foot, near one edge of that tile. */
  a: number;
  b: number;
  /** Seed for its looks. */
  seed: number;
}

export interface PoleSpan {
  /** Indexes into the poles. */
  from: number;
  to: number;
  /** 'x' when the wire runs along a row (y fixed), 'y' along a column. */
  axis: 'x' | 'y';
  /** The path tiles under the wire, both poles' tiles included. */
  tiles: { x: number; y: number }[];
}

/** Longest span, in tiles. */
export const SPAN_MAX = 9;

/**
 * A pole goes up every four to ten path tiles, counted in build order. It stands on the path tile's
 * edge, on the same side for a whole row or column, so the wires run along the path. It is wired to the
 * nearest earlier pole on the same row or column, at most SPAN_MAX tiles away, with path all the way between.
 */
export function layoutPoles(paths: readonly { uid: number; x: number; y: number }[]): { poles: PoleSpot[]; spans: PoleSpan[] } {
  const sorted = [...paths].sort((p, q) => p.uid - q.uid);
  const on = new Set(sorted.map((b) => `${b.x},${b.y}`));
  const has = (x: number, y: number) => on.has(`${x},${y}`);
  const poles: PoleSpot[] = [];
  const spans: PoleSpan[] = [];
  let next = 4 + Math.floor(poleHash(7, 1) * 7);
  let count = 0;
  for (const b of sorted) {
    if (++count < next) continue;
    count = 0;
    next = 4 + Math.floor(poleHash(b.uid, 2) * 7);
    const alongX = has(b.x - 1, b.y) || has(b.x + 1, b.y);
    const side = (k: number, salt: number) => (poleHash(k, salt) < 0.5 ? 0.14 : 0.86);
    const a = alongX ? b.x + 0.5 : b.x + side(b.x, 5);
    const bb = alongX ? b.y + side(b.y, 3) : b.y + 0.5;
    const me = poles.length;
    poles.push({ x: b.x, y: b.y, a, b: bb, seed: 1000 + b.uid });
    let best: PoleSpan | null = null;
    for (let i = 0; i < me; i++) {
      const q = poles[i];
      const axis = q.y === b.y ? 'x' : q.x === b.x ? 'y' : null;
      if (!axis) continue;
      const d = axis === 'x' ? Math.abs(q.x - b.x) : Math.abs(q.y - b.y);
      if (d > SPAN_MAX || (best && d >= best.tiles.length - 1)) continue;
      const tiles: { x: number; y: number }[] = [];
      let ok = true;
      for (let k = 0; k <= d && ok; k++) {
        const t = axis === 'x' ? { x: Math.min(q.x, b.x) + k, y: b.y } : { x: b.x, y: Math.min(q.y, b.y) + k };
        ok = has(t.x, t.y);
        tiles.push(t);
      }
      if (ok) best = { from: i, to: me, axis, tiles };
    }
    if (best) spans.push(best);
  }
  return { poles, spans };
}
