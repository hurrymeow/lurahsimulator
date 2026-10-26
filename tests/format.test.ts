import { describe, expect, it } from 'vitest';
import { rupiahHud } from '../src/format';

describe('rupiahHud', () => {
  it('shortens without rounding up', () => {
    expect(rupiahHud(850)).toBe('Rp 850');
    expect(rupiahHud(150_999)).toBe('Rp 150rb');
    expect(rupiahHud(5_000_000)).toBe('Rp 5jt');
    expect(rupiahHud(4_850_000)).toBe('Rp 4,85jt');
    expect(rupiahHud(4_859_999)).toBe('Rp 4,85jt');
    expect(rupiahHud(123_400_000)).toBe('Rp 123jt');
    expect(rupiahHud(1_234_567_890)).toBe('Rp 1,23M');
    expect(rupiahHud(-2_500_000)).toBe('-Rp 2,5jt');
  });
});
