import { afterEach, describe, expect, it } from 'vitest';
import { cellOf, cellOrigin, lotAt, ungapTile } from '../src/sim/area';
import { goalProgress, nextStarChecklist } from '../src/sim/stages';
import { viewOf } from '../src/sim/neighbourView';
import { FLAT, connectedRoad, hasRoadBeside } from '../src/sim/access';
import { absorb, checkVisit, visit, nextWant, rivalTarget, lotFull, builtBy, layAiPath, autoFloor, autoMonthly, boostOf, checkFund, checkTakeover, fundCost, fundNeighbour, handBack, neighboursSystem, promote, setAutoFund, takeover } from '../src/sim/grow';
import { NEIGHBOUR, STEMPEL } from '../src/sim/balance';

const NEIGHBOUR_LETTERS = STEMPEL.perBuild;
import { checkPlace, place, siteGaps } from '../src/sim/rules';
import { def } from '../src/sim/content';
import { areaScore, scoreParts } from '../src/sim/ranking';
import { deserialize, serialize } from '../src/sim/save';
import { addBuilding, addResident, emptyTiles, housing, newGame, population, sprawl, tilesOf } from '../src/sim/state';
import { tick } from '../src/sim/tick';
import { CELL_H, CELL_W, GRID_H, GRID_W, RT_H, RT_W, SEAM, mapSpan, setGrid } from '../src/sim/types';

afterEach(() => setGrid('rt'));

/** One month, with any event waved through so the clock keeps moving. */
const step = (s: ReturnType<typeof newGame>) => {
  s.pendingEvent = null;
  tick(s);
};

const grown = (stage: 'rw' | 'kelurahan' = 'rw') => {
  const s = newGame(7);
  s.stage.current = 'rt';
  if (stage === 'kelurahan') promote(s, []);
  s.stage.stars[stage === 'kelurahan' ? 'rw' : 'rt'] = 3;
  s.stage.current = stage === 'kelurahan' ? 'rw' : 'rt';
  promote(s, []);
  return s;
};

/**
 * The next cell run by the AI. Since docs/plans/second-rt.md no RW has an AI RT in play: the first are RW 2's, at the
 * Kelurahan. The AI's rules do not depend on the cell, so these tests keep one AI RT next door on the smallest map.
 */
const aiNextDoor = (s: ReturnType<typeof newGame>) => {
  const n = s.neighbours[0];
  n.absorbed = false;
  handBack(s, n);
  return s;
};
const withAi = () => aiNextDoor(grown());

describe('growing map', () => {
  it('grows the grid at RW and again at Kelurahan, never moving what the player built', () => {
    const s = newGame(1);
    const before = s.buildings.map((b) => [b.x, b.y]);
    expect([GRID_W, GRID_H]).toEqual([RT_W, RT_H]);
    promote(s, []);
    expect([GRID_W, GRID_H]).toEqual([RT_W * 2 + SEAM, RT_H]);
    expect(s.neighbours).toHaveLength(1);
    promote(s, []);
    expect([GRID_W, GRID_H]).toEqual([RT_W * 2 + SEAM, RT_H * 2 + SEAM]);
    expect(s.neighbours).toHaveLength(3);
    expect(s.buildings.slice(0, before.length).map((b) => [b.x, b.y])).toEqual(before);
  });

  it('reports the map span in RTs across and down', () => {
    const s = newGame(1);
    expect(mapSpan()).toEqual({ w: 1, h: 1 });
    promote(s, []);
    expect(mapSpan()).toEqual({ w: 2, h: 1 });
  });

  it('keeps Kampung Sebelah the player\'s at the Kelurahan, and RW 2 brings the first AI RTs', () => {
    const s = grown();
    const kept = s.buildings.map((b) => b.uid);
    promote(s, []);
    for (const uid of kept) expect(s.buildings.map((b) => b.uid)).toContain(uid);
    expect(s.neighbours).toHaveLength(3);
    expect(s.neighbours.filter((n) => n.run !== 'player').map((n) => n.cy)).toEqual([1, 1]);
  });

  it('stops at the top of the ladder', () => {
    const s = newGame(1);
    s.stage.current = 'kecamatan';
    expect(promote(s, [])).toBe(false);
  });
});

describe('lots', () => {
  it('is all RT at the RT stage', () => {
    for (let y = 0; y < RT_H; y++) for (let x = 0; x < RT_W; x++) expect(lotAt(x, y)).toBe('rt');
  });

  it('gives the RW seams to RW buildings and the other RTs to the AI', () => {
    withAi();
    expect(lotAt(2, 2)).toBe('rt');
    // The RT keeps its edge rows: the seam starts just past them, and runs the full height.
    expect(lotAt(RT_W - 1, 2)).toBe('rt');
    expect(lotAt(2, RT_H - 1)).toBe('rt');
    expect(lotAt(RT_W, 2)).toBe('rw');
    expect(lotAt(RT_W + 1, 2)).toBe('rw');
    expect(lotAt(RT_W, RT_H - 1)).toBe('rw');
    expect(lotAt(CELL_W, 3)).toBe('other');
    expect(lotAt(CELL_W + 3, 3)).toBe('other');
  });

  it('puts the RW boundary on the Kelurahan lots', () => {
    grown('kelurahan');
    // The horizontal seam between the two RWs is the Kelurahan's.
    expect(lotAt(3, CELL_H - SEAM)).toBe('kel');
    expect(lotAt(3, CELL_H - 1)).toBe('kel');
    expect(lotAt(RT_W, 3)).toBe('rw');
    // The vertical seam in RW 2 is not the player's.
    expect(lotAt(CELL_W, CELL_H + 3)).toBe('other');
    expect(lotAt(CELL_W + 2, CELL_H + 2)).toBe('other');
  });

  it('lets the player build RT buildings on an AI RT\'s free lots, never on its buildings, its seams or with an RW building', () => {
    const s = withAi();
    s.res.rupiah = 50_000_000;
    const n = s.neighbours[0];
    const o = cellOrigin(n.cx, n.cy);
    const taken = (x: number, y: number) => n.buildings.some((b) => b.x === x && b.y === y);
    let spot = { x: -1, y: -1 };
    for (let y = o.y + 1; y < o.y + RT_H - 1 && spot.x < 0; y++) for (let x = o.x + 1; x < o.x + RT_W - 1; x++) if (!taken(x, y) && checkPlace(s, 'warung', x, y).ok) { spot = { x, y }; break; }
    expect(spot.x).toBeGreaterThanOrEqual(0);
    const k = n.buildings.find((b) => b.def === 'kantorRT')!;
    expect(checkPlace(s, 'warung', k.x, k.y).ok).toBe(false);
    expect(siteGaps(s, def('balaiRW'), spot.x, spot.y)).toEqual(['Another RT: only RT buildings go on its lots.']);
    const seam = checkPlace(s, 'warung', RT_W, 3);
    expect(seam.ok).toBe(false);
    expect(checkPlace(s, 'warung', 2, 2)).toEqual({ ok: true });
  });

  it('Kunjungan: 1 Orang Dalam, the RT builds now and gains warga, once a quarter per RT', () => {
    const s = withAi();
    const n = s.neighbours[0];
    s.res.orangDalam = 3;
    n.pop = 1;
    const built = builtBy(n).length;
    const pop = n.pop;
    expect(checkVisit(s, n)).toBeNull();
    expect(visit(s, n)).toBeNull();
    expect(s.res.orangDalam).toBe(2);
    expect(builtBy(n).length).toBe(built + 1);
    expect(n.pop).toBeGreaterThan(pop);
    // The same RT waits a quarter; the key is not spent on a refusal.
    expect(visit(s, n)).toBe('Visited lately. Again in 12 weeks.');
    expect(s.res.orangDalam).toBe(2);
    s.month += 12;
    expect(checkVisit(s, n)).toBeNull();
    s.res.orangDalam = 0;
    expect(checkVisit(s, n)).toBe('Needs 1 Orang Inside.');
  });

  it('a building the player puts in an AI RT counts for that RT, and the AI never builds over it', () => {
    const s = withAi();
    s.res.rupiah = 500_000_000;
    const n = s.neighbours[0];
    const o = cellOrigin(n.cx, n.cy);
    const mine: { x: number; y: number }[] = [];
    for (let y = o.y + 1; y < o.y + RT_H - 1 && mine.length < 3; y++)
      for (let x = o.x + 1; x < o.x + RT_W - 1 && mine.length < 3; x++)
        if (checkPlace(s, 'rumah', x, y).ok) {
          place(s, 'rumah', x, y);
          mine.push({ x, y });
        }
    expect(mine).toHaveLength(3);
    for (const b of s.buildings) if (b.def === 'rumah') b.status = 'active';
    expect(viewOf(s, n).buildings.filter((b) => b.def === 'rumah').length).toBe(n.buildings.filter((b) => b.def === 'rumah').length + 3);
    setAutoFund(n, 12);
    for (let m = 0; m < 120; m++) neighboursSystem(s, []);
    for (const p of mine) expect(n.buildings.some((b) => tilesOf(b).some((t) => t.x === p.x && t.y === p.y)), `${p.x},${p.y}`).toBe(false);
  });

  it('lets RW and Kelurahan buildings stand inside the RT as well as on their own seams', () => {
    const s = grown('kelurahan');
    const free = (id: string, ok: (x: number, y: number) => boolean) => {
      for (let y = 0; y < GRID_H; y++) for (let x = 0; x < GRID_W; x++) if (ok(x, y) && siteGaps(s, def(id), x, y).length === 0) return { x, y };
      return null;
    };
    const inRt = (x: number, y: number) => x < RT_W - 1 && y < RT_H - 1;
    expect(free('balaiRW', inRt)).not.toBeNull();
    expect(free('kantorKel', inRt)).not.toBeNull();
    expect(free('balaiRW', (x, y) => lotAt(x, y) === 'rw')).not.toBeNull();
    // Each keeps to its own seam: an RW building never on the Kelurahan seam, nor the other way round.
    expect(siteGaps(s, def('balaiRW'), 3, CELL_H - SEAM)).toEqual(['Goes inside your RT or on a seam lot between your RTs.']);
    expect(siteGaps(s, def('kantorKel'), RT_W, 3)).toEqual(['Goes inside your RT or on the wide seam between the RWs.']);
    // RT buildings still stay off the seams.
    expect(siteGaps(s, def('warung'), RT_W, 3)).toHaveLength(1);
  });

  it('refuses a tile an AI building holds', () => {
    const s = withAi();
    s.res.rupiah = 50_000_000;
    const b = s.neighbours[0].buildings[0];
    const r = checkPlace(s, 'warung', b.x, b.y);
    expect(r.ok).toBe(false);
  });

  it('settles new residents only inside the player RT', () => {
    const s = withAi();
    expect(emptyTiles(s).every((p) => lotAt(p.x, p.y) === 'rt')).toBe(true);
  });
});

describe('AI neighbours', () => {
  it('stall until funded, then build', () => {
    const s = withAi();
    const n = s.neighbours[0];
    const start = n.buildings.length;
    s.res.rupiah = 50_000_000;
    for (let i = 0; i < 12; i++) step(s);
    expect(n.buildings).toHaveLength(start);
    expect(fundNeighbour(s, n)).toBeNull();
    expect(n.funded).toBe(1);
    for (let i = 0; i < 6; i++) step(s);
    expect(n.buildings.length).toBeGreaterThan(start);
    expect(n.funded).toBe(0);
    // One Dana pays for one build, so it stalls again.
    const after = n.buildings.length;
    for (let i = 0; i < 12; i++) step(s);
    expect(n.buildings).toHaveLength(after);
  });

  it('build only inside their own cell, off the seams', () => {
    const s = withAi();
    s.res.rupiah = 1e12;
    s.res.sabar = 100;
    for (let i = 0; i < 80; i++) {
      for (const n of s.neighbours) fundNeighbour(s, n);
      step(s);
    }
    for (const n of s.neighbours) {
      expect(n.buildings.length).toBeGreaterThan(2);
      for (const b of n.buildings) {
        expect(cellOf(b.x, b.y)).toEqual({ cx: n.cx, cy: n.cy });
        expect(lotAt(b.x, b.y)).toBe('other');
      }
      expect(new Set(n.buildings.map((b) => `${b.x},${b.y}`)).size).toBe(n.buildings.length);
    }
  });

  it('earn stars by the same checklist as the player', () => {
    const s = withAi();
    const n = s.neighbours[0];
    n.pop = 12;
    n.discovered = ['tongkrongan'];
    tick(s);
    expect(n.stars).toBeGreaterThanOrEqual(1);
  });

  it('earns its 2nd star on the RT checklist without a ranking win', () => {
    const s = withAi();
    const n = s.neighbours[0];
    n.stars = 1;
    n.pop = 25;
    n.discovered = ['tongkrongan', 'rapatMalam'];
    // Two social buildings put its own Sabar over the 2nd-star bar.
    const o = cellOrigin(n.cx, n.cy);
    for (const [i, id] of ['posRonda', 'wifi'].entries()) n.buildings.push({ uid: s.nextUid++, def: id, x: o.x + 2 + i, y: o.y + 2, level: 1, status: 'active', timer: 0, invested: 0, placedAt: 0 });
    expect(n.ranking).toEqual([]);
    neighboursSystem(s, []);
    expect(n.stars).toBe(2);
  });

  it('pay iuran into the kas, Rajin more', () => {
    const s = withAi();
    const a = s.neighbours[0];
    a.trait = 'jarang';
    s.neighbours.forEach((n) => (n.pop = 0));
    a.pop = 10;
    const base = tick(s) && s.res.rupiah;
    const t2 = newGame(7);
    expect(base).toBeGreaterThan(t2.res.rupiah - 1e9);
    const r1 = withAi();
    r1.neighbours.forEach((n) => (n.pop = 0));
    r1.neighbours[0].trait = 'jarang';
    r1.neighbours[0].pop = 10;
    const r2 = withAi();
    r2.neighbours.forEach((n) => (n.pop = 0));
    r2.neighbours[0].trait = 'rajin';
    r2.neighbours[0].pop = 10;
    tick(r1);
    tick(r2);
    expect(r2.res.rupiah - r1.res.rupiah).toBe(Math.round(10 * 25_000 * 0.2));
  });

  it('count in the area score used for ranking', () => {
    const s = withAi();
    const solo = areaScore({ ...s, neighbours: [] });
    expect(areaScore(s)).toBeGreaterThan(solo);
  });

  it('cannot be funded without the rupiah, or past the cap', () => {
    const s = withAi();
    s.res.rupiah = 0;
    expect(checkFund(s, s.neighbours[0])).toContain('Need');
    s.res.rupiah = 1e9;
    expect(fundNeighbour(s, s.neighbours[0], NEIGHBOUR.fundBulk)).toBeNull();
    expect(s.neighbours[0].funded).toBe(NEIGHBOUR.fundBulk);
    // A big Dana banks only what still fits.
    for (let i = 0; i < 3; i++) fundNeighbour(s, s.neighbours[0], NEIGHBOUR.fundBulk);
    expect(s.neighbours[0].funded).toBe(NEIGHBOUR.fundMax);
    expect(fundNeighbour(s, s.neighbours[0])).toContain('bank is full');
  });

  it('builds faster with more Dana banked, with diminishing returns', () => {
    const n = withAi().neighbours[0];
    const at = (k: number) => ((n.funded = k), boostOf(n));
    expect(at(1)).toBe(0);
    expect(at(3)).toBeGreaterThan(0.3);
    expect(at(6) - at(3)).toBeGreaterThan(at(12) - at(9));
    expect(at(NEIGHBOUR.fundMax)).toBeLessThanOrEqual(NEIGHBOUR.boostMax);
    // Six banked: a Jarang Muncul RT builds about every 1.8 months instead of 3.
    const s = withAi();
    const j = s.neighbours[0];
    j.trait = 'jarang';
    s.res.rupiah = 1e9;
    fundNeighbour(s, j, 12);
    const before = j.buildings.length;
    for (let m = 0; m < 12; m++) step(s);
    expect(j.buildings.length - before).toBeGreaterThanOrEqual(6);
  });

  it('auto-dana tops an RT back up each month and keeps the kas above the floor', () => {
    const s = withAi();
    const n = s.neighbours[0];
    s.res.rupiah = 1e9;
    setAutoFund(n, 6);
    step(s);
    expect(n.funded).toBeGreaterThanOrEqual(5);
    setAutoFund(n, 4);
    expect(n.autoKeep).toBe(0);
    setAutoFund(n, 3);
    n.funded = 0;
    s.res.rupiah = autoFloor(s) + fundCost(s) * 1.5;
    step(s);
    expect(s.res.rupiah).toBeGreaterThanOrEqual(autoFloor(s) - fundCost(s));
    expect(autoMonthly(s, n)).toBeGreaterThan(0);
  });
});

describe('save', () => {
  it('round-trips a grown map and restores the grid', () => {
    const s = withAi();
    const raw = serialize(s);
    setGrid('rt');
    const back = deserialize(raw)!;
    expect(back.stage.current).toBe('rw');
    expect(back.neighbours).toHaveLength(1);
    expect([GRID_W, GRID_H]).toEqual([RT_W * 2 + SEAM, RT_H]);
  });

  it('moves an old grown map apart so the seams sit between the RTs', () => {
    const s = withAi();
    const raw = JSON.parse(serialize(s));
    delete raw.gapped;
    // Old layout: the seam was the RT's own last column (12) and the next cell's first (13).
    raw.buildings.push({ uid: 9001, def: 'warung', x: 5, y: 5, level: 1, status: 'active', timer: 0, invested: 0, placedAt: 0 });
    raw.buildings.push({ uid: 9002, def: 'warung', x: RT_W - 1, y: 4, level: 1, status: 'active', timer: 0, invested: 0, placedAt: 0 });
    raw.neighbours[0].buildings = [{ uid: 9003, def: 'warung', x: RT_W + 4, y: 4, level: 1, status: 'active', timer: 0, invested: 0, placedAt: 0 }];
    setGrid('rt');
    const back = deserialize(JSON.stringify(raw))!;
    const at = (uid: number) => back.buildings.concat(back.neighbours.flatMap((n) => n.buildings)).find((b) => b.uid === uid)!;
    expect([at(9001).x, at(9001).y]).toEqual([5, 5]);
    expect([at(9002).x, at(9002).y]).toEqual([RT_W, 4]);
    expect(lotAt(at(9002).x, at(9002).y)).toBe('rw');
    expect([at(9003).x, at(9003).y]).toEqual([CELL_W + 4, 4]);
    expect(back.gapped).toBe(true);
  });

  it('maps old seam tiles onto the new seam band', () => {
    expect([12, 13].map((v) => ungapTile(v, RT_W, 2))).toEqual([RT_W, RT_W + 1]);
    expect([0, 11, 14, 25].map((v) => ungapTile(v, RT_W, 2))).toEqual([0, 11, CELL_W + 1, CELL_W + 12]);
  });

  it('adds an empty neighbour list to an older save', () => {
    const s = newGame(3);
    const raw = JSON.parse(serialize(s));
    delete raw.neighbours;
    const back = deserialize(JSON.stringify(raw))!;
    expect(back.neighbours).toEqual([]);
    expect([GRID_W, GRID_H]).toEqual([RT_W, RT_H]);
  });

  it('loads a version 3 RT save as version 4', () => {
    const raw = JSON.parse(serialize(newGame(1)));
    raw.version = 3;
    const back = deserialize(JSON.stringify(raw))!;
    expect(back.version).toBe(4);
    expect(back.stage.current).toBe('rt');
  });

  it('refuses a version 3 save past the RT', () => {
    const raw = JSON.parse(serialize(withAi()));
    raw.version = 3;
    expect(deserialize(JSON.stringify(raw))).toBeNull();
  });
});

describe('RW goals and Stempel', () => {
  const line = (s: ReturnType<typeof newGame>, kind: string) => nextStarChecklist(s, s.stage.current)!.find((l) => l.goal.kind === kind)!;

  it('piles letters up when builds outrun the stamps, and costs Sabar', () => {
    const s = grown('kelurahan');
    s.stage.current = 'kelurahan';
    s.stempel.backlog = 9;
    s.res.sabar = 60;
    step(s);
    // 1 stamp clears 1 letter, 8 wait and drain half a Sabar each.
    expect(s.stempel.backlog).toBe(8);
    expect(s.stempel.clear).toBe(0);
    expect(s.res.sabar).toBeLessThan(60);
  });

  it('counts clear months in a row, and a Balai RW adds a stamp', () => {
    const s = grown();
    s.stempel.sent = true;
    for (let i = 0; i < 3; i++) step(s);
    expect(s.stempel.clear).toBe(3);
    s.stempel.backlog = 20;
    s.stempel.stock = 0;
    s.buildings.push({ uid: 999, def: 'balaiRW', x: 2, y: 2, level: 1, status: 'active', timer: 0, invested: 0, placedAt: 0 });
    step(s);
    expect(s.stempel.backlog).toBe(18);
    expect(s.stempel.clear).toBe(0);
  });

  it('on a Kelurahan map only the RTs in the player\'s own RW send letters to the player', () => {
    const s = grown('kelurahan');
    s.res.rupiah = 1e9;
    s.stempel.backlog = 0;
    // RW 2 stamps its own: no AI RT sits in the player's top row, so nothing reaches the player's backlog.
    const far = s.neighbours.find((n) => n.cy === 1)!;
    s.neighbours.forEach((n) => { n.funded = 0; n.trait = 'rajin'; });
    fundNeighbour(s, far);
    far.progress = 1;
    neighboursSystem(s, []);
    expect(far.turns).toBe(1);
    expect(s.stempel.backlog).toBe(0);
  });

  it('counts Kampung Sebelah at a star, and ranking wins by tier', () => {
    const s = withAi();
    s.stage.current = 'rw';
    s.stage.stars.rt = 3;
    s.stage.stars.rw = 1;
    s.neighbours.forEach((n) => (n.stars = 1));
    expect(line(s, 'sebelahAtStars').goal).toMatchObject({ n: 1 });
    expect(line(s, 'sebelahAtStars').done).toBe(true);
    s.ranking.push({ tier: 'rt', year: 1, us: 9, them: 1, won: true });
    expect(line(s, 'tierWins').done).toBe(false);
    s.ranking.push({ tier: 'rw', year: 4, us: 9, them: 1, won: true });
    expect(line(s, 'tierWins').done).toBe(true);
  });

  it('names Kampung Sebelah as the neighbour at cell (1,0)', () => {
    const s = grown('kelurahan');
    s.neighbours.forEach((n) => (n.stars = 0));
    s.neighbours.find((n) => n.cx === 1 && n.cy === 1)!.stars = 3;
    expect(goalProgress(s, { kind: 'sebelahAtStars', n: 2 })).toEqual({ have: 0, need: 2 });
    s.neighbours.find((n) => n.cx === 1 && n.cy === 0)!.stars = 2;
    expect(goalProgress(s, { kind: 'sebelahAtStars', n: 2 })).toEqual({ have: 2, need: 2 });
  });

  it('reads RW 2 as the lowest star in the cy 1 row, or 0 when there are none', () => {
    const s = grown('kelurahan');
    s.neighbours.forEach((n) => (n.stars = 3));
    s.neighbours.find((n) => n.cx === 0 && n.cy === 1)!.stars = 1;
    expect(goalProgress(s, { kind: 'rw2AtStars', n: 2 })).toEqual({ have: 1, need: 2 });
    s.neighbours.find((n) => n.cx === 0 && n.cy === 1)!.stars = 3;
    expect(goalProgress(s, { kind: 'rw2AtStars', n: 2 })).toEqual({ have: 3, need: 2 });
    s.neighbours = [];
    expect(goalProgress(s, { kind: 'rw2AtStars', n: 1 })).toEqual({ have: 0, need: 1 });
    expect(goalProgress(s, { kind: 'sebelahAtStars', n: 1 })).toEqual({ have: 0, need: 1 });
  });

  it('counts months out of debt', () => {
    const s = withAi();
    s.stage.current = 'rw';
    s.month = 30;
    s.res.rupiah = 5e7;
    for (let i = 0; i < 3; i++) step(s);
    expect(s.debtFree).toBe(3);
    s.res.rupiah = -9e9;
    step(s);
    expect(s.debtFree).toBe(0);
  });
});

describe('the 2nd RT', () => {
  /** A free tile for `id` in the RT at (cx, 0). */
  const spot = (s: ReturnType<typeof newGame>, id: string, cx: number) => {
    const o = cellOrigin(cx, 0);
    for (let y = o.y; y < o.y + RT_H; y++) for (let x = o.x; x < o.x + RT_W; x++) if (checkPlace(s, id, x, y).ok) return { x, y };
    throw new Error(`no spot for ${id}`);
  };
  const rich = () => {
    const s = grown();
    s.res.rupiah = 1e9;
    return s;
  };

  it('joins the player at the RW, with its Kantor RT, its Rumah and their warga', () => {
    const before = newGame(7);
    const s = rich();
    const n = s.neighbours[0];
    expect(n.run).toBe('player');
    expect(n.absorbed).toBe(true);
    expect(n.buildings).toEqual([]);
    expect(s.buildings.some((b) => b.def === 'kantorRT' && cellOf(b.x, b.y).cx === 1)).toBe(true);
    expect(s.residents.length).toBe(before.residents.length + NEIGHBOUR.startPop);
  });

  it('serves a building there with no road across the seam', () => {
    const s = rich();
    const o = cellOrigin(1, 0);
    const conn = connectedRoad(s);
    const kantor = s.buildings.find((b) => b.def === 'kantorRT' && b.x >= o.x)!;
    expect(hasRoadBeside(conn, { def: 'warung', x: kantor.x + 1, y: kantor.y })).toBeTypeOf('boolean');
    expect(s.buildings.filter((b) => b.x >= o.x && b.def === 'rumah').every((b) => hasRoadBeside(conn, b))).toBe(true);
  });

  it('sends letters for a build there, never for the home RT, a seam lot or at the Kelurahan', () => {
    const s = rich();
    const home = spot(s, 'warung', 0);
    place(s, 'warung', home.x, home.y);
    expect(s.stempel.backlog).toBe(0);
    const seam = (() => {
      for (let y = 0; y < RT_H; y++) for (let x = 0; x < GRID_W; x++) if (lotAt(x, y) === 'rw' && checkPlace(s, 'balaiRW', x, y).ok) return { x, y };
      throw new Error('no seam spot');
    })();
    place(s, 'balaiRW', seam.x, seam.y);
    expect(s.stempel.backlog).toBe(0);
    const there = spot(s, 'warung', 1);
    place(s, 'warung', there.x, there.y);
    expect(s.stempel.backlog).toBe(NEIGHBOUR_LETTERS);
    promote(s, []);
    expect(s.stempel.backlog).toBe(0);
    const later = spot(s, 'warung', 1);
    place(s, 'warung', later.x, later.y);
    expect(s.stempel.backlog).toBe(0);
  });

  it('counts the RW 1★ Stempel goal only after the first letter', () => {
    const s = rich();
    step(s);
    step(s);
    expect(s.stempel.clear).toBe(0);
    const there = spot(s, 'warung', 1);
    place(s, 'warung', there.x, there.y);
    step(s);
    step(s);
    step(s);
    expect(s.stempel.sent).toBe(true);
    expect(s.stempel.clear).toBeGreaterThan(0);
  });

  it('counts what the player builds there, not what it came with', () => {
    const s = rich();
    const goal = { kind: 'sebelahBuilds', n: 3 } as const;
    expect(goalProgress(s, goal).have).toBe(0);
    const there = spot(s, 'warung', 1);
    place(s, 'warung', there.x, there.y);
    expect(goalProgress(s, goal).have).toBe(0);
    s.buildings.find((b) => b.x === there.x && b.y === there.y)!.status = 'active';
    expect(goalProgress(s, goal).have).toBe(1);
  });

  it('earns its stars from what the player builds', () => {
    const s = rich();
    const n = s.neighbours[0];
    expect(n.stars).toBe(0);
    s.res.sabar = 80;
    for (const id of ['rumah', 'rumah', 'rumah', 'rumah', 'warung', 'posRonda']) {
      const at = spot(s, id, 1);
      place(s, id, at.x, at.y);
      s.buildings.find((b) => b.x === at.x && b.y === at.y)!.status = 'active';
    }
    while (population(s) < housing(s)) addResident(s);
    step(s);
    expect(n.stars).toBeGreaterThan(0);
  });

  it('turns an old RW save\'s AI-run Sebelah over to the player on load', () => {
    const s = withAi();
    expect(s.neighbours[0].run).not.toBe('player');
    const loaded = deserialize(serialize(s))!;
    expect(loaded.neighbours[0].run).toBe('player');
    expect(loaded.neighbours[0].absorbed).toBe(true);
    expect(loaded.neighbours[0].buildings).toEqual([]);
  });
});

describe('combos count across RTs', () => {
  it("an AI RT's combos goal uses the most combos any RT has, the player's own check stays its own", () => {
    const s = grown('kelurahan');
    const n = s.neighbours.find((x) => x.run !== 'player')!;
    s.discovered = ['a', 'b', 'c'];
    n.discovered = [];
    const combos = { kind: 'combos', n: 3 } as const;
    expect(goalProgress(viewOf(s, n), combos).have).toBe(3);
    s.discovered = [];
    s.neighbours[0].discovered = ['x', 'y'];
    expect(goalProgress(viewOf(s, n), combos).have).toBe(2);
    expect(goalProgress(s, combos).have).toBe(0);
  });

  it('an all-Rajin RW reaches 3 stars on auto-dana', () => {
    for (const seed of [1, 2, 3]) {
      const s = newGame(seed);
      s.stage.stars.rt = 3;
      // The player's own RT reached 3 stars, which takes 3 combos.
      s.discovered = ['tongkrongan', 'rapatMalam', 'perangKuota'];
      promote(s, []);
      s.stage.current = 'rw';
      aiNextDoor(s);
      s.neighbours.forEach((n) => { n.trait = 'rajin'; setAutoFund(n, 6); });
      for (let m = 0; m < 6 * 12; m++) {
        s.res.rupiah = 1e9;
        step(s);
      }
      for (const n of s.neighbours) {
        expect(n.stars, `seed ${seed}`).toBe(3);
      }
    }
  });
});

describe('player-run RTs', () => {
  /** An empty tile inside a neighbour's cell, away from its buildings. */
  const spotIn = (s: ReturnType<typeof grown>, i: number, id = 'rumah') => {
    const n = s.neighbours[i];
    for (let y = cellOrigin(n.cx, n.cy).y + 2; y < cellOrigin(n.cx, n.cy).y + RT_H - 2; y++)
      for (let x = cellOrigin(n.cx, n.cy).x + 2; x < cellOrigin(n.cx, n.cy).x + RT_W - 2; x++) if (checkPlace(s, id, x, y).ok) return { x, y };
    throw new Error('no spot');
  };

  it('a takeover costs Orang Dalam, moves the RT into the player list, and opens its lots to build on', () => {
    const s = withAi();
    s.stage.current = 'rw';
    const n = s.neighbours[0];
    s.res.orangDalam = 0;
    expect(checkTakeover(s, n)).toContain('Orang Inside');
    s.res.orangDalam = NEIGHBOUR.takeoverOd + 1;
    s.res.rupiah = 1e9;
    fundNeighbour(s, n, 6);
    const kas = s.res.rupiah;
    const theirs = n.buildings.map((b) => b.uid);
    const pop = population(s);
    const warga = n.pop;
    expect(lotAt(n.buildings[0].x, n.buildings[0].y)).toBe('other');
    expect(takeover(s, n)).toBeNull();
    expect(s.res.orangDalam).toBe(1);
    expect(s.res.rupiah).toBe(kas + fundCost(s) * 6);
    expect(n.run).toBe('player');
    expect(n.buildings).toHaveLength(0);
    for (const uid of theirs) expect(s.buildings.some((b) => b.uid === uid)).toBe(true);
    expect(population(s)).toBe(pop + warga);
    const p = spotIn(s, 0);
    expect(lotAt(p.x, p.y)).toBe('rt');
    expect(checkFund(s, n)).not.toBeNull();
    expect(checkTakeover(s, n)).not.toBeNull();
  });

  it('a player-run RT earns its stars from its own lots', () => {
    const s = withAi();
    s.stage.current = 'rw';
    s.discovered = ['tongkrongan'];
    s.res.orangDalam = 10;
    const n = s.neighbours[0];
    takeover(s, n);
    for (let i = 0; i < 4; i++) {
      const p = spotIn(s, 0);
      addBuilding(s, 'rumah', p.x, p.y, 'active');
    }
    while (population(s) < 60) addResident(s);
    step(s);
    expect(n.stars).toBeGreaterThanOrEqual(1);
  });

  it('hands back to the AI with its buildings and warga, keeps staff, and the save keeps who runs what', () => {
    const s = withAi();
    s.stage.current = 'rw';
    s.res.orangDalam = 10;
    const n = s.neighbours[0];
    takeover(s, n);
    const p = spotIn(s, 0);
    addBuilding(s, 'rumah', p.x, p.y, 'active');
    // Round trip while player-run: the lots stay the player's.
    const back = deserialize(serialize(s))!;
    expect(back.neighbours[0].run).toBe('player');
    expect(lotAt(p.x, p.y)).toBe('rt');
    const mine = s.buildings.length;
    const pop = population(s);
    handBack(s, n);
    expect(n.run).toBeUndefined();
    expect(n.buildings.some((b) => b.x === p.x && b.y === p.y)).toBe(true);
    expect(s.buildings.length).toBeLessThan(mine);
    expect(population(s) + n.pop).toBe(pop);
    expect(lotAt(p.x, p.y)).toBe('other');
    expect(s.residents.every((r) => r.staffId === undefined || s.staff?.some((x) => x.id === r.staffId))).toBe(true);
  });

  it('only RTs in the player own RW can be taken over', () => {
    const rwMap = withAi();
    rwMap.res.orangDalam = 99;
    expect(checkTakeover(rwMap, rwMap.neighbours[0])).toBeNull();
    const s = grown('kelurahan');
    s.res.orangDalam = 99;
    const far = s.neighbours.find((n) => n.cy === 1)!;
    expect(checkTakeover(s, far)).not.toBeNull();
  });

  it('counts a player-run RT once in the area score', () => {
    const s = withAi();
    s.stage.current = 'rw';
    s.res.orangDalam = 10;
    const before = areaScore(s);
    takeover(s, s.neighbours[0]);
    // Its buildings and warga moved into the player's score; the RT itself adds nothing on top.
    expect(areaScore(s)).toBeLessThan(before * 1.5);
  });
});

describe('AI paths', () => {
  it('every AI RT lays Jalan Setapak so its buildings reach the Kantor RT, as the player must', () => {
    for (const seed of [1, 2, 3]) {
      const s = newGame(seed);
      s.stage.stars.rt = 3;
      s.discovered = ['tongkrongan', 'rapatMalam', 'perangKuota'];
      promote(s, []);
      s.stage.current = 'rw';
      aiNextDoor(s);
      s.neighbours.forEach((n) => setAutoFund(n, 6));
      for (let m = 0; m < 5 * 12; m++) {
        s.res.rupiah = 1e9;
        step(s);
      }
      for (const n of s.neighbours) {
        const v = viewOf(s, n);
        const conn = connectedRoad(v);
        const need = builtBy(n).filter((b) => b.def !== 'kantorRT' && !FLAT.has(b.def));
        const linked = need.filter((b) => hasRoadBeside(conn, b));
        expect(n.buildings.some((b) => b.def === 'jalan'), `seed ${seed}`).toBe(true);
        expect(linked.length / need.length, `seed ${seed} ${n.trait}`).toBeGreaterThanOrEqual(0.95);
        // Paths are not buildings: the RT's build order and count ignore them.
        expect(builtBy(n).every((b) => b.def !== 'jalan')).toBe(true);
      }
    }
  });

  it('links an old save whose AI RT has no paths, once', () => {
    const s = withAi();
    const n = s.neighbours[0];
    n.buildings = n.buildings.filter((b) => b.def !== 'jalan');
    delete n.pathsLaid;
    step(s);
    expect(n.pathsLaid).toBe(true);
    expect(n.buildings.some((b) => b.def === 'jalan')).toBe(true);
    expect(layAiPath(s, n, n.buildings.find((b) => b.def === 'rumah')!)).toBe(true);
  });
});


describe('AI RT views', () => {
  it('stand in a resident with no job for every warga, so job combos never read a hole', () => {
    const s = withAi();
    const v = viewOf(s, s.neighbours[0]);
    expect(v.residents.length).toBe(s.neighbours[0].pop);
    for (const r of v.residents) expect(r.job).toBe('none');
  });
});

describe('AI RT variety', () => {
  it('each trait builds at least 10 kinds of building and finds 3 combos or more, reaching 3 stars', () => {
    for (const trait of ['rajin', 'hobi', 'jarang'] as const) {
      for (const seed of [1, 2, 3]) {
        const s = newGame(seed);
        s.stage.stars.rt = 3;
        s.discovered = ['tongkrongan', 'rapatMalam', 'perangKuota'];
        promote(s, []);
        s.stage.current = 'rw';
        aiNextDoor(s);
        s.neighbours.forEach((n) => { n.trait = trait; setAutoFund(n, 6); });
        for (let m = 0; m < 10 * 12; m++) {
          s.res.rupiah = 1e9;
          step(s);
        }
        const n = s.neighbours[0];
        const kinds = new Set(builtBy(n).map((b) => b.def).filter((d) => d !== 'rumah' && d !== 'kantorRT'));
        expect(kinds.size, `${trait} ${seed}`).toBeGreaterThanOrEqual(10);
        expect(n.discovered.length, `${trait} ${seed}`).toBeGreaterThanOrEqual(3);
        expect(n.stars, `${trait} ${seed}`).toBe(3);
      }
    }
  }, 60_000);

  it('builds the missing partner of a combo it has half built', () => {
    const s = withAi();
    const n = s.neighbours[0];
    n.trait = 'hobi';
    n.stars = 2;
    n.discovered = [];
    n.buildings.push({ uid: s.nextUid++, def: 'bankSampah', x: cellOrigin(n.cx, n.cy).x + 2, y: cellOrigin(n.cx, n.cy).y + 2, level: 1, status: 'active', timer: 0, invested: 0, placedAt: 0 });
    // Kali Bersih needs Bank Sampah and Biopori: the Biopori comes next.
    expect(nextWant(n)).toBe('biopori');
  });

  it('explains a score by its parts', () => {
    const s = withAi();
    const p = scoreParts(viewOf(s, s.neighbours[0]));
    expect(Math.abs(p.residents + p.buildings + p.combos + p.sabar - p.total)).toBeLessThanOrEqual(2);
    expect(rivalTarget(2)).toBeGreaterThan(rivalTarget(1));
  });
});

describe('handing an RT back', () => {
  const taken = () => {
    const s = withAi();
    s.stage.current = 'rw';
    s.res.orangDalam = 10;
    s.res.rupiah = 1e9;
    return s;
  };
  const months = (s: ReturnType<typeof grown>, k: number) => {
    for (let m = 0; m < k; m++) step(s);
  };

  it('a handed-back RT builds again once it has Dana', () => {
    const s = taken();
    const n = s.neighbours[0];
    takeover(s, n);
    handBack(s, n);
    expect(n.funded).toBe(0);
    const before = builtBy(n).length;
    fundNeighbour(s, n, 6);
    months(s, 6);
    expect(builtBy(n).length).toBeGreaterThan(before);
  });

  it('Auto-dana comes back on at its old level, so the RT keeps building without a tap', () => {
    const s = taken();
    const n = s.neighbours[0];
    setAutoFund(n, 6);
    takeover(s, n);
    expect(n.autoKeep).toBe(0);
    handBack(s, n);
    expect(n.autoKeep).toBe(6);
    const before = builtBy(n).length;
    months(s, 6);
    expect(builtBy(n).length).toBeGreaterThan(before);
  });

  it('says when the lot is full, the other reason an RT stops building', () => {
    const s = taken();
    const n = s.neighbours[0];
    expect(lotFull(s, n)).toBe(false);
    const o = cellOrigin(n.cx, n.cy);
    for (let y = o.y; y < o.y + RT_H; y++)
      for (let x = o.x; x < o.x + RT_W; x++)
        if (!n.buildings.some((b) => b.x === x && b.y === y)) n.buildings.push({ uid: s.nextUid++, def: 'rumah', x, y, level: 1, status: 'active', timer: 0, invested: 0, placedAt: 0 });
    expect(lotFull(s, n)).toBe(true);
  });
});

describe('absorbing an RT', () => {
  const ready = () => {
    const s = withAi();
    s.stage.current = 'rw';
    s.res.rupiah = 1e9;
    return s;
  };

  it('costs no Orang Dalam and refunds banked Dana', () => {
    const s = ready();
    const n = s.neighbours[0];
    s.res.orangDalam = 0;
    fundNeighbour(s, n, 6);
    const kas = s.res.rupiah;
    absorb(s, n);
    expect(s.res.orangDalam).toBe(0);
    expect(s.res.rupiah).toBe(kas + fundCost(s) * 6);
    expect(n.funded).toBe(0);
    expect(n.run).toBe('player');
    expect(n.absorbed).toBe(true);
  });

  it('moves its buildings and warga to the player, and keeps its stars', () => {
    const s = ready();
    const n = s.neighbours[0];
    n.stars = 2;
    const theirs = n.buildings.map((b) => b.uid);
    const pop = population(s);
    const warga = n.pop;
    absorb(s, n);
    expect(n.buildings).toHaveLength(0);
    for (const uid of theirs) expect(s.buildings.some((b) => b.uid === uid)).toBe(true);
    expect(n.pop).toBe(0);
    expect(population(s)).toBe(pop + warga);
    expect(n.stars).toBe(2);
  });

  it('works on an RT the player already took over', () => {
    const s = ready();
    s.res.orangDalam = 10;
    const n = s.neighbours[0];
    takeover(s, n);
    const mine = s.buildings.length;
    const pop = population(s);
    const kas = s.res.rupiah;
    absorb(s, n);
    expect(n.absorbed).toBe(true);
    expect(s.buildings).toHaveLength(mine);
    expect(population(s)).toBe(pop);
    expect(s.res.rupiah).toBe(kas);
  });

  it('does not make buildings dearer: what it brings does not count toward sprawl', () => {
    const s = withAi();
    const n = s.neighbours[0];
    n.buildings = Array.from({ length: 40 }, (_, i) => ({ uid: 5000 + i, def: 'warung', x: 13 + (i % 13), y: i % 17, level: 1, status: 'active' as const, timer: 0, invested: 0, placedAt: 0 }));
    const before = sprawl(s);
    absorb(s, n);
    expect(sprawl(s)).toBe(before);
  });

  it('can never be handed back once absorbed', () => {
    const s = ready();
    const n = s.neighbours[0];
    absorb(s, n);
    const mine = s.buildings.length;
    const pop = population(s);
    handBack(s, n);
    expect(n.run).toBe('player');
    expect(n.absorbed).toBe(true);
    expect(n.buildings).toHaveLength(0);
    expect(s.buildings).toHaveLength(mine);
    expect(population(s)).toBe(pop);
  });
});

