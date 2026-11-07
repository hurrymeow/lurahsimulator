import { describe, expect, it } from 'vitest';
import { BPM, SCORE, TICKS_PER_BEAT } from '../src/music-score';
import { BAR, BARS } from '../src/music';

const BAR_TICKS = 4 * TICKS_PER_BEAT;
const CHANNELS = new Set([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]);

describe('Mars Pak Pejabat score', () => {
  it('loops in exactly three minutes', () => {
    expect(BPM).toBe(112);
    expect(BARS).toBe(84);
    expect(BARS * BAR).toBeCloseTo(180, 6);
  });

  it('keeps every note inside its bar, on a known channel, in range', () => {
    SCORE.forEach((bar, b) => {
      expect(bar.length % 5, `bar ${b}`).toBe(0);
      expect(bar.length, `bar ${b} is empty`).toBeGreaterThan(0);
      for (let i = 0; i < bar.length; i += 5) {
        const [ch, start, len, note, vel] = bar.slice(i, i + 5);
        expect(CHANNELS.has(ch), `bar ${b} channel ${ch}`).toBe(true);
        expect(start).toBeGreaterThanOrEqual(0);
        expect(start).toBeLessThan(BAR_TICKS);
        expect(len).toBeGreaterThan(0);
        expect(note).toBeGreaterThanOrEqual(24);
        expect(note).toBeLessThanOrEqual(96);
        expect(vel).toBeGreaterThan(0);
        expect(vel).toBeLessThanOrEqual(127);
      }
    });
  });

  it('ends on the dominant so the loop turns back to the top in F', () => {
    const notes = (b: number) => SCORE[b].filter((_, i) => i % 5 === 3).map((m) => m % 12);
    expect(notes(BARS - 1)).toContain(0); // C, the root of C7
    expect(notes(0)).toContain(5); // F
  });
});
