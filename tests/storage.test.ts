import { describe, expect, it } from 'vitest';
import { storage } from '../src/storage';

// Node has no window, which is the same as storage being blocked.
describe('storage without localStorage', () => {
  it('returns null instead of throwing', () => {
    expect(storage.get('x')).toBeNull();
  });
  it('reports failed writes', () => {
    expect(storage.set('x', '1')).toBe(false);
  });
  it('ignores removes', () => {
    expect(() => storage.remove('x')).not.toThrow();
  });
});
