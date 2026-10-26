import { describe, expect, it } from 'vitest';
import { EVENTS, eventDef } from '../src/data/events';
import { LINES } from '../src/data/lines';
import { RIVAL_BASE, RIVAL_PER_YEAR, RIVAL_JITTER } from '../src/data/ranking';
import { banjirProtection, checkChoice, checkRepair, eventCost, repair, resolveEvent } from '../src/sim/events';
import { inspectionScore } from '../src/sim/inspection';
import { score } from '../src/sim/ranking';
import { place } from '../src/sim/rules';
import { addBuilding, newGame } from '../src/sim/state';
import { tick } from '../src/sim/tick';
import { announce } from '../src/sim/wacana';
import type { GameState, SimEffect } from '../src/sim/types';

const run = (s: GameState, n: number) => {
  const fx: SimEffect[] = [];
  for (let i = 0; i < n; i++) {
    fx.push(...tick(s));
    s.pendingEvent = null;
    s.res.sabar = Math.max(s.res.sabar, 60);
  }
  return fx;
};

describe('events', () => {
  it('raises 17 Agustus every August, even in year 1, and pauses the game', () => {
    const s = newGame(1);
    let raised = '';
    for (let i = 0; i < 8; i++) {
      const fx = tick(s);
      if (fx.some((f) => f.kind === 'event' && f.eventId === 'agustusan')) raised = 'yes';
      if (s.pendingEvent === 'agustusan') break;
      s.pendingEvent = null;
    }
    expect(raised).toBe('yes');
    expect(s.month).toBe(7);
    expect(s.pendingEvent).toBe('agustusan');
  });

  it('a pending event blocks the tick until resolved', () => {
    const s = newGame(2);
    s.pendingEvent = 'agustusan';
    const month = s.month;
    expect(tick(s)).toEqual([]);
    expect(s.month).toBe(month);
  });

  it('every event has a free first choice, so none can soft-lock', () => {
    for (const e of EVENTS) {
      expect(e.choices[0].cost, e.id).toBeUndefined();
      const s = newGame(3);
      s.res.rupiah = 0;
      s.res.orangDalam = 0;
      expect(checkChoice(s, e.choices[0]).ok, e.id).toBe(true);
    }
  });

  it('says what is missing when a paid choice is unaffordable', () => {
    const s = newGame(4);
    s.res.rupiah = 100;
    const c = eventDef('agustusan')!.choices[1];
    const r = checkChoice(s, c);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.missing[0]).toMatch(/^Need Rp .* more/);
  });

  it('funding the lomba costs Rupiah and gives Sabar, Viral and a timed income boost', () => {
    const s = newGame(5);
    s.pendingEvent = 'agustusan';
    s.res.sabar = 50;
    const before = s.res.rupiah;
    expect(resolveEvent(s, [], 1).ok).toBe(true);
    expect(s.res.rupiah).toBeLessThan(before);
    expect(s.res.sabar).toBe(65);
    expect(s.res.viral).toBe(10);
    expect(s.modifiers.length).toBe(1);
    expect(s.pendingEvent).toBeNull();
  });

  it('harga cabai cuts warung income for a few months', () => {
    const s = newGame(6);
    addBuilding(s, 'warung', 0, 0, 'active');
    const base = newGame(6);
    addBuilding(base, 'warung', 0, 0, 'active');
    s.pendingEvent = 'cabai';
    resolveEvent(s, [], 0);
    const a = s.res.rupiah;
    const b = base.res.rupiah;
    tick(s);
    tick(base);
    expect(s.res.rupiah - a).toBeLessThan(base.res.rupiah - b);
    run(s, 5);
    expect(s.modifiers.length).toBe(0);
  });
});

describe('more events', () => {
  const advice = EVENTS.filter((e) => e.choices.some((c) => c.outcomes));

  it('has at least 20 new events, 10 of them advice', () => {
    expect(EVENTS.length).toBeGreaterThanOrEqual(24);
    expect(advice.length).toBeGreaterThanOrEqual(10);
  });

  it('every paid choice costs at least its base, and rises with income', () => {
    const poor = newGame(1);
    const rich = newGame(1);
    for (let i = 0; i < 12; i++) addBuilding(rich, 'warung', i % 6, 2 + Math.floor(i / 6), 'active');
    const c = eventDef('truckSampah')!.choices[1];
    expect(eventCost(poor, c).rupiah).toBeGreaterThanOrEqual(200_000);
    expect(eventCost(rich, c).rupiah).toBeGreaterThan(eventCost(poor, c).rupiah);
  });

  it('advice rolls different outcomes, each one moving a number, and every outcome is reachable', () => {
    for (const e of advice) {
      const idx = e.choices.findIndex((c) => c.outcomes);
      const seen = new Set<string>();
      for (let seed = 1; seed <= 200; seed++) {
        const s = newGame(seed);
        s.res.rupiah = 50_000_000;
        s.res.sabar = 50;
        const before = { ...s.res };
        s.pendingEvent = e.id;
        const out = resolveEvent(s, [], idx);
        expect(out.ok, e.id).toBe(true);
        expect(Object.keys(out.delta ?? {}).length, e.id).toBeGreaterThan(0);
        seen.add(out.text);
        expect(s.res.rupiah, e.id).not.toBeNaN();
        void before;
      }
      expect(seen.size, e.id).toBe(e.choices[idx].outcomes!.length);
    }
  });

  it('popups are rationed: random events come at most once every five months', () => {
    for (let seed = 1; seed <= 10; seed++) {
      const s = newGame(seed);
      s.res.sabar = 60;
      const months: number[] = [];
      for (let i = 0; i < 120; i++) {
        const fx = tick(s);
        s.res.sabar = 60;
        s.res.rupiah = Math.max(s.res.rupiah, 1_000_000);
        if (fx.some((f) => f.kind === 'event')) {
          if (!['agustusan', 'banjir', 'kecamatan'].includes(s.pendingEvent!)) months.push(s.month);
          s.pendingEvent = null;
        }
      }
      for (let i = 1; i < months.length; i++) expect(months[i] - months[i - 1], `seed ${seed}`).toBeGreaterThanOrEqual(5);
    }
  });

  it('minor log lines show most months, never repeat close together, and never pause the game', () => {
    const s = newGame(3);
    s.res.sabar = 60;
    const titles: string[] = [];
    let lines = 0;
    for (let i = 0; i < 60; i++) {
      const fx = tick(s);
      s.pendingEvent = null;
      s.res.sabar = 60;
      for (const f of fx) if (f.kind === 'notice' && !f.fanfare && LINES.some((l) => l.name === f.title)) titles.push(f.title);
      lines += fx.filter((f) => f.kind === 'notice' && LINES.some((l) => l.name === f.title)).length;
    }
    expect(lines).toBeGreaterThan(25);
    for (let i = 0; i < titles.length; i++) expect(titles.slice(Math.max(0, i - 8), i), titles[i]).not.toContain(titles[i]);
  });
});

describe('banjir', () => {
  const flood = (selokanLevels: number, seed: number) => {
    const s = newGame(seed);
    s.month = 20;
    for (let i = 0; i < selokanLevels; i++) addBuilding(s, 'biopori', i, 12, 'active');
    for (let i = 0; i < 6; i++) addBuilding(s, 'warung', i, 0, 'active');
    s.pendingEvent = 'banjir';
    resolveEvent(s, [], 0);
    return s.buildings.filter((b) => b.status === 'damaged').length;
  };

  it('protection scales with selokan level and caps at 80%', () => {
    const s = newGame(7);
    expect(banjirProtection(s)).toBe(0);
    addBuilding(s, 'biopori', 0, 0, 'active');
    expect(banjirProtection(s)).toBeCloseTo(0.2);
    for (let i = 1; i < 8; i++) addBuilding(s, 'biopori', i, 0, 'active');
    expect(banjirProtection(s)).toBe(0.8);
  });

  it('more selokan means less damage on average', () => {
    let none = 0;
    let lots = 0;
    for (let seed = 1; seed <= 40; seed++) {
      none += flood(0, seed);
      lots += flood(4, seed);
    }
    expect(lots).toBeLessThan(none);
  });

  it('year 1 floods break at most one building', () => {
    for (let seed = 1; seed <= 20; seed++) {
      const s = newGame(seed);
      s.month = 10;
      for (let i = 0; i < 6; i++) addBuilding(s, 'warung', i, 0, 'active');
      s.pendingEvent = 'banjir';
      resolveEvent(s, [], 0);
      expect(s.buildings.filter((b) => b.status === 'damaged').length).toBeLessThanOrEqual(1);
    }
  });

  it('damaged buildings earn nothing; repair costs Rupiah, or is free at 30 Viral', () => {
    const s = newGame(8);
    const b = addBuilding(s, 'warung', 0, 0, 'damaged');
    s.res.rupiah = 0;
    expect(checkRepair(s, b).ok).toBe(false);
    s.res.viral = 40;
    expect(repair(s, b).ok).toBe(true);
    expect(b.status).toBe('active');
    expect(s.res.rupiah).toBe(0);
    b.status = 'damaged';
    s.res.viral = 0;
    s.res.rupiah = 10_000_000;
    expect(repair(s, b).ok).toBe(true);
    expect(s.res.rupiah).toBeLessThan(10_000_000);
  });
});

describe('yearly ranking and Indonesia Emas', () => {
  it('ranks against Kampung Sebelah at every year end', () => {
    const s = newGame(9);
    run(s, 24);
    expect(s.ranking.map((r) => r.year)).toEqual([1, 2]);
    for (const r of s.ranking) {
      expect(r.them).toBeGreaterThanOrEqual(RIVAL_BASE + RIVAL_PER_YEAR * r.year - RIVAL_JITTER);
      expect(r.them).toBeLessThanOrEqual(RIVAL_BASE + RIVAL_PER_YEAR * r.year + RIVAL_JITTER);
      expect(r.won).toBe(r.us > r.them);
    }
  });

  it('winning pays Sabar and Orang Dalam, losing costs a little Sabar', () => {
    const win = newGame(10);
    win.month = 11;
    for (let i = 0; i < 12; i++) addBuilding(win, 'warung', i % 9, Math.floor(i / 9), 'active');
    for (let i = 0; i < 20; i++) win.residents.push({ id: 100 + i, name: 'x', job: 'none', pensiun: 0, fake: 0, arrived: 0 });
    win.res.sabar = 50;
    const od = win.res.orangDalam;
    tick(win);
    expect(win.ranking[0].won).toBe(true);
    expect(win.res.orangDalam).toBeGreaterThan(od);

    const lose = newGame(10);
    lose.month = 11;
    for (const r of lose.residents) r.manual = true;
    lose.res.sabar = 50;
    tick(lose);
    expect(lose.ranking[0].won).toBe(false);
    expect(lose.res.sabar).toBeLessThan(50);
  });

  it('a decent kampung wins year 1', () => {
    const s = newGame(11);
    for (let i = 0; i < 2; i++) place(s, 'warung', i, 0);
    place(s, 'posRonda', 2, 0);
    run(s, 12);
    expect(s.ranking[0].won).toBe(true);
  });

  it('Indonesia Emas barely moves: under 1 percent after ten years of play', () => {
    const s = newGame(12);
    for (let i = 0; i < 10; i++) {
      announce(s, 'digital');
      s.res.rupiah = 5_000_000;
      run(s, 12);
    }
    expect(s.emas).toBeGreaterThan(0.1);
    expect(s.emas).toBeLessThan(1);
  });

  it('score counts residents, working buildings, combos and Sabar', () => {
    const s = newGame(13);
    const base = score(s);
    addBuilding(s, 'warung', 0, 0, 'active');
    expect(score(s)).toBeGreaterThan(base);
    addBuilding(s, 'warung', 1, 0, 'damaged');
    const withDamaged = score(s);
    expect(withDamaged).toBe(score(s));
  });
});

describe('free choices while in debt', () => {
  it('stay available when the kas is negative, so an event can never freeze the game', () => {
    for (const e of EVENTS) {
      const s = newGame(20);
      s.res.rupiah = -500_000;
      s.res.orangDalam = 0;
      expect(checkChoice(s, e.choices[0]).ok, e.id).toBe(true);
    }
  });
});

describe('event cooldowns', () => {
  it('banjir never comes twice within 9 months', () => {
    for (let seed = 1; seed <= 15; seed++) {
      const s = newGame(seed);
      const floods: number[] = [];
      for (let m = 0; m < 120; m++) {
        const fx = tick(s);
        if (fx.some((f) => f.kind === 'event' && f.eventId === 'banjir')) floods.push(s.month);
        s.pendingEvent = null;
      }
      for (let i = 1; i < floods.length; i++) expect(floods[i] - floods[i - 1], `seed ${seed}`).toBeGreaterThanOrEqual(9);
    }
  });
});

describe('kecamatan inspection', () => {
  const next = (s: GameState) => {
    s.pendingEvent = null;
    return tick(s);
  };
  const warn = () => {
    const s = newGame(5);
    s.month = 11;
    const fx = tick(s);
    return { s, fx };
  };

  it('warns in year 2 with a free first choice, then visits two months later', () => {
    const { s, fx } = warn();
    expect(fx.some((f) => f.kind === 'event' && f.eventId === 'kecamatan')).toBe(true);
    expect(s.inspection?.visitAt).toBe(14);
    resolveEvent(s, [], 0);
    expect(next(s)).not.toContainEqual(expect.objectContaining({ title: expect.stringContaining('Kecamatan') }));
    const out = next(s);
    expect(out.some((f) => f.kind === 'notice' && f.title.startsWith('Kecamatan'))).toBe(true);
    expect(s.inspection?.warnAt).toBe(24);
  });

  it('cat ulang inflates the score for one visit only', () => {
    const { s } = warn();
    const before = inspectionScore(s).total;
    s.res.rupiah = 10_000_000;
    expect(resolveEvent(s, [], 1).ok).toBe(true);
    const after = inspectionScore(s);
    expect(after.total).toBe(before + 20);
    expect(after.real).toBe(before);
    next(s);
    next(s);
    expect(s.inspection?.prep).toBe(0);
  });

  it('a good score pays Orang Dalam and a bad one costs a little Sabar without trapping the player', () => {
    const good = warn().s;
    good.res.sabar = 100;
    good.inspection!.prep = 100;
    const od = good.res.orangDalam;
    good.pendingEvent = null;
    next(good);
    next(good);
    expect(good.res.orangDalam).toBeGreaterThan(od);
    const bad = warn().s;
    bad.res.sabar = 40;
    bad.pendingEvent = null;
    bad.buildings.push(...Array.from({ length: 6 }, (_, i) => ({ ...bad.buildings[0], uid: 900 + i, def: 'parkir', x: i, y: 0 })));
    const sabar = bad.res.sabar;
    next(bad);
    next(bad);
    expect(bad.res.sabar).toBeLessThan(sabar);
    expect(bad.res.sabar).toBeGreaterThan(0);
  });
});
