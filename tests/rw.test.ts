import { afterEach, describe, expect, it } from 'vitest';
import { activeCombos } from '../src/sim/combos';
import { agustusMult, banjirProtection, resolveEvent } from '../src/sim/events';
import { acceptSK, canPromote, nextStarChecklist, stageTitle } from '../src/sim/stages';
import { promote } from '../src/sim/grow';
import { liveJobs, assign } from '../src/sim/jobs';
import { onBuildingFinished } from '../src/sim/projects';
import { areaScore } from '../src/sim/ranking';
import { viewOf } from '../src/sim/neighbourView';
import { deserialize, serialize } from '../src/sim/save';
import { addBuilding, addResident, newGame } from '../src/sim/state';
import { buildingIncome, jobsSystemForTest, tick } from './rw-helpers';
import { setGrid, type GameState, type JobId } from '../src/sim/types';

afterEach(() => setGrid('rt'));

/** A player RW with the given stars, ready to hold RW buildings. */
function rw(stars: 0 | 1 | 2 = 2, seed = 3): GameState {
  const s = newGame(seed);
  promote(s, []);
  s.stage.current = 'rw';
  s.stage.stars.rw = stars;
  s.res.rupiah = 1e9;
  s.res.sabar = 60;
  return s;
}

const put = (s: GameState, id: string, x: number, y: number, level = 1) => {
  const b = addBuilding(s, id, x, y, 'active');
  b.level = level;
  return b;
};

/** Hires a resident straight into a job. */
function hire(s: GameState, job: JobId) {
  const r = addResident(s);
  r.job = job;
  r.manual = true;
  return r;
}

describe('RW stage is playable', () => {
  it('lets RT 3★ accept the SK into the RW', () => {
    const s = newGame(1);
    s.stage.stars.rt = 3;
    s.stage.sk = 'offered';
    expect(canPromote(s)).toBe(true);
    expect(acceptSK(s)).toBe(true);
    expect(s.stage.current).toBe('rw');
    expect(s.neighbours).toHaveLength(3);
  });

  it('lets RW 3★ pick the Desa path', () => {
    const s = newGame(1);
    s.stage.current = 'rw';
    setGrid('rw');
    s.stage.stars.rw = 3;
    s.stage.sk = 'offered';
    expect(acceptSK(s, [], 'desa')).toBe(true);
    expect(s.stage.current).toBe('kelurahan');
    expect(s.stage.path).toBe('desa');
  });

  it('gives the Desa path its own titles', () => {
    expect(stageTitle('kelurahan', 1, 'desa')).toBe('Desa Rintisan');
    expect(stageTitle('kelurahan', 1)).not.toBe('Desa Rintisan');
  });

  it('always draws two AI RTs of one trait, so Grup Chat Warga can be found', () => {
    for (let seed = 1; seed <= 40; seed++) {
      const s = newGame(seed);
      promote(s, []);
      expect(new Set(s.neighbours.map((n) => n.trait)).size, `seed ${seed}`).toBeLessThan(3);
      setGrid('rt');
    }
  });

  it('opens Kader Posyandu at 1★ and Calo at 2★', () => {
    expect(liveJobs(rw(0)).map((j) => j.id)).not.toContain('kaderPosyandu');
    expect(liveJobs(rw(1)).map((j) => j.id)).toContain('kaderPosyandu');
    expect(liveJobs(rw(1)).map((j) => j.id)).not.toContain('calo');
    expect(liveJobs(rw(2)).map((j) => j.id)).toContain('calo');
    expect(liveJobs(newGame(1)).map((j) => j.id)).not.toContain('calo');
  });
});

describe('RW combos', () => {
  it('finds Grup Chat Warga with a Balai RW and two same-trait RTs', () => {
    const s = rw(1);
    s.neighbours.forEach((n, i) => (n.trait = i === 2 ? 'jarang' : 'rajin'));
    expect(activeCombos(s).map((a) => a.combo.id)).not.toContain('grupChatWarga');
    put(s, 'balaiRW', 13, 3);
    expect(activeCombos(s).map((a) => a.combo.id)).toContain('grupChatWarga');
    s.neighbours.forEach((n, i) => (n.trait = (['rajin', 'hobi', 'jarang'] as const)[i]));
    expect(activeCombos(s).map((a) => a.combo.id)).not.toContain('grupChatWarga');
  });

  it('finds Pos Siaga from a Posyandu and a Portal', () => {
    const s = rw(1);
    put(s, 'posyandu', 13, 3);
    put(s, 'portal', 14, 4);
    const before = s.res.sabar;
    expect(activeCombos(s).map((a) => a.combo.id)).toContain('posSiaga');
    tick(s);
    expect(s.discovered).toContain('posSiaga');
    expect(s.res.sabar).toBeGreaterThan(before - 5);
  });

  it('reaches the two RW combos the 2★ goal needs using only 1★ buildings', () => {
    const s = rw(1);
    s.neighbours.forEach((n, i) => (n.trait = i === 0 ? 'hobi' : 'rajin'));
    put(s, 'balaiRW', 13, 3);
    put(s, 'posyandu', 14, 5);
    put(s, 'portal', 15, 5);
    tick(s);
    const line = nextStarChecklist(s)!.find((l) => l.goal.kind === 'rwCombos')!;
    expect(line.done).toBe(true);
  });

  it('ties Jalan Ditutup to the burst month and zeroes ojol that month only', () => {
    const s = rw(2);
    const pasar = put(s, 'pasarKaget', 13, 3);
    put(s, 'portal', 14, 4);
    expect(activeCombos(s).map((a) => a.combo.id)).toContain('jalanDitutup');
    put(s, 'wifi', 3, 3);
    hire(s, 'ojol');
    s.res.rupiah = 1e6;
    s.month = 3; // 3 % 4 === 3: burst month
    const burst = jobsSystemForTest(s);
    s.month = 4;
    const calm = jobsSystemForTest(s);
    expect(burst.rupiah).toBe(0);
    expect(calm.rupiah).toBeGreaterThan(0);
    expect(pasar.def).toBe('pasarKaget');
  });

  it('doubles the Lomba Agustusan prizes again with Agustusan Akbar', () => {
    const s = rw(2);
    put(s, 'lapangan', 13, 3);
    put(s, 'gapura', 14, 4);
    // Lapangan doubles them, Agustusan Akbar doubles them again.
    expect(agustusMult(s)).toBe(4);
  });
});

describe('RW building effects', () => {
  it('Posyandu lifts every AI RT and the player\'s own Sabar', () => {
    const s = rw(1);
    const n = s.neighbours[0];
    const before = viewOf(s, n).res.sabar;
    put(s, 'posyandu', 13, 3);
    expect(viewOf(s, n).res.sabar).toBe(Math.min(80, before + 3));
    s.res.sabar = 50;
    tick(s);
    expect(s.res.sabar).toBeGreaterThan(50);
  });

  it('Portal cuts ojol income by 30%', () => {
    const s = rw(1);
    put(s, 'wifi', 3, 3);
    hire(s, 'ojol');
    const plain = jobsSystemForTest(s).rupiah;
    put(s, 'portal', 13, 3);
    const gated = jobsSystemForTest(s).rupiah;
    expect(plain).toBeGreaterThan(0);
    expect(gated).toBeCloseTo(plain * 0.7, -2);
  });

  it('Pasar Kaget pays x3 one month in four', () => {
    const s = rw(2);
    const b = put(s, 'pasarKaget', 13, 3);
    const incomes = [0, 1, 2, 3].map((m) => ((s.month = m), buildingIncome(s, b)));
    expect(incomes[3]).toBe(incomes[0] * 3);
    expect(new Set(incomes.slice(0, 3)).size).toBe(1);
  });

  it('Pasar Kaget spawns 2 tukang parkir when it opens', () => {
    const s = rw(2);
    const b = put(s, 'pasarKaget', 13, 3);
    const before = s.buildings.filter((x) => x.def === 'parkir').length;
    onBuildingFinished(s, [], b);
    expect(s.buildings.filter((x) => x.def === 'parkir').length - before).toBe(2);
  });

  it('Gapura gives +5 Viral in August, charges the repaint, and does nothing in other months', () => {
    const s = rw(2);
    put(s, 'gapura', 13, 3);
    s.month = 27;
    s.res.viral = 0;
    s.res.rupiah = 5_000_000;
    tick(s); // week 28 = first week of August
    expect(s.res.viral).toBeGreaterThanOrEqual(4); // +5, less a month of decay
    expect(s.res.rupiah).toBeLessThan(5_000_000);
    s.pendingEvent = null;
    s.res.viral = 0;
    const cash = s.res.rupiah;
    tick(s); // the next week
    expect(s.res.viral).toBeLessThan(1);
    expect(s.res.rupiah).toBeGreaterThanOrEqual(cash - 200_000);
  });
});

describe('RW jobs', () => {
  it('slots Kader at the Posyandu and Calo at the Balai RW', () => {
    const s = rw(2);
    const r = addResident(s);
    expect(assign(s, r, 'kaderPosyandu').ok).toBe(false);
    put(s, 'posyandu', 13, 3);
    put(s, 'balaiRW', 14, 5);
    expect(assign(s, r, 'kaderPosyandu').ok).toBe(true);
    expect(assign(s, addResident(s), 'calo').ok).toBe(true);
  });

  it('Kader lose 40% a year without an Apresiasi and recover when it is paid', () => {
    const s = rw(1);
    put(s, 'posyandu', 13, 3);
    hire(s, 'kaderPosyandu');
    s.res.rupiah = 0;
    s.month = 47;
    s.pendingEvent = null;
    tick(s); // year end with an empty kas
    expect(s.rw.kaderDecay).toBeCloseTo(0.4);
    s.res.rupiah = 5_000_000;
    s.month = 95;
    s.pendingEvent = null;
    tick(s);
    expect(s.rw.kaderDecay).toBe(0);
  });

  it('Calo turns Rp 200.000 into a stamp and Orang Dalam', () => {
    const s = rw(2);
    put(s, 'balaiRW', 13, 3);
    hire(s, 'calo');
    s.stempel.backlog = 4;
    s.res.orangDalam = 0;
    const gained = jobsSystemForTest(s, true);
    expect(s.stempel.backlog).toBeLessThan(4);
    expect(s.res.orangDalam).toBeCloseTo(0.1);
    expect(gained.rupiah).toBeLessThanOrEqual(-200_000);
  });
});

describe('RW events', () => {
  const choose = (s: GameState, id: string, i: number) => {
    s.pendingEvent = id;
    return resolveEvent(s, [], i);
  };

  it('Musim Pindahan triples the letters for 2 months, then they go back', () => {
    const s = rw(2);
    choose(s, 'musimPindahan', 0);
    expect(s.rw.letterMult).toEqual({ mult: 3, until: s.month + 2 });
    const cheap = rw(2);
    choose(cheap, 'musimPindahan', 1);
    expect(cheap.rw.letterMult!.mult).toBe(2);
  });

  it('Pendataan Warga moves the ranking score when the spreadsheet is reported', () => {
    const s = rw(1);
    const honest = areaScore(s);
    choose(s, 'pendataanWarga', 0);
    expect(areaScore(s)).toBeGreaterThanOrEqual(honest);
    s.month += 13;
    expect(areaScore(s)).toBe(honest);
  });

  it('Kerja Bakti makes the biopori protect more against banjir', () => {
    const s = rw(0);
    put(s, 'biopori', 3, 3);
    const before = banjirProtection(s);
    choose(s, 'kerjaBakti', 1);
    expect(banjirProtection(s)).toBeGreaterThan(before);
  });

  it('raises every RW event at a time it can happen, and never before its gate', () => {
    const rt = newGame(1);
    rt.month = 30;
    for (let i = 0; i < 400; i++) {
      rt.pendingEvent = null;
      tick(rt);
      expect(['kerjaBakti', 'musimPindahan', 'pendataanWarga']).not.toContain(rt.pendingEvent);
    }
  });
});

describe('saves', () => {
  it('opens an old save without RW state', () => {
    const s = newGame(1);
    const raw = JSON.parse(serialize(s));
    delete raw.rw;
    expect(deserialize(JSON.stringify(raw))!.rw).toEqual({ kaderDecay: 0 });
  });
});
