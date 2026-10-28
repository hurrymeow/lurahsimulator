import { describe, expect, it } from 'vitest';
import { canShowQueued, POPUP_IDLE_MS, type PopupQueueState } from '../src/ui/popupQueue';

const idle: PopupQueueState = { modalHidden: true, sheetOpen: false, placing: false, homeOpen: false, howtoOpen: false };

describe('popup queue', () => {
  it('shows when the player has been idle for 500ms', () => {
    expect(canShowQueued(10000, 10000 - POPUP_IDLE_MS, idle)).toBe(true);
  });

  it('waits while the player is still tapping', () => {
    expect(canShowQueued(10000, 10000 - POPUP_IDLE_MS + 1, idle)).toBe(false);
    expect(canShowQueued(10000, 10000, idle)).toBe(false);
  });

  it.each([
    ['sheet open', { sheetOpen: true }],
    ['placing', { placing: true }],
    ['home open', { homeOpen: true }],
    ['how-to open', { howtoOpen: true }],
    ['a card already showing', { modalHidden: false }],
  ])('waits when %s', (_n, patch) => {
    expect(canShowQueued(10000, 0, { ...idle, ...patch })).toBe(false);
  });
});
