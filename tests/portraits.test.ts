import { describe, expect, it } from 'vitest';
import { ROLES, SPECIALS } from '../src/data/staff';
import { LOOKS, PORTRAIT, portraitGrid } from '../src/render/portraits';

describe('special hires and their portraits', () => {
  it('every special has a portrait, and every portrait belongs to a special', () => {
    expect(Object.keys(LOOKS).sort()).toEqual(SPECIALS.map((p) => p.id).sort());
  });

  it('the 90s types are hireable for real roles', () => {
    for (const id of ['bangLawak', 'omLaluLintas', 'buJuruKetik', 'pakKuis', 'mbakSenam', 'bangRentalPS']) {
      const sp = SPECIALS.find((p) => p.id === id);
      expect(sp, id).toBeDefined();
      expect(ROLES.some((r) => r.id === sp!.role), id).toBe(true);
    }
  });

  it('draws at 44x60 with coloured outlines and never pure black (ART.md)', () => {
    for (const id of Object.keys(LOOKS)) {
      const g = portraitGrid(id);
      expect(g).toHaveLength(PORTRAIT.h);
      expect(g[0]).toHaveLength(PORTRAIT.w);
      const filled = g.flat().filter(Boolean) as string[];
      expect(filled.length, id).toBeGreaterThan(900);
      expect(filled.some((c) => c === '#000000'), id).toBe(false);
    }
  });

  it('no two specials look the same', () => {
    const seen = new Set(Object.keys(LOOKS).map((id) => JSON.stringify(portraitGrid(id))));
    expect(seen.size).toBe(Object.keys(LOOKS).length);
  });
});
