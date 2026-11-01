import { afterEach, describe, expect, it } from 'vitest';
import { YEAR_SCALE } from '../src/sim/calendar';
import { activeCombos } from '../src/sim/combos';
import { resolveEvent } from '../src/sim/events';
import { assign, liveJobs } from '../src/sim/jobs';
import { kelSystem, serapan, wacanaNoReceipt } from '../src/sim/kel';
import { onBuildingFinished } from '../src/sim/projects';
import { areaScore } from '../src/sim/ranking';
import { nextStarChecklist } from '../src/sim/stages';
import { addBuilding, addResident, newGame } from '../src/sim/state';
import { buildingUpkeep, tick } from '../src/sim/tick';
import { setGrid, type GameState, type JobId } from '../src/sim/types';
import { jobsSystemForTest } from './rw-helpers';

afterEach(() => setGrid('rt'));

/** A Kelurahan-stage game. Tests place buildings by hand, so lots do not matter. */
function kel(stars: 0 | 1 | 2 = 2, path: 'kelurahan' = 'kelurahan'): GameState {
  const s = newGame(5);
  s.stage.current = 'kelurahan';
  s.stage.path = path;
  s.stage.stars.kelurahan = stars;
  setGrid('kelurahan');
  s.res.rupiah = 1e9;
  s.res.sabar = 60;
  return s;
}

const put = (s: GameState, id: string, x: number, y: number) => addBuilding(s, id, x, y, 'active');
const hire = (s: GameState, job: JobId) => {
  const r = addResident(s);
  r.job = job;
  r.manual = true;
  return r;
};
/** Runs the budget system alone at a given month. */
const at = (s: GameState, month: number) => {
  s.month = month;
  const fx: Parameters<typeof kelSystem>[1] = [];
  kelSystem(s, fx);
  return fx;
};

describe('Anggaran and serapan', () => {
  it('pays the first budget at once and does nothing at the RT stage', () => {
    const rt = newGame(1);
    const before = rt.res.rupiah;
    kelSystem(rt, []);
    expect(rt.res.rupiah).toBe(before);
    const s = kel();
    s.res.rupiah = 0;
    at(s, 1);
    expect(s.kel.budget).toBe(24_000_000 * YEAR_SCALE * s.inflation);
    expect(s.res.rupiah).toBe(s.kel.budget);
  });

  it('cuts next year by the unspent share, never below the floor', () => {
    const s = kel();
    at(s, 1);
    const first = s.kel.budget;
    s.stats.spent += first * 0.75;
    at(s, 48);
    expect(s.kel.budget).toBe(Math.round((first * 0.75) / 1000) * 1000);
    const second = s.kel.budget;
    at(s, 96); // nothing spent at all
    expect(s.kel.budget).toBeCloseTo(Math.round((first * 0.2) / 1000) * 1000, -3);
    expect(s.kel.budget).toBeLessThan(second);
  });

  it('counts months in a row at 80% serapan against what is due so far', () => {
    const s = kel(0);
    at(s, 1);
    expect(serapan(s)).toBe(0);
    s.stats.spent += s.kel.budget; // spent the whole year up front
    for (let m = 2; m <= 6; m++) at(s, m);
    expect(s.kel.serapanRun).toBeGreaterThanOrEqual(5);
    const line = nextStarChecklist(s, 'kelurahan')!.find((l) => l.goal.kind === 'serapanMonths')!;
    expect(line.text).toContain(String(s.kel.serapanRun));
    s.stats.spent = s.kel.spentBase; // spending stops, so the streak breaks
    s.month = 7;
    kelSystem(s, []);
    expect(s.kel.serapanRun).toBe(0);
  });

  it('rushes half of the December shortfall into aspal, if the kas can cover it', () => {
    const s = kel();
    at(s, 1);
    const before = s.res.rupiah;
    const fx = at(s, 47);
    const rush = before - s.res.rupiah;
    expect(rush).toBe(Math.round((s.kel.budget * 0.5) / 1000) * 1000);
    expect(fx.some((f) => f.kind === 'notice')).toBe(true);
    s.res.rupiah = 1000;
    at(s, 95);
    expect(s.res.rupiah).toBeGreaterThanOrEqual(0);
  });

});

describe('Tim Audit', () => {
  const audit = (s: GameState, choice: number) => {
    s.pendingEvent = 'timAudit';
    return resolveEvent(s, [], choice);
  };

  it('clean when no wacana lacks a receipt, and costs 2 Popularitas for each that does', () => {
    const s = kel(1);
    expect(wacanaNoReceipt(s)).toBe(0);
    audit(s, 0);
    expect(s.kel.cleanAudits).toBe(1);
    s.wacana.push({ id: 'digital', power: 0, times: 2, lastAnnounced: 0 }, { id: 'hijau', power: 0, times: 1, lastAnnounced: 0 });
    s.month = 30;
    const sabar = s.res.sabar;
    audit(s, 0);
    expect(sabar - s.res.sabar).toBe(4);
    expect(s.kel.cleanAudits).toBe(1);
  });

  it('the paid choice always gives a clean audit', () => {
    const s = kel(1);
    s.wacana.push({ id: 'digital', power: 0, times: 2, lastAnnounced: 0 });
    s.month = 30;
    audit(s, 1);
    expect(s.kel.cleanAudits).toBe(1);
    expect(nextStarChecklist(s, 'kelurahan')!.find((l) => l.goal.kind === 'cleanAudits')!.done).toBe(true);
  });

  it('Lomba Kelurahan lifts the area score for the months it lasts', () => {
    const s = kel(1);
    const plain = areaScore(s);
    s.pendingEvent = 'lombaKelurahan';
    resolveEvent(s, [], 1);
    expect(areaScore(s)).toBeGreaterThan(plain);
    s.month += 2;
    expect(areaScore(s)).toBe(plain);
  });
});

describe('Kelurahan combos, jobs and buildings', () => {
  it('Perang Tarif needs an ojol employed, and lifts ojol income x1.3', () => {
    const s = kel();
    put(s, 'terminal', 3, 3);
    expect(activeCombos(s).map((a) => a.combo.id)).not.toContain('perangTarif');
    put(s, 'wifi', 4, 4);
    hire(s, 'ojol');
    expect(activeCombos(s).map((a) => a.combo.id)).toContain('perangTarif');
    const t = kel();
    put(t, 'wifi', 4, 4);
    hire(t, 'ojol');
    expect(jobsSystemForTest(s).rupiah).toBeCloseTo(jobsSystemForTest(t).rupiah * 1.3, -3);
  });

  it('Spot Instagramable doubles the Taman upkeep', () => {
    const s = kel();
    const taman = put(s, 'taman', 3, 3);
    const plain = buildingUpkeep(s, taman);
    hire(s, 'influencer');
    put(s, 'wifi', 4, 4);
    expect(activeCombos(s).map((a) => a.combo.id)).toContain('spotInstagramable');
    expect(buildingUpkeep(s, taman)).toBe(plain * 2);
  });

  it('Studi Banding returns one wacana when it opens', () => {
    const s = kel(1);
    const b = put(s, 'studiBanding', 3, 3);
    onBuildingFinished(s, [], b);
    expect(s.wacana).toHaveLength(1);
    expect(s.wacana[0].power).toBeGreaterThan(0);
  });

  it('Honorer is offered at 1 star, holds desks at the kantor, and can be made PNS after 5 years', () => {
    const s = kel(0);
    put(s, 'kantorKel', 3, 3);
    const r = addResident(s);
    expect(liveJobs(s).map((j) => j.id)).not.toContain('honorer');
    s.stage.stars.kelurahan = 1;
    expect(liveJobs(s).map((j) => j.id)).toContain('honorer');
    expect(assign(s, r, 'honorer').ok).toBe(true);
    r.manual = true;
    r.xp = 70;
    let promoted = false;
    for (let m = 0; m < 400 && !promoted; m++) {
      jobsSystemForTest(s);
      s.month++;
      promoted = r.job === 'pns';
    }
    expect(promoted).toBe(true);
  });

  it('keeps old saves loading with an empty Kelurahan state', () => {
    const s = newGame(1);
    expect(s.kel).toEqual({ budget: 0, spentBase: 0, serapanRun: 0, cleanAudits: 0 });
    tick(s);
    expect(s.kel.budget).toBe(0);
  });
});
