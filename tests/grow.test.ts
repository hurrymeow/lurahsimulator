import { afterEach, describe, expect, it } from 'vitest';
import { lotAt } from '../src/sim/area';
import { goalProgress, nextStarChecklist } from '../src/sim/stages';
import { viewOf } from '../src/sim/neighbourView';
import { FLAT, connectedRoad, hasRoadBeside } from '../src/sim/access';
import { builtBy, layAiPath, autoFloor, autoMonthly, boostOf, checkFund, checkTakeover, fundCost, fundNeighbour, handBack, promote, setAutoFund, takeover } from '../src/sim/grow';
import { NEIGHBOUR } from '../src/sim/balance';
import { checkPlace } from '../src/sim/rules';
import { areaScore } from '../src/sim/ranking';
import { deserialize, serialize } from '../src/sim/save';
import { addBuilding, addResident, emptyTiles, newGame, population } from '../src/sim/state';
import { tick } from '../src/sim/tick';
import { GRID_H, GRID_W, RT_H, RT_W, setGrid } from '../src/sim/types';

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

describe('growing map', () => {
  it('doubles the grid at RW and again at Kelurahan, never moving what the player built', () => {
    const s = newGame(1);
    const before = s.buildings.map((b) => [b.x, b.y]);
    expect([GRID_W, GRID_H]).toEqual([RT_W, RT_H]);
    promote(s, []);
    expect([GRID_W, GRID_H]).toEqual([RT_W * 2, RT_H * 2]);
    expect(s.neighbours).toHaveLength(3);
    promote(s, []);
    expect([GRID_W, GRID_H]).toEqual([RT_W * 4, RT_H * 4]);
    expect(s.neighbours).toHaveLength(15);
    expect(s.buildings.map((b) => [b.x, b.y])).toEqual(before);
  });

  it('keeps the same AI RTs when the RW becomes a Kelurahan', () => {
    const s = grown();
    const first = s.neighbours.map((n) => n.buildings[0].uid);
    s.stage.current = 'rw';
    promote(s, []);
    expect(s.neighbours.slice(0, 3).map((n) => n.buildings[0].uid)).toEqual(first);
  });

  it('stops at the top of the ladder', () => {
    const s = newGame(1);
    s.stage.current = 'kelurahan';
    expect(promote(s, [])).toBe(false);
  });
});

describe('lots', () => {
  it('is all RT at the RT stage', () => {
    for (let y = 0; y < RT_H; y++) for (let x = 0; x < RT_W; x++) expect(lotAt(x, y)).toBe('rt');
  });

  it('gives the RW seams to RW buildings and the other RTs to the AI', () => {
    grown();
    expect(lotAt(2, 2)).toBe('rt');
    expect(lotAt(RT_W, 2)).toBe('rw');
    expect(lotAt(2, RT_H - 1)).toBe('rw');
    expect(lotAt(RT_W + 3, 3)).toBe('other');
  });

  it('puts the RW boundary on the Kelurahan lots', () => {
    grown('kelurahan');
    expect(lotAt(2 * RT_W, 3)).toBe('kel');
    expect(lotAt(RT_W, 3)).toBe('rw');
    expect(lotAt(3 * RT_W, 3)).toBe('other');
    expect(lotAt(3 * RT_W - 1, 2 * RT_H + 3)).toBe('other');
  });

  it('refuses to build in an AI RT or on a seam with an RT building', () => {
    const s = grown();
    s.res.rupiah = 50_000_000;
    expect(checkPlace(s, 'warung', RT_W + 3, 3)).toEqual({ ok: false, missing: ['That is another RT. Fund it and it builds there itself.'] });
    const seam = checkPlace(s, 'warung', RT_W, 3);
    expect(seam.ok).toBe(false);
    expect(checkPlace(s, 'warung', 2, 2)).toEqual({ ok: true });
  });

  it('refuses a tile an AI building holds', () => {
    const s = grown();
    s.res.rupiah = 50_000_000;
    const b = s.neighbours[0].buildings[0];
    const r = checkPlace(s, 'warung', b.x, b.y);
    expect(r.ok).toBe(false);
  });

  it('settles new residents only inside the player RT', () => {
    const s = grown();
    expect(emptyTiles(s).every((p) => lotAt(p.x, p.y) === 'rt')).toBe(true);
  });
});

describe('AI neighbours', () => {
  it('stall until funded, then build', () => {
    const s = grown();
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
    const s = grown();
    s.res.rupiah = 1e12;
    s.res.sabar = 100;
    for (let i = 0; i < 80; i++) {
      for (const n of s.neighbours) fundNeighbour(s, n);
      step(s);
    }
    for (const n of s.neighbours) {
      expect(n.buildings.length).toBeGreaterThan(2);
      for (const b of n.buildings) {
        expect(Math.floor(b.x / RT_W)).toBe(n.cx);
        expect(Math.floor(b.y / RT_H)).toBe(n.cy);
        expect(lotAt(b.x, b.y)).toBe('other');
      }
      expect(new Set(n.buildings.map((b) => `${b.x},${b.y}`)).size).toBe(n.buildings.length);
    }
  });

  it('earn stars by the same checklist as the player', () => {
    const s = grown();
    const n = s.neighbours[0];
    n.pop = 12;
    n.discovered = ['tongkrongan'];
    tick(s);
    expect(n.stars).toBeGreaterThanOrEqual(1);
  });

  it('pay iuran into the kas, Rajin more', () => {
    const s = grown();
    const a = s.neighbours[0];
    a.trait = 'jarang';
    s.neighbours.forEach((n) => (n.pop = 0));
    a.pop = 10;
    const base = tick(s) && s.res.rupiah;
    const t2 = newGame(7);
    expect(base).toBeGreaterThan(t2.res.rupiah - 1e9);
    const r1 = grown();
    r1.neighbours.forEach((n) => (n.pop = 0));
    r1.neighbours[0].trait = 'jarang';
    r1.neighbours[0].pop = 10;
    const r2 = grown();
    r2.neighbours.forEach((n) => (n.pop = 0));
    r2.neighbours[0].trait = 'rajin';
    r2.neighbours[0].pop = 10;
    tick(r1);
    tick(r2);
    expect(r2.res.rupiah - r1.res.rupiah).toBe(Math.round(10 * 25_000 * 0.2));
  });

  it('count in the area score used for ranking', () => {
    const s = grown();
    const solo = areaScore({ ...s, neighbours: [] });
    expect(areaScore(s)).toBeGreaterThan(solo);
  });

  it('cannot be funded without the rupiah, or past the cap', () => {
    const s = grown();
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
    const n = grown().neighbours[0];
    const at = (k: number) => ((n.funded = k), boostOf(n));
    expect(at(1)).toBe(0);
    expect(at(3)).toBeGreaterThan(0.3);
    expect(at(6) - at(3)).toBeGreaterThan(at(12) - at(9));
    expect(at(NEIGHBOUR.fundMax)).toBeLessThanOrEqual(NEIGHBOUR.boostMax);
    // Six banked: a Jarang Muncul RT builds about every 1.8 months instead of 3.
    const s = grown();
    const j = s.neighbours[0];
    j.trait = 'jarang';
    s.res.rupiah = 1e9;
    fundNeighbour(s, j, 12);
    const before = j.buildings.length;
    for (let m = 0; m < 12; m++) step(s);
    expect(j.buildings.length - before).toBeGreaterThanOrEqual(6);
  });

  it('auto-dana tops an RT back up each month and keeps the kas above the floor', () => {
    const s = grown();
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
    const s = grown();
    const raw = serialize(s);
    setGrid('rt');
    const back = deserialize(raw)!;
    expect(back.stage.current).toBe('rw');
    expect(back.neighbours).toHaveLength(3);
    expect([GRID_W, GRID_H]).toEqual([RT_W * 2, RT_H * 2]);
  });

  it('adds an empty neighbour list to an older save', () => {
    const s = newGame(3);
    const raw = JSON.parse(serialize(s));
    delete raw.neighbours;
    const back = deserialize(JSON.stringify(raw))!;
    expect(back.neighbours).toEqual([]);
    expect([GRID_W, GRID_H]).toEqual([RT_W, RT_H]);
  });
});

describe('RW goals and Stempel', () => {
  const line = (s: ReturnType<typeof newGame>, kind: string) => nextStarChecklist(s, s.stage.current)!.find((l) => l.goal.kind === kind)!;

  it('counts RTs funded at least once', () => {
    const s = grown();
    s.stage.current = 'rw';
    s.res.rupiah = 1e9;
    expect(line(s, 'fundedRts').done).toBe(false);
    s.neighbours.forEach((n) => fundNeighbour(s, n));
    expect(line(s, 'fundedRts').done).toBe(true);
  });

  it('piles letters up when builds outrun the stamps, and costs Sabar', () => {
    const s = grown('kelurahan');
    s.stage.current = 'kelurahan';
    s.stempel.backlog = 9;
    s.res.sabar = 60;
    step(s);
    // 3 stamps clear 3 letters, 6 wait and drain half a Sabar each.
    expect(s.stempel.backlog).toBe(6);
    expect(s.stempel.clear).toBe(0);
    expect(s.res.sabar).toBeLessThan(60);
  });

  it('counts clear months in a row, and a Balai RW adds a stamp', () => {
    const s = grown();
    s.stage.current = 'rw';
    for (let i = 0; i < 3; i++) step(s);
    expect(s.stempel.clear).toBe(3);
    s.stempel.backlog = 20;
    s.stempel.stock = 0;
    s.buildings.push({ uid: 999, def: 'balaiRW', x: 2, y: 2, level: 1, status: 'active', timer: 0, invested: 0, placedAt: 0 });
    step(s);
    expect(s.stempel.backlog).toBe(16);
    expect(s.stempel.clear).toBe(0);
  });

  it('sends twice the letters for Jarang Muncul', () => {
    const s = grown();
    s.res.rupiah = 1e9;
    s.neighbours.forEach((n, i) => { n.trait = i ? 'rajin' : 'jarang'; n.pop = 0; });
    s.neighbours[0].progress = 1;
    fundNeighbour(s, s.neighbours[0]);
    s.stempel.stock = 0;
    step(s);
    expect(s.stempel.backlog).toBe(Math.max(0, 2 - 3));
    expect(s.neighbours[0].buildings.length).toBeGreaterThan(2);
  });

  it('counts RTs and RWs at a star, and ranking wins by tier', () => {
    const s = grown();
    s.stage.current = 'rw';
    s.stage.stars.rt = 3;
    s.stage.stars.rw = 1;
    s.neighbours.forEach((n) => (n.stars = 1));
    expect(line(s, 'rtsAtStars').goal).toMatchObject({ n: 4, stars: 1 });
    expect(line(s, 'rtsAtStars').done).toBe(true);
    s.ranking.push({ tier: 'rt', year: 1, us: 9, them: 1, won: true });
    expect(line(s, 'tierWins').done).toBe(false);
    s.ranking.push({ tier: 'rw', year: 2, us: 9, them: 1, won: true });
    expect(line(s, 'tierWins').done).toBe(true);
  });

  it('counts months out of debt', () => {
    const s = grown();
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

describe('combos count across RTs', () => {
  it("an AI RT's combos goal uses the most combos any RT has, the player's own check stays its own", () => {
    const s = grown();
    const n = s.neighbours[0];
    s.discovered = ['a', 'b', 'c'];
    n.discovered = [];
    const combos = { kind: 'combos', n: 3 } as const;
    expect(goalProgress(viewOf(s, n), combos).have).toBe(3);
    s.discovered = [];
    s.neighbours[1].discovered = ['x', 'y'];
    expect(goalProgress(viewOf(s, n), combos).have).toBe(2);
    expect(goalProgress(s, combos).have).toBe(0);
  });

  it('a Rajin RT, which only ever finds one combo, reaches 3 stars on auto-dana', () => {
    for (const seed of [1, 2, 3]) {
      const s = newGame(seed);
      s.stage.stars.rt = 3;
      // The player's own RT reached 3 stars, which takes 3 combos.
      s.discovered = ['tongkrongan', 'rapatMalam', 'perangKuota'];
      promote(s, []);
      s.stage.current = 'rw';
      s.neighbours.forEach((n) => { n.trait = 'rajin'; setAutoFund(n, 6); });
      for (let m = 0; m < 6 * 12; m++) {
        s.res.rupiah = 1e9;
        step(s);
      }
      for (const n of s.neighbours) {
        expect(n.discovered.length, `seed ${seed}`).toBeLessThanOrEqual(1);
        expect(n.stars, `seed ${seed}`).toBe(3);
      }
    }
  });
});

describe('player-run RTs', () => {
  /** An empty tile inside a neighbour's cell, away from its buildings. */
  const spotIn = (s: ReturnType<typeof grown>, i: number, id = 'rumah') => {
    const n = s.neighbours[i];
    for (let y = n.cy * RT_H + 2; y < (n.cy + 1) * RT_H - 2; y++)
      for (let x = n.cx * RT_W + 2; x < (n.cx + 1) * RT_W - 2; x++) if (checkPlace(s, id, x, y).ok) return { x, y };
    throw new Error('no spot');
  };

  it('a takeover costs Orang Dalam, moves the RT into the player list, and opens its lots to build on', () => {
    const s = grown();
    s.stage.current = 'rw';
    const n = s.neighbours[0];
    s.res.orangDalam = 0;
    expect(checkTakeover(s, n)).toContain('Orang Dalam');
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
    const s = grown();
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
    const s = grown();
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
    const s = grown('kelurahan');
    s.res.orangDalam = 99;
    const far = s.neighbours.find((n) => n.cx >= 2 || n.cy >= 2)!;
    const near = s.neighbours.find((n) => n.cx < 2 && n.cy < 2)!;
    expect(checkTakeover(s, far)).not.toBeNull();
    expect(checkTakeover(s, near)).toBeNull();
  });

  it('counts a player-run RT once in the area score', () => {
    const s = grown();
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
    const s = grown();
    const n = s.neighbours[0];
    n.buildings = n.buildings.filter((b) => b.def !== 'jalan');
    delete n.pathsLaid;
    step(s);
    expect(n.pathsLaid).toBe(true);
    expect(n.buildings.some((b) => b.def === 'jalan')).toBe(true);
    expect(layAiPath(s, n, n.buildings.find((b) => b.def === 'rumah')!)).toBe(true);
  });
});

