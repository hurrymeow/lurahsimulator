// The growing map: promotion, and the AI-run RTs that fill the new space.
import { t } from '../i18n';
import { RIVAL_BASE, RIVAL_PER_YEAR } from '../data/ranking';
import { IURAN, NEIGHBOUR, STEMPEL } from './balance';
import { viewOf } from './neighbourView';
import { cellOf, isSeam, neighbourCells } from './area';
import { activeCombos } from './combos';
import type { Fx } from './gain';
import { gain } from './gain';
import { letterMult } from './rw';
import { pick } from './rng';
import { score } from './ranking';
import { stageDef, goalProgress } from './stages';
import { housing, price } from './state';
import { GRID_W, RT_H, RT_W, setGrid, type Building, type GameState, type Neighbour, type RtTrait, type StageId } from './types';

/** The ladder this engine climbs. Matches `next` in the stage data. */
const NEXT: Partial<Record<StageId, StageId>> = { rt: 'rw', rw: 'kelurahan' };

const TRAITS: RtTrait[] = ['rajin', 'hobi', 'jarang'];

/** What each trait builds next, in order. It repeats once the list runs out. */
const WANTS: Record<RtTrait, string[]> = {
  rajin: ['warung', 'indomaret', 'alfamart', 'warung', 'biopori'],
  hobi: ['posRonda', 'wifi', 'warung', 'posRonda', 'biopori'],
  jarang: ['warung', 'posRonda', 'wifi', 'biopori', 'indomaret'],
};

export const neighbourAt = (s: GameState, x: number, y: number): Building | undefined => {
  const { cx, cy } = cellOf(x, y);
  return s.neighbours.find((n) => n.cx === cx && n.cy === cy)?.buildings.find((b) => b.x === x && b.y === y);
};

function addTo(s: GameState, n: Neighbour, id: string, x: number, y: number): Building {
  const b: Building = { uid: s.nextUid++, def: id, x, y, level: 1, status: 'active', timer: 0, invested: 0, placedAt: s.month };
  n.buildings.push(b);
  return b;
}

function freeTiles(n: Neighbour): { x: number; y: number }[] {
  const taken = new Set(n.buildings.map((b) => `${b.x},${b.y}`));
  const out: { x: number; y: number }[] = [];
  for (let y = n.cy * RT_H; y < (n.cy + 1) * RT_H; y++)
    for (let x = n.cx * RT_W; x < (n.cx + 1) * RT_W; x++) if (!isSeam(x, y) && !taken.has(`${x},${y}`)) out.push({ x, y });
  return out;
}

function newNeighbour(s: GameState, cx: number, cy: number): Neighbour {
  const n: Neighbour = { cx, cy, trait: pick(s, TRAITS), buildings: [], pop: NEIGHBOUR.startPop, stars: 0, funded: 0, everFunded: false, lastBuild: s.month, turns: 0, discovered: [], ranking: [] };
  const mx = cx * RT_W + Math.floor(RT_W / 2);
  const my = cy * RT_H + Math.floor(RT_H / 2);
  addTo(s, n, 'kantorRT', mx, my);
  addTo(s, n, 'rumah', mx - 1, my + 1);
  return n;
}

/** What one Dana costs now. */
export const fundCost = (s: GameState) => price(s, NEIGHBOUR.fundCost);

export function checkFund(s: GameState, n: Neighbour): string | null {
  if (n.funded >= NEIGHBOUR.fundMax) return t('grow.fundFull');
  if (s.res.rupiah < fundCost(s)) return t('grow.fundMoney', { amt: fundCost(s) - Math.floor(s.res.rupiah) });
  return null;
}

/** Dana for one RT: it pays for one more build. */
export function fundNeighbour(s: GameState, n: Neighbour): string | null {
  const why = checkFund(s, n);
  if (why) return why;
  s.res.rupiah -= fundCost(s);
  s.stats.spent += fundCost(s);
  n.funded = Math.min(NEIGHBOUR.fundMax, n.funded + 1);
  n.everFunded = true;
  return null;
}

function build(s: GameState, n: Neighbour): void {
  const v = viewOf(s, n);
  const free = freeTiles(n);
  if (!free.length) return;
  let id: string;
  // Houses and shops take turns, or a full RT would only ever add houses and never find a combo.
  if (n.pop >= housing(v) && n.buildings.at(-1)?.def !== 'rumah') id = 'rumah';
  else {
    const list = WANTS[n.trait];
    id = list[n.buildings.filter((b) => b.def !== 'rumah' && b.def !== 'kantorRT').length % list.length];
  }
  // Settle next to what is already there, like the player's kampung does.
  const near = free.filter((f) => n.buildings.some((b) => Math.abs(b.x - f.x) <= 1 && Math.abs(b.y - f.y) <= 1));
  // Shops go where they have the most different neighbours, which is how combos happen. Ties are drawn.
  const mix = (f: { x: number; y: number }) => new Set(n.buildings.filter((b) => b.def !== 'rumah' && Math.abs(b.x - f.x) <= 1 && Math.abs(b.y - f.y) <= 1).map((b) => b.def)).size;
  const pool = near.length ? near : free;
  const best = id === 'rumah' ? 0 : Math.max(...pool.map(mix));
  const spot = pick(s, id === 'rumah' ? pool : pool.filter((f) => mix(f) === best));
  addTo(s, n, id, spot.x, spot.y);
}

/** Month by month: build when funded, grow, and earn stars by the same checklist the player uses. */
export function neighboursSystem(s: GameState, fx: Fx): void {
  for (const n of s.neighbours) {
    if (n.funded > 0) {
      const every = n.trait === 'rajin' ? NEIGHBOUR.buildEveryRajin : NEIGHBOUR.buildEvery;
      if (s.month - n.lastBuild >= every) {
        n.lastBuild = s.month;
        n.turns++;
        // Hobi Wacana holds a wacana instead of building every third turn.
        if (!(n.trait === 'hobi' && n.turns % 3 === 0)) {
          build(s, n);
          n.funded--;
          // Every build needs a Surat Pengantar stamped by the RW. Jarang Muncul sends twice as many.
          s.stempel.backlog += STEMPEL.perBuild * (n.trait === 'jarang' ? 2 : 1) * letterMult(s);
        }
      }
      const v = viewOf(s, n);
      if (n.pop < housing(v)) n.pop++;
    }
    const v = viewOf(s, n);
    n.discovered = [...new Set([...n.discovered, ...activeCombos(v).map((a) => a.combo.id)])];
    while (n.stars < 3) {
      const goals = stageDef('rt').stars[n.stars as 0 | 1 | 2].goals;
      if (!goals.every((g) => goalProgress(viewOf(s, n), g).have >= g.n)) break;
      n.stars++;
      fx.push({ kind: 'notice', title: t('grow.rtStar', { cell: cellName(n), n: n.stars }), body: t('grow.rtStarBody'), tone: 'info', x: n.cx * RT_W + 4, y: n.cy * RT_H + 6 });
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
export function neighboursYearEnd(s: GameState, year: number): void {
  for (const n of s.neighbours) {
    const us = score(viewOf(s, n));
    const them = RIVAL_BASE + RIVAL_PER_YEAR * year;
    n.ranking.push({ year, us, them, won: us > them });
  }
}

export const cellName = (n: Neighbour): string => `RT ${n.cy * (GRID_W / RT_W) + n.cx + 1}`;

/** Moves the player up a stage: the map grows and the new cells fill with AI RTs. Everything the player built stays where it is. */
export function promote(s: GameState, fx: Fx): boolean {
  const next = NEXT[s.stage.current];
  if (!next) return false;
  s.stage.current = next;
  setGrid(next);
  for (const c of neighbourCells()) if (!s.neighbours.some((n) => n.cx === c.cx && n.cy === c.cy)) s.neighbours.push(newNeighbour(s, c.cx, c.cy));
  // Grup Chat Warga needs two RTs that think alike, so the draw never leaves every trait different.
  if (s.neighbours.length > 1 && new Set(s.neighbours.map((n) => n.trait)).size === s.neighbours.length) s.neighbours[s.neighbours.length - 1].trait = s.neighbours[0].trait;
  s.lastNovelty = s.month;
  fx.push({ kind: 'notice', title: t('grow.promoted'), body: t('grow.promotedBody'), tone: 'good', fanfare: true });
  return true;
}
