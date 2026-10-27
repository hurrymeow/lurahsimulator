import { describe, expect, it } from 'vitest';
import { BADGE_H, placeBadge, type BadgeBox } from '../src/render/badge';

describe('map badges', () => {
  it('leaves a lone badge where it is', () => {
    expect(placeBadge([], 100, 100, 60)).toBe(100);
  });

  it('lifts a badge that would sit on top of another, until it clears', () => {
    const placed: BadgeBox[] = [];
    const ys = [placeBadge(placed, 100, 100, 70), placeBadge(placed, 130, 104, 70), placeBadge(placed, 110, 98, 20)];
    for (let i = 0; i < ys.length; i++) {
      for (let j = i + 1; j < ys.length; j++) {
        const apart = Math.abs(placed[i].x - placed[j].x) >= (placed[i].w + placed[j].w) / 2 || Math.abs(ys[i] - ys[j]) >= BADGE_H;
        expect(apart, `badge ${i} overlaps ${j}`).toBe(true);
      }
    }
  });

  it('keeps side-by-side badges level', () => {
    const placed: BadgeBox[] = [];
    placeBadge(placed, 100, 100, 40);
    expect(placeBadge(placed, 200, 100, 40)).toBe(100);
  });
});
