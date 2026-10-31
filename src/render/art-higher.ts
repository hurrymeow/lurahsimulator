import { dither, type Painter } from './iso';

// Sprites for the RW and Kelurahan/Desa buildings. Same rules as ART.md: straight isometric
// boxes, palette keys, the ink pass from Painter.finish. Registered in iso.ts.
// Only `import type` from iso.ts, so there is no import cycle.

const within = (v: number, lo: number, hi: number) => v >= lo && v < hi;
const TH = 16;

type Face = 'L' | 'R' | 'T';

/** Windows in a row on the side faces. */
const windows = (face: Face, u: number, j: number, i: number, rows: [number, number], colour = 'l') =>
  face !== 'T' && within(j, rows[0], rows[1]) && i % 5 >= 2 && within(u, 0.12, 0.88) ? colour : undefined;

export const HIGHER_ART: Record<string, (p: Painter) => void> = {
  // RW
  balaiRW: (p) => {
    p.shadow(1);
    p.box(1, 10, 'w', (face, u, j, i) => {
      if (face === 'L' && within(u, 0.42, 0.6) && j < 7) return 'k';
      if (j < 1) return 'S';
      if (face !== 'T' && j === 9) return 'b';
      return windows(face, u, j, i, [4, 8]);
    });
    p.roof(1, 10, 8, 'o', (x) => (Math.floor(x / 3) % 2 ? 'y' : undefined));
  },
  posyandu: (p) => {
    p.shadow(3);
    p.box(3, 8, 't', (face, u, j) => {
      if (face === 'L' && within(u, 0.4, 0.6) && within(j, 2, 7)) return within(u, 0.46, 0.54) || within(j, 4, 5) ? 'r' : 'w';
      if (face === 'R' && within(u, 0.25, 0.45) && within(j, 3, 6)) return 'l';
      return undefined;
    });
    p.roof(3, 8, 6, 'p');
  },
  portal: (p) => {
    p.shadow(6);
    // Two posts and a red-and-white boom between them.
    p.stroke(-8, -3, -8, -13, 3, 'S');
    p.stroke(8, 3, 8, -7, 3, 'S');
    p.stroke(-8, -10, 8, -2, 2, 'r');
    for (const k of [-5, -1, 3]) p.stroke(k, -10 + (k + 8) / 2, k + 2, -10 + (k + 10) / 2, 2, 'w', false);
    p.stroke(8, -8, 8, -9, 3, 'y', false);
  },
  pasarKaget: (p) => {
    p.shadow(2);
    // A long awning over a counter, striped like a kaget stall.
    p.box(2, 5, 'n', (face, _u, j) => (face !== 'T' && j < 2 ? 'N' : undefined));
    p.box(1, 3, 'r', (face, _u, _j, i) => (face !== 'T' ? (Math.floor(i / 3) % 2 ? 'w' : 'r') : undefined), 8);
    p.box(5, 4, 'y', (face, _u, _j, i) => (face !== 'T' && i % 4 === 0 ? 'o' : undefined), 5);
  },
  gapura: (p) => {
    p.shadow(2);
    // Two pillars with a gap between, red and white band on top.
    p.box(2, 16, 'R', (face, u, j, i) => {
      if (face === 'T') return undefined;
      if (j >= 12) return Math.floor(i / 3) % 2 ? 'w' : 'r';
      if (within(u, 0.2, 0.8)) return null;
      return j % 4 === 3 ? 'r' : undefined;
    });
    p.roof(2, 16, 4, 'y');
  },
  // Kelurahan
  kantorKel: (p) => {
    p.shadow(1);
    p.box(1, 9, 'w', (face, u, j, i) => {
      if (face === 'L' && within(u, 0.42, 0.6) && j < 6) return 'k';
      if (j < 1) return 'S';
      return windows(face, u, j, i, [3, 7]);
    });
    p.box(5, 6, 't', (face, u, j, i) => windows(face, u, j, i, [2, 5]), 9);
    p.roof(5, 15, 5, 'b');
    const ax = 16;
    const ay = 40 + TH / 2 - 15 - 5;
    for (let k = 1; k <= 7; k++) p.set(ax, ay - k, 'k');
    for (let k = 1; k <= 4; k++) for (const dy of [7, 6]) p.set(ax + k, ay - dy, 'r');
    for (let k = 1; k <= 4; k++) for (const dy of [5, 4]) p.set(ax + k, ay - dy, 'w');
  },
  balaiDesa: (p) => {
    p.shadow(2);
    // A pendopo: open sides under a heavy joglo roof.
    p.box(2, 8, 'n', (face, u, j) => {
      if (face === 'T') return undefined;
      if (j < 1) return 'N';
      if (u < 0.16 || u > 0.84) return 'N';
      return j < 6 ? null : 'N';
    });
    p.roof(2, 8, 5, 'N', (x, y) => ((x + y) % 4 === 0 ? 'n' : undefined));
    p.box(8, 3, 'N', undefined, 8);
    p.roof(8, 11, 4, 'N', (x, y) => ((x + y) % 4 === 0 ? 'n' : undefined));
  },
  puskesmasPembantu: (p) => {
    p.shadow(2);
    p.box(2, 9, 'w', (face, u, j, i) => {
      if (face === 'L' && within(u, 0.44, 0.58) && j < 6) return 'k';
      if (j < 1) return 'S';
      if (face === 'R' && within(u, 0.4, 0.6) && within(j, 3, 8)) return within(u, 0.46, 0.54) || within(j, 5, 6) ? 'r' : 'w';
      return windows(face, u, j, i, [3, 7], 'c');
    });
    p.roof(2, 9, 6, 'c');
  },
  pasar: (p) => {
    p.shadow(1);
    p.box(1, 6, 't', (face, _u, j, i) => {
      if (face === 'T') return undefined;
      if (j < 1) return 'N';
      if (within(j, 2, 5) && (i % 6 < 3)) return Math.floor(i / 6) % 2 ? 'y' : 'c';
      return undefined;
    });
    p.roof(1, 6, 6, 'y', (x) => (Math.floor(x / 3) % 2 ? 'r' : undefined));
  },
  terminal: (p) => {
    p.shadow(1);
    p.box(2, 7, 'S', (face, u, j, i) => {
      if (face === 'T') return undefined;
      if (j >= 5) return 'y';
      return windows(face, u, j, i, [2, 5]);
    });
    p.box(1, 2, 'b', (face, _u, j, i) => (face !== 'T' && j === 0 && i % 4 === 0 ? 'w' : undefined), 7);
  },
  taman: (p) => {
    p.shadow(2);
    p.ground((a, b) => {
      if (within(a, 0.46, 0.54) || within(b, 0.46, 0.54)) return 't';
      return (Math.floor(a * 4) + Math.floor(b * 4)) % 2 ? 'g' : 'G';
    });
    p.box(7, 9, 'N');
    p.blob(-2, 15, 6, 'G');
    p.blob(3, 18, 5, 'g');
    p.overlay.push(dither);
  },
  aspalUlang: (p) => {
    p.ground((a, b) => {
      if (a < 0.04 || a > 0.96 || b < 0.04 || b > 0.96) return null;
      if (within(b, 0.47, 0.53) && Math.floor(a * 8) % 2 === 0) return 'y';
      return within(a, 0.3, 0.34) ? 'S' : 's';
    });
  },
  studiBanding: (p) => {
    p.shadow(3);
    // A tour bus with a roof rack of suitcases.
    p.box(4, 7, 'y', (face, u, j, i) => {
      if (face === 'T') return undefined;
      if (j < 2) return 'k';
      return within(j, 3, 6) && i % 4 < 3 && within(u, 0.1, 0.9) ? 'l' : undefined;
    });
    p.box(7, 2, 'n', undefined, 7);
    p.box(8, 3, 'r', undefined, 9);
  },
  // Desa
  bumdes: (p) => {
    p.shadow(2);
    p.box(2, 9, 't', (face, u, j, i) => {
      if (face === 'T') return undefined;
      if (j < 1) return 'N';
      if (face === 'L' && within(j, 6, 9)) return 'G';
      if (face === 'L' && within(u, 0.3, 0.7) && within(j, 1, 5)) return i % 3 === 0 ? 'y' : 'k';
      return windows(face, u, j, i, [3, 5]);
    });
    p.roof(2, 9, 5, 'G');
  },
  sawahIrigasi: (p) => {
    p.ground((a, b, px) => {
      const e = Math.min(a, b, 1 - a, 1 - b);
      if (e < 0.6 * px) return null;
      if (within(b, 0.47, 0.53)) return 'l';
      if (e < 1.8 * px || within(b, 0.4, 0.47) || within(b, 0.53, 0.6)) return 'n';
      return Math.floor(a * 6) % 2 ? (b < 0.5 ? 'g' : 'a') : (b < 0.5 ? 'G' : 'y');
    });
  },
  embung: (p) => {
    p.ground((a, b, px) => {
      const d = Math.max(Math.abs(a - 0.5), Math.abs(b - 0.5));
      if (d > 0.48) return null;
      if (d < 0.3) return Math.floor((a + b) * 10) % 4 === 0 ? 'c' : 'l';
      // A stone lip two pixels wide round the water, at any size.
      if (d < 0.3 + 2 * px) return 's';
      return Math.floor(a * 5 + b * 5) % 2 ? 'g' : 'G';
    });
    p.overlay.push(dither);
  },
  desaWisata: (p) => {
    p.shadow(3);
    p.box(3, 7, 'n', (face, u, j) => {
      if (face === 'T') return undefined;
      if (j < 1) return 'N';
      if (u < 0.16 || u > 0.84) return 'N';
      return j < 5 ? null : 'N';
    });
    p.roof(3, 7, 6, 'p', (x, y) => ((x + y) % 4 === 0 ? 'w' : undefined));
    // Selfie frame out front.
    p.stroke(-8, -2, -8, -10, 2, 'y');
    p.stroke(-12, -2, -12, -10, 2, 'y', false);
    p.stroke(-12, -10, -8, -10, 2, 'y', false);
  },
  // Kecamatan
  kantorKec: (p) => {
    p.shadow(1);
    p.box(1, 10, 'w', (face, u, j, i) => {
      if (face === 'L' && within(u, 0.42, 0.6) && j < 7) return 'k';
      if (j < 1) return 'S';
      if (face !== 'T' && j === 9) return 'o';
      return windows(face, u, j, i, [3, 8]);
    });
    p.roof(1, 10, 9, 'S', (x) => (Math.floor(x / 4) % 2 ? 'b' : undefined));
  },
  posSatpol: (p) => {
    p.shadow(3);
    // A khaki post with a blue stripe and a barred window.
    p.box(3, 7, 'y', (face, u, j) => {
      if (face === 'T') return undefined;
      if (j < 1) return 'N';
      if (face === 'L' && within(u, 0.4, 0.6) && j < 5) return 'k';
      if (j === 5) return 'b';
      if (face === 'R' && within(u, 0.3, 0.7) && within(j, 2, 4)) return 'l';
      return undefined;
    });
    p.roof(3, 7, 5, 'b');
  },
  koperasiSP: (p) => {
    p.shadow(2);
    p.box(2, 8, 'g', (face, u, j, i) => {
      if (face === 'T') return undefined;
      if (j < 1) return 'N';
      if (face === 'L' && within(u, 0.4, 0.6) && j < 5) return 'k';
      if (j >= 6) return 'y';
      return windows(face, u, j, i, [2, 5]);
    });
    p.roof(2, 8, 5, 'o');
  },
  balaiLatihanKerja: (p) => {
    p.shadow(2);
    p.box(2, 9, 'c', (face, u, j, i) => {
      if (face === 'T') return undefined;
      if (j < 1) return 'S';
      if (face === 'L' && within(u, 0.42, 0.6) && j < 5) return 'k';
      return windows(face, u, j, i, [3, 7]);
    });
    p.roof(2, 9, 5, 'S', (x) => (Math.floor(x / 3) % 2 ? 'y' : undefined));
  },
  baliho: (p) => {
    p.shadow(6);
    // Two posts under a wide board with a bright stripe, like the ones over every junction.
    p.stroke(-8, -2, -8, -12, 3, 'S');
    p.stroke(8, 3, 8, -7, 3, 'S');
    p.stroke(-10, -14, 10, -4, 10, 'w');
    p.stroke(-9, -12, 9, -3, 3, 'y', false);
    p.stroke(-9, -16, 9, -6, 2, 'r', false);
  },
  tamanKota: (p) => {
    p.shadow(2);
    p.ground((a, b) => {
      const d = Math.max(Math.abs(a - 0.5), Math.abs(b - 0.5));
      if (d < 0.14) return Math.floor((a + b) * 12) % 3 === 0 ? 'c' : 'l';
      if (d < 0.2) return 's';
      if (within(a, 0.46, 0.54) || within(b, 0.46, 0.54)) return 't';
      return (Math.floor(a * 4) + Math.floor(b * 4)) % 2 ? 'g' : 'G';
    });
    p.blob(-8, 16, 5, 'G');
    p.blob(8, 18, 5, 'g');
    p.overlay.push(dither);
  },
};
