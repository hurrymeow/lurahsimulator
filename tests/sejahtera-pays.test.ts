import { describe, expect, it } from 'vitest';
import { newGame } from '../src/sim/state';
import { sejahteraShopMult } from '../src/sim/tick';

describe('Sejahtera pays shop income', () => {
  it('adds nothing at 50 or below and up to 25% at 100', () => {
    const s = newGame(1);
    s.meters = { perut: 50, kerja: 50, aman: 50, cap: 100 };
    expect(sejahteraShopMult(s)).toBe(1);
    s.meters = { perut: 20, kerja: 20, aman: 20, cap: 100 };
    expect(sejahteraShopMult(s)).toBe(1);
    s.meters = { perut: 100, kerja: 100, aman: 100, cap: 100 };
    expect(sejahteraShopMult(s)).toBeCloseTo(1.25);
    s.meters = { perut: 100, kerja: 100, aman: 100, cap: 30 };
    expect(sejahteraShopMult(s)).toBeCloseTo(1 + 0.25 * (30 - 50 > 0 ? 1 : 0));
  });
});
