import type { Painter } from './iso';
import { PALETTE } from './sprites';

// Massing helpers: boxes and roofs over any rectangle of a footprint, not only the centred square that
// Painter.box draws. They let one lot hold several small masses (a row of units, a hall and its annex,
// a wall longer than it is deep), so big buildings read as a group of parts rather than one block
// scaled up. Both draw in native pixels, so edges stay 1px on a 2x2 or 3x3, and they honour p.low().
//
// a runs 0..1 along the footprint's x axis (screen right and down), b along its y axis (screen left and
// down), as in Painter.ground. The front corner is a = b = 1. Heights are art pixels, as in Painter.box.
// Only `import type` from iso.ts, so there is no import cycle.

const TW = 32;
const TH = 16;
const TOP = 40;

type Face = 'L' | 'R' | 'T';
/** A palette key or hex, null to leave the pixel clear, undefined for the base colour. Same contract as Painter.box. */
export type MassPaint = (face: Face, u: number, j: number, i: number) => string | null | undefined;

const hex = (c: string) => (c.startsWith('#') ? c : PALETTE[c] ?? '#ff00ff');
function shade(c: string, f: number): string {
  const n = parseInt(hex(c).slice(1), 16);
  const ch = (s: number) => Math.max(0, Math.min(255, Math.round(((n >> s) & 255) * f)));
  return `#${((ch(16) << 16) | (ch(8) << 8) | ch(0)).toString(16).padStart(6, '0')}`;
}
const FACE_SHADE: Record<Face, number> = { L: 1, R: 0.72, T: 1.18 };

/** The footprint's projection on this painter: screen x and y of the ground point (a, b), in native pixels. */
function frame(p: Painter) {
  const n = p.n;
  const x0 = (TW / 2) * n + p.ox;
  const y0 = TOP * n + p.oy;
  const ua = (TW / 2) * n;
  const va = (TH / 2) * n;
  return { n, zs: p.zs, x0, y0, ua, va };
}

/**
 * A box over the rectangle a0..a1 by b0..b1, h art pixels tall, its base z above the ground. Draws the
 * two front faces and the top, cel-shaded like Painter.box: L is the face at b = b1 (lit), R the face at
 * a = a1 (shaded). paint gets the face, u (0..1 along the face, L from its back end, R from its front
 * corner, as Painter.box), the row j from the bottom and the column i, both in one-tile pixels.
 */
export function prism(p: Painter, a0: number, a1: number, b0: number, b1: number, h: number, colour: string, paint: MassPaint = () => undefined, z = 0): void {
  const { n, zs, x0, y0, ua, va } = frame(p);
  const H = h * zs;
  const Z = z * zs;
  const base = (p.id += 3);
  const ids: Record<Face, number> = { L: base - 2, R: base - 1, T: base };
  const xl = Math.floor(x0 + (a0 - b1) * ua);
  const xr = Math.ceil(x0 + (a1 - b0) * ua);
  const yt = Math.floor(y0 + (a0 + b0) * va - Z - H);
  const yb = Math.ceil(y0 + (a1 + b1) * va - Z);
  const xFront = x0 + (a1 - b1) * ua;
  for (let y = yt; y <= yb; y++)
    for (let x = xl; x <= xr; x++) {
      const sx = x + 0.5;
      const sy = y + 0.5;
      let face: Face | null = null;
      let u = 0;
      let j = 0;
      let i = 0;
      // Top face: invert the projection at the top's height.
      const s = (sx - x0) / ua;
      const t = (sy + Z + H - y0) / va;
      const ta = (t + s) / 2;
      const tb = (t - s) / 2;
      if (ta >= a0 && ta <= a1 && tb >= b0 && tb <= b1) face = 'T';
      else if (sx <= xFront) {
        const a = s + b1;
        const g = y0 + (a + b1) * va - Z;
        if (a >= a0 && a <= a1 && sy <= g && sy >= g - H) {
          face = 'L';
          u = (a - a0) / (a1 - a0);
          j = Math.floor((g - sy) / zs);
          i = Math.floor((x - xl) / n);
        }
      } else {
        const b = a1 - s;
        const g = y0 + (a1 + b) * va - Z;
        if (b >= b0 && b <= b1 && sy <= g && sy >= g - H) {
          face = 'R';
          u = (b1 - b) / (b1 - b0);
          j = Math.floor((g - sy) / zs);
          i = Math.floor((x - Math.floor(xFront)) / n);
        }
      }
      if (!face) continue;
      const c = paint(face, u, j, i);
      if (c === null) continue;
      p.id = ids[face];
      const ao = face !== 'T' && z === 0 ? (j === 0 ? 0.78 : j === 1 ? 0.9 : 1) : 1;
      const grain = c === undefined && face !== 'T' && j % 3 === 2 ? 0.93 : 1;
      p.px(x, y, shade(c ?? colour, FACE_SHADE[face] * ao * grain));
    }
}

export type RoofKind = 'hip' | 'gableA' | 'gableB' | 'shed' | 'flat';

/**
 * A roof over the rectangle a0..a1 by b0..b1, its eave h art pixels up, rising rise more. 'gableA' runs
 * its ridge along a, so its gable end faces front right; 'gableB' runs it along b, gable end to the front
 * left; 'shed' is one pitch, high along the back (b0) edge; 'hip' is a limasan with a ridge along the
 * longer side. over pushes the eave out past the walls, in footprint units. Gable ends are wall, in the
 * wall colour. paint can recolour a pixel by its one-tile column and row, for zinc ribs or stripes.
 */
export function roofRect(
  p: Painter,
  a0: number, a1: number, b0: number, b1: number,
  h: number, rise: number, kind: RoofKind, colour: string, wall: string,
  paint: (x: number, y: number) => string | undefined = () => undefined,
  over = 0.03,
): void {
  const { n, zs, x0, y0, ua, va } = frame(p);
  const A0 = a0 - over, A1 = a1 + over, B0 = b0 - over, B1 = b1 + over;
  const am = (a0 + a1) / 2;
  const bm = (b0 + b1) / 2;
  const ha = (a1 - a0) / 2;
  const hb = (b1 - b0) / 2;
  // Height of the roof surface over (a, b), and which plane it is: its shade and id.
  const surf = (a: number, b: number): [number, number, number] => {
    if (kind === 'gableA') return b < bm ? [rise * (1 - (bm - b) / (hb + over)), 1.05, 0] : [rise * (1 - (b - bm) / (hb + over)), 1, 1];
    if (kind === 'gableB') return a < am ? [rise * (1 - (am - a) / (ha + over)), 1.2, 0] : [rise * (1 - (a - am) / (ha + over)), 0.75, 1];
    if (kind === 'shed') return [rise * ((B1 - b) / (B1 - B0)), 1, 0];
    if (kind === 'flat') return [0, 1.18, 0];
    // Hip: the height is set by the nearest edge, the slope by the narrower half-width.
    const k = rise / (Math.min(ha, hb) + over);
    const d = [a - A0, A1 - a, b - B0, B1 - b];
    const m = Math.min(...d);
    const plane = d.indexOf(m);
    return [Math.min(rise, m * k), [1.2, 0.75, 1.05, 1][plane], plane];
  };
  const id0 = (p.id += 5);
  const depth = new Float32Array(p.w * p.h).fill(-1);
  const step = 1 / (ua * 2.2);
  const put = (x: number, y: number, d: number, c: string, id: number) => {
    x = Math.floor(x);
    y = Math.floor(y);
    if (x < 0 || y < 0 || x >= p.w || y >= p.h) return;
    const k = y * p.w + x;
    if (depth[k] > d) return;
    depth[k] = d;
    p.id = id;
    p.px(x, y, c);
  };
  // The roof surface, splatted back to front with a depth test, so the nearer plane wins.
  for (let a = A0; a <= A1; a += step)
    for (let b = B0; b <= B1; b += step) {
      const [r, f, plane] = surf(a, b);
      const sx = x0 + (a - b) * ua;
      const sy = y0 + (a + b) * va - (h + r) * zs;
      // Courses every third row down the slope, as on Painter.roof, staggered at the joints.
      const row = Math.floor((rise - r) * 1.2);
      const course = kind === 'flat' ? 1 : row % 3 === 2 ? 0.86 : row % 3 === 0 ? 1.06 : 1;
      const col = paint(Math.floor(sx / n), Math.floor(sy / zs)) ?? colour;
      put(sx, sy, a + b + r * 0.001, shade(col, f * course), id0 + plane);
    }
  // Gable and shed end walls, so the roof never floats over a gap.
  const end = (a: number, b: number, r: number, f: number) => {
    for (let k = 0; k <= r * zs; k += 0.5) put(x0 + (a - b) * ua, y0 + (a + b) * va - h * zs - k, a + b - 0.0005, shade(wall, f), id0 + 4);
  };
  if (kind === 'gableA') for (let b = b0; b <= b1; b += step) end(a1, b, surf(a1, b)[0] * 0.98, 0.72);
  if (kind === 'gableB') for (let a = a0; a <= a1; a += step) end(a, b1, surf(a, b1)[0] * 0.98, 1);
  if (kind === 'shed') for (let b = b0; b <= b1; b += step) end(a1, b, surf(a1, b)[0] * 0.98, 0.72);
}
