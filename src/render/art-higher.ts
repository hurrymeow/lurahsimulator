import { dither, type Painter } from './iso';

// Sprites for the RW and Kelurahan buildings. Same rules as ART.md: straight isometric
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
    // Wide, not tall: as high as a 1x1 building, its size shows as width (ART.md).
    p.low();
    p.shadow(1);
    p.box(1, 12, 'w', (face, u, j, i) => {
      if (face === 'L' && within(u, 0.42, 0.6) && j < 8) return 'k';
      if (j < 1) return 'S';
      if (face !== 'T' && j === 11) return 'b';
      return windows(face, u, j, i, [4, 9]);
    });
    p.roof(1, 12, 13, 'o', (x) => (Math.floor(x / 3) % 2 ? 'y' : undefined));
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
    // The front post stands inside the tile (UI.md rule 17).
    p.stroke(-8, -3, -8, -13, 3, 'S');
    p.stroke(8, 1, 8, -9, 3, 'S');
    p.stroke(-8, -10, 8, -4, 2, 'r');
    for (const k of [-5, -1, 3]) p.stroke(k, -10 + ((k + 8) * 3) / 8, k + 2, -10 + ((k + 10) * 3) / 8, 2, 'w', false);
    p.stroke(8, -10, 8, -11, 3, 'y', false);
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
    // Wide, not tall: as high as a 1x1 building, its size shows as width (ART.md).
    p.low();
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
  puskesmasPembantu: (p) => {
    // Wide, not tall: as high as a 1x1 building, its size shows as width (ART.md).
    p.low();
    p.shadow(2);
    p.box(2, 12, 'w', (face, u, j, i) => {
      if (face === 'L' && within(u, 0.44, 0.58) && j < 8) return 'k';
      if (j < 1) return 'S';
      if (face === 'R' && within(u, 0.4, 0.6) && within(j, 4, 10)) return within(u, 0.46, 0.54) || within(j, 6, 7) ? 'r' : 'w';
      return windows(face, u, j, i, [3, 9], 'c');
    });
    p.roof(2, 12, 13, 'c');
  },
  pasar: (p) => {
    // Wide, not tall: as high as a 1x1 building, its size shows as width (ART.md).
    p.low();
    p.shadow(1);
    p.box(1, 8, 't', (face, _u, j, i) => {
      if (face === 'T') return undefined;
      if (j < 1) return 'N';
      if (within(j, 2, 7) && (i % 6 < 3)) return Math.floor(i / 6) % 2 ? 'y' : 'c';
      return undefined;
    });
    p.roof(1, 8, 12, 'y', (x) => (Math.floor(x / 3) % 2 ? 'r' : undefined));
  },
  terminal: (p) => {
    // Wide, not tall: as high as a 1x1 building, its size shows as width (ART.md).
    p.low();
    p.shadow(1);
    p.box(2, 10, 'S', (face, u, j, i) => {
      if (face === 'T') return undefined;
      if (j >= 8) return 'y';
      return windows(face, u, j, i, [2, 7]);
    });
    // A long blue canopy over the bays: wide, not tall.
    p.roofShape('gable', 1, 10, 10, 'b', 'S', (x) => (Math.floor(x / 4) % 2 ? 'B' : undefined));
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
  // Kecamatan
  kantorKec: (p) => {
    // Wide, not tall: as high as a 1x1 building, its size shows as width (ART.md).
    p.low();
    p.shadow(1);
    p.box(1, 12, 'w', (face, u, j, i) => {
      if (face === 'L' && within(u, 0.42, 0.6) && j < 8) return 'k';
      if (j < 1) return 'S';
      if (face !== 'T' && j === 11) return 'o';
      return windows(face, u, j, i, [3, 9]);
    });
    p.roof(1, 12, 14, 'S', (x) => (Math.floor(x / 4) % 2 ? 'b' : undefined));
  },
  posSatpol: (p) => {
    // Wide, not tall: as high as a 1x1 building, its size shows as width (ART.md).
    p.low();
    p.shadow(3);
    // A khaki post with a blue stripe and a barred window.
    p.box(3, 10, 'y', (face, u, j) => {
      if (face === 'T') return undefined;
      if (j < 1) return 'N';
      if (face === 'L' && within(u, 0.4, 0.6) && j < 7) return 'k';
      if (j === 8) return 'b';
      if (face === 'R' && within(u, 0.3, 0.7) && within(j, 3, 6)) return 'l';
      return undefined;
    });
    p.roof(3, 10, 12, 'b');
  },
  koperasiSP: (p) => {
    // Wide, not tall: as high as a 1x1 building, its size shows as width (ART.md).
    p.low();
    p.shadow(2);
    p.box(2, 11, 'g', (face, u, j, i) => {
      if (face === 'T') return undefined;
      if (j < 1) return 'N';
      if (face === 'L' && within(u, 0.4, 0.6) && j < 7) return 'k';
      if (j >= 9) return 'y';
      return windows(face, u, j, i, [2, 7]);
    });
    p.roof(2, 11, 12, 'o');
  },
  balaiLatihanKerja: (p) => {
    // Wide, not tall: as high as a 1x1 building, its size shows as width (ART.md).
    p.low();
    p.shadow(2);
    p.box(2, 12, 'c', (face, u, j, i) => {
      if (face === 'T') return undefined;
      if (j < 1) return 'S';
      if (face === 'L' && within(u, 0.42, 0.6) && j < 7) return 'k';
      return windows(face, u, j, i, [3, 9]);
    });
    p.roof(2, 12, 12, 'S', (x) => (Math.floor(x / 3) % 2 ? 'y' : undefined));
  },
  baliho: (p) => {
    p.shadow(6);
    // Two posts under a wide board with a bright stripe, like the ones over every junction.
    p.stroke(-8, -2, -8, -12, 3, 'S');
    p.stroke(8, 1, 8, -7, 3, 'S');
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
