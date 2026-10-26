import { NAMES, TITLES } from '../data/names';
import { EMAS } from '../data/ranking';
import { BASE_ATTRACT, LEVEL_BONUS, SPRAWL_FREE, SPRAWL_STEP, START, START_RESIDENTS } from './balance';
import { def, hasDef } from './content';
import { pick } from './rng';
import { lotAt } from './area';
import { GRID_H, GRID_W, setGrid, type Building, type BuildingDef, type GameState, type Resident, type StageState } from './types';

export const SAVE_VERSION = 2;

export const newStageState = (): StageState => ({ current: 'rt', stars: { rt: 0, rw: 0, kelurahan: 0 } });

export function newGame(seed = Date.now() % 2147483647): GameState {
  const s: GameState = {
    version: SAVE_VERSION,
    seed,
    rng: seed,
    month: 0,
    res: { ...START },
    buildings: [],
    nextUid: 1,
    residents: [],
    nextResidentId: 1,
    inflation: 1,
    discovered: [],
    unlocked: [],
    wacana: [],
    modifiers: [],
    ranking: [],
    emas: EMAS.start,
    pendingEvent: null,
    stage: newStageState(),
    neighbours: [],
    stempel: { stock: 0, backlog: 0, clear: 0 },
    debtFree: 0,
    rw: { kaderDecay: 0 },
    kel: { budget: 0, spentBase: 0, serapanRun: 0, cleanAudits: 0 },
    lastNovelty: 0,
    lastArrival: 0,
    stats: { earned: 0, spent: 0, arrived: 0, left: 0 },
  };
  setGrid('rt');
  const cx = Math.floor(GRID_W / 2);
  const cy = Math.floor(GRID_H / 2);
  addBuilding(s, 'kantorRT', cx, cy, 'active');
  addBuilding(s, 'rumah', cx - 1, cy + 1, 'active');
  addBuilding(s, 'rumah', cx + 1, cy + 1, 'active');
  for (let i = 0; i < START_RESIDENTS; i++) addResident(s);
  s.unlocked = ['rumah', 'warung', 'posRonda', 'selokan', 'jalan', 'kantorRT'];
  return s;
}

export function addBuilding(s: GameState, id: string, x: number, y: number, status: Building['status'], invested = 0): Building {
  const b: Building = { uid: s.nextUid++, def: id, x, y, level: 1, status, timer: 0, invested, placedAt: s.month };
  s.buildings.push(b);
  return b;
}

export function addResident(s: GameState): Resident {
  const r: Resident = { id: s.nextResidentId++, name: `${pick(s, TITLES)} ${pick(s, NAMES)}`, job: 'none', pensiun: 0, fake: 0, arrived: s.month };
  s.residents.push(r);
  return r;
}

export const year = (s: GameState) => Math.floor(s.month / 12) + 1;
export const inBounds = (x: number, y: number) => x >= 0 && y >= 0 && x < GRID_W && y < GRID_H;
/** Tiles on each side of a building's footprint. */
export const footprintOf = (id: string) => (hasDef(id) ? def(id).footprint ?? 1 : 1);

/** True when the tile is one of the building's footprint tiles. */
export function covers(b: { def: string; x: number; y: number }, x: number, y: number): boolean {
  const n = footprintOf(b.def);
  return x >= b.x && y >= b.y && x < b.x + n && y < b.y + n;
}

/** Every tile a building covers, top corner first. */
export function tilesOf(b: { def: string; x: number; y: number }): { x: number; y: number }[] {
  const n = footprintOf(b.def);
  const out: { x: number; y: number }[] = [];
  for (let dy = 0; dy < n; dy++) for (let dx = 0; dx < n; dx++) out.push({ x: b.x + dx, y: b.y + dy });
  return out;
}

export const buildingAt = (s: GameState, x: number, y: number) => s.buildings.find((b) => covers(b, x, y));
export const byUid = (s: GameState, uid: number) => s.buildings.find((b) => b.uid === uid);
export const population = (s: GameState) => s.residents.length;
export const levelMult = (level: number) => 1 + LEVEL_BONUS * (level - 1);
export const isWorking = (b: Building) => b.status === 'active';

export function count(s: GameState, id: string, activeOnly = false): number {
  return s.buildings.filter((b) => b.def === id && (!activeOnly || isWorking(b))).length;
}

export function housing(s: GameState): number {
  return s.buildings.reduce((n, b) => n + (def(b.def).housing ?? 0), 0);
}

export function attractTarget(s: GameState): number {
  let t = BASE_ATTRACT;
  for (const b of s.buildings) if (isWorking(b)) t += def(b.def).attract * levelMult(b.level);
  return Math.floor(t);
}

/** Price after inflation, rounded to Rp 1.000. */
export function price(s: GameState, base: number): number {
  return Math.round((base * s.inflation) / 1000) * 1000;
}

/** 1 for a small kampung, then +5% for every building past the eighth. Paths do not count. */
export function sprawl(s: GameState): number {
  const n = s.buildings.filter((b) => !def(b.def).pathIncome).length;
  return 1 + SPRAWL_STEP * Math.max(0, n - SPRAWL_FREE);
}

export function buildCost(s: GameState, d: BuildingDef): number {
  return price(s, d.cost * sprawl(s));
}

export function upgradeCost(s: GameState, b: Building): number {
  return price(s, def(b.def).cost * b.level * sprawl(s));
}

/** Buildings within radius tiles of the tile or footprint, not counting the building itself. */
export function neighbours(s: GameState, b: { x: number; y: number; def?: string }, radius = 1): Building[] {
  const n = b.def ? footprintOf(b.def) : 1;
  return s.buildings.filter((o) => {
    if (o.x === b.x && o.y === b.y) return false;
    const m = footprintOf(o.def);
    return o.x <= b.x + n - 1 + radius && o.x + m - 1 >= b.x - radius && o.y <= b.y + n - 1 + radius && o.y + m - 1 >= b.y - radius;
  });
}

export function emptyTiles(s: GameState): { x: number; y: number }[] {
  const taken = new Set(s.buildings.flatMap((b) => tilesOf(b).map((t) => t.y * GRID_W + t.x)));
  const out: { x: number; y: number }[] = [];
  // Residents only settle inside the player's own RT, never on a seam lot or in a neighbour.
  for (let y = 0; y < GRID_H; y++) for (let x = 0; x < GRID_W; x++) if (!taken.has(y * GRID_W + x) && lotAt(x, y) === 'rt') out.push({ x, y });
  return out;
}

/** Income multiplier for a working building beside a path (4-way, once however many paths touch it). */
export function pathMult(s: GameState, b: Building): number {
  if (!def(b.def).income || def(b.def).pathIncome) return 1;
  let bonus = 0;
  const n = footprintOf(b.def);
  const edge: [number, number][] = [];
  for (let i = 0; i < n; i++) edge.push([b.x + i, b.y - 1], [b.x + i, b.y + n], [b.x - 1, b.y + i], [b.x + n, b.y + i]);
  for (const [x, y] of edge) {
    const o = buildingAt(s, x, y);
    if (o && isWorking(o)) bonus = Math.max(bonus, def(o.def).pathIncome ?? 0);
  }
  return 1 + bonus;
}
