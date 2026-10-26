import { afterEach, describe, expect, it } from 'vitest';
import { lotAt } from '../src/sim/area';
import { nextStarChecklist } from '../src/sim/stages';
import { checkFund, fundNeighbour, promote } from '../src/sim/grow';
import { checkPlace } from '../src/sim/rules';
import { areaScore } from '../src/sim/ranking';
import { deserialize, serialize } from '../src/sim/save';
import { emptyTiles, newGame } from '../src/sim/state';
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
    for (let i = 0; i < 3; i++) fundNeighbour(s, s.neighbours[0]);
    expect(fundNeighbour(s, s.neighbours[0])).toContain('Already funded');
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
    s.neighbours[0].lastBuild = -10;
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
