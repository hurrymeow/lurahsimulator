// The growing map: promotion, and the AI-run RTs that fill the new space.
import { RANKING_WEEKS } from './calendar';
import { t } from '../i18n';
import { RIVAL_BASE, RIVAL_PER_YEAR } from '../data/ranking';
import { IURAN, NEIGHBOUR, STEMPEL } from './balance';
import { inCell, viewOf } from './neighbourView';
import { cellOf, cellOrigin, isSeam, neighbourCells, rwOf, setPlayerCells } from './area';
import { FLAT, layRoads, refreshAccess, ring } from './access';
import { activeCombos } from './combos';
import { COMBOS } from '../data/combos';
import { def } from './content';
import type { Fx } from './gain';
import { gain } from './gain';
import { letterMult } from './rw';
import { pick } from './rng';
import { score } from './ranking';
import { stageDef, goalProgress } from './stages';
import { addResident, bedsOf, covers, housing, price, tilesOf } from './state';
import { RT_H, RT_W, mapSpan, setGrid, type Building, type GameState, type Neighbour, type RtTrait, type StageId } from './types';

/** The ladder this engine climbs. Matches `next` in the stage data. */
const NEXT: Partial<Record<StageId, StageId>> = { rt: 'rw', rw: 'kelurahan' };

const TRAITS: RtTrait[] = ['rajin', 'hobi', 'jarang'];

/**
 * What each trait builds, in its order of taste. All one-tile buildings, each unlocked by the RT's own stars as the
 * player's are. Every list can form at least 3 combos at level 1 (Tongkrongan, Rapat Malam with the Kantor RT, and
 * more), so no trait gets stuck on its combo goal.
 */
export const WANTS: Record<RtTrait, string[]> = {
  // Business-minded: shops and minimarkets, then the services that pair with them.
  rajin: ['warung', 'indomaret', 'posRonda', 'alfamart', 'rumahMakan', 'wifi', 'barbershop', 'kandangAyam', 'bengkel', 'biopori', 'koperasi', 'apotek', 'posSatpam'],
  // Loves a wacana: social spots, greenery and the things a rapat needs.
  hobi: ['posRonda', 'wifi', 'warung', 'pohonRindang', 'biopori', 'rumahMakan', 'bankSampah', 'bangku', 'kebunSayur', 'mural', 'lampuTaman'],
  // Shows up on time: a bit of everything, nothing fancy.
  jarang: ['warung', 'posRonda', 'wifi', 'biopori', 'indomaret', 'rumahMakan', 'kebunSayur', 'barbershop', 'pohonRindang', 'bankSampah', 'kandangAyam', 'koperasi'],
};

/** RT stars a building needs before an AI RT builds it, read from the player's own unlock rule. */
const starsFor = (id: string): number => {
  const st = def(id).requires?.stars;
  return st && (st.stage ?? 'rt') === 'rt' ? st.n : 0;
};

/**
 * The next thing an AI RT builds. First, the missing piece of a level-1 combo it has half built and not found yet,
 * so partners go up one after the other and can stand side by side. Otherwise, of what its stars allow, the kind it
 * has least of, first in its taste on a tie.
 */
export function nextWant(n: Neighbour): string {
  const open = WANTS[n.trait].filter((id) => starsFor(id) <= n.stars);
  const have = (id: string) => n.buildings.filter((b) => b.def === id).length;
  for (const c of COMBOS) {
    if (n.discovered.includes(c.id) || c.needs.some((need) => need.includes('@'))) continue;
    // A pair of the same kind (two wifi) needs two of it.
    const need = (id: string) => c.needs.filter((x) => x === id).length;
    const missing = c.needs.filter((id) => have(id) < need(id));
    const started = c.needs.some((id) => have(id) > 0 && id !== 'kantorRT');
    if (started && missing.length && missing.every((id) => open.includes(id))) return missing[0];
  }
  return open.reduce((best, id) => (have(id) < have(best) ? id : best), open[0]);
}

export const neighbourAt = (s: GameState, x: number, y: number): Building | undefined => {
  const { cx, cy } = cellOf(x, y);
  return s.neighbours.find((n) => n.cx === cx && n.cy === cy)?.buildings.find((b) => covers(b, x, y));
};

function addTo(s: GameState, n: Neighbour, id: string, x: number, y: number, rot: 0 | 1 = 0): Building {
  const b: Building = { uid: s.nextUid++, def: id, x, y, level: 1, status: 'active', timer: 0, invested: 0, placedAt: s.month };
  if (rot) b.rot = rot;
  n.buildings.push(b);
  return b;
}

/** Every tile the RT's buildings cover, so a big building never lands on part of another. */
const takenTiles = (n: Neighbour): Set<string> => new Set(n.buildings.flatMap((b) => tilesOf(b).map((p) => `${p.x},${p.y}`)));

/** How a building fits at a free tile of the RT's lot: unturned, turned, or not at all. */
function fitAt(n: Neighbour, taken: Set<string>, id: string, x: number, y: number): 0 | 1 | null {
  const o = cellOrigin(n.cx, n.cy);
  const ok = (rot: 0 | 1) => tilesOf({ def: id, x, y, rot }).every((p) => p.x >= o.x && p.y >= o.y && p.x < o.x + RT_W && p.y < o.y + RT_H && !isSeam(p.x, p.y) && !taken.has(`${p.x},${p.y}`));
  return ok(0) ? 0 : ok(1) ? 1 : null;
}

/** True when the RT's lot has no free tile left: Dana then waits, so the screen says why. */
export const lotFull = (n: Neighbour): boolean => freeTiles(n).length === 0;

function freeTiles(n: Neighbour): { x: number; y: number }[] {
  const taken = takenTiles(n);
  const out: { x: number; y: number }[] = [];
  const o = cellOrigin(n.cx, n.cy);
  for (let y = o.y; y < o.y + RT_H; y++)
    for (let x = o.x; x < o.x + RT_W; x++) if (!isSeam(x, y) && !taken.has(`${x},${y}`)) out.push({ x, y });
  return out;
}

// ---------- Jalan Setapak ----------

/** A path tile the AI lays, like the player's Jalan Setapak. */
const PATH = 'jalan';
/** Buildings that need a path to the Kantor, by the same rule as the player's (flat pieces and the Kantor do not). */
const wantsPath = (b: Building) => !FLAT.has(b.def) && !b.def.startsWith('kantor');
/** What the RT has built, leaving out its paths. */
export const builtBy = (n: Neighbour): Building[] => n.buildings.filter((b) => b.def !== PATH);

/**
 * Lays Jalan Setapak from a building to the RT's network, as the player must: the tiles round its Kantor RT, or a path
 * already laid. Shortest route over free tiles inside the RT's own cell. False when no route exists.
 */
export function layAiPath(s: GameState, n: Neighbour, b: Building): boolean {
  const key = (x: number, y: number) => y * 100_000 + x;
  const inside = (x: number, y: number) => cellOf(x, y).cx === n.cx && cellOf(x, y).cy === n.cy && !isSeam(x, y);
  const taken = new Set<number>();
  const roads = new Set<number>();
  for (const o of n.buildings) {
    if (o.def === PATH) roads.add(key(o.x, o.y));
    else for (const p of tilesOf(o)) taken.add(key(p.x, p.y));
  }
  const door = new Set<number>();
  for (const k of n.buildings.filter((o) => o.def.startsWith('kantor'))) for (const [x, y] of ring(k)) if (inside(x, y) && !taken.has(key(x, y))) door.add(key(x, y));
  const goal = (k: number) => roads.has(k) || door.has(k);
  const open = (x: number, y: number) => inside(x, y) && !taken.has(key(x, y));
  const prev = new Map<number, number>();
  const queue: [number, number][] = [];
  for (const [x, y] of ring(b)) if (open(x, y) && !prev.has(key(x, y))) {
    prev.set(key(x, y), -1);
    queue.push([x, y]);
  }
  for (let i = 0; i < queue.length; i++) {
    const [x, y] = queue[i];
    if (goal(key(x, y))) {
      for (let k = key(x, y); k >= 0; k = prev.get(k)!) if (!roads.has(k)) addTo(s, n, PATH, k % 100_000, Math.floor(k / 100_000));
      return true;
    }
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx;
      const ny = y + dy;
      if (!open(nx, ny) || prev.has(key(nx, ny))) continue;
      prev.set(key(nx, ny), key(x, y));
      queue.push([nx, ny]);
    }
  }
  return false;
}

/** Old saves: link every building an AI RT already has. Runs once per RT. */
function linkAll(s: GameState, n: Neighbour): void {
  for (const b of builtBy(n)) if (wantsPath(b)) layAiPath(s, n, b);
  n.pathsLaid = true;
}

function newNeighbour(s: GameState, cx: number, cy: number): Neighbour {
  const n: Neighbour = { cx, cy, trait: pick(s, TRAITS), buildings: [], pop: NEIGHBOUR.startPop, stars: 0, funded: 0, everFunded: false, lastBuild: s.month, turns: 0, discovered: [], ranking: [] };
  const mx = cellOrigin(cx, cy).x + Math.floor(RT_W / 2);
  const my = cellOrigin(cx, cy).y + Math.floor(RT_H / 2);
  addTo(s, n, 'kantorRT', mx, my);
  addTo(s, n, 'rumah', mx - 1, my + 1);
  linkAll(s, n);
  return n;
}

/** What one Dana costs now. */
export const fundCost = (s: GameState) => price(s, NEIGHBOUR.fundCost);

/** How many of `count` builds still fit in the bank. */
const room = (n: Neighbour, count: number) => Math.max(0, Math.min(count, NEIGHBOUR.fundMax - n.funded));

export function checkFund(s: GameState, n: Neighbour, count = 1): string | null {
  if (n.run === 'player') return t('grow.takeoverAlready');
  const k = room(n, count);
  if (!k) return t('grow.fundFull', { n: NEIGHBOUR.fundMax });
  if (s.res.rupiah < fundCost(s) * k) return t('grow.fundMoney', { amt: fundCost(s) * k - Math.floor(s.res.rupiah) });
  return null;
}

/** Dana for one RT: each pays for one more build. Asking for more than fits banks only what fits. */
export function fundNeighbour(s: GameState, n: Neighbour, count = 1): string | null {
  const why = checkFund(s, n, count);
  if (why) return why;
  const k = room(n, count);
  s.res.rupiah -= fundCost(s) * k;
  s.stats.spent += fundCost(s) * k;
  n.funded += k;
  n.everFunded = true;
  return null;
}

/** How much faster banked Dana makes an RT build, as a fraction: 0.82 is +82%. Diminishing returns. */
export const boostOf = (n: Neighbour): number => (n.funded > 1 ? NEIGHBOUR.boostMax * (1 - NEIGHBOUR.boostDecay ** (n.funded - 1)) : 0);

/** Months between builds at no boost. */
export const buildEvery = (n: Neighbour): number => (n.trait === 'rajin' ? NEIGHBOUR.buildEveryRajin : NEIGHBOUR.buildEvery);

/** Auto-dana: off (0) or one of the levels it keeps the bank topped up to. */
export function setAutoFund(n: Neighbour, keep: number): void {
  n.autoKeep = (NEIGHBOUR.autoLevels as readonly number[]).includes(keep) ? keep : 0;
}

/** The kas never drops below this to auto-fund. */
export const autoFloor = (s: GameState) => price(s, NEIGHBOUR.autoFloor);

/** About what auto-dana spends a month on this RT at its level: one Dana per build, at the boosted pace. */
export const autoMonthly = (s: GameState, n: Neighbour): number =>
  n.autoKeep ? Math.round((fundCost(s) * (1 + NEIGHBOUR.boostMax * (1 - NEIGHBOUR.boostDecay ** (n.autoKeep - 1)))) / buildEvery(n)) : 0;

// ---------- player-run RTs ----------

/** Keeps the lot map in step with which RTs the player runs. Call after loading, promotion, takeover and hand-back. */
export const syncArea = (s: GameState): void => setPlayerCells(s.neighbours.filter((n) => n.run === 'player'));

/** Why this RT cannot be taken over now, or null. Only RTs in the player's own RW, and it costs Orang Dalam. */
export function checkTakeover(s: GameState, n: Neighbour): string | null {
  if (n.run === 'player') return t('grow.takeoverAlready');
  const { rx, ry } = rwOf(n.cx, n.cy);
  if (rx || ry) return t('grow.takeoverOwnRw');
  if (s.res.orangDalam < NEIGHBOUR.takeoverOd) return t('grow.takeoverOd', { n: NEIGHBOUR.takeoverOd });
  return null;
}

/**
 * The player takes an RT over: its buildings join the player's, its warga become the player's residents, and any
 * banked Dana comes back to the kas. Its stars, ranking and combos stay with the RT.
 */
export function takeover(s: GameState, n: Neighbour): string | null {
  const why = checkTakeover(s, n);
  if (why) return why;
  s.res.orangDalam -= NEIGHBOUR.takeoverOd;
  s.res.rupiah += fundCost(s) * n.funded;
  s.buildings.push(...n.buildings);
  for (let i = 0; i < n.pop; i++) addResident(s);
  n.buildings = [];
  n.pop = 0;
  n.funded = 0;
  // Remembered, so handing it back resumes Auto-dana where the player left it.
  n.autoBefore = n.autoKeep ?? 0;
  n.autoKeep = 0;
  n.progress = 0;
  n.run = 'player';
  syncArea(s);
  // Its buildings were laid out by the AI, so link any that a path does not reach.
  s.roadsLaid = false;
  layRoads(s);
  return null;
}

/**
 * Hands a player-run RT back to the AI: every building in its cell goes back, finished as it stands, and as many
 * warga as its houses hold leave the player's list with it. Staff stay with the player.
 */
export function handBack(s: GameState, n: Neighbour): void {
  if (n.run !== 'player') return;
  const mine = s.buildings.filter((b) => inCell(n, b));
  s.buildings = s.buildings.filter((b) => !inCell(n, b));
  for (const b of mine) {
    b.status = 'active';
    b.timer = 0;
    delete b.noRoad;
  }
  n.buildings = mine;
  const beds = mine.reduce((sum, b) => sum + bedsOf(b), 0);
  const leaving = s.residents.filter((r) => r.staffId === undefined).slice(-beds);
  const gone = new Set(leaving.map((r) => r.id));
  s.residents = s.residents.filter((r) => !gone.has(r.id));
  n.pop = leaving.length;
  n.progress = 0;
  n.lastBuild = s.month;
  // The player may have built where the AI's paths ran: link everything again next month.
  n.pathsLaid = false;
  // Auto-dana comes back on at the level it had before the takeover, so the RT does not sit unfunded.
  n.autoKeep = n.autoBefore ?? 0;
  delete n.autoBefore;
  delete n.run;
  syncArea(s);
  refreshAccess(s);
}

/** Each month, auto-dana tops every RT that has it on back up to its level, while the kas stays above the floor. */
function autoFund(s: GameState): void {
  for (const n of s.neighbours) {
    if (n.run === 'player') continue;
    while (n.autoKeep && n.funded < n.autoKeep && s.res.rupiah - fundCost(s) >= autoFloor(s)) fundNeighbour(s, n);
  }
}

function build(s: GameState, n: Neighbour): void {
  const v = viewOf(s, n);
  const free = freeTiles(n);
  if (!free.length) return;
  let id: string;
  const built = builtBy(n);
  // Houses and shops take turns, or a full RT would only ever add houses and never find a combo.
  if (n.pop >= housing(v) && built.at(-1)?.def !== 'rumah') id = 'rumah';
  else {
    id = nextWant(n);
  }
  // A big building needs every tile of its footprint free: keep only the spots it fits, turned if need be.
  const taken = takenTiles(n);
  const rotAt = new Map<string, 0 | 1>();
  for (const f of free) {
    const r = fitAt(n, taken, id, f.x, f.y);
    if (r !== null) rotAt.set(`${f.x},${f.y}`, r);
  }
  const fits = free.filter((f) => rotAt.has(`${f.x},${f.y}`));
  if (!fits.length) {
    if (id === 'rumah') return;
    // No room for it: a house instead, so a crowded RT still grows.
    id = 'rumah';
    for (const f of free) rotAt.set(`${f.x},${f.y}`, 0);
  }
  const rotOf = (f: { x: number; y: number }) => rotAt.get(`${f.x},${f.y}`) ?? 0;
  const spots = fits.length ? fits : free;
  // Settle next to what is already there, like the player's kampung does.
  const near = spots.filter((f) => built.some((b) => Math.abs(b.x - f.x) <= 1 && Math.abs(b.y - f.y) <= 1));
  // Shops go where they have the most different neighbours, which is how combos happen. Ties are drawn.
  const mix = (f: { x: number; y: number }) => new Set(built.filter((b) => b.def !== 'rumah' && Math.abs(b.x - f.x) <= 1 && Math.abs(b.y - f.y) <= 1).map((b) => b.def)).size;
  const pool = near.length ? near : spots;
  // A spot that completes a combo it has not found wins outright: the AI looks for combos as a player would.
  const combosHere = () => activeCombos(viewOf(s, n)).filter((a) => !n.discovered.includes(a.combo.id)).length;
  const fresh = id === 'rumah' ? [] : (() => {
    const base = combosHere();
    const out: { x: number; y: number }[] = [];
    for (const f of pool) {
      addTo(s, n, id, f.x, f.y, rotOf(f));
      if (combosHere() > base) out.push(f);
      n.buildings.pop();
    }
    return out;
  })();
  const best = id === 'rumah' ? 0 : Math.max(...pool.map(mix));
  const first = fresh.length ? pick(s, fresh) : pick(s, id === 'rumah' ? pool : pool.filter((f) => mix(f) === best));
  // Like the player, the AI needs a path to the Kantor: try the chosen spot, then the rest of the pool, then anywhere free.
  const tries = [first, ...pool.filter((f) => f !== first), ...spots.filter((f) => !pool.includes(f))];
  for (const spot of tries.slice(0, 40)) {
    const b = addTo(s, n, id, spot.x, spot.y, rotOf(spot));
    if (!wantsPath(b) || layAiPath(s, n, b)) return;
    n.buildings.pop();
  }
  // Boxed in everywhere: build anyway, so the RT never stalls on a full lot.
  addTo(s, n, id, first.x, first.y, rotOf(first));
}

/** True for an RT inside the player's own RW, the first RW of every map. */
const ownRw = (n: { cx: number; cy: number }): boolean => {
  const { rx, ry } = rwOf(n.cx, n.cy);
  return rx === 0 && ry === 0;
};

/** Month by month: build when funded, grow, and earn stars by the same checklist the player uses. */
export function neighboursSystem(s: GameState, fx: Fx): void {
  autoFund(s);
  for (const n of s.neighbours) {
    if (n.run !== 'player' && !n.pathsLaid) linkAll(s, n);
    if (n.run !== 'player' && n.funded > 0) {
      // Progress toward the next build: one build every `buildEvery` months, faster with more Dana banked.
      n.progress = (n.progress ?? 0) + (1 + boostOf(n)) / buildEvery(n);
      if (n.progress >= 1) {
        n.progress = Math.min(1, n.progress - 1);
        n.lastBuild = s.month;
        n.turns++;
        // Hobi Wacana holds a wacana instead of building every third turn.
        if (!(n.trait === 'hobi' && n.turns % 3 === 0)) {
          build(s, n);
          n.funded--;
          // Every build needs a Surat Pengantar stamped by the RW. Jarang Muncul sends twice as many.
          // On a Kelurahan map the other RWs stamp their own; only the player's RW queues at the player.
          if (ownRw(n)) s.stempel.backlog += STEMPEL.perBuild * (n.trait === 'jarang' ? 2 : 1) * letterMult(s);
        }
      }
      const v = viewOf(s, n);
      if (n.pop < housing(v)) n.pop++;
    }
    const v = viewOf(s, n);
    n.discovered = [...new Set([...n.discovered, ...activeCombos(v).map((a) => a.combo.id)])];
    while (n.stars < 3) {
      const goals = stageDef('rt').stars[n.stars as 0 | 1 | 2].goals;
      // The player's RT 3★ asks for more residents (pace, decisions/rt-3star-pace.md); the AI RTs keep the old bar.
      if (!goals.every((g) => goalProgress(viewOf(s, n), g).have >= (g.kind === 'residents' ? Math.min(g.n, NEIGHBOUR_RESIDENTS_BAR) : g.n))) break;
      n.stars++;
      fx.push({ kind: 'notice', title: t('grow.rtStar', { cell: cellName(n), n: n.stars }), body: t('grow.rtStarBody'), tone: 'info', x: cellOrigin(n.cx, n.cy).x + 4, y: cellOrigin(n.cx, n.cy).y + 6 });
    }
  }
}

/** Stamps refill, letters get stamped, and every letter left waiting costs Sabar. */
export function stempelSystem(s: GameState, fx: Fx): void {
  if (s.stage.current === 'rt') return;
  const st = s.stempel;
  const balai = s.buildings.filter((b) => b.def === 'balaiRW' && b.status === 'active').length;
  st.stock = Math.min(STEMPEL.stockMax, st.stock + STEMPEL.base + balai * STEMPEL.perBalai);
  const used = Math.min(st.stock, st.backlog);
  st.stock -= used;
  st.backlog -= used;
  if (st.backlog) gain(s, fx, 'sabar', -st.backlog * STEMPEL.sabarPerLetter, s.buildings.find((b) => b.def === 'kantorRT'));
  st.clear = st.backlog < STEMPEL.clearUnder ? st.clear + 1 : 0;
}

/** Counts months in a row with no RT in debt. AI RTs run on the player's Dana, so only the kas can go negative. */
export function debtSystem(s: GameState): void {
  s.debtFree = s.res.rupiah >= 0 ? s.debtFree + 1 : 0;
}

/** Kas RW: every RT in the area pays iuran into the player's kas. */
export function iuranFromNeighbours(s: GameState, fx: Fx): void {
  let total = 0;
  for (const n of s.neighbours) total += n.pop * IURAN * (n.trait === 'rajin' ? NEIGHBOUR.rajinIuran : 1);
  const kantor = s.buildings.find((b) => b.def === 'kantorRT');
  if (total) gain(s, fx, 'rupiah', Math.round(total), kantor);
}

/** Yearly: AI RTs are ranked on the same formula, and the RW or Kelurahan score is the sum. */
/** The score an AI RT must beat at the year end of `year` (1 at the end of the first year). */
export const rivalTarget = (year: number): number => RIVAL_BASE + RIVAL_PER_YEAR * year;

/** The next year-end ranking: which year it closes, and how many months away. */
/** Residents an AI RT needs for a star, whatever the player's own bar is. */
const NEIGHBOUR_RESIDENTS_BAR = 40;

export const nextRanking = (s: GameState) => ({ year: Math.floor(s.month / RANKING_WEEKS) + 1, weeks: RANKING_WEEKS - (s.month % RANKING_WEEKS) });

export function neighboursYearEnd(s: GameState, year: number): void {
  for (const n of s.neighbours) {
    const us = score(viewOf(s, n));
    const them = rivalTarget(year);
    n.ranking.push({ year, us, them, won: us > them });
  }
}

export const cellName = (n: Neighbour): string => `RT ${n.cy * mapSpan() + n.cx + 1}`;

/** Moves the player up a stage: the map grows and the new cells fill with AI RTs. Everything the player built stays where it is. */
export function promote(s: GameState, fx: Fx): boolean {
  const next = NEXT[s.stage.current];
  if (!next) return false;
  s.stage.current = next;
  setGrid(next);
  syncArea(s);
  for (const c of neighbourCells()) if (!s.neighbours.some((n) => n.cx === c.cx && n.cy === c.cy)) s.neighbours.push(newNeighbour(s, c.cx, c.cy));
  // Grup Chat Warga needs two RTs that think alike, so the draw never leaves every trait different.
  if (s.neighbours.length > 1 && new Set(s.neighbours.map((n) => n.trait)).size === s.neighbours.length) s.neighbours[s.neighbours.length - 1].trait = s.neighbours[0].trait;
  s.lastNovelty = s.month;
  fx.push({ kind: 'notice', title: t('grow.promoted'), body: t('grow.promotedBody'), tone: 'good', fanfare: true });
  return true;
}
