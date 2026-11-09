import { dither, type Painter } from './iso';
import { at } from './kampung-art';
import { prism } from './massing';
import { PALETTE } from './sprites';

// Air Mancur (Payung Air) and Studi Banding (Bus Pariwisata), picked by Koko from three options each
// (2026-11-09, decisions/air-mancur-studi-banding.md). Round forms (basins, bowls, balls) are true 2:1
// ellipses and cel-lit spheres in native pixels. bolaDunia and kunkerLuarNegeri are the runner-up designs,
// kept unregistered as the higher levels if these two ever level up. Registered in art-content.ts.

type Art = (p: Painter, variant?: string, level?: number) => void;
const within = (v: number, lo: number, hi: number) => v >= lo && v < hi;

const hex = (c: string): string => (c.startsWith('#') ? c : (PALETTE as Record<string, string>)[c] ?? c);
function shade(c: string, f: number): string {
  const n = parseInt(hex(c).slice(1), 16);
  const ch = (s: number) => Math.max(0, Math.min(255, Math.round(((n >> s) & 255) * f)));
  return `#${((ch(16) << 16) | (ch(8) << 8) | ch(0)).toString(16).padStart(6, '0')}`;
}

const WATER = '#82bfdc';
const FOAM = '#e8f6fb';
const STONE = '#d8d0c0';

/**
 * A round drum (basin, plinth, bowl): an upright elliptical cylinder at screen point (x, y), half width rx,
 * h pixels tall, its base z pixels up. The wall is lit on the left and shaded on the right; top is the
 * fill on its top face (water or stone), with a 1px lit rim when rim is set.
 */
function drum(p: Painter, x: number, y: number, rx: number, h: number, wall: string, top: string, z = 0, rim?: string): void {
  const ry = rx / 2;
  const yb = y - z;
  p.id++;
  for (let dx = -rx; dx <= rx; dx++) {
    const f = Math.round(ry * Math.sqrt(Math.max(0, 1 - (dx * dx) / (rx * rx))));
    const c = dx > rx * 0.3 ? shade(wall, 0.72) : dx < -rx * 0.55 ? shade(wall, 1.1) : hex(wall);
    for (let k = 0; k <= h; k++) p.px(x + dx, yb + f - k, c);
  }
  p.id++;
  const inside = (dx: number, dy: number, r: number) => (dx * dx) / (r * r) + (dy * dy) / ((r / 2) * (r / 2)) <= 1;
  for (let dy = -Math.ceil(ry) - 1; dy <= Math.ceil(ry) + 1; dy++)
    for (let dx = -rx - 1; dx <= rx + 1; dx++) {
      if (!inside(dx, dy, rx + 0.5)) continue;
      const inner = rim ? inside(dx, dy, rx - 1.2) : true;
      p.px(x + dx, yb + dy - h, inner ? (top === WATER && (dx * 3 + dy * 7) % 19 === 0 ? FOAM : hex(top)) : hex(rim!));
    }
}

/** A cel-lit ball at screen (x, y) (its centre), radius r: a bright cap at the top left, a shaded crescent at the bottom right. */
function ball(p: Painter, x: number, y: number, r: number, c: string, paint?: (dx: number, dy: number) => string | undefined): void {
  p.id++;
  for (let dy = -r; dy <= r; dy++)
    for (let dx = -r; dx <= r; dx++) {
      const d = (dx * dx + dy * dy) / (r * r);
      if (d > 1.05) continue;
      const lit = dx + dy < -r * 0.6 ? 1.25 : dx + dy > r * 0.5 ? 0.72 : 1;
      p.px(x + dx, y + dy, paint?.(dx, dy) ?? shade(c, lit));
    }
  p.px(x - Math.round(r * 0.4), y - Math.round(r * 0.5), '#ffffff');
}

/** A water arc in native pixels after the ink pass, from (x0, y0) to (x1, y1), rising h pixels at its top. */
function arc(q: Painter, x0: number, y0: number, x1: number, y1: number, h: number, c = FOAM): void {
  const steps = Math.ceil(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), h) * 2);
  for (let k = 0; k <= steps; k++) {
    const t = k / steps;
    q.px(Math.round(x0 + (x1 - x0) * t), Math.round(y0 + (y1 - y0) * t - Math.sin(t * Math.PI) * h), k % 3 === 2 ? WATER : c);
  }
}

/** The paved square round a fountain: stone pavers in rings, the grass dithered in at the corners. */
function plaza(p: Painter, r = 0.46): void {
  p.ground((a, b) => {
    const d = Math.hypot(a - 0.5, b - 0.5);
    if (d > r) return null;
    if (d > r - 0.04) return 'S';
    return Math.floor(d * 30) % 3 === 0 ? '#c6baa5' : '#cfc4b0';
  });
  p.overlay.push(dither);
}

/**
 * Backup for an Air Mancur level up (not registered): Bola Dunia. A round pool with a stepped plinth and a big globe on top, four jets arching onto it from the rim. */
export const bolaDunia: Art = (p) => {
  plaza(p);
  const [x, y] = at(p, 0.5, 0.5).map(Math.round);
  drum(p, x, y, 13, 3, '#3d72b4', WATER, 0, '#93d8cb');
  drum(p, x, y, 6, 2, STONE, STONE, 3);
  drum(p, x, y, 4, 2, '#bdb4a3', '#bdb4a3', 5);
  // The globe: blue sea, green land in blocky continents, a gold ring round its equator.
  ball(p, x, y - 14, 6, '#3d72b4', (dx, dy) => {
    if (dy === 1 || dy === 2) return Math.abs(dx) <= 6 ? (dx > 2 ? '#a8821f' : '#f4b935') : undefined;
    const land = (dx + 7 + (dy + 7) * 3) % 7 < 3 && Math.abs(dx) + Math.abs(dy) < 7;
    if (!land) return undefined;
    return dx + dy > 2 ? '#3f7430' : '#6aa443';
  });
  p.overlay.push((q) => {
    for (const [sx, sy] of [[-11, 1], [11, 1], [-6, 4], [6, 4]]) arc(q, x + sx, y - 3 + sy, x + Math.sign(sx) * 3, y - 9, 6);
    for (const [dx, dy] of [[-4, 1], [4, 1], [-9, -1], [9, -1]]) q.px(x + dx, y - 3 + dy, FOAM);
  });
};

/** Air Mancur: Payung Air. A lotus pool with a slim column, a gold bud on top and a dome of jets arching from it like an umbrella. */
export const airMancur: Art = (p) => {
  plaza(p);
  const [x, y] = at(p, 0.5, 0.5).map(Math.round);
  drum(p, x, y, 10, 2, '#a8652f', WATER, 0, '#e57d2e');
  // Lotus petals round the base of the column.
  p.id++;
  for (const [dx, dy] of [[-4, 0], [4, 0], [-2, 1], [2, 1], [0, 1], [-3, -1], [3, -1]]) {
    p.px(x + dx, y - 3 + dy, '#e57a9c');
    p.px(x + dx, y - 4 + dy, '#f6b0c4');
  }
  drum(p, x, y, 1, 9, STONE, STONE, 3);
  ball(p, x, y - 15, 2, '#f4b935');
  p.px(x, y - 18, '#f4b935');
  p.overlay.push((q) => {
    // The water dome: jets from the bud fall in an umbrella onto a ring of the pool.
    for (let k = 0; k < 8; k++) {
      const th = (k / 8) * Math.PI * 2;
      const ex = Math.round(Math.cos(th) * 8);
      const ey = Math.round(Math.sin(th) * 5);
      if (ey < -3) continue;
      arc(q, x, y - 16, x + ex, y - 2 + ey, 4);
    }
    for (const [dx, dy] of [[-8, 0], [8, 0], [-5, 2], [5, 2], [0, 3]]) q.px(x + dx, y - 2 + dy, '#ffffff');
  });
};

// ---------------------------------------------------------------- Studi Banding

/** A small figure standing at ground (a, b), in native pixels after the ink pass: legs, a shirt (batik for officials), a face and hair or a peci. */
function person(p: Painter, a: number, b: number, shirt: string, peci = false): void {
  p.overlay.push((q) => {
    const [x0, y0] = at(q, a, b);
    const x = Math.round(x0), y = Math.round(y0);
    const sh = hex(shirt);
    for (const dx of [0, 1]) {
      q.px(x + dx, y, '#2a1810');
      q.px(x + dx, y - 1, '#3b3430');
      for (const dy of [2, 3, 4]) q.px(x + dx, y - dy, shirt === 'n' && dy === 3 ? (dx ? '#f4b935' : '#a8321f') : dx ? shade(sh, 0.8) : sh);
      q.px(x + dx, y - 5, '#eac58f');
      q.px(x + dx, y - 6, peci ? '#2a1810' : '#3b3430');
    }
  });
}

/** Suitcases in a heap: small boxes in bright colours. */
function luggage(p: Painter, a: number, b: number, z = 0): void {
  const cols = ['r', 'b', 'y', 'p', 'g'];
  [[0, 0, 2], [0.06, 0, 2], [0.12, 0, 3], [0.18, 0, 2]].forEach(([da, db, h], k) =>
    prism(p, a + da, a + da + 0.05, b + db, b + db + 0.08, h, cols[k % cols.length], undefined, z));
}

/**
 * Studi Banding: Bus Pariwisata. A long tour coach along the lot with a curved roof, a tinted window band, a
 * swoosh livery and a roof rack piled with luggage; the rombongan in batik pose with a spanduk in front.
 */
export const studiBanding: Art = (p) => {
  p.low();
  p.shadow(1);
  p.ground((a, b, px) => (Math.min(a, b, 1 - a, 1 - b) < 2 * px ? 'S' : (Math.floor(a * 8) + Math.floor(b * 8)) % 2 ? '#3f3a35' : '#47413b'));
  // The coach: body, a rounder top from a narrower box over it, wheels.
  const [a0, a1, b0, b1] = [0.08, 0.92, 0.22, 0.5];
  prism(p, a0, a1, b0, b1, 9, 'w', (face, u, j, i) => {
    if (face === 'T') return undefined;
    if (j === 0) return 'k';
    if (j === 1) return face === 'L' && (Math.abs(u - 0.16) < 0.05 || Math.abs(u - 0.8) < 0.05) ? 'k' : 'S';
    if (within(j, 5, 8)) return face === 'R' ? (i % 6 === 0 ? 'w' : '#27427c') : i % 5 === 0 ? 'w' : '#27427c';
    if (j === 3 || j === 4) return face === 'L' ? (Math.floor(u * 20 + j) % 7 < 3 ? 'o' : Math.floor(u * 20 + j) % 7 < 5 ? 'r' : undefined) : undefined;
    return undefined;
  });
  prism(p, a0 + 0.02, a1 - 0.02, b0 + 0.02, b1 - 0.02, 1, 'w', undefined, 9);
  // The roof rack and the luggage on it.
  luggage(p, 0.3, 0.28, 10);
  luggage(p, 0.56, 0.3, 10);
  // The spanduk held by two officials, the others posing beside it.
  prism(p, 0.3, 0.62, 0.78, 0.8, 4, 'w', (face, _u, j, i) => (face === 'L' ? (j === 3 ? 'r' : j === 0 ? 'r' : j === 2 && i % 3 ? 'k' : 'w') : undefined), 3);
  for (const [a, c, pe] of [[0.26, 'n', true], [0.36, 'b', false], [0.46, 'n', true], [0.56, 'p', false], [0.64, 'n', true]] as [number, string, boolean][]) person(p, a, 0.82, c, pe);
  // The photographer with his tripod.
  person(p, 0.52, 0.94, 'k');
  luggage(p, 0.78, 0.66);
};

/**
 * Backup for a Studi Banding level up (not registered): Kunjungan Kerja ke Luar Negeri. A small airliner on the apron with its nose, wings and tail fin,
 * a boarding stair truck at the door, a luggage cart, and the rombongan in batik climbing aboard.
 */
export const kunkerLuarNegeri: Art = (p) => {
  p.low();
  p.shadow(1);
  p.ground((a, b, px) => {
    if (Math.min(a, b, 1 - a, 1 - b) < 2 * px) return 'S';
    if (within(b, 0.86, 0.88) && Math.floor(a * 10) % 2) return 'y';
    return '#9a968e';
  });
  // Fuselage along a: a long white body with a window row and a blue cheatline, the nose stepped round
  // with a dark cockpit, the tail cone stepped up to a tall fin in red and white.
  const [b0, b1] = [0.4, 0.58];
  prism(p, 0.16, 0.76, b0, b1, 7, 'w', (face, _u, j, i) => (face === 'T' ? undefined : j === 0 ? 'S' : j === 2 ? 'b' : j === 5 && i % 3 === 0 ? '#27427c' : undefined), 2);
  prism(p, 0.76, 0.84, b0 + 0.02, b1 - 0.02, 6, 'w', (face, _u, j) => (face === 'T' ? undefined : j === 2 ? 'b' : j === 4 ? 'k' : undefined), 2);
  prism(p, 0.84, 0.9, b0 + 0.05, b1 - 0.05, 4, 'w', (face, _u, j) => (face !== 'T' && j === 3 ? 'k' : undefined), 3);
  prism(p, 0.08, 0.16, b0 + 0.03, b1 - 0.03, 5, 'w', undefined, 4);
  prism(p, 0.06, 0.2, 0.48, 0.5, 9, 'r', (face, _u, j) => (face === 'L' && within(j, 3, 6) ? 'w' : undefined), 8);
  prism(p, 0.04, 0.14, 0.34, 0.64, 1, 'w', undefined, 7);
  // The wings, wide at the root and tapering, swept a little back, with an engine under each.
  prism(p, 0.4, 0.62, 0.22, b0, 1, '#d8d0c0', undefined, 4);
  prism(p, 0.36, 0.52, 0.04, 0.22, 1, '#d8d0c0', undefined, 4);
  prism(p, 0.4, 0.62, b1, 0.76, 1, '#d8d0c0', undefined, 4);
  prism(p, 0.36, 0.52, 0.76, 0.94, 1, '#d8d0c0', undefined, 4);
  for (const b of [0.26, 0.68]) prism(p, 0.46, 0.6, b, b + 0.06, 3, 'S', (face) => (face === 'T' ? 'w' : face === 'L' ? 'S' : undefined), 1);
  // The stair truck at the front door and the rombongan climbing up, a luggage cart at the side.
  prism(p, 0.66, 0.76, 0.66, 0.8, 2, 'y');
  for (let k = 0; k < 4; k++) prism(p, 0.67, 0.73, 0.6 + k * 0.04, 0.64 + k * 0.04, 1, 'S', undefined, 7 - k * 2);
  for (const [a, b, c] of [[0.7, 0.86, 'n'], [0.62, 0.9, 'n'], [0.54, 0.92, 'p']] as [number, number, string][]) person(p, a, b, c, c === 'n');
  prism(p, 0.84, 0.96, 0.7, 0.8, 1, 'S', undefined, 1);
  luggage(p, 0.84, 0.72, 2);
};
