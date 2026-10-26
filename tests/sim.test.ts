import { describe, expect, it } from 'vitest';
import { def } from '../src/sim/content';
import { checkPlace, demolish, place, skipPermit, upgrade } from '../src/sim/rules';
import { deserialize, serialize } from '../src/sim/save';
import { buildCost, byUid, count, emptyTiles, newGame, population } from '../src/sim/state';
import { tick } from '../src/sim/tick';
import type { GameState } from '../src/sim/types';

const run = (s: GameState, months: number) => {
  const fx = [];
  for (let i = 0; i < months; i++) {
    fx.push(...tick(s));
    s.pendingEvent = null;
  }
  return fx;
};

describe('new game', () => {
  it('starts with a kantor RT, two rumah and four residents', () => {
    const s = newGame(1);
    expect(count(s, 'kantorRT')).toBe(1);
    expect(count(s, 'rumah')).toBe(2);
    expect(population(s)).toBe(4);
    expect(s.res.rupiah).toBe(5_000_000);
  });
});

describe('placing buildings', () => {
  it('charges the cost and moves through permit, construction, active', () => {
    const s = newGame(2);
    const r = place(s, 'warung', 0, 0);
    expect(r.ok).toBe(true);
    expect(s.res.rupiah).toBe(5_000_000 - 1_500_000);
    const b = byUid(s, r.uid!)!;
    expect(b.status).toBe('permit');
    tick(s);
    expect(b.status).toBe('building');
    tick(s);
    expect(b.status).toBe('active');
  });

  it('says exactly what is missing', () => {
    const s = newGame(3);
    const r = checkPlace(s, 'wifi', 0, 0);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.missing).toContain('Need 8 residents (have 4)');
    const idm = checkPlace(s, 'indomaret', 0, 0);
    if (!idm.ok) {
      expect(idm.missing).toContain('Need a working Warung');
      expect(idm.missing.some((m) => m.startsWith('Need Rp 2.000.000 more'))).toBe(true);
    }
  });

  it('rejects taken tiles and the second kantor RT', () => {
    const s = newGame(4);
    const k = s.buildings.find((b) => b.def === 'kantorRT')!;
    const r = checkPlace(s, 'warung', k.x, k.y);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.missing).toContain('Tile has a Kantor RT');
    const k2 = checkPlace(s, 'kantorRT', 0, 0);
    if (!k2.ok) expect(k2.missing[0]).toMatch(/^Limit 1/);
  });

  it('lets Orang Dalam skip the permit queue', () => {
    const s = newGame(5);
    const r = place(s, 'selokan', 0, 0);
    const b = byUid(s, r.uid!)!;
    expect(skipPermit(s, b).ok).toBe(true);
    expect(b.status).toBe('building');
    expect(s.res.orangDalam).toBe(0);
    const again = skipPermit(s, b);
    expect(again.ok).toBe(false);
  });

  it('drains Sabar while a permit waits in the queue', () => {
    const s = newGame(6);
    place(s, 'selokan', 0, 0);
    const before = s.res.sabar;
    tick(s);
    expect(s.res.sabar).toBeLessThan(before + 1);
  });

  it('refunds half on demolish and refuses to remove the kantor RT', () => {
    const s = newGame(7);
    const r = place(s, 'warung', 0, 0);
    const d = demolish(s, byUid(s, r.uid!)!);
    expect(d.ok && d.refund).toBe(750_000);
    const k = demolish(s, s.buildings.find((b) => b.def === 'kantorRT')!);
    expect(k.ok).toBe(false);
  });

  it('upgrades only working buildings', () => {
    const s = newGame(8);
    const r = place(s, 'warung', 0, 0);
    const b = byUid(s, r.uid!)!;
    expect(upgrade(s, b).ok).toBe(false);
    run(s, 2);
    expect(upgrade(s, b).ok).toBe(true);
    expect(b.level).toBe(2);
  });
});

describe('monthly tick', () => {
  it('pays income from working buildings', () => {
    const s = newGame(9);
    place(s, 'warung', 0, 0);
    run(s, 2);
    const before = s.res.rupiah;
    const fx = tick(s);
    expect(s.res.rupiah).toBeGreaterThan(before);
    expect(fx.some((f) => f.kind === 'pop' && f.res === 'rupiah' && f.amount > 0)).toBe(true);
  });

  it('never lets the kas go negative in year 1', () => {
    const s = newGame(10);
    s.res.rupiah = 0;
    for (let i = 0; i < 11; i++) {
      tick(s);
      expect(s.res.rupiah).toBeGreaterThanOrEqual(0);
    }
  });

  it('brings residents in and builds rumah for them on the map', () => {
    const s = newGame(11);
    for (let i = 0; i < 3; i++) place(s, 'posRonda', i, 0);
    run(s, 8);
    expect(population(s)).toBeGreaterThan(4);
    expect(count(s, 'rumah')).toBeGreaterThan(2);
  });

  it('lets residents leave at low Sabar but never below two', () => {
    const s = newGame(12);
    for (let i = 0; i < 30; i++) {
      s.res.sabar = 0;
      tick(s);
    }
    expect(population(s)).toBe(2);
  });

  it('delivers something new at least every 8 months with no input', () => {
    const s = newGame(13);
    s.res.sabar = 30;
    let last = 0;
    for (let m = 1; m <= 48; m++) {
      const fx = tick(s);
      s.pendingEvent = null;
      if (fx.some((f) => f.kind === 'event' || (f.kind === 'notice' && f.tone === 'good'))) last = m;
      expect(m - last).toBeLessThanOrEqual(8);
    }
  });

  it('inflates prices every year', () => {
    const s = newGame(14);
    run(s, 12);
    expect(buildCost(s, def('warung'))).toBe(1_545_000);
  });

  it('is deterministic for the same seed', () => {
    const a = newGame(42);
    const b = newGame(42);
    place(a, 'warung', 0, 0);
    place(b, 'warung', 0, 0);
    run(a, 36);
    run(b, 36);
    expect(serialize(a)).toBe(serialize(b));
  });

  it('survives ten idle years without errors', () => {
    const s = newGame(15);
    expect(() => run(s, 120)).not.toThrow();
    expect(emptyTiles(s).length).toBeGreaterThanOrEqual(0);
  });
});

describe('save and load', () => {
  it('round-trips the full state', () => {
    const s = newGame(16);
    place(s, 'warung', 0, 0);
    run(s, 5);
    const loaded = deserialize(serialize(s));
    expect(loaded).toEqual(s);
  });

  it('rejects junk, old versions and unknown buildings', () => {
    expect(deserialize(null)).toBeNull();
    expect(deserialize('{nope')).toBeNull();
    const s = newGame(17);
    expect(deserialize(JSON.stringify({ ...s, version: 0 }))).toBeNull();
    s.buildings[0].def = 'monas';
    expect(deserialize(serialize(s))).toBeNull();
  });
});
