import { describe, expect, it } from 'vitest';
import { ROLE_FX } from '../src/data/staff';
import { nextStep } from '../src/sim/nextstep';
import { clearPermits, deskCapacity, ensureStaff, permitEta, permitQueue, queueMonths } from '../src/sim/staff';
import { addBuilding, newGame } from '../src/sim/state';
import { tick } from '../src/sim/tick';
import type { GameState, Staff } from '../src/sim/types';

/** A game with Inem, rich enough to build, and n permits of the given folders, placed in that order. */
function queued(folders: number[]): GameState {
  const s = newGame(4);
  ensureStaff(s);
  s.res.rupiah = 1e9;
  folders.forEach((f, i) => {
    const b = addBuilding(s, 'warung', 1 + i, 1, 'permit');
    b.timer = f;
    b.placedAt = i;
  });
  return s;
}

const clerk = (id: number, lobi = 50): Staff =>
  ({ id, name: `Asisten ${id}`, role: 'asisten', stars: 2, stats: { rajin: 50, lobi, jujur: 50, gaul: 50 }, salary: 300_000, xp: 0, level: 1, hiredAt: 0 }) as Staff;

describe('the permit desk queue', () => {
  it('Inem alone clears about one folder a month, first placed first', () => {
    const s = queued([2, 1, 1]);
    expect(deskCapacity(s)).toBeCloseTo(1.02, 2);
    const [a, b, c] = permitQueue(s);
    expect(clearPermits(s)).toEqual([]);
    expect([a.timer, b.timer, c.timer]).toEqual([1, 1, 1]);
    expect(clearPermits(s)).toEqual([a]);
    expect(permitEta(s, c)).toBe(2);
  });

  it('every Asisten hired adds a desk, so the queue clears sooner', () => {
    const s = queued([3, 3, 3]);
    const before = queueMonths(s);
    s.staff!.push(clerk(2), clerk(3));
    expect(deskCapacity(s)).toBeGreaterThan(2.5);
    expect(queueMonths(s)).toBeLessThan(before / 2);
  });

  it('never stops: with Inem away, the Kantor still clears half a folder a month', () => {
    const s = queued([1]);
    s.staff![0].away = 1;
    expect(deskCapacity(s)).toBe(ROLE_FX.asisten.floor);
    expect(clearPermits(s)).toEqual([]);
    expect(clearPermits(s)).toHaveLength(1);
  });

  it('a stamped building goes on site, and the queue costs Popularitas while it waits', () => {
    const s = queued([1, 1]);
    s.res.sabar = 60;
    s.pendingEvent = null;
    tick(s);
    const statuses = s.buildings.filter((b) => b.def === 'warung').map((b) => b.status);
    expect(statuses).toContain('building');
    expect(statuses).toContain('permit');
  });

  it('the goal strip says to hire an Asisten once the queue is three months deep and a slot is free', () => {
    const s = queued([1, 1]);
    s.stage.stars.rt = 1;
    expect(nextStep(s)?.kind).not.toBe('desk');
    const t = queued([3, 3, 3]);
    t.stage.stars.rt = 1;
    expect(queueMonths(t)).toBeGreaterThanOrEqual(ROLE_FX.asisten.hireAfter);
    // A house exists in a new game, so the first-house step does not lead.
    expect(nextStep(t)?.kind).toBe('desk');
    // No room on the staff: the strip goes back to waiting.
    t.stage.stars.rt = 0;
    expect(nextStep(t)?.kind).not.toBe('desk');
  });
});
