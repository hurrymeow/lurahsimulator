import { describe, expect, it } from 'vitest';
import { autoPaused, autoPauseStarted, showPausedBadge, simRunning, type PauseInputs } from '../src/ui/autopause';

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

  it('starts an auto-pause only on the running-to-held transition', () => {
    expect(autoPauseStarted(true, { ...idle, modals: 1 })).toBe(true);
    expect(autoPauseStarted(true, { ...idle, sheetOpen: true })).toBe(true);
    expect(autoPauseStarted(false, { ...idle, modals: 1 })).toBe(false);
    expect(autoPauseStarted(true, idle)).toBe(false);
    expect(autoPauseStarted(true, { ...idle, speed: 0, modals: 1 })).toBe(false);
  });

  it('shows the Paused pill only over a visible map', () => {
    expect(showPausedBadge(idle)).toBe(false);
    expect(showPausedBadge({ ...idle, placing: true })).toBe(true);
    // The player's own pause shows it too.
    expect(showPausedBadge({ ...idle, speed: 0 })).toBe(true);
    expect(showPausedBadge({ ...idle, speed: 0, sheetOpen: true })).toBe(false);
    for (const patch of [{ sheetOpen: true }, { modals: 1 }, { pendingEvent: true }, { howtoOpen: true }, { held: true }]) {
      expect(showPausedBadge({ ...idle, ...patch })).toBe(false);
    }
    expect(showPausedBadge({ ...idle, placing: true, sheetOpen: true })).toBe(false);
  });
});
