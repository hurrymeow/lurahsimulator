import { describe, expect, it } from 'vitest';
import { autoPaused, simRunning, type PauseInputs } from '../src/ui/autopause';

const idle: PauseInputs = { speed: 1, held: false, sheetOpen: false, modals: 0, pendingEvent: false, placing: false, howtoOpen: false };

describe('auto-pause', () => {
  it('runs when nothing is open', () => {
    expect(autoPaused(idle)).toBe(false);
    expect(simRunning(idle)).toBe(true);
  });

  it.each([
    ['menu or panel', { sheetOpen: true }],
    ['popup', { modals: 1 }],
    ['event card', { pendingEvent: true }],
    ['build mode', { placing: true }],
    ['how to play', { howtoOpen: true }],
    ['home screen', { held: true }],
  ])('holds time for %s and resumes after', (_n, patch) => {
    expect(simRunning({ ...idle, ...patch, speed: 4 })).toBe(false);
    expect(simRunning({ ...idle, speed: 4 })).toBe(true);
  });

  it('keeps a manual pause paused after the menu closes', () => {
    expect(simRunning({ ...idle, speed: 0, sheetOpen: true })).toBe(false);
    expect(simRunning({ ...idle, speed: 0 })).toBe(false);
  });
});
