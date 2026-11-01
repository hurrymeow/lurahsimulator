// The scorecard bots and the timeline they leave behind. See GAME-DESIGN.md section 8.
// A bot is a plain routine that plays one sim tick at a time. The recorder logs every tick and every event.
import { eventDef } from '../../src/data/events';
import { lotAt } from '../../src/sim/area';
import { connectedRoad, FLAT, hasRoadBeside } from '../../src/sim/access';
import { liveCombos, parseNeed } from '../../src/sim/combos';
import { def, placeableDefs } from '../../src/sim/content';
import { checkRepair, monthlyNet, repair, resolveEvent } from '../../src/sim/events';
import { fundNeighbour, setAutoFund } from '../../src/sim/grow';
import { meters, sejahtera, laporan } from '../../src/sim/needs';
import { checkRestart, restart } from '../../src/sim/projects';
import { checkPlace, checkUpgrade, place, requirementGaps, siteGaps, skipPermit, upgrade } from '../../src/sim/rules';
import { COMBO_HINT_MONTH, easiestCombo, nextStep } from '../../src/sim/nextstep';
import { acceptSK, canPromote, nextStarChecklist } from '../../src/sim/stages';
import { buildCost, housing, newGame, population, tilesOf } from '../../src/sim/state';
import { tick } from '../../src/sim/tick';
import { announce } from '../../src/sim/wacana';
import { GRID_H, GRID_W, RT_H, RT_W, setGrid, type GameState, type StageId } from '../../src/sim/types';
import type { Fx } from '../../src/sim/gain';

export type BotId = 'idle' | 'builder' | 'shopkeeper' | 'safety' | 'cheapskate' | 'pencitraan' | 'honest' | 'random' | 'hint';
export const BOTS: BotId[] = ['idle', 'builder', 'shopkeeper', 'safety', 'cheapskate', 'pencitraan', 'honest', 'random', 'hint'];

/** One sim tick is 8s of wall time at 1x (one week). */
export const SECONDS_PER_TICK = 8;
export const WACANA_IDS = ['hijau', 'warung', 'gotong', 'digital', 'genangan'];

// ---------------------------------------------------------------- timeline

export interface Row {
  t: number;
  stage: StageId;
  stars: number;
  rupiah: number;
  sabar: number;
  viral: number;
  odn: number;
  pop: number;
  beds: number;
  buildings: number;
  aman: number;
  sejahtera: number;
  laporan: number;
  net: number;
  /** Cost of the cheapest non-decor building the bot could place next, or 0 if none. */
  nextKey: number;
  goalsDone: number;
  goalsTotal: number;
  acts: number;
}

export type TLEvent =
  | { t: number; kind: 'star'; stage: StageId; n: number }
  | { t: number; kind: 'sk' }
  | { t: number; kind: 'promote'; to: StageId }
  | { t: number; kind: 'popup'; id: string }
  | { t: number; kind: 'combo'; id: string }
  | { t: number; kind: 'unlock'; id: string }
  | { t: number; kind: 'resident' }
  | { t: number; kind: 'built'; id: string }
  | { t: number; kind: 'job' | 'level' | 'report' }
  | { t: number; kind: 'goal' }
  | { t: number; kind: 'drop'; res: 'sabar'; amount: number; cause: boolean };

export interface Timeline {
  bot: BotId;
  seed: number;
  rows: Row[];
  events: TLEvent[];
  ticks: number;
  /** Final state facts. */
  end: { stage: StageId; stars: number; sejahtera: number; laporan: number; discovered: string[] };
  /** Stars reached across all stages, as tick numbers, in order. */
  starTicks: number[];
  /** Tick at which each stage was entered. */
  stageTicks: Partial<Record<StageId, number>>;
}

const STAGE_ORDER: StageId[] = ['rt', 'rw', 'kelurahan', 'kecamatan'];
const SCOPES: Record<StageId, string[]> = { rt: ['rt'], rw: ['rt', 'rw'], kelurahan: ['rt', 'rw', 'kel'], kecamatan: ['rt', 'rw', 'kel'] };
/** Stars earned so far across all stages. */
export const totalStars = (s: GameState): number => STAGE_ORDER.reduce((n, id) => n + s.stage.stars[id], 0);

// ---------------------------------------------------------------- moves

interface Ctx {
  s: GameState;
  fx: Fx;
  rnd: () => number;
  acts: number;
  t: number;
  /** Defs with no free spot, by how many buildings stood then. A spot cannot appear until something changes. */
  noSpot: Map<string, number>;
}

/** Whether the tile is a legal site. Requirements and cash do not depend on the tile; `place` checks them once a spot is picked. */
const free = (s: GameState, id: string, p: { x: number; y: number }) => siteGaps(s, def(id), p.x, p.y).length === 0;

function mulberry(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let x = Math.imul(a ^ (a >>> 15), 1 | a);
    x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

/** Street rows of the player's RT, a Jalan Setapak every fourth row joined by a spine through the Kantor. */
const STREETS = [2, 6, 10, 14];
const SPINE_X = 6;
const near = (p: { x: number; y: number }) => Math.abs(p.x - SPINE_X) + Math.abs(p.y - 8);

function laySetapak(c: Ctx): void {
  const { s } = c;
  const tiles: [number, number][] = [];
  for (const y of STREETS) for (let x = 0; x < RT_W; x++) tiles.push([x, y]);
  for (let y = 0; y < RT_H; y++) if (!STREETS.includes(y)) tiles.push([SPINE_X, y]);
  for (const [x, y] of tiles) if (checkPlace(s, 'jalan', x, y).ok ) place(s, 'jalan', x, y);
}

const allCells = (): { x: number; y: number }[] => {
  const cells: { x: number; y: number }[] = [];
  for (let y = 0; y < GRID_H; y++) for (let x = 0; x < GRID_W; x++) cells.push({ x, y });
  return cells;
};

/** Where a player would put this building: beside a street for road-fed ones, in the gaps for flat and decor pieces. */
function spotFor(s: GameState, id: string, around?: { x: number; y: number }): { x: number; y: number } | undefined {
  const d = def(id);
  const scope = d.scope ?? 'rt';
  // A tile under a standing building can never be a spot (a plain path can be built over): skip it before the costly placement check.
  const taken = new Set(s.buildings.filter((b) => b.def !== 'jalan').flatMap((b) => tilesOf(b).map((q) => q.x + q.y * GRID_W)));
  const cells = allCells().filter((p) => !taken.has(p.x + p.y * GRID_W));
  if (around) {
    return [...cells].sort((p, q) => dist(p, around) - dist(q, around)).find((p) => free(s, id, p));
  }
  if (scope !== 'rt') return cells.find((p) => lotAt(p.x, p.y) === scope && free(s, id, p));
  const rtCells = cells.filter((p) => lotAt(p.x, p.y) === 'rt');
  const conn = connectedRoad(s);
  const fedAt = (p: { x: number; y: number }) => hasRoadBeside(conn, { def: id, x: p.x, y: p.y });
  const needsRoad = d.category !== 'decoration' && !FLAT.has(id) && !id.startsWith('kantor');
  // Same picks as filtering every lot first, but stops at the first site that qualifies.
  if (needsRoad) return [...rtCells].sort((p, q) => near(p) - near(q) || p.y - q.y).find((p) => fedAt(p) && free(s, id, p));
  let firstFree: { x: number; y: number } | undefined;
  for (const p of rtCells) {
    if (!free(s, id, p)) continue;
    if (!fedAt(p)) return p;
    firstFree ??= p;
  }
  return firstFree;
}

const dist = (a: { x: number; y: number }, b: { x: number; y: number }) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
const count = (s: GameState, id: string) => s.buildings.filter((b) => b.def === id).length;

/** Buys one building if it is open, affordable beyond the cash buffer, and a spot exists. */
function buy(c: Ctx, id: string, buffer: number, around?: { x: number; y: number }): boolean {
  const { s } = c;
  const d = def(id);
  if (!d.placeable) return false;
  if (s.res.rupiah - buildCost(s, d) < buffer) return false;
  const key = `${s.stage.current}:${totalStars(s)}:${id}`;
  if (!around && c.noSpot.get(key) === s.buildings.length) return false;
  const spot = spotFor(s, id, around);
  if (!spot || !place(s, id, spot.x, spot.y).ok) {
    if (!around) c.noSpot.set(key, s.buildings.length);
    return false;
  }
  c.acts++;
  return true;
}

function openDefs(s: GameState) {
  const scopes = SCOPES[s.stage.current];
  return placeableDefs().filter((d) => scopes.includes(d.scope ?? 'rt') && d.id !== 'jalan');
}

/** Permits skipped, damage mended, stalled projects restarted: what a player does without thinking. */
function maintain(c: Ctx, upgradeAt: number | null): void {
  const { s } = c;
  for (const b of s.buildings) {
    if (b.status === 'permit') { if (skipPermit(s, b).ok) c.acts++; }
    else if (b.status === 'damaged' && checkRepair(s, b).ok) { repair(s, b); c.acts++; }
    else if (b.status === 'mangkrak' && checkRestart(s, b).ok) { restart(s, b); c.acts++; }
    else if (upgradeAt !== null && b.status === 'active' && s.res.rupiah > upgradeAt && checkUpgrade(s, b).ok) { upgrade(s, b); c.acts++; }
  }
}

type EventMode = 'free' | 'paid';

/** The first choice is always free. 'paid' takes the dearest choice it can afford, as a cautious player buys the fix. */
function answerEvent(c: Ctx, mode: EventMode): void {
  const { s } = c;
  if (!s.pendingEvent) return;
  const e = eventDef(s.pendingEvent);
  let pick = 0;
  if (mode === 'paid' && e) for (let i = e.choices.length - 1; i > 0; i--) if (resolvable(s, e.choices[i])) { pick = i; break; }
  resolveEvent(s, c.fx, pick);
  c.acts++;
}
const resolvable = (s: GameState, ch: { cost?: { rupiah?: number; orangDalam?: number } }): boolean => (ch.cost?.rupiah ?? 0) <= s.res.rupiah * 0.5 && (ch.cost?.orangDalam ?? 0) <= s.res.orangDalam;

function promoteWhenOffered(c: Ctx): void {
  const { s } = c;
  if (s.stage.sk && canPromote(s)) {
    const was = s.stage.current;
    if (acceptSK(s, c.fx)) {
      c.acts++;
      if (was === 'rw') for (const n of s.neighbours) setAutoFund(n, 6);
    }
  }
}

function fundAll(c: Ctx, over = 3_000_000): void {
  const { s } = c;
  for (const n of s.neighbours) if (s.res.rupiah > over && fundNeighbour(s, n) === null) c.acts++;
}

/** Houses first when beds run short, then the shared list. */
function keepBeds(c: Ctx, buffer: number): void {
  const { s } = c;
  if (population(s) >= housing(s) - 1) buy(c, 'rumah', buffer);
}

/** The order a plain builder buys in: combo pieces, then what draws residents for the price, decor last. */
function builderOrder(s: GameState): string[] {
  const core = ['posRonda', 'warung', 'wifi'];
  const rest = openDefs(s)
    .filter((d) => !core.includes(d.id) && !d.housing && d.category !== 'decoration')
    .sort((a, b) => (b.attract + b.income / 100_000) / b.cost - (a.attract + a.income / 100_000) / a.cost)
    .map((d) => d.id);
  const decor = openDefs(s).filter((d) => d.category === 'decoration').map((d) => d.id);
  return [...core, ...rest, ...decor];
}

const capOf = (id: string, max?: number): number => Math.min(max ?? 99, id === 'rumah' ? 99 : 3);

function buildFrom(c: Ctx, order: string[], buffer: number, perTick: number, caps: Record<string, number> = {}): void {
  const { s } = c;
  let n = 0;
  for (const id of order) {
    if (n >= perTick) break;
    if (!openDefs(s).some((d) => d.id === id)) continue;
    if (count(s, id) >= (caps[id] ?? capOf(id, def(id).maxCount))) continue;
    if (buy(c, id, buffer)) n++;
  }
}

/** Builds a missing piece of the cheapest combo the player has not found yet, close to a piece already standing. */
function buildCombo(c: Ctx, buffer: number, only?: string[]): void {
  const { s } = c;
  const todo = liveCombos(s).filter((cb) => !s.discovered.includes(cb.id) && !(cb as { brands?: string }).brands && !(cb as { needsJob?: string }).needsJob);
  const scored = todo
    .map((cb) => ({ cb, ids: cb.needs.map((n) => parseNeed(n).id) }))
    .filter(({ ids }) => ids.every((id) => def(id).placeable && openDefs(s).some((d) => d.id === id)) && (!only || ids.every((id) => only.includes(id))))
    .map((x) => ({ ...x, cost: x.ids.reduce((sum, id) => sum + (count(s, id) ? 0 : def(id).cost), 0) }))
    .sort((a, b) => a.cost - b.cost);
  for (const { ids } of scored) {
    const member = s.buildings.find((b) => ids.includes(b.def));
    for (const id of ids) {
      if (s.buildings.some((b) => b.def === id)) continue;
      if (buy(c, id, buffer, member ? { x: member.x, y: member.y } : undefined)) return;
    }
    // Every piece is on the map but none touch: buy one more copy of the last piece beside the first, as the hint says.
    if (ids.length > 1 && ids.every((id) => s.buildings.some((b) => b.def === id))) {
      const anchor = s.buildings.find((b) => b.def === ids[0])!;
      if (buy(c, ids[ids.length - 1], buffer, { x: anchor.x, y: anchor.y })) return;
    }
  }
}

function announceWhen(c: Ctx, mode: 'never' | 'low' | 'always'): void {
  const { s } = c;
  if (mode === 'never') return;
  if (mode === 'low' && !(s.res.sabar < 55 && c.t % 3 === 0)) return;
  if (mode === 'always' && (c.t % 4 !== 0 || s.res.rupiah < 1_500_000)) return;
  const id = WACANA_IDS[Math.floor(c.rnd() * WACANA_IDS.length)];
  if (announce(s, id).ok) c.acts++;
}

// ---------------------------------------------------------------- bots

interface Plan {
  every: number;
  buffer: number;
  perTick: number;
  upgradeAt: number | null;
  announce: 'never' | 'low' | 'always';
  event: EventMode;
  fund: boolean;
  order: (s: GameState) => string[];
  /** 'book': reads the Buku Combo from `comboFrom` and builds the cheapest unfound combo. 'hint': builds only the combo the game points out. */
  combo: 'book' | 'hint' | 'none';
  /** First tick at which the bot reads the book. Before it, money goes to growth. */
  comboFrom: number;
  /** Per-kind limits that replace the default of 3. */
  caps?: Record<string, number>;
}

const shopsFirst = (s: GameState): string[] => {
  const shops = openDefs(s).filter((d) => d.shop || d.income > 0).sort((a, b) => b.income / b.cost - a.income / a.cost).map((d) => d.id);
  return [...shops, ...builderOrder(s)];
};
const safetyFirst = (s: GameState): string[] => ['posRonda', 'posSatpam', 'lampuTaman', 'bidan', 'warung', 'kebunSayur', ...builderOrder(s)];
const noNeeds = (s: GameState): string[] => builderOrder(s).filter((id) => !['posSatpam', 'kebunSayur', 'lampuTaman', 'bidan', 'sawah', 'kandangAyam', 'kolamLele', 'paud'].includes(id));
const needsFirst = (s: GameState): string[] => ['kebunSayur', 'posSatpam', 'lampuTaman', ...builderOrder(s)];

const BASE: Plan = { every: 1, buffer: 200_000, perTick: 2, upgradeAt: 2_000_000, announce: 'low', event: 'free', fund: true, order: builderOrder, combo: 'book', comboFrom: COMBO_HINT_MONTH };
const PLANS: Partial<Record<BotId, Plan>> = {
  builder: BASE,
  shopkeeper: { ...BASE, order: shopsFirst },
  safety: { ...BASE, order: safetyFirst, event: 'paid', caps: { posRonda: 2, posSatpam: 1, lampuTaman: 2, bidan: 1 } },
  cheapskate: { ...BASE, every: 4, buffer: 3_000_000, perTick: 1, upgradeAt: null, announce: 'never' },
  pencitraan: { ...BASE, order: noNeeds, announce: 'always', upgradeAt: 4_000_000 },
  honest: { ...BASE, order: needsFirst, announce: 'never' },
  hint: { ...BASE, combo: 'hint' },
};

function playRandom(c: Ctx): void {
  const { s } = c;
  maintain(c, null);
  fundAll(c);
  const pool = openDefs(s);
  for (let i = 0; i < 2; i++) {
    const d = pool[Math.floor(c.rnd() * pool.length)];
    if (!d || s.res.rupiah < buildCost(s, d) + 200_000) continue;
    const scope = d.scope ?? 'rt';
    for (let k = 0; k < 40; k++) {
      const p = { x: Math.floor(c.rnd() * GRID_W), y: Math.floor(c.rnd() * GRID_H) };
      if (lotAt(p.x, p.y) === scope && place(s, d.id, p.x, p.y).ok) { c.acts++; break; }
    }
  }
}

function playPlan(c: Ctx, p: Plan): void {
  const { s } = c;
  if (c.t % p.every !== 0) return;
  if (c.t === 0) laySetapak(c);
  maintain(c, p.upgradeAt);
  if (p.fund && s.stage.current !== 'rt') fundAll(c);
  keepBeds(c, p.buffer);
  if (p.combo === 'book' && c.t >= p.comboFrom) buildCombo(c, p.buffer);
  if (p.combo === 'hint' && nextStep(s)?.kind === 'combo') {
    const pick = easiestCombo(s);
    if (pick) buildCombo(c, p.buffer, pick.ids);
  }
  buildFrom(c, p.order(s), p.buffer, p.perTick, p.caps);
  announceWhen(c, p.announce);
}

/** One tick of a bot's routine. `idle` only answers events, like a player who walked away and came back to taps. */
export function act(c: Ctx, bot: BotId, plan?: Plan): void {
  const p = plan ?? PLANS[bot];
  answerEvent(c, p?.event ?? 'free');
  promoteWhenOffered(c);
  if (bot === 'idle') return;
  if (bot === 'random') return playRandom(c);
  if (c.s.stage.current === 'rt' && c.t === 0 && bot !== 'hint') laySetapak(c);
  playPlan(c, p!);
}

// ---------------------------------------------------------------- recorder

function goalCounts(s: GameState): { done: number; total: number } {
  const list = nextStarChecklist(s);
  return list ? { done: list.filter((l) => l.done).length, total: list.length } : { done: 0, total: 0 };
}

/** The cheapest kind the player could build now and does not own yet: the next thing worth saving for. */
function nextKeyCost(s: GameState): number {
  const costs = openDefs(s)
    .filter((d) => d.category !== 'decoration' && !d.housing && count(s, d.id) === 0 && requirementGaps(s, d, { ignoreLimit: true }).length === 0)
    .map((d) => buildCost(s, d));
  return costs.length ? Math.min(...costs) : 0;
}

export interface RunOpts {
  /** Stop when this many stars are earned across stages (9 = the end of the content). */
  stopStars?: number;
  /** Start from a state that is already played, instead of a new game. */
  from?: GameState;
  /** Receives the final state, for a run that hands over to another bot. */
  out?: { s?: GameState };
}

/** Plays one bot on one seed and returns what happened, tick by tick. */
export function runBot(bot: BotId, seed: number, ticks: number, opts: RunOpts = {}, plan?: Plan): Timeline {
  setGrid('rt');
  const s = opts.from ?? newGame(seed);
  if (opts.from) setGrid(s.stage.current);
  const rnd = mulberry(seed * 7919 + BOTS.indexOf(bot));
  const rows: Row[] = [];
  const events: TLEvent[] = [];
  const starTicks: number[] = [];
  const stageTicks: Partial<Record<StageId, number>> = { [s.stage.current]: 0 };
  let seenCombos = new Set(s.discovered);
  let seenUnlocked = new Set(s.unlocked);
  let stars = totalStars(s);
  let pop = population(s);
  let lastGoal = goalCounts(s).done;
  let t = 0;
  const noSpot = new Map<string, number>();
  try {
    for (; t < ticks; t++) {
      const c: Ctx = { s, fx: [], rnd, acts: 0, t, noSpot };
      const stage = s.stage.current;
      act(c, bot, plan);
      if (s.stage.current !== stage) {
        events.push({ t, kind: 'promote', to: s.stage.current });
        stageTicks[s.stage.current] = t;
      }
      const sabarBefore = s.res.sabar;
      const fx = tick(s);
      c.fx.push(...fx);
      // A bot that answers an event after the tick sees it next tick, as a player would.
      for (const e of fx) {
        if (e.kind === 'event') events.push({ t, kind: 'popup', id: e.eventId });
        else if (e.kind === 'built') events.push({ t, kind: 'built', id: s.buildings.find((b) => b.uid === e.uid)?.def ?? '?' });
        else if (e.kind === 'job') events.push({ t, kind: 'job' });
        else if (e.kind === 'level') events.push({ t, kind: 'level' });
        else if (e.kind === 'report') events.push({ t, kind: 'report' });
      }
      const drop = s.res.sabar - sabarBefore;
      if (drop < -2) events.push({ t, kind: 'drop', res: 'sabar', amount: drop, cause: fx.some((e) => e.kind === 'pop' && e.res === 'sabar' && e.amount < 0) || fx.some((e) => e.kind === 'notice' && e.tone === 'bad') });
      for (const id of s.discovered) if (!seenCombos.has(id)) { seenCombos.add(id); events.push({ t, kind: 'combo', id }); }
      for (const id of s.unlocked) if (!seenUnlocked.has(id)) { seenUnlocked.add(id); events.push({ t, kind: 'unlock', id }); }
      const now = totalStars(s);
      while (stars < now) { stars++; starTicks.push(t); events.push({ t, kind: 'star', stage: s.stage.current, n: stars }); }
      if (s.stage.sk === 'offered' && !events.some((e) => e.kind === 'sk' && e.t === t)) events.push({ t, kind: 'sk' });
      const p = population(s);
      for (let i = pop; i < p; i++) events.push({ t, kind: 'resident' });
      pop = p;
      const g = goalCounts(s);
      if (g.done > lastGoal) events.push({ t, kind: 'goal' });
      lastGoal = g.done;
      const m = meters(s);
      rows.push({
        t, stage: s.stage.current, stars: s.stage.stars[s.stage.current], rupiah: s.res.rupiah, sabar: s.res.sabar, viral: s.res.viral,
        odn: s.res.orangDalam, pop: p, beds: housing(s), buildings: s.buildings.length, aman: m.aman, sejahtera: sejahtera(m), laporan: laporan(s),
        net: monthlyNet(s), nextKey: nextKeyCost(s), goalsDone: g.done, goalsTotal: g.total, acts: c.acts,
      });
      if (opts.stopStars && now >= opts.stopStars) { t++; break; }
    }
  } finally {
    setGrid('rt');
  }
  if (opts.out) opts.out.s = s;
  const m = meters(s);
  return {
    bot, seed, rows, events, ticks: t, starTicks, stageTicks,
    end: { stage: s.stage.current, stars: s.stage.stars[s.stage.current], sejahtera: sejahtera(m), laporan: laporan(s), discovered: [...s.discovered] },
  };
}

