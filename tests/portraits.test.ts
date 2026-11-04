import { describe, expect, it } from 'vitest';
import { ROLES, SPECIALS } from '../src/data/staff';
import { LOOKS, PORTRAIT, portraitGrid, ROLES_WITH_LOOK, staffGrid, staffLook } from '../src/render/portraits';

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

describe('generic hires and their portraits', () => {
  it('every role has an outfit of its own', () => {
    expect([...ROLES_WITH_LOOK].sort()).toEqual(ROLES.map((r) => r.id).sort());
    const outfits = new Set(ROLES.map((r) => JSON.stringify(staffGrid(r.id, 1).slice(40))));
    expect(outfits.size).toBe(ROLES.length);
  });

  it('a hire keeps the same face for good, and different hires look different', () => {
    for (const r of ROLES) expect(JSON.stringify(staffGrid(r.id, 42))).toBe(JSON.stringify(staffGrid(r.id, 42)));
    const faces = new Set(Array.from({ length: 12 }, (_, id) => JSON.stringify(staffGrid('asisten', id + 1))));
    expect(faces.size).toBeGreaterThanOrEqual(8);
  });

  it('draws at 44x60 with coloured outlines and never pure black (ART.md)', () => {
    for (const r of ROLES)
      for (const id of [1, 2, 3]) {
        const g = staffGrid(r.id, id);
        expect(g).toHaveLength(PORTRAIT.h);
        expect(g[0]).toHaveLength(PORTRAIT.w);
        const filled = g.flat().filter(Boolean) as string[];
        expect(filled.length, `${r.id} ${id}`).toBeGreaterThan(900);
        expect(filled.some((c) => c === '#000000'), `${r.id} ${id}`).toBe(false);
      }
  });

  it('headwear never sits on long hair', () => {
    for (const role of ['hansip', 'pu', 'supir', 'satpol'])
      for (let id = 1; id <= 40; id++) expect(['long', 'bun', 'ponytail'], `${role} ${id}`).not.toContain(staffLook(role, id).hair);
  });
});

