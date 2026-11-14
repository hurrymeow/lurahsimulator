import { describe, expect, it } from 'vitest';
import { INEM_LEAD_SLOW, checkRealisasi, realisasiSystem, startRealisasi } from '../src/sim/realisasi';
import { ensureStaff, inem, picCandidates } from '../src/sim/staff';
import { goalProgress } from '../src/sim/stages';
import { newGame } from '../src/sim/state';
import type { GameState, Staff, StageId } from '../src/sim/types';

// Staff move a star (docs/plans/staff-move-stars.md): programs carried out count per stage; from the RW on, Inem leads
// one program at a time at double delay, and a lead stays busy while the program runs.
const game = (stage: StageId = 'rw'): GameState => {
  const s = newGame(1);
  ensureStaff(s);
  s.res.rupiah = 100_000_000;
  s.stage.current = stage;
  return s;
};

const hire = (s: GameState, rajin = 50): Staff => {
  const x: Staff = { id: s.nextStaffId!++, name: 'Bu Test', role: 'penagih', stars: 3, stats: { rajin, lobi: 40, jujur: 80, gaul: 40 }, salary: 450_000, xp: 0, level: 1, hiredAt: s.month };
  s.staff!.push(x);
  return x;
};

const weeks = (s: GameState, n: number) => {
  for (let i = 0; i < n; i++) {
    s.month++;
    realisasiSystem(s, []);
  }
};

describe('programs carried out', () => {
  it('count only the programs that landed in the current stage', () => {
    const s = game('rt');
    startRealisasi(s, 'kerjaBakti');
    weeks(s, 10);
    expect(goalProgress(s, { kind: 'realisasiDone', n: 3 }).have).toBe(1);
    s.stage.current = 'rw';
    expect(goalProgress(s, { kind: 'realisasiDone', n: 3 }).have).toBe(0);
  });

  it('at the RT Inem leads as many programs as she likes; from the RW on, one at a time and twice as slow', () => {
    const rt = game('rt');
    expect(startRealisasi(rt, 'kerjaBakti').ok).toBe(true);
    expect(startRealisasi(rt, 'wifiGratis').ok).toBe(true);
    const rw = game('rw');
    expect(startRealisasi(rw, 'kerjaBakti').ok).toBe(true);
    const run = rw.realisasi![0];
    expect(run.pic).toBe(inem(rw)!.id);
    const atRt = rt.realisasi!.find((r) => r.id === 'kerjaBakti')!;
    expect(run.landsAt - rw.month).toBe((atRt.landsAt - rt.month) * INEM_LEAD_SLOW);
    expect(picCandidates(rw, 'rajin')).toHaveLength(0);
    expect(checkRealisasi(rw, 'wifiGratis').ok).toBe(false);
  });

  it('a hire leads one more at once, and stays on it until the program ends', () => {
    const s = game('rw');
    hire(s, 80);
    expect(startRealisasi(s, 'kerjaBakti').ok).toBe(true);
    expect(startRealisasi(s, 'wifiGratis').ok).toBe(true);
    expect(checkRealisasi(s, 'pelatihanUmkm').ok).toBe(false);
    const first = s.realisasi![0];
    weeks(s, first.landsAt - s.month);
    // Landed, but still running: its lead is not free yet.
    expect(checkRealisasi(s, 'pelatihanUmkm').ok).toBe(false);
    weeks(s, first.endsAt - s.month);
    expect(checkRealisasi(s, 'pelatihanUmkm').ok).toBe(true);
  });
});
