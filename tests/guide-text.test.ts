import { describe, expect, it } from 'vitest';
import { EN } from '../src/i18n/en';
import { ID } from '../src/i18n/id';

// The pixel heading font draws a lowercase f like a capital A, so "find" reads as "And".
describe('guide headings', () => {
  for (const [name, dict] of [['en', EN], ['id', ID]] as const) {
    it(`${name} How to play headings avoid the pixel font's f`, () => {
      const heads = Object.entries(dict).filter(([k]) => /^how\.\d+\.head$/.test(k));
      expect(heads.length).toBeGreaterThan(8);
      for (const [k, v] of heads) expect(v, k).not.toMatch(/f/);
    });
  }
});
