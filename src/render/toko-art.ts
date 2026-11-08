import type { Painter } from './iso';
import { warungMakan } from './level-art';
import { warungArt } from './warung-art';
import { prism } from './massing';
import { awning, barberPole, plusPylon, plusSign, stripes } from './sign-art';

// Toko art: the shops a player meets in the first hours, one silhouette per kind and one per level.
// Level 1 is makeshift and smallest, level 3 is built to last and the biggest and busiest (ART.md,
// Building levels). Each shop is told apart by its outline before its colour, using a few massing moves
// (after Di Mari and Yoo's catalogue of operations): a cart Lifted on wheels under an Inflated payung,
// a lean-to Extruded off a back wall, a signboard Extruded above the eave as a false front, a second
// storey Stacked on a shop, a canopy Shifted forward over the door, a lamp arm Bent off its pole.
// Only `import type` from iso.ts, so there is no import cycle.

const TW = 32;
const TH = 16;
const TOP = 40;
const GX = TW / 2;
const GY = TOP + TH / 2;
const within = (v: number, lo: number, hi: number) => v >= lo && v < hi;

type Level = (p: Painter) => void;
const byLevel = (l1: Level, l2: Level, l3: Level = l2) => (p: Painter, _v?: string, level = 1) => (level <= 1 ? l1 : level === 2 ? l2 : l3)(p);

/** Four corner posts of a box footprint, h pixels tall, for open stalls and lean-tos. */
function posts(p: Painter, inset: number, h: number, colour: string, which = [0, 1, 2, 3]): void {
  const hw = TW / 2 - inset * 2 - 1;
  const hh = TH / 2 - inset - 1;
  const at = [[-hw, 0], [0, hh], [hw, 0], [0, -hh]];
  for (const k of which) p.stroke(at[k][0], at[k][1], at[k][0], at[k][1] - h, 1, colour);
}

/** A small spoked wheel, 3x3, its hub at ground offset (x, y). */
function wheel(p: Painter, x: number, y: number): void {
  p.id++;
  for (const [e, d] of [[1, 0], [0, 1], [2, 1], [1, 2]]) p.set(GX + x + e, GY + y - d, 'k');
  p.set(GX + x + 1, GY + y - 1, 's');
}

/** A red plastic stool. */
function stool(p: Painter, x: number, y: number, c = 'r'): void {
  p.id++;
  for (let e = 0; e < 3; e++) p.set(GX + x + e, GY + y - 2, c);
  p.set(GX + x, GY + y - 1, 'R');
  p.set(GX + x + 2, GY + y - 1, 'R');
}

/** A long bench on two legs, sloping down to the right like the tile's front-left edge. */
function bench(p: Painter, x: number, y: number, len: number): void {
  p.id++;
  for (let k = 0; k < len; k++) p.set(GX + x + k, GY + y + Math.floor(k / 2) - 2, 'n');
  p.set(GX + x, GY + y - 1, 'N');
  p.set(GX + x + len - 1, GY + y + Math.floor((len - 1) / 2) - 1, 'N');
}

/**
 * A signboard standing proud of a box's front-left wall: a false front. It runs along the wall's top
 * edge from u0 to u1, rows tall, over a box of the given inset and height. paint picks each pixel's
 * colour by its column k and row r (0 at the top).
 */
function falseFront(p: Painter, inset: number, h: number, u0: number, u1: number, rows: number, paint: (k: number, r: number) => string): void {
  p.id++;
  const hw = TW / 2 - inset * 2;
  const hh = TH / 2 - inset;
  const x0 = Math.round(-hw + hw * u0);
  const x1 = Math.round(-hw + hw * u1);
  for (let x = x0; x < x1; x++) {
    const yb = Math.round(((x + hw) / hw) * hh) - h;
    for (let r = 0; r < rows; r++) p.set(GX + x, GY + yb - rows + r + 1, paint(x - x0, r));
  }
}

/** A pylon sign: a steel post and a board of w x rows on top, at ground offset x, y. */
function pylon(p: Painter, x: number, y: number, top: number, w: number, rows: number, paint: (k: number, r: number) => string): void {
  p.stroke(x, y, x, y - top + rows, 1, 'S');
  p.id++;
  const x0 = x - Math.floor(w / 2);
  for (let k = 0; k < w; k++) for (let r = 0; r < rows; r++) p.set(GX + x0 + k, GY + y - top + r, paint(k, r));
}

// ---------------------------------------------------------------- Rumah Makan

/** Level 1, a gerobak bakso: a red cart Lifted on two wheels, a glass case of bowls, an Inflated payung over it. */
const gerobakBakso: Level = (p) => {
  p.shadow(6);
  wheel(p, -6, 2);
  wheel(p, 0, 5);
  // The cart body on its wheels, a yellow stripe along it.
  p.box(5, 4, 'r', (face, _u, j) => (face !== 'T' && j === 2 ? 'y' : face === 'T' ? 'R' : undefined), 2);
  // The glass case: bowls and a stack of mangkok behind the glass, a steaming pot at the back.
  p.box(6, 4, 'l', (face, _u, j, i) => {
    if (face === 'T') return 'c';
    if (j === 0) return 'w';
    return j === 1 && i % 3 === 0 ? 'w' : (i + j) % 4 === 0 ? 'o' : undefined;
  }, 6);
  // The payung: a pole up from the case, a red-and-white striped canopy wider than the cart.
  p.stroke(0, -10, 0, -13, 1, 'S');
  p.roof(4, 13, 3, 'r', (x) => (Math.floor(x / 2) % 2 ? 'w' : undefined));
  // The push handle, and a stool for the customer.
  p.stroke(-9, -5, -13, -6, 1, 'n');
  stool(p, 7, 3);
};

/** Level 2, a warkop: a plank lean-to Extruded off its back wall, an open counter, a banner under a zinc shed roof, a bench. */
const warkop: Level = (p) => {
  p.shadow(3);
  p.box(4, 7, 'N', (face, u, j, i) => {
    if (face === 'T') return undefined;
    // The open front: a counter of planks, jars on it, a dark room behind.
    if (face === 'L' && within(u, 0.08, 0.92)) {
      if (j < 3) return i % 3 === 0 ? 'N' : 'n';
      if (j === 3) return i % 3 === 1 ? 'y' : i % 3 === 2 ? 'r' : 'c';
      if (j < 6) return 'k';
      return i % 4 < 2 ? 'y' : 'r';
    }
    return i % 3 === 0 ? 'n' : undefined;
  });
  p.roofShape('shed', 3, 7, 3, 's', 'N', (x) => (x % 2 ? 'S' : undefined));
  bench(p, -11, 3, 6);
  stool(p, 6, 4);
};

/** Level 3, a warteg: a false-front nameboard over a wide etalase of dishes, a teal door, a pelana, a bench out front. */
const warteg: Level = (p) => {
  p.shadow(2);
  p.box(2, 10, 'w', (face, u, j, i) => {
    if (face === 'T') return undefined;
    if (j < 2) return 'G';
    // The etalase: a long glass case of dishes in rows.
    if (face === 'L' && within(u, 0.08, 0.6) && within(j, 2, 7)) return j === 2 ? 'S' : j === 6 ? 'c' : ['o', 'y', 'g', 'r', 'n'][(i + j * 2) % 5];
    if (face === 'L' && within(u, 0.68, 0.88) && j < 8) return 'c';
    if (face === 'R' && within(u, 0.25, 0.75) && within(j, 3, 7)) return 'l';
    return undefined;
  });
  p.roofShape('gable', 2, 10, 5, 'G', 'w');
  falseFront(p, 2, 10, 0.04, 0.72, 4, (k, r) => (r === 0 || r === 3 ? 'B' : k % 3 === 1 && r < 3 ? 'w' : 'b'));
  bench(p, -9, 4, 6);
};

// ---------------------------------------------------------------- Minimarkets

/**
 * The two minimarket chains share one silhouette, as the real ones share a template: a white box under
 * a flat dak, a box sign on the roof, glass along the front, and at level 2 a pylon sign and an ATM.
 * They differ in colour and pattern only. IndoApril runs a blue band over red and yellow stripes with
 * close-set blue mullions; BetaMart a deep red fascia with a white strip, a yellow line over a blue
 * base band, and wider-set red mullions. Level 1 is a small branch, level 2 the full store.
 */
interface Chain {
  fascia: (j: number, h: number) => string | undefined;
  mullion: (i: number) => string;
  base: string;
  sign: (j: number, i: number) => string;
  pylon: (r: number) => string;
}

const INDO: Chain = {
  fascia: (j, h) => (j >= h - 3 ? (j === h - 1 ? 'B' : 'b') : j === h - 4 ? 'r' : j === h - 5 ? 'y' : undefined),
  mullion: (i) => (i % 4 === 0 ? 'B' : 'c'),
  base: 'S',
  sign: (j, i) => (j === 0 ? 'y' : j === 1 ? 'r' : j >= 3 && i % 3 === 1 ? 'w' : 'b'),
  pylon: (r) => (r < 3 ? 'b' : r === 3 ? 'r' : 'y'),
};

const BETA: Chain = {
  fascia: (j, h) => (j >= h - 3 ? (j === h - 2 ? 'w' : 'r') : j === h - 4 ? 'y' : j === h - 5 ? 'B' : undefined),
  mullion: (i) => (i % 6 === 0 ? 'r' : i % 6 === 3 ? 'w' : 'c'),
  base: 'B',
  sign: (j, i) => (j === 0 ? 'B' : j === 1 ? 'y' : j >= 3 && (i % 4 === 0) ? 'w' : 'r'),
  pylon: (r) => (r < 3 ? 'r' : r === 3 ? 'y' : 'B'),
};

function minimarket(chain: Chain, level: number): Level {
  return (p) => {
    const big = level >= 2;
    const inset = big ? 1 : 3;
    const h = big ? 13 : 11;
    p.shadow(inset);
    p.box(inset, h, 'w', (face, u, j, i) => {
      if (face === 'T') return undefined;
      const f = chain.fascia(j, h);
      if (f) return f;
      if (j === 0) return chain.base;
      if (face === 'L' && within(u, 0.44, 0.62) && j < h - 6) return j === h - 7 ? chain.base : 'k';
      if (j >= 1 && j <= h - 6) return chain.mullion(i);
      return undefined;
    });
    p.roofShape('flat', inset, h, 0, 's', 'w');
    p.box(inset + 3, big ? 6 : 5, 'w', (face, _u, j, i) => (face === 'T' ? chain.sign(0, 0) : chain.sign(j, i)), h + 1);
    if (!big) return;
    pylon(p, -12, 1, 17, 4, 5, (_k, r) => chain.pylon(r));
    // An ATM column by the right corner.
    p.stroke(10, 1, 10, -6, 3, 'S');
    p.set(GX + 10, GY - 5, 'c');
    p.set(GX + 11, GY - 5, 'c');
  };
}

// ---------------------------------------------------------------- Fotokopi

/** The fotokopi banner: blue, with white and yellow lettering bands, the way every one is printed. */
const banner = (k: number, r: number) => (r === 0 || r === 3 ? 'B' : r === 1 ? (k % 3 ? 'w' : 'b') : k % 4 < 2 ? 'y' : 'b');

/** Level 1, a kios fotokopi: one copier under a blue lean-to and a big printed banner, a ream of paper on a crate. */
const fotokopiKios: Level = (p) => {
  p.shadow(4);
  p.box(4, 7, 'w', (face, u, j) => {
    if (face === 'T') return undefined;
    if (face === 'L' && within(u, 0.1, 0.9) && j >= 1) return 'k';
    return undefined;
  });
  // The copier inside the open front.
  p.box(8, 4, 's', (face, _u, j) => (face === 'T' ? 'w' : j === 3 ? 'S' : undefined));
  p.roofShape('shed', 4, 7, 3, 'B', 'w', (x) => (x % 2 ? 'b' : undefined));
  falseFront(p, 4, 7, 0.05, 0.95, 4, banner);
  p.box(9, 2, 'w', (face) => (face === 'T' ? 'w' : 'c'), 0);
};

/** Level 2, a fotokopi shop: a flat-roofed toko with a big banner board Extruded above the parapet. */
const fotokopiToko: Level = (p) => {
  p.shadow(2);
  p.box(2, 10, 'w', (face, u, j, i) => {
    if (face === 'T') return undefined;
    if (j === 0) return 'S';
    // A rolling door half up over the copiers, a glass case of ATK beside it.
    if (face === 'L' && within(u, 0.36, 0.92) && j < 8) return j >= 5 ? (i % 2 ? 's' : 'S') : j === 1 ? 's' : 'k';
    if (face === 'L' && within(u, 0.06, 0.3) && within(j, 2, 7)) return (i + j) % 3 === 0 ? 'r' : (i + j) % 3 === 1 ? 'y' : 'c';
    if (face === 'R' && within(u, 0.3, 0.7) && within(j, 3, 7)) return 'l';
    return undefined;
  });
  p.roofShape('shed', 2, 10, 5, 'B', 'w', (x) => (x % 2 ? 'b' : undefined));
  falseFront(p, 2, 13, 0.02, 0.98, 6, banner);
};

/** Level 3, a ruko fotokopi: a second storey Stacked on the shop, the banner across it, a vertical ATK sign on the side. */
const fotokopiRuko: Level = (p) => {
  p.shadow(2);
  p.box(2, 8, 'w', (face, u, j, i) => {
    if (face === 'T') return undefined;
    if (j === 0) return 'S';
    if (face === 'L' && within(u, 0.06, 0.94) && j < 7) return j >= 5 ? (i % 2 ? 's' : 'S') : j === 1 ? 's' : (i % 5 === 2 ? 'w' : 'k');
    if (face === 'R' && within(u, 0.2, 0.8) && within(j, 2, 7)) return (i + j) % 3 === 0 ? 'y' : 'c';
    return undefined;
  });
  // The upper floor: the stock room, a row of windows.
  p.box(2, 6, 'c', (face, u, j, i) => {
    if (face === 'T') return undefined;
    if (j === 0) return 'w';
    if (face === 'L' && within(u, 0.1, 0.9) && within(j, 2, 5) && i % 4 !== 0) return 'l';
    return undefined;
  }, 8);
  p.roofShape('shed', 2, 14, 2, 'B', 'c', (x) => (x % 2 ? 'b' : undefined));
  falseFront(p, 2, 8, 0.02, 0.98, 4, banner);
  // A vertical ATK sign on a bracket off the right wall.
  p.stroke(12, -6, 12, -15, 2, 'y');
  p.stroke(12, -13, 12, -12, 2, 'r', false);
  p.stroke(12, -9, 12, -8, 2, 'b', false);
};

// ---------------------------------------------------------------- Apotek

/** Clutter on a dak: an AC outdoor unit and, when tandon is set, an orange water tank on a stand. (a, b) is the unit's back corner, z the roof height. */
function roofKit(p: Painter, a: number, b: number, tandon: boolean, z = 7): void {
  prism(p, a, a + 0.14, b, b + 0.08, 2, 'e', (face, _u, j, i) => (face === 'R' && j === 1 && i % 2 ? 'S' : face === 'T' ? 'e' : undefined), z);
  if (tandon) {
    prism(p, a + 0.2, a + 0.3, b - 0.06, b + 0.04, 1, 'S', undefined, z);
    prism(p, a + 0.19, a + 0.31, b - 0.07, b + 0.05, 3, 'o', (face, _u, j) => (j === 2 || face === 'T' ? 'a' : undefined), z + 1);
  }
}


/**
 * Every apotek is flat-roofed with a deep green fascia and wears the plus-shaped lightbox, so its outline is a
 * box with a cross standing over it, never a house roof. Level 1, a kios obat: a glass counter under a green
 * awning, the cross on a post beside it.
 */
const apotekKios: Level = (p) => {
  p.shadow(5);
  prism(p, 0.28, 0.76, 0.26, 0.7, 7, 'e', (face, u, j, i) => {
    if (face === 'T') return 's';
    if (j === 0) return 'G';
    if (j >= 5) return j === 6 ? 'G' : 'g';
    if (face === 'L' && within(u, 0.1, 0.9) && within(j, 1, 5)) return i % 3 === 0 ? 'e' : 'c';
    return undefined;
  });
  awning(p, 0.3, 0.74, 0.7, 0.1, 6, 'g', stripes(['g', 'e']));
  roofKit(p, 0.5, 0.36, false);
  plusPylon(p, 9, 0, 17);
};

/** Level 2, an apotek: a wide white shop, a green fascia band with the cross mounted on it, a glass front under a canopy. */
const apotekToko: Level = (p) => {
  p.shadow(2);
  prism(p, 0.14, 0.86, 0.12, 0.74, 9, 'e', (face, u, j, i) => {
    if (face === 'T') return 's';
    if (j === 0) return 'G';
    if (j >= 7) return j === 8 ? 'G' : 'g';
    if (face === 'L' && within(u, 0.62, 0.8) && j < 6) return 'k';
    if (face === 'L' && within(u, 0.06, 0.56) && within(j, 1, 6)) return i % 4 === 0 ? 'e' : 'c';
    if (face === 'R' && within(u, 0.2, 0.8) && within(j, 2, 6)) return i % 4 === 0 ? 'e' : 'l';
    return undefined;
  });
  awning(p, 0.14, 0.86, 0.74, 0.08, 8, 'G');
  // The parapet rim round the dak, and the lightbox standing on the roof's front corner.
  prism(p, 0.14, 0.86, 0.12, 0.74, 1, 'e', (face) => (face === 'T' ? 's' : 'e'), 9);
  roofKit(p, 0.62, 0.2, true, 10);
  p.stroke(-1, -4, -1, -16, 1, 'S');
  plusSign(p, -1, -17);
};

/** Level 3, apotek and praktik dokter: the shop with a clinic stacked on top behind a balcony, the cross lit gold on the roof. */
const apotekKlinik: Level = (p) => {
  p.shadow(1);
  prism(p, 0.1, 0.9, 0.1, 0.8, 8, 'e', (face, u, j, i) => {
    if (face === 'T') return 's';
    if (j === 0) return 'G';
    if (j >= 6) return j === 7 ? 'G' : 'g';
    if (face === 'L' && within(u, 0.62, 0.8) && j < 5) return 'k';
    if (face === 'L' && within(u, 0.06, 0.56) && within(j, 1, 5)) return i % 4 === 0 ? 'e' : 'c';
    if (face === 'R' && within(u, 0.15, 0.85) && within(j, 2, 5)) return i % 4 === 0 ? 'e' : 'l';
    return undefined;
  });
  awning(p, 0.1, 0.9, 0.8, 0.07, 7, 'G');
  // The praktik dokter upstairs, set back so its balcony runs along the front.
  prism(p, 0.14, 0.78, 0.12, 0.64, 6, 'e', (face, u, j) => {
    if (face === 'T') return 's';
    if (j === 5) return 'G';
    if (face === 'L' && (within(u, 0.1, 0.35) || within(u, 0.55, 0.8)) && within(j, 1, 4)) return 'l';
    if (face === 'R' && within(u, 0.3, 0.7) && within(j, 1, 4)) return 'l';
    return undefined;
  }, 8);
  p.id++;
  for (let x = -11; x <= 1; x++) p.set(GX + x, GY - 8 - 2 + Math.round((x + 11) / 2) + 2, x & 1 ? 'G' : 'e');
  roofKit(p, 0.3, 0.2, true, 14);
  p.stroke(9, -9, 9, -20, 1, 'S');
  plusSign(p, 9, -21, 'y');
};

// ---------------------------------------------------------------- Barbershop

// Every barbershop has the spiral pole by its door and a tricolour stripe somewhere, and none has a house
// roof: a tarp, then a flat kiosk with a false front, then a charcoal box with a lit nameboard.
const BARBER = stripes(['r', 'e', 'b', 'e']);

/** Level 1, pangkas rambut: a chair and a mirror nailed to a plank wall, under a striped tarp on two poles. */
const pangkas: Level = (p) => {
  p.shadow(6);
  // The plank back wall, only its back half, so the stall stays open.
  p.box(6, 9, 'n', (face, u) => (face === 'T' ? null : face === 'L' && u > 0.25 ? null : face === 'R' && u < 0.75 ? null : undefined));
  posts(p, 6, 9, 'a', [0, 1]);
  // The mirror and the chair.
  p.stroke(-6, -7, -4, -6, 2, 'c');
  p.box(10, 3, 'r', (face) => (face === 'T' ? 'R' : undefined));
  p.roofShape('shed', 6, 9, 3, 'r', 'n', BARBER);
  barberPole(p, -10, 1, 7);
};

/** Level 2, a barbershop kiosk: flat-roofed teal walls behind a tall false front painted in the tricolour, a striped awning over the window. */
const barberKios: Level = (p) => {
  p.shadow(3);
  prism(p, 0.2, 0.8, 0.2, 0.72, 8, 'c', (face, u, j, i) => {
    if (face === 'T') return 's';
    if (j === 0) return 'S';
    if (face === 'L' && within(u, 0.66, 0.86) && j < 6) return 'N';
    if (face === 'L' && within(u, 0.1, 0.58) && within(j, 1, 5)) return i % 5 === 0 ? 'e' : 'l';
    if (face === 'R' && within(u, 0.3, 0.7) && within(j, 2, 6)) return 'l';
    return undefined;
  });
  // The false front: the front wall carried up past the roof, a sign band of red, white and blue.
  prism(p, 0.2, 0.8, 0.68, 0.72, 5, 'e', (face, _u, j, i) => (face === 'T' ? 'e' : j === 4 || j === 0 ? 'B' : ['r', 'e', 'b'][Math.floor(i / 2) % 3]), 8);
  roofKit(p, 0.3, 0.3, false, 8);
  awning(p, 0.24, 0.62, 0.72, 0.09, 6, 'r', BARBER);
  barberPole(p, -1, 7, 8);
};

/** Level 3, a modern barbershop: a wide charcoal box with full glass and the chairs inside, a lit gold nameboard on the roof, a pole at each end. */
const barberModern: Level = (p) => {
  const char = '#3b3430';
  p.shadow(2);
  prism(p, 0.1, 0.9, 0.12, 0.82, 11, char, (face, u, j, i) => {
    if (face === 'T') return '#4a423d';
    if (j === 0) return 'S';
    if (j === 10) return 'a';
    if (face === 'L' && within(u, 0.06, 0.94) && within(j, 1, 7)) {
      // Two red chairs and their mirrors through the glass.
      if (j < 3 && (i % 8 === 2 || i % 8 === 3)) return 'r';
      if (j >= 4 && j < 6 && i % 8 === 2) return 'e';
      return i % 8 === 0 ? char : 'l';
    }
    if (face === 'R' && within(u, 0.2, 0.8) && within(j, 3, 8)) return 'l';
    return undefined;
  });
  awning(p, 0.14, 0.86, 0.82, 0.1, 8, 'r', BARBER);
  // The lightbox nameboard standing on the roof's front edge, gold letters on charcoal.
  prism(p, 0.2, 0.8, 0.66, 0.72, 4, char, (face, _u, j, i) => (face === 'T' ? 'a' : j === 0 || j === 3 ? 'a' : i % 3 === 1 ? 'y' : char), 11);
  barberPole(p, -13, 1, 10, true);
  barberPole(p, 10, 1, 10, true);
};

// ---------------------------------------------------------------- Bengkel

/** Level 1, tambal ban: an orange tarp lean-to on posts, a stack of tyres, a red compressor and the tyre-on-a-stick sign. */
const tambalBan: Level = (p) => {
  p.shadow(4);
  posts(p, 4, 9, 'n');
  p.roofShape('shed', 4, 9, 3, 'o', 'n', (x) => (x % 3 === 0 ? 'y' : undefined));
  // The compressor and a stack of three tyres.
  p.box(8, 4, 'r', (face, _u, j) => (face === 'T' ? 'R' : j === 3 ? 'R' : undefined));
  for (const k of [0, 2, 4]) p.blob(-6, 1 + k, 2.2, 'k');
  // The sign: a tyre on a stick by the road, the whole kampung's way of saying tambal ban.
  p.stroke(10, 2, 10, -9, 1, 'n');
  p.blob(10, 12, 2.6, 'k');
  p.set(GX + 10, GY - 12, 'r');
};

/** Level 2, a workshop: a steel-grey garage with a dark open bay, a pelana and an orange signboard. */
const bengkelGarage: Level = (p) => {
  p.shadow(3);
  p.box(3, 9, 'S', (face, u, j, i) => {
    if (face === 'T') return undefined;
    if (face === 'L' && within(u, 0.15, 0.85) && j < 7) return j === 6 ? 's' : 'k';
    if (face === 'R' && within(u, 0.3, 0.7) && within(j, 3, 6)) return 'l';
    return j === 8 ? (i % 2 ? 'o' : 'y') : undefined;
  });
  p.roofShape('gable', 3, 9, 4, 'b', 'S');
  p.blob(-8, 1, 2, 'k');
};

/** Level 3, a bengkel resmi: a wide garage with two blue roller doors, a red fascia and a lit box sign on the dak. */
const bengkelResmi: Level = (p) => {
  p.shadow(1);
  p.box(1, 10, 'w', (face, u, j, i) => {
    if (face === 'T') return undefined;
    if (j >= 8) return j === 9 ? 'R' : 'r';
    if (face === 'L' && (within(u, 0.08, 0.46) || within(u, 0.54, 0.92)) && j < 7) return j >= 5 ? (i % 2 ? 'b' : 'B') : 'k';
    if (face === 'R' && within(u, 0.25, 0.75) && within(j, 3, 7)) return 'l';
    return j === 0 ? 'S' : undefined;
  });
  p.roofShape('flat', 1, 10, 0, 's', 'w');
  p.box(6, 3, 'w', (face, _u, j) => (face === 'T' ? 's' : j === 1 ? 'r' : 'w'), 11);
};

// ---------------------------------------------------------------- Lampu Jalan and Patung Ikon

/** Lampu Jalan: a steel pole with an arm Bent out over the path and a lamp head hanging from it, on a concrete foot. */
const lampuJalan: Level = (p) => {
  p.shadow(9);
  p.box(7, 2, 's');
  p.stroke(-2, -2, -2, -21, 2, 'S');
  p.stroke(-2, -21, 5, -24, 1, 'S');
  p.stroke(5, -22, 7, -21, 2, 'S');
  p.stroke(5, -20, 7, -19, 1, 'y');
};

/**
 * Patung Ikon: a golden mini oil palm, short and fat, on a two-step plinth. The trunk is stout and
 * shaggy with the cut frond bases of a real sawit, the crown a rosette of stiff arching fronds, and a
 * fruit bunch hangs under it, all in gold: the kampung's own landmark for its kebun sawit.
 */
const patungIkon: Level = (p) => {
  p.shadow(3);
  p.box(3, 2, 's', (face) => (face === 'T' ? 'w' : undefined));
  p.box(5, 3, 'S', (face, _u, j) => (face !== 'T' && j === 1 ? 'y' : undefined), 2);
  // The fat trunk, its frond bases in a staggered gold checker.
  p.box(6, 9, 'a', (face, _u, j, i) => (face !== 'T' && (i + j * 2) % 4 === 0 ? 'o' : face === 'T' ? 'y' : undefined), 5);
  // The crown: stiff fronds rising out of the top, then arching over and down, back ones first, so the
  // palm reads as a shaggy rosette and never as a flower.
  const top = -15;
  for (const [dx, dy, ex, ey] of [[-4, -5, -8, -3], [4, -5, 8, -3], [-6, -3, -12, 1], [6, -3, 12, 2], [-2, -6, -3, -2], [2, -6, 4, -2], [-5, -1, -9, 5], [5, -1, 9, 5]] as [number, number, number, number][]) {
    p.leaf(0, top, dx, top + dy, 'y');
    p.leaf(dx, top + dy, ex, top + ey, 'a');
  }
  // The fruit bunch under the crown.
  p.blob(-1, 13, 2.4, 'o');
  p.blob(2, 12, 1.8, 'o');
};

export const TOKO_ART: Record<string, (p: Painter, variant?: string, level?: number) => void> = {
  rumahMakan: byLevel(warungMakan, warkop, warteg),
  indomaret: (p, _v, level = 1) => minimarket(INDO, level)(p),
  alfamart: (p, _v, level = 1) => minimarket(BETA, level)(p),
  fotokopi: byLevel(fotokopiKios, fotokopiToko, fotokopiRuko),
  apotek: byLevel(apotekKios, apotekToko, apotekKlinik),
  barbershop: byLevel(pangkas, barberKios, barberModern),
  bengkel: byLevel(tambalBan, bengkelGarage, bengkelResmi),
  // Retired buildings that joined a levelled one keep their old saves' look: the level they stand for.
  gerobakBakso: gerobakBakso,
  warkop,
  warteg,
  tokoKelontong: (p) => warungArt(p, 3),
  lampuTaman: lampuJalan,
  patungIkon,
};
