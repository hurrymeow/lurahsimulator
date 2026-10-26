import type { Painter } from './iso';

// Sprites for the content wave: biopori, decorations, farm, shops and facilities. Same rules as ART.md:
// straight isometric boxes, palette keys, the ink pass from Painter.finish. Registered in iso.ts.
// Only `import type` from iso.ts, so there is no import cycle.

const within = (v: number, lo: number, hi: number) => v >= lo && v < hi;
const TW = 32;
const TH = 16;
const TOP = 40;

/** Centre of the ground diamond in art pixels, plus an offset. */
const at = (dx: number, dy: number): [number, number] => [TW / 2 + dx, TOP + TH / 2 + dy];

export const CONTENT_ART: Record<string, (p: Painter) => void> = {
  // A round infiltration hole with a stone rim and a sprout. Bare, so the rim is drawn here.
  biopori: (p) => {
    p.bare = true;
    p.ground((a, b) => {
      const d = Math.hypot(a - 0.5, b - 0.5);
      if (d > 0.3) return null;
      if (d > 0.25) return 'S';
      if (d > 0.2) return 's';
      return d < 0.1 ? 'k' : 'N';
    });
    const [x, y] = at(0, 0);
    for (const [dx, dy, c] of [[0, -1, 'g'], [-1, -2, 'g'], [1, -2, 'G'], [0, -3, 'g']] as const) p.set(x + dx, y + dy, c);
  },

  // Decorations. Small, low and bright, so they read as nice-to-have beside the working buildings.
  potBunga: (p) => {
    p.shadow(8);
    p.box(6, 4, 'n', (face, _u, j) => (face !== 'T' && j === 3 ? 'N' : undefined));
    p.blob(0, 6, 3.5, 'G');
    for (const [dx, up, c] of [[-2, 8, 'r'], [2, 9, 'y'], [0, 10, 'p']] as const) p.blob(dx, up, 1.6, c);
  },
  bangku: (p) => {
    p.shadow(5);
    p.box(6, 3, 'N');
    p.box(4, 2, 't', undefined, 3);
    p.box(6, 5, 'n', undefined, 5);
  },
  lampuTaman: (p) => {
    p.shadow(9);
    p.box(6, 2, 'S');
    p.stroke(0, -2, 0, -22, 2, 'S');
    p.blob(0, 24, 3.4, 'y');
    p.blob(-1, 25, 1.4, 'w');
  },
  // Flat pond: bare, so it draws its own stone rim.
  kolamIkan: (p) => {
    p.bare = true;
    p.ground((a, b) => {
      if (a < 0.1 || a > 0.9 || b < 0.1 || b > 0.9) return 'S';
      if (a < 0.17 || a > 0.83 || b < 0.17 || b > 0.83) return 's';
      if (within(a, 0.3, 0.43) && within(b, 0.4, 0.48)) return 'o';
      if (within(a, 0.56, 0.68) && within(b, 0.55, 0.62)) return 'y';
      return within(a, 0.7, 0.78) && within(b, 0.25, 0.32) ? 'w' : 'l';
    });
  },
  mural: (p) => {
    p.shadow(2);
    p.box(3, 10, 'w', (face, u, j, i) => {
      if (face === 'T') return 'S';
      if (j < 2 || j > 8) return 'S';
      if (face === 'L') return u < 0.25 ? 'r' : u < 0.5 ? 'y' : u < 0.75 ? 'b' : 'g';
      return i % 6 < 3 ? 'p' : 'c';
    });
  },
  tamanBermain: (p) => {
    p.ground((a, b) => (a < 0.04 || a > 0.96 || b < 0.04 || b > 0.96 ? null : Math.floor((a + b) * 6) % 2 ? 'g' : 'G'));
    p.box(7, 5, 'S');
    p.stroke(-10, -6, 10, -1, 3, 'o');
    p.blob(-11, 8, 2, 'r');
    p.blob(11, 4, 2, 'b');
  },
  airMancur: (p) => {
    p.shadow(3);
    p.ground((a, b) => {
      const d = Math.hypot(a - 0.5, b - 0.5);
      return d > 0.44 ? null : d > 0.38 ? 'S' : d > 0.31 ? 's' : 'l';
    });
    p.box(6, 6, 's');
    p.stroke(0, -6, 0, -17, 2, 'c');
    p.stroke(0, -17, -7, -9, 1, 'l');
    p.stroke(0, -17, 7, -9, 1, 'l');
    p.blob(0, 18, 3, 'c');
  },
  patungIkon: (p) => {
    p.shadow(6);
    p.box(6, 7, 's', (face, _u, j) => (face !== 'T' && j === 5 ? 'S' : undefined));
    p.box(7, 11, 'y', (face, _u, j) => (face !== 'T' && j > 7 ? 'a' : undefined), 7);
    p.blob(0, 22, 4, 'y');
  },
};
