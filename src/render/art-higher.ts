import type { Painter } from './iso';

// Sprites for the RW and Kelurahan buildings. Same rules as ART.md: straight isometric
// boxes, palette keys, the ink pass from Painter.finish. Registered in iso.ts.
// Only `import type` from iso.ts, so there is no import cycle.

const within = (v: number, lo: number, hi: number) => v >= lo && v < hi;

export const HIGHER_ART: Record<string, (p: Painter) => void> = {
  // RW
  portal: (p) => {
    p.shadow(6);
    // Two posts and a red-and-white boom between them.
    // The front post stands inside the tile (UI.md rule 17).
    p.stroke(-8, -3, -8, -13, 3, 'S');
    p.stroke(8, 1, 8, -9, 3, 'S');
    p.stroke(-8, -10, 8, -4, 2, 'r');
    for (const k of [-5, -1, 3]) p.stroke(k, -10 + ((k + 8) * 3) / 8, k + 2, -10 + ((k + 10) * 3) / 8, 2, 'w', false);
    p.stroke(8, -10, 8, -11, 3, 'y', false);
  },
  aspalUlang: (p) => {
    p.ground((a, b) => {
      if (a < 0.04 || a > 0.96 || b < 0.04 || b > 0.96) return null;
      if (within(b, 0.47, 0.53) && Math.floor(a * 8) % 2 === 0) return 'y';
      return within(a, 0.3, 0.34) ? 'S' : 's';
    });
  },
};
