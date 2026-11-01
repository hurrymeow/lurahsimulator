import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it } from 'vitest';
import { AMAN_RUN_MIN, amanAcross, DISTRICT_STAR_WEEKS, kecSystem } from '../src/sim/kec';
import { deserialize, serialize } from '../src/sim/save';
import { acceptSK, canPromote, nextStarChecklist, stageSystem } from '../src/sim/stages';
import { meters } from '../src/sim/needs';
import { newGame } from '../src/sim/state';
import { GRID_H, GRID_W, setGrid, type GameState } from '../src/sim/types';

afterEach(() => setGrid('rt'));

const seed = (): GameState => deserialize(readFileSync(new URL('../src/sim/seeds/kel.json', import.meta.url), 'utf8'))!;

/** The Kelurahan seed with its 3rd star, the SK offered. */
function kel3(): GameState {
  const s = seed();
  s.stage.stars.kelurahan = 3;
  s.stage.sk = 'offered';
  return s;
}

describe('promotion into the Kecamatan', () => {
  it('a Kelurahan 3★ save accepts the SK and keeps its map', () => {
    const s = kel3();
    const [w, h, buildings, neighbours] = [GRID_W, GRID_H, s.buildings.length, s.neighbours.length];
    expect(canPromote(s)).toBe(true);
    expect(acceptSK(s)).toBe(true);
    expect(s.stage.current).toBe('kecamatan');
    expect(s.stage.stars.kecamatan).toBe(0);
    expect(s.stage.sk).toBeUndefined();
    expect([GRID_W, GRID_H, s.buildings.length, s.neighbours.length]).toEqual([w, h, buildings, neighbours]);
    expect(s.kec!.districts.map((d) => d.stars)).toEqual([0, 0, 0]);
    expect(s.kec!.since).toBe(s.month);
  });

  it('shows every goal line with have and need', () => {
    const s = kel3();
    acceptSK(s);
    const lines = nextStarChecklist(s)!;
    expect(lines.map((l) => l.goal.kind)).toEqual(['built', 'kelsAtStars', 'pinjolUnder', 'residents']);
    for (const l of lines) expect(l.text).toMatch(/\d/);
    expect(lines.find((l) => l.goal.kind === 'kelsAtStars')!.text).toBe('4 Kelurahan at 1★ or above (have 1)');
    expect(lines.find((l) => l.goal.kind === 'built')!.done).toBe(false);
  });

  it('meets pinjol-under goals from below', () => {
    const s = kel3();
    acceptSK(s);
    s.kec!.pinjol = 30;
    expect(nextStarChecklist(s)!.find((l) => l.goal.kind === 'pinjolUnder')!.done).toBe(false);
    s.kec!.pinjol = 24;
    expect(nextStarChecklist(s)!.find((l) => l.goal.kind === 'pinjolUnder')!.done).toBe(true);
  });

  it('offers the SK to a Kelurahan save that was already at 3★', () => {
    const s = seed();
    s.stage.stars.kelurahan = 3;
    delete s.stage.sk;
    stageSystem(s, []);
    expect(s.stage.sk).toBe('offered');
  });
});

describe('the modelled Kelurahan', () => {
  it('earn stars with time and never lose them', () => {
    const s = kel3();
    acceptSK(s);
    for (let i = 0; i < 400; i++) kecSystem(s);
    const stars = s.kec!.districts.map((d) => d.stars);
    expect(Math.max(...stars)).toBe(3);
    expect(s.kec!.districts.every((d) => d.stars >= 2)).toBe(true);
    const before = s.kec!.districts.map((d) => d.progress);
    kecSystem(s);
    expect(s.kec!.districts.map((d) => d.stars)).toEqual(stars);
    expect(s.kec!.districts.every((d, i) => d.progress > before[i])).toBe(true);
    expect(DISTRICT_STAR_WEEKS).toHaveLength(3);
  });

  it('counts the Aman run only while Aman across the Kecamatan holds', () => {
    const s = kel3();
    acceptSK(s);
    const mine = meters(s).aman;
    expect(amanAcross(s)).toBe(Math.round((mine + 3 * 55) / 4));
    const bar = amanAcross(s);
    s.kec!.amanRun = 5;
    kecSystem(s);
    expect(s.kec!.amanRun).toBe(bar >= AMAN_RUN_MIN ? 6 : 0);
  });
});

describe('saves', () => {
  it('an old save loads unchanged and gets no Kecamatan state', () => {
    const s = newGame(3);
    const raw = JSON.parse(serialize(s));
    delete raw.stage.stars.kecamatan;
    const loaded = deserialize(JSON.stringify(raw))!;
    expect(loaded.stage.current).toBe('rt');
    expect(loaded.stage.stars.kecamatan).toBe(0);
    expect(loaded.kec).toBeUndefined();
    expect(loaded.buildings).toEqual(s.buildings);
  });

  it('a Kecamatan save round-trips', () => {
    const s = kel3();
    acceptSK(s);
    const back = deserialize(serialize(s))!;
    expect(back.stage.current).toBe('kecamatan');
    expect(back.kec).toEqual(s.kec);
  });
});
