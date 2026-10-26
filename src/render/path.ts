// Grid pathfinding for walkers. Pure, so it is unit-tested without a canvas.

export interface Pt {
  x: number;
  y: number;
}

/**
 * Shortest 4-way path from a to b over walkable tiles, excluding a and including b.
 * Returns null when b cannot be reached.
 */
export function findPath(w: number, h: number, walkable: (x: number, y: number) => boolean, a: Pt, b: Pt): Pt[] | null {
  if (a.x === b.x && a.y === b.y) return [];
  const prev = new Int16Array(w * h).fill(-1);
  const start = a.y * w + a.x;
  const goal = b.y * w + b.x;
  prev[start] = start;
  const queue = [start];
  for (let q = 0; q < queue.length; q++) {
    const k = queue[q];
    if (k === goal) break;
    const x = k % w;
    const y = (k - x) / w;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx;
      const ny = y + dy;
      const n = ny * w + nx;
      if (nx < 0 || ny < 0 || nx >= w || ny >= h || prev[n] !== -1 || !walkable(nx, ny)) continue;
      prev[n] = k;
      queue.push(n);
    }
  }
  if (prev[goal] === -1) return null;
  const out: Pt[] = [];
  for (let k = goal; k !== start; k = prev[k]) out.push({ x: k % w, y: Math.floor(k / w) });
  return out.reverse();
}

/** Free tiles beside a building, where a walker can stand at its door. */
export function doorsOf(w: number, h: number, walkable: (x: number, y: number) => boolean, p: Pt): Pt[] {
  return [[1, 0], [0, 1], [-1, 0], [0, -1]]
    .map(([dx, dy]) => ({ x: p.x + dx, y: p.y + dy }))
    .filter((d) => d.x >= 0 && d.y >= 0 && d.x < w && d.y < h && walkable(d.x, d.y));
}
