import { describe, expect, it } from 'vitest';
import { ROLES, SPECIALS } from '../src/data/staff';
import { INEM_ROWS } from '../src/render/inem';
import { LOOKS, PORTRAIT, portraitGrid, ROLES_WITH_LOOK, staffGrid, staffLook } from '../src/render/portraits';

const shade78 = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return `#${[n >> 16, (n >> 8) & 255, n & 255].map((v) => Math.round(v * 0.78).toString(16).padStart(2, '0')).join('')}`;
};

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

  it('draws at 22x30 with coloured outlines and never pure black (ART.md)', () => {
    for (const id of Object.keys(LOOKS)) {
      const g = portraitGrid(id);
      expect(g).toHaveLength(PORTRAIT.h);
      expect(g[0]).toHaveLength(PORTRAIT.w);
      const filled = g.flat().filter(Boolean) as string[];
      expect(filled.length, id).toBeGreaterThan(220);
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
    const outfits = new Set(ROLES.map((r) => JSON.stringify(staffGrid(r.id, 1).slice(20))));
    expect(outfits.size).toBe(ROLES.length);
  });

  it('a hire keeps the same face for good, and different hires look different', () => {
    for (const r of ROLES) expect(JSON.stringify(staffGrid(r.id, 42))).toBe(JSON.stringify(staffGrid(r.id, 42)));
    const faces = new Set(Array.from({ length: 12 }, (_, id) => JSON.stringify(staffGrid('asisten', id + 1))));
    expect(faces.size).toBeGreaterThanOrEqual(8);
  });

  it('draws at 22x30 with coloured outlines and never pure black (ART.md)', () => {
    for (const r of ROLES)
      for (const id of [1, 2, 3]) {
        const g = staffGrid(r.id, id);
        expect(g).toHaveLength(PORTRAIT.h);
        expect(g[0]).toHaveLength(PORTRAIT.w);
        const filled = g.flat().filter(Boolean) as string[];
        expect(filled.length, `${r.id} ${id}`).toBeGreaterThan(220);
        expect(filled.some((c) => c === '#000000'), `${r.id} ${id}`).toBe(false);
      }
  });

  it('one art pixel is 2 CSS px, as on the map, so outlines and eyes are as thick as a walker\'s', () => {
    // The img slot is 44x60 CSS px; the map never draws an art pixel smaller than 2 CSS px.
    expect(PORTRAIT).toEqual({ w: 22, h: 30 });
    expect(INEM_ROWS.small).toHaveLength(30);
    for (const row of INEM_ROWS.small) expect(row).toHaveLength(22);
    const k = (hex: string, f: number) => {
      const n = parseInt(hex.slice(1), 16);
      return `#${[n >> 16, (n >> 8) & 255, n & 255].map((v) => Math.min(255, Math.round(v * f)).toString(16).padStart(2, '0')).join('')}`;
    };
    for (const r of ROLES)
      for (let id = 1; id <= 12; id++) {
        const look = staffLook(r.id, id);
        const g = staffGrid(r.id, id);
        // The left eye is a 1px ink stroke, two pixels tall, like a walker's.
        expect(g[12][8], `${r.id} ${id}`).toBe('#2a1810');
        expect(g[13][8], `${r.id} ${id}`).toBe('#2a1810');
        // A 0.55x line where the head and neck meet the chest (ART.md, Outlines).
        const [main, second] = look.colours;
        const lines = [main, shade78(main), k(main, 1.14), second].map((c) => k(c, 0.55));
        expect(g.slice(18, 26).flat().some((c) => c !== null && lines.includes(c)), `${r.id} ${id}`).toBe(true);
      }
  });

  it('headwear never sits on long hair', () => {
    for (const role of ['hansip', 'pu', 'supir', 'satpol'])
      for (let id = 1; id <= 40; id++) expect(['long', 'bun', 'ponytail'], `${role} ${id}`).not.toContain(staffLook(role, id).hair);
  });
});

