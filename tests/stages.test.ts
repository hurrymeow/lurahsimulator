import { describe, expect, it } from 'vitest';
import { activeCombos, comboIncomeMult } from '../src/sim/combos';
import { agustusMult, banjirProtection } from '../src/sim/events';
import { checkPlace, checkUpgrade } from '../src/sim/rules';
import { deserialize, serialize } from '../src/sim/save';
import { addBuilding, housing, newGame } from '../src/sim/state';
import { canPromote, declineSK, nextStarChecklist, reofferSK, starsEarnable } from '../src/sim/stages';
import { tick } from '../src/sim/tick';

const add = (s: ReturnType<typeof newGame>, id: string, x: number, y: number) => addBuilding(s, id, x, y, 'active');

describe('stage checklist', () => {
  it('starts at 0 stars and names exactly what is missing', () => {
    const s = newGame(1);
    expect(s.stage).toEqual({ current: 'rt', stars: { rt: 0, rw: 0, kelurahan: 0 } });
    const lines = nextStarChecklist(s)!;
    expect(lines.map((l) => l.text)).toEqual(['12 residents (have 4)', '1 combos found (have 0)']);
    expect(starsEarnable(s)).toBe(false);
  });

  it('ticks lines off as the goals are met', () => {
    const s = newGame(1);
    s.discovered.push('tongkrongan');
    s.residents.push(...Array.from({ length: 8 }, (_, i) => ({ ...s.residents[0], id: 100 + i })));
    expect(nextStarChecklist(s)!.every((l) => l.done)).toBe(true);
    expect(starsEarnable(s)).toBe(true);
  });

  it('counts a win streak from the latest year', () => {
    const s = newGame(1);
    s.stage.stars.rt = 2;
    s.ranking = [true, false, true, true].map((won, i) => ({ year: i + 1, us: 1, them: 1, won }));
    const streak = nextStarChecklist(s)!.find((l) => l.goal.kind === 'winStreak')!;
    expect(streak.done).toBe(true);
  });

  it('is null at 3 stars', () => {
    const s = newGame(1);
    s.stage.stars.rt = 3;
    expect(nextStarChecklist(s)).toBeNull();
  });

  it('fills the stage into saves from before stages', () => {
    const s = newGame(1) as Partial<ReturnType<typeof newGame>>;
    delete s.stage;
    expect(deserialize(serialize(s as never))!.stage.current).toBe('rt');
  });
});

describe('star engine', () => {
  const calm = (s: ReturnType<typeof newGame>) => {
    s.res.sabar = 80;
  };
  const run = (s: ReturnType<typeof newGame>, n = 1) => {
    const fx = [];
    for (let i = 0; i < n; i++) {
      calm(s);
      fx.push(...tick(s));
      s.pendingEvent = null;
    }
    return fx;
  };

  it('earns 1 star when the checklist is done, with fanfare, the unlocks and the reward', () => {
    const s = newGame(1);
    s.discovered.push('tongkrongan');
    s.residents.push(...Array.from({ length: 8 }, (_, i) => ({ ...s.residents[0], id: 100 + i })));
    const od = s.res.orangDalam;
    const fx = run(s);
    expect(s.stage.stars.rt).toBe(1);
    expect(s.unlocked).toEqual(expect.arrayContaining(['indomaret', 'alfamart', 'kosan']));
    expect(s.res.orangDalam).toBeGreaterThanOrEqual(od + 1);
    expect(fx.some((f) => f.kind === 'notice' && f.fanfare && f.title.startsWith('1★'))).toBe(true);
  });

  it('gates shops, Kos-kosan and Kantor RT levels on stars', () => {
    const s = newGame(1);
    s.res.rupiah = 100_000_000;
    add(s, 'warung', 0, 0);
    expect(checkPlace(s, 'indomaret', 1, 0)).toMatchObject({ ok: false, missing: expect.arrayContaining([expect.stringContaining('RT Rintisan')]) });
    expect(checkPlace(s, 'kosan', 1, 0).ok).toBe(false);
    const kantor = s.buildings.find((b) => b.def === 'kantorRT')!;
    expect(checkUpgrade(s, kantor).ok).toBe(false);
    s.stage.stars.rt = 1;
    expect(checkPlace(s, 'indomaret', 1, 0).ok).toBe(true);
    expect(checkPlace(s, 'kosan', 2, 0).ok).toBe(true);
    expect(checkPlace(s, 'lapangan', 2, 0).ok).toBe(false);
    expect(checkUpgrade(s, kantor).ok).toBe(true);
    s.stage.stars.rt = 2;
    expect(checkPlace(s, 'lapangan', 2, 0).ok).toBe(true);
  });

  it('never drops a star, even when the goals are no longer met', () => {
    const s = newGame(1);
    s.stage.stars.rt = 2;
    run(s, 24);
    expect(s.stage.stars.rt).toBeGreaterThanOrEqual(2);
  });

  it('offers the SK at 3 stars and lets the player decline and ask again', () => {
    const s = newGame(1);
    s.stage.stars.rt = 2;
    s.discovered.push('a', 'b', 'c');
    s.residents.push(...Array.from({ length: 40 }, (_, i) => ({ ...s.residents[0], id: 100 + i })));
    s.ranking = [true, true].map((won, i) => ({ year: i + 1, us: 1, them: 1, won }));
    const fx = run(s);
    expect(s.stage.stars.rt).toBe(3);
    expect(s.stage.sk).toBe('offered');
    expect(fx.some((f) => f.kind === 'notice' && f.title === 'An SK has arrived')).toBe(true);
    expect(canPromote(s)).toBe(true);
    declineSK(s);
    expect(s.stage.sk).toBe('declined');
    reofferSK(s);
    expect(s.stage.sk).toBe('offered');
  });
});

describe('late-RT content', () => {
  it('Kos-kosan houses 6', () => {
    const s = newGame(1);
    const before = housing(s);
    add(s, 'kosan', 0, 0);
    expect(housing(s)).toBe(before + 6);
  });

  it('Lapangan doubles the Agustus prize and Panjat Pinang adds half again', () => {
    const s = newGame(1);
    expect(agustusMult(s)).toBe(1);
    add(s, 'lapangan', 0, 0);
    expect(agustusMult(s)).toBe(2);
    add(s, 'posRonda', 1, 0);
    expect(activeCombos(s).map((a) => a.combo.id)).toContain('panjatPinang');
    expect(agustusMult(s)).toBe(3);
  });

  it('Kali Bersih cuts banjir damage by 20% and the 80% cap holds', () => {
    const s = newGame(1);
    add(s, 'selokan', 0, 0);
    add(s, 'bankSampah', 1, 0);
    expect(activeCombos(s).map((a) => a.combo.id)).toContain('kaliBersih');
    expect(banjirProtection(s)).toBeCloseTo(0.4);
    for (let i = 0; i < 6; i++) add(s, 'selokan', i, 5);
    expect(banjirProtection(s)).toBe(0.8);
  });

  it('Anak Kos boosts the warung by 30% and adds Viral', () => {
    const s = newGame(1);
    add(s, 'kosan', 0, 0);
    const w = add(s, 'warung', 1, 0);
    add(s, 'wifi', 1, 1);
    expect(activeCombos(s).map((a) => a.combo.id)).toContain('anakKos');
    expect(comboIncomeMult(s, w)).toBeCloseTo(1.3);
  });
});
