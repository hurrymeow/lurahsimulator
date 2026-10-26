// Grid pathfinding for walkers. Pure, so it is unit-tested without a canvas.

export interface Pt {
  x: number;
  y: number;
  /** Footprint side, for a building's top corner. Defaults to 1. */
  n?: number;
}

/**
 * Shortest 4-way path from a to b over walkable tiles, excluding a and including b.
 * Returns null when b cannot be reached.
 */
export function findPath(w: number, h: number, walkable: (x: number, y: number) => boolean, a: Pt, b: Pt, cost: (x: number, y: number) => number = () => 1): Pt[] | null {
  if (a.x === b.x && a.y === b.y) return [];
  const prev = new Int16Array(w * h).fill(-1);
  const dist = new Float32Array(w * h).fill(Infinity);
  const start = a.y * w + a.x;
  const goal = b.y * w + b.x;
  prev[start] = start;
  dist[start] = 0;
  // Dijkstra over a small grid. Cheap tiles (paths) pull the route toward them.
  const open = [start];
  while (open.length) {
    let bi = 0;
    for (let i = 1; i < open.length; i++) if (dist[open[i]] < dist[open[bi]]) bi = i;
    const k = open.splice(bi, 1)[0];
    if (k === goal) break;
    const x = k % w;
    const y = (k - x) / w;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx;
      const ny = y + dy;
      const n = ny * w + nx;
      if (nx < 0 || ny < 0 || nx >= w || ny >= h || !walkable(nx, ny)) continue;
      const d = dist[k] + cost(nx, ny);
      if (d >= dist[n]) continue;
      dist[n] = d;
      prev[n] = k;
      open.push(n);
    }
  }
  if (prev[goal] === -1) return null;
  const out: Pt[] = [];
  for (let k = goal; k !== start; k = prev[k]) out.push({ x: k % w, y: Math.floor(k / w) });
  return out.reverse();
}

/** Free tiles beside a building, where a walker can stand at its door. */
export function doorsOf(w: number, h: number, walkable: (x: number, y: number) => boolean, p: Pt): Pt[] {
  const n = p.n ?? 1;
  const ring: Pt[] = [];
  for (let i = 0; i < n; i++) ring.push({ x: p.x + n, y: p.y + i }, { x: p.x + i, y: p.y + n }, { x: p.x - 1, y: p.y + i }, { x: p.x + i, y: p.y - 1 });
  return ring
    .filter((d) => d.x >= 0 && d.y >= 0 && d.x < w && d.y < h && walkable(d.x, d.y));
}
