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

// The combo tip shows the two buildings, not the word "Combo": the heading already says it.
describe('combo tip picture', () => {
  it('shows Warung + Pos Ronda and no word', async () => {
    const { STEPS } = await import('../src/ui/howto');
    const combo = STEPS.find((s) => s.id === 'combo')!;
    expect(combo.pics).toEqual([{ sprite: 'warung' }, { text: '+' }, { sprite: 'posRonda' }]);
  });
});
