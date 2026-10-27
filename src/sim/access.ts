// Road access: a building works only when a path links it to the Kantor RT.
import { isSeam, lotAt } from './area';
import { addBuilding } from './state';
import { def } from './content';
import { GRID_H, GRID_W, type Building, type GameState } from './types';

/** Flat pieces are ground, not destinations: they need no road and block nothing. Decorations need no road either. */
export const FLAT = new Set(['selokan', 'biopori', 'kolamIkan', 'kebunSayur', 'sawah', 'kolamLele', 'parkir', 'jalan', 'aspalUlang', 'sawahIrigasi', 'embung', 'taman']);
const ROADS = new Set(['jalan', 'aspalUlang']);
const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];

export const isRoadPiece = (b: Building) => ROADS.has(b.def) && b.status === 'active';
const isHub = (b: Building) => b.def.startsWith('kantor');
/** RW and Kelurahan buildings stand on seam lots, which are roads already. */
const needsRoad = (b: Building) => !FLAT.has(b.def) && def(b.def).category !== 'decoration' && !isHub(b) && (def(b.def).scope ?? 'rt') === 'rt';

/** Tiles a walker or a delivery can stand on: active paths and the dirt seams between cells. */
export function roadTiles(s: GameState): Uint8Array {
  const out = new Uint8Array(GRID_W * GRID_H);
  for (let y = 0; y < GRID_H; y++) for (let x = 0; x < GRID_W; x++) if (isSeam(x, y)) out[y * GRID_W + x] = 1;
  for (const b of s.buildings) if (isRoadPiece(b)) out[b.y * GRID_W + b.x] = 1;
  return out;
}

/** Road tiles reachable from a Kantor's door. Seams link RT cells, so they carry access across the map. */
export function connectedRoad(s: GameState, road = roadTiles(s)): Uint8Array {
  const seen = new Uint8Array(GRID_W * GRID_H);
  const queue: number[] = [];
  const visit = (x: number, y: number) => {
    if (x < 0 || y < 0 || x >= GRID_W || y >= GRID_H) return;
    const k = y * GRID_W + x;
    if (road[k] && !seen[k]) {
      seen[k] = 1;
      queue.push(k);
    }
  };
  for (const b of s.buildings) if (isHub(b) && b.status === 'active') for (const [tx, ty] of ring(b)) visit(tx, ty);
  while (queue.length) {
    const k = queue.pop()!;
    const x = k % GRID_W;
    const y = (k - x) / GRID_W;
    for (const [dx, dy] of DIRS) visit(x + dx, y + dy);
  }
  return seen;
}

/** Tiles edge-adjacent to a building's footprint (top-left x,y), where a door can open. */
export function ring(b: { def: string; x: number; y: number }): [number, number][] {
  const n = def(b.def).footprint ?? 1;
  const out: [number, number][] = [];
  for (let i = 0; i < n; i++) out.push([b.x + i, b.y - 1], [b.x + i, b.y + n], [b.x - 1, b.y + i], [b.x + n, b.y + i]);
  return out;
}

/** True when a road tile that leads to a Kantor touches this building. */
export function hasRoadBeside(conn: Uint8Array, b: Pick<Building, 'def' | 'x' | 'y'>): boolean {
  return ring(b).some(([x, y]) => x >= 0 && y >= 0 && x < GRID_W && y < GRID_H && conn[y * GRID_W + x] === 1);
}

/** Marks every building that cannot reach the Kantor by path. Call after anything moves or changes status. */
/** Tests that are about something else switch the rule off, so they can build anywhere. */
let enforced = true;
export const setRoadRule = (on: boolean): void => {
  enforced = on;
};

export function refreshAccess(s: GameState): void {
  if (!enforced) {
    for (const b of s.buildings) delete b.noRoad;
    return;
  }
  const conn = connectedRoad(s);
  for (const b of s.buildings) {
    if (!needsRoad(b)) delete b.noRoad;
    else if (hasRoadBeside(conn, b)) delete b.noRoad;
    else b.noRoad = true;
  }
}

export const accessSystem = (s: GameState): void => refreshAccess(s);

/**
 * Old saves have no roads. Lay free paths from each cut-off building to the network (or the Kantor),
 * through empty tiles, so loading never switches a whole village off. Runs once per save.
 */
export function layRoads(s: GameState): void {
  s.roadsLaid = true;
  refreshAccess(s);
  const taken = (x: number, y: number) => s.buildings.some((b) => b.x === x && b.y === y);
  for (const b of s.buildings.filter((o) => o.noRoad)) {
    const conn = connectedRoad(s);
    const goal = (x: number, y: number) => conn[y * GRID_W + x] === 1 || s.buildings.some((h) => isHub(h) && ring(h).some(([rx, ry]) => rx === x && ry === y));
    const prev = new Map<number, number>();
    const queue: [number, number][] = [];
    for (const [x, y] of ring(b)) if (x >= 0 && y >= 0 && x < GRID_W && y < GRID_H && !taken(x, y)) {
      prev.set(y * GRID_W + x, -1);
      queue.push([x, y]);
    }
    let end = -1;
    for (let i = 0; i < queue.length && end < 0; i++) {
      const [x, y] = queue[i];
      if (goal(x, y)) { end = y * GRID_W + x; break; }
      for (const [dx, dy] of DIRS) {
        const nx = x + dx;
        const ny = y + dy;
        const k = ny * GRID_W + nx;
        if (nx < 0 || ny < 0 || nx >= GRID_W || ny >= GRID_H || prev.has(k) || taken(nx, ny) || lotAt(nx, ny) !== 'rt') continue;
        prev.set(k, y * GRID_W + x);
        queue.push([nx, ny]);
      }
    }
    for (let k = end; k >= 0; k = prev.get(k)!) {
      const x = k % GRID_W;
      const y = (k - x) / GRID_W;
      if (!conn[k] && !taken(x, y)) addBuilding(s, 'jalan', x, y, 'active');
    }
    refreshAccess(s);
  }
}
