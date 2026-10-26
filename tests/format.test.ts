import { describe, expect, it } from 'vitest';
import { rupiahHud } from '../src/format';

describe('rupiahHud', () => {
  it('shortens without rounding up', () => {
    expect(rupiahHud(850)).toBe('850');
    expect(rupiahHud(150_999)).toBe('150rb');
    expect(rupiahHud(5_000_000)).toBe('5jt');
    expect(rupiahHud(4_850_000)).toBe('4,85jt');
    expect(rupiahHud(4_859_999)).toBe('4,85jt');
    expect(rupiahHud(123_400_000)).toBe('123jt');
    expect(rupiahHud(1_234_567_890)).toBe('1,23M');
    expect(rupiahHud(-2_500_000)).toBe('-2,5jt');
  });
});
