import { dither, type Painter, type RoofShape } from './iso';

// Sprites for the content wave: selokan, decorations, farm, shops and facilities. Same rules as ART.md:
// straight isometric boxes, palette keys, the ink pass from Painter.finish. Registered in iso.ts.
// Only `import type` from iso.ts, so there is no import cycle.

const within = (v: number, lo: number, hi: number) => v >= lo && v < hi;
const TW = 32;
const TH = 16;
const TOP = 40;

/** A shopfront: a walled box under a roof of the given shape, a door, and a coloured band of awning above a window. */
const shopfront = (wall: string, roof: string, awning: string, opts: { height?: number; rise?: number; inset?: number; door?: string; shape?: RoofShape } = {}) => (p: Painter): void => {
  const { height = 8, rise = 5, inset = 3, door = 'N', shape = 'hip' } = opts;
  p.shadow(inset);
  p.box(inset, height, wall, (face, u, j, i) => {
    if (face === 'T') return undefined;
    if (face === 'L' && within(u, 0.62, 0.84) && j < height - 3) return door;
    if (face === 'L' && within(u, 0.14, 0.56) && within(j, 2, height - 3)) return 'l';
    if (face === 'R' && within(u, 0.2, 0.8) && within(j, 2, height - 3) && i % 5 >= 1) return 'l';
    if (j >= height - 2) return i % 4 < 2 ? awning : 'w';
    return undefined;
  });
  p.roofShape(shape, inset, height, shape === 'shed' ? Math.max(3, rise - 1) : rise, roof, wall);
};

export const CONTENT_ART: Record<string, (p: Painter, variant?: string, level?: number) => void> = {
  // Rumah Makan grows from a bakso cart to a warkop to a rumah makan, each the existing art for that stage.
  // Level 2 is a lower warkop, drawn here beside the artist's, so the step from the cart stays within one storey.
  rumahMakan: (p, v, level = 1) => (level === 2 ? shopfront('N', 'r', 'y', { shape: 'shed', height: 7 })(p) : CONTENT_ART[level >= 3 ? 'warteg' : 'gerobakBakso'](p, v)),
  // Selokan: a concrete channel across the tile, edge to edge so neighbours line up, with a plank bridge over it.
  // Bare, so the kerbs and their ink line are drawn here.
  drain: (p, v) => {
    p.bare = true;
    p.ground((a0, b0, px) => {
      // a runs along the channel, b across it. Variant 'y' turns it, so a column of selokan joins up like a row.
      const [a, b] = v === 'y' ? [b0, a0] : [a0, b0];
      if (b < 0.06 || b > 0.94) return null;
      const bridge = within(a, 0.44, 0.56);
      const edge = b < 0.06 + px || b > 0.94 - px;
      if (bridge && !edge) {
        // Planks lie across, a dark gap between each, an ink rail along each end.
        if (b < 0.12 + px || b > 0.88 - px) return 'N';
        return Math.floor((a - 0.44) * 32) % 2 ? 'n' : 't';
      }
      if (b < 0.26 || b > 0.74) {
        if (edge) return 'S';
        // Poured slabs: a seam every quarter, a light face, and the far kerb a shade darker.
        if (Math.abs(((a * 4) % 1) - 0.5) < px * 0.6 && !within(a, 0.37, 0.63)) return 'S';
        return b < 0.26 ? 's' : 'S';
      }
      // The wall drops into the water, so the near strip is shade, then ripples drift along the channel.
      if (b < 0.34) return 'b';
      if (b > 0.66) return 'B';
      const r = (a * 9 + b * 4) % 1;
      return r < 0.14 ? 'w' : r < 0.4 ? 'c' : 'l';
    });
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
    p.ground((a, b, px) => {
      // A stone kerb two pixels wide, then a lighter coping, at any size.
      const e = Math.min(a, b, 1 - a, 1 - b);
      if (e < 2 * px) return 'S';
      if (e < 4 * px) return 's';
      if (within(a, 0.3, 0.43) && within(b, 0.4, 0.48)) return 'o';
      if (within(a, 0.56, 0.68) && within(b, 0.55, 0.62)) return 'y';
      return within(a, 0.7, 0.78) && within(b, 0.25, 0.32) ? 'w' : 'l';
    });
    p.overlay.push(dither);
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
    p.ground((a, b, px) => (Math.min(a, b, 1 - a, 1 - b) < px ? null : Math.floor((a + b) * 6) % 2 ? 'g' : 'G'));
    p.overlay.push(dither);
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
    p.overlay.push(dither);
  },
  patungIkon: (p) => {
    p.shadow(6);
    p.box(6, 7, 's', (face, _u, j) => (face !== 'T' && j === 5 ? 'S' : undefined));
    p.box(7, 11, 'y', (face, _u, j) => (face !== 'T' && j > 7 ? 'a' : undefined), 7);
    p.blob(0, 22, 4, 'y');
  },

  // Farm. Flat plots are bare and draw their own pematang edge so neighbouring plots join up.
  kebunSayur: (p) => {
    p.bare = true;
    p.ground((a, b, px) => {
      if (Math.min(a, b, 1 - a, 1 - b) < 1.2 * px) return 'n';
      const row = Math.floor(b * 5);
      if (row % 2 === 0) return 'N';
      return Math.floor(a * 6) % 2 ? 'g' : 'G';
    });
  },
  // Water-filled paddies with green rice rows and a clay bund.
  sawah: (p) => {
    p.bare = true;
    p.ground((a, b, px) => {
      // A pematang bund: a 1px dark edge and a 1px top, the same width on a big plot.
      const e = Math.min(a, b, 1 - a, 1 - b);
      if (e < 1.2 * px) return 'n';
      if (e < 2.4 * px) return 't';
      const row = Math.floor(b * 6) % 2;
      return row === 0 && Math.floor(a * 8) % 2 === 0 ? 'g' : row === 0 ? 'G' : 'l';
    });
  },
  kandangAyam: (p) => {
    p.shadow(4);
    p.box(5, 6, 'n', (face, u, j) => (face === 'L' && within(u, 0.3, 0.7) && within(j, 1, 4) ? 'N' : undefined));
    p.roof(5, 6, 4, 'y');
    p.blob(7, 2, 2.2, 'w');
    p.set(TW / 2 + 9, TOP + TH / 2 - 3, 'r');
  },
  kolamLele: (p) => {
    p.bare = true;
    p.ground((a, b, px) => {
      const e = Math.min(a, b, 1 - a, 1 - b);
      if (e < 1.2 * px) return 'B';
      if (e < 2.4 * px) return 'b';
      if (within(a, 0.3, 0.45) && within(b, 0.38, 0.46)) return 'k';
      if (within(a, 0.55, 0.7) && within(b, 0.55, 0.63)) return 'k';
      return 'c';
    });
  },

  // Shops and facilities share the shopfront shape and differ in colour and one sign detail.
  // Each shop type has its own roof, so a row of shops reads as a street, not one copy.
  warteg: shopfront('t', 'G', 'g', { shape: 'gable' }),
  warkop: shopfront('N', 'r', 'y', { shape: 'shed' }),
  tokoKelontong: shopfront('y', 'o', 'r', { height: 9, rise: 5 }),
  fotokopi: (p) => {
    shopfront('w', 'B', 'b', { shape: 'flat' })(p);
    p.blob(-7, 14, 2, 'a');
  },
  barbershop: (p) => {
    shopfront('c', 'R', 'w', { shape: 'shed' })(p);
    // The barber pole: red and white bands on a short post.
    for (let k = 0; k < 8; k++) p.set(TW / 2 + 10, TOP + TH / 2 - 2 - k, k % 4 < 2 ? 'r' : 'w');
    p.set(TW / 2 + 10, TOP + TH / 2 - 10, 'b');
  },
  bengkel: (p) => {
    shopfront('S', 'b', 'o', { height: 9, rise: 4, door: 'k', shape: 'gable' })(p);
    p.box(9, 4, 'k', undefined, 0);
  },
  apotek: (p) => {
    shopfront('w', 'g', 'g', { shape: 'flat' })(p);
    // A red cross over the door.
    const x = TW / 2 - 5;
    const y = TOP + TH / 2 - 11;
    for (const [dx, dy] of [[0, 0], [-1, 0], [1, 0], [0, -1], [0, 1]]) p.set(x + dx, y + dy, 'r');
  },
  koperasi: (p) => {
    shopfront('w', 'b', 'a', { height: 10, rise: 6, inset: 2, shape: 'gableY' })(p);
    p.blob(0, 18, 2.2, 'a');
  },
  posSatpam: (p) => {
    p.shadow(5);
    p.box(5, 8, 'b', (face, u, j) => (face === 'L' && within(u, 0.2, 0.8) && within(j, 3, 6) ? 'l' : undefined));
    p.roof(5, 8, 3, 'B');
    // A red and white barrier arm across the front.
    p.stroke(-4, 2, 12, 6, 2, 'w');
    for (const k of [0, 4, 8, 12]) p.stroke(-4 + k, 2 + k / 4, -3 + k, 2 + k / 4, 2, 'r', false);
  },
  paud: (p) => {
    shopfront('p', 'y', 'c', { height: 8, rise: 5 })(p);
    p.blob(-8, 13, 2, 'r');
    p.blob(8, 13, 2, 'b');
  },
  balaiWarga: (p) => {
    p.shadow(1);
    p.box(1, 9, 't', (face, u, j, i) => {
      if (face === 'T') return undefined;
      if (face === 'L' && within(u, 0.4, 0.62) && j < 6) return 'N';
      if (i % 6 < 2 && j > 0 && j < 8) return 'w';
      if (j >= 8) return 'R';
      return undefined;
    });
    p.roof(1, 9, 8, 'R');
  },
  gudangMaterial: (p) => {
    p.shadow(2);
    p.box(2, 8, 'S', (face, u, j) => {
      if (face === 'L' && within(u, 0.2, 0.8) && j < 6) return j === 5 ? 'N' : 'n';
      return undefined;
    });
    // A warehouse pelana with a vent on the gable end.
    p.roofShape('gable', 2, 8, 5, 'n', 'S');
  },
  kontrakan: (p) => {
    p.shadow(1);
    p.box(1, 9, 'a', (face, u, j, i) => {
      if (face === 'T') return undefined;
      if (face === 'L' && (within(u, 0.12, 0.3) || within(u, 0.42, 0.6) || within(u, 0.72, 0.9)) && within(j, 2, 7)) return j < 5 ? 'N' : 'l';
      if (face === 'R' && i % 6 >= 2 && within(j, 3, 7)) return 'l';
      return undefined;
    });
    // Row houses share one long shed roof.
    p.roofShape('shed', 1, 9, 4, 'R', 'a');
  },
  gerobakBakso: (p) => {
    p.shadow(8);
    p.box(7, 5, 'r', (face, u, j) => (face === 'L' && within(u, 0.2, 0.8) && j === 3 ? 'y' : undefined), 3);
    p.box(9, 2, 'w', undefined, 8);
    p.stroke(-6, -3, -12, -4, 2, 'n');
    p.blob(-4, 2, 2, 'k');
    p.blob(5, 2, 2, 'k');
  },
};
