import { NAMES, TITLES } from '../data/names';
import { EMAS } from '../data/ranking';
import { BASE_ATTRACT, LEVEL_BONUS, START, START_RESIDENTS } from './balance';
import { def } from './content';
import { pick } from './rng';
import { GRID_H, GRID_W, type Building, type BuildingDef, type GameState, type Resident } from './types';

export const SAVE_VERSION = 1;

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
    lastNovelty: 0,
    stats: { earned: 0, spent: 0, arrived: 0, left: 0 },
  };
  const cx = Math.floor(GRID_W / 2);
  const cy = Math.floor(GRID_H / 2);
  addBuilding(s, 'kantorRT', cx, cy, 'active');
  addBuilding(s, 'rumah', cx - 1, cy + 1, 'active');
  addBuilding(s, 'rumah', cx + 1, cy + 1, 'active');
  for (let i = 0; i < START_RESIDENTS; i++) addResident(s);
  s.unlocked = ['warung', 'posRonda', 'selokan', 'kantorRT'];
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
export const buildingAt = (s: GameState, x: number, y: number) => s.buildings.find((b) => b.x === x && b.y === y);
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

export function buildCost(s: GameState, d: BuildingDef): number {
  return price(s, d.cost);
}

export function upgradeCost(s: GameState, b: Building): number {
  return price(s, def(b.def).cost * b.level);
}

export function neighbours(s: GameState, b: { x: number; y: number }, radius = 1): Building[] {
  return s.buildings.filter((o) => (o.x !== b.x || o.y !== b.y) && Math.abs(o.x - b.x) <= radius && Math.abs(o.y - b.y) <= radius);
}

export function emptyTiles(s: GameState): { x: number; y: number }[] {
  const taken = new Set(s.buildings.map((b) => b.y * GRID_W + b.x));
  const out: { x: number; y: number }[] = [];
  for (let y = 0; y < GRID_H; y++) for (let x = 0; x < GRID_W; x++) if (!taken.has(y * GRID_W + x)) out.push({ x, y });
  return out;
}
