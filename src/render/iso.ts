// Isometric pixel art, rasterised in code at 1 art pixel per canvas pixel. No external art.
// Party-game look: flat cel shading, a warm storybook palette and a bold ink outline round every shape and
// along every face edge. Geometry stays straight and isometric so the map never gets busy.
import { CONTENT_ART } from './art-content';
import { HIGHER_ART } from './art-higher';
import { PALETTE } from './sprites';

/** Art-pixel size of one ground diamond. The view scales these up by a whole number. */
export const TW = 32;
export const TH = 16;
/** Headroom above a tile's top corner, so tall buildings fit in the art canvas. */
export const TOP = 40;

/** Outline colour for every sprite, a dark warm brown rather than flat black. */
export const INK = '#2a1810';

export interface Art {
  canvas: HTMLCanvasElement;
  alpha: Uint8ClampedArray;
  /** Highest painted point, in art pixels above the ground centre. */
  height: number;
  /** Footprint the art was drawn for. A 2x2 or 3x3 building's art is n times the size with its outline still 1px. */
  n: number;
  /** Tiles the art covers along the map's x and y axes. A square n covers n x n; a 2x1 covers 2 x 1. */
  w: number;
  h: number;
  /** Where the footprint's top corner sits on the canvas, in canvas pixels. */
  cornerX: number;
  cornerY: number;
}

type Face = 'L' | 'R' | 'T';
export type RoofShape = 'hip' | 'gable' | 'gableY' | 'shed' | 'flat';
/** Returns a palette key or hex colour, null to leave the pixel clear, or undefined for the face's shade. */
type Paint = (face: Face, u: number, j: number, i: number) => string | null | undefined;

const hex = (c: string) => (c.startsWith('#') ? c : PALETTE[c] ?? '#ff00ff');

function shade(c: string, f: number): string {
  const n = parseInt(hex(c).slice(1), 16);
  const ch = (s: number) => Math.max(0, Math.min(255, Math.round(((n >> s) & 255) * f)));
  return `#${((ch(16) << 16) | (ch(8) << 8) | ch(0)).toString(16).padStart(6, '0')}`;
}

/** Two-tone cel shading: lit left face, shaded right face, bright top. */
const FACE_SHADE: Record<Face, number> = { L: 1, R: 0.72, T: 1.18 };

export class Painter {
  readonly w: number;
  readonly h: number;
  readonly data: Uint8ClampedArray;
  /** Which shape or face painted each pixel. Ink lines go where two of them meet. */
  readonly ids: Uint16Array;
  /** Id stamped by set(). Bumped per face, roof plane and clump. */
  id = 1;
  /** Skip the ink pass, for specks too small to outline. */
  bare = false;
  /** Fine detail drawn after the ink pass in native pixels, so 1px lines stay 1px and get no outline. */
  readonly overlay: ((p: Painter) => void)[] = [];
  private inked = false;
  /**
   * n is the footprint the art is drawn for. Every call below takes one-tile art pixels, as if n were
   * 1, and rasterises at n times that, so a 2x2 or 3x3 building's edges and diagonals come out as
   * smooth 1px lines instead of a small sprite's stair steps scaled up. Paint callbacks still get
   * one-tile rows and columns, so windows, stripes and courses keep their proportions.
   */
  /** Offset of the tile being drawn, in canvas pixels, from the footprint's first tile. Set by at(). */
  ox = 0;
  oy = 0;
  private readonly ox0: number;

  /**
   * fa and fb make a long footprint, fa tiles along the map's x axis and fb along its y axis, drawn at
   * n = 1. Its art is built from one-tile pieces: at(u, v) moves every call below onto tile (u, v).
   */
  constructor(readonly n = 1, readonly fa = 1, readonly fb = 1) {
    this.w = n === 1 ? ((fa + fb) * TW) / 2 : TW * n;
    this.h = n === 1 ? TOP + ((fa + fb) * TH) / 2 : (TOP + TH) * n;
    this.ox0 = ((fb - 1) * TW) / 2;
    this.ox = this.ox0;
    this.data = new Uint8ClampedArray(this.w * this.h * 4);
    this.ids = new Uint16Array(this.w * this.h);
  }

  /** Draws the next pieces on tile (u, v) of a long footprint: u along the map's x axis, v along its y. */
  at(u: number, v: number): this {
    this.ox = this.ox0 + ((u - v) * TW) / 2;
    this.oy = ((u + v) * TH) / 2;
    return this;
  }

  /** True for a long footprint built from one-tile pieces. */
  get long(): boolean {
    return this.fa !== this.fb;
  }

  /** One canvas pixel, in native (n-scaled) coordinates. */
  px(x: number, y: number, c: string | null, alpha = 255): void {
    if (c === null || x < 0 || y < 0 || x >= this.w || y >= this.h) return;
    const n = parseInt(hex(c).slice(1), 16);
    const k = (y * this.w + x) * 4;
    this.data.set([(n >> 16) & 255, (n >> 8) & 255, n & 255, alpha], k);
    this.ids[k / 4] = alpha === 255 ? this.id : 0;
  }

  /** One art pixel in one-tile coordinates: an n x n block on a big canvas. */
  set(x: number, y: number, c: string | null, alpha = 255): void {
    const n = this.n;
    for (let dy = 0; dy < n; dy++) for (let dx = 0; dx < n; dx++) this.px(x * n + dx + this.ox, y * n + dy + this.oy, c, alpha);
  }

  /** Native ground centre, for drawing that follows the whole footprint (fences, kerbs). */
  get gx(): number {
    return (TW / 2) * this.n + this.ox;
  }
  get gy(): number {
    return (TOP + TH / 2) * this.n + this.oy;
  }

  /**
   * Ground-level paint. a runs along the tile's x axis, b along its y axis, both 0..1. px is the
   * size of one canvas pixel in a or b, so a border can be drawn exactly one or two pixels wide at
   * any footprint instead of a band that grows with the lot.
   */
  ground(paint: (a: number, b: number, px: number) => string | null): void {
    this.id++;
    const n = this.n;
    const cx = (TW / 2) * n + this.ox;
    const cy = (TOP + TH / 2) * n + this.oy;
    const px = 1 / (TH * n);
    for (let y = TOP * n + this.oy; y < (TOP + TH) * n + this.oy; y++)
      for (let x = this.ox; x < TW * n + this.ox; x++) {
        const rx = (x + 0.5 - cx) / cx;
        const ry = (y + 0.5 - cy) / ((TH / 2) * n);
        if (Math.abs(rx) + Math.abs(ry) > 1) continue;
        this.px(x, y, paint((rx + ry) / 2 + 0.5, (ry - rx) / 2 + 0.5, px));
      }
  }

  /** Ground paint over a whole long footprint. a runs 0..1 along its x side, b along its y side; px is one pixel in the shorter. */
  groundLong(paint: (a: number, b: number, px: number) => string | null): void {
    this.id++;
    const bx = (this.fb * TW) / 2;
    const px = 1 / (TH * Math.max(this.fa, this.fb));
    for (let y = TOP; y < this.h; y++)
      for (let x = 0; x < this.w; x++) {
        const dx = x + 0.5 - bx;
        const dy = y + 0.5 - TOP;
        const u = dy / TH + dx / TW;
        const v = dy / TH - dx / TW;
        if (u < 0 || v < 0 || u >= this.fa || v >= this.fb) continue;
        this.px(x, y, paint(u / this.fa, v / this.fb, px));
      }
  }

  /** A box standing on the tile. inset shrinks the footprint, z lifts its base. */
  box(inset: number, h: number, colour: string, paint: Paint = () => undefined, z = 0): void {
    const n = this.n;
    const hw = (TW / 2 - inset * 2) * n;
    const hh = (TH / 2 - inset) * n;
    const H = h * n;
    const cx = (TW / 2) * n + this.ox;
    const cy = (TOP + TH / 2 - z) * n + this.oy;
    const base = (this.id += 3);
    const FACE_ID: Record<Face, number> = { L: base - 2, R: base - 1, T: base };
    for (let x = Math.floor(cx - hw); x < Math.ceil(cx + hw); x++) {
      const px = x + 0.5;
      const left = px < cx;
      const t = left ? (px - (cx - hw)) / hw : (cx + hw - px) / hw;
      const yb = cy + t * hh;
      const u = left ? t : 1 - t;
      const i = Math.floor((left ? x - Math.floor(cx - hw) : x - cx) / n);
      for (let y = Math.floor(yb - H - hh); y <= Math.ceil(yb); y++) {
        const py = y + 0.5;
        const face: Face | null = py <= yb && py >= yb - H ? (left ? 'L' : 'R') : Math.abs(px - cx) / hw + Math.abs(py - (cy - H)) / hh <= 1 ? 'T' : null;
        if (!face) continue;
        const j = face === 'T' ? 0 : Math.floor((yb - py) / n);
        const p = paint(face, u, j, i);
        if (p === null) continue;
        this.id = FACE_ID[face];
        // Baked ambient occlusion: walls darken toward the ground they stand on.
        const ao = face !== 'T' && z === 0 ? (j === 0 ? 0.78 : j === 1 ? 0.9 : 1) : 1;
        // Plain walls get faint plank or course lines, so they read as built, not flat.
        const grain = p === undefined && face !== 'T' && j % 3 === 2 ? 0.93 : 1;
        this.px(x, y, shade(p === undefined ? colour : p, FACE_SHADE[face] * ao * grain));
      }
    }
  }

  /** A hipped (limasan) roof over a box of the same inset and height. */
  roof(inset: number, h: number, rise: number, colour: string, paint: (x: number, y: number) => string | undefined = () => undefined): void {
    const n = this.n;
    const hw = (TW / 2 - inset * 2 + 2) * n;
    const hh = (TH / 2 - inset + 1) * n;
    const cx = (TW / 2) * n + this.ox;
    const cy = (TOP + TH / 2 - h) * n + this.oy;
    const apex = [cx, cy - rise * n];
    const L = [cx - hw, cy];
    const F = [cx, cy + hh];
    const R = [cx + hw, cy];
    const B = [cx, cy - hh];
    const tris: [number[], number[], number, number][] = [
      [L, B, 1.2, 0],
      [B, R, 1.05, 0],
      [L, F, 1, 1],
      [F, R, 0.75, 1],
    ];
    for (const [p, q, f] of tris) {
      this.id++;
      for (let y = Math.floor(apex[1]); y <= Math.ceil(F[1]); y++)
        for (let x = Math.floor(L[0]); x < Math.ceil(R[0]); x++)
          if (inTri(x + 0.5, y + 0.5, p, q, apex)) {
            // Tile courses every third row, with staggered joints, darker under each lip.
            const ox = Math.floor(x / n);
            const row = Math.floor((y - apex[1]) / n);
            const course = row % 3 === 2 ? 0.86 : row % 3 === 0 ? 1.06 : 1;
            const joint = row % 3 !== 2 && (ox + (Math.floor(row / 3) % 2) * 2) % 4 === 0 ? 0.93 : 1;
            this.px(x, y, shade(paint(ox, Math.floor(y / n)) ?? colour, f * course * joint));
          }
    }
  }

  /**
   * Any roof shape over a box of the same inset and height. 'hip' is the limasan of roof(). 'gable'
   * is a pelana with its ridge along the tile's x axis and its gable end facing front right; 'gableY'
   * turns it, so the gable end faces front left. 'shed' is one pitch, high at the back. 'flat' is a
   * dak beton with a parapet. Gable ends and the shed's side are wall, in the wall colour.
   */
  roofShape(shape: RoofShape, inset: number, h: number, rise: number, colour: string, wall: string, paint: (x: number, y: number) => string | undefined = () => undefined): void {
    if (shape === 'hip') return this.roof(inset, h, rise, colour, paint);
    if (shape === 'flat') {
      // The parapet: a low wall-coloured rim with a light coping, then the concrete deck set inside
      // it, so the roof reads as a recessed dak, not a slab.
      this.box(inset, 2, wall, (face, _u, j) => (face === 'T' ? 'w' : j === 1 ? 'w' : undefined), h);
      this.box(inset + 1, 1, 'S', (face) => (face === 'T' ? 's' : 'S'), h + 1);
      return;
    }
    const n = this.n;
    const hw = (TW / 2 - inset * 2 + 2) * n;
    const hh = (TH / 2 - inset + 1) * n;
    const cx = (TW / 2) * n + this.ox;
    const cy = (TOP + TH / 2 - h) * n + this.oy;
    const up = (p: number[]) => [p[0], p[1] - rise * n];
    const mid = (a: number[], b: number[]) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    const L = [cx - hw, cy];
    const F = [cx, cy + hh];
    const R = [cx + hw, cy];
    const B = [cx, cy - hh];
    type Plane = { pts: number[][]; f: number; wall?: boolean };
    let planes: Plane[];
    if (shape === 'gable') {
      const a = up(mid(L, B));
      const b = up(mid(F, R));
      planes = [{ pts: [a, B, R, b], f: 1.05 }, { pts: [L, a, b, F], f: 1 }, { pts: [F, R, b], f: 0.72, wall: true }];
    } else if (shape === 'gableY') {
      const a = up(mid(B, R));
      const b = up(mid(L, F));
      planes = [{ pts: [L, B, a, b], f: 1.2 }, { pts: [b, a, R, F], f: 0.75 }, { pts: [L, F, b], f: 1, wall: true }];
    } else {
      // Shed: the back corners rise, the front edge stays at the eave.
      planes = [{ pts: [L, up(B), up(R), F], f: 1 }, { pts: [F, R, up(R)], f: 0.72, wall: true }];
    }
    for (const { pts, f, wall: isWall } of planes) {
      this.id++;
      const xs = pts.map((q) => q[0]);
      const ys = pts.map((q) => q[1]);
      const top = Math.min(...ys);
      const tris = pts.length === 3 ? [pts] : [[pts[0], pts[1], pts[2]], [pts[0], pts[2], pts[3]]];
      for (let y = Math.floor(top); y <= Math.ceil(Math.max(...ys)); y++)
        for (let x = Math.floor(Math.min(...xs)); x < Math.ceil(Math.max(...xs)); x++) {
          if (!tris.some(([a, b, c]) => inTri(x + 0.5, y + 0.5, a, b, c))) continue;
          const ox = Math.floor(x / n);
          const row = Math.floor((y - top) / n);
          if (isWall) {
            // Gable wall: plain, with a small roster vent near the peak.
            const vent = row >= 2 && row <= 3 && Math.abs(ox - Math.floor(pts.reduce((s, q) => s + q[0], 0) / pts.length / n)) <= 1 && (ox + row) % 2 === 0;
            this.px(x, y, shade(vent ? 'S' : wall, f));
            continue;
          }
          // Tile or zinc courses along the slope, as on the hipped roof.
          const course = row % 3 === 2 ? 0.86 : row % 3 === 0 ? 1.06 : 1;
          const joint = row % 3 !== 2 && (ox + (Math.floor(row / 3) % 2) * 2) % 4 === 0 ? 0.93 : 1;
          this.px(x, y, shade(paint(ox, Math.floor(y / n)) ?? colour, f * course * joint));
        }
    }
  }

  shadow(inset: number): void {
    const n = this.n;
    const hw = (TW / 2 - inset * 2 + 2) * n;
    const hh = (TH / 2 - inset + 1) * n;
    const cx = (TW / 2 + 2) * n + this.ox;
    const cy = (TOP + TH / 2) * n + this.oy;
    for (let y = TOP * n + this.oy; y < (TOP + TH) * n + this.oy; y++)
      for (let x = this.ox; x < (TW + 4) * n + this.ox; x++)
        if (Math.abs(x + 0.5 - cx) / hw + Math.abs(y + 0.5 - cy) / hh <= 1) this.px(x, y, INK, 90);
  }

  /** A round leafy clump centred r art pixels above the ground centre, cel-lit from the top left. */
  blob(dx: number, up: number, r: number, colour: string): void {
    this.id++;
    const n = this.n;
    const cx = (TW / 2 + dx) * n + this.ox;
    const cy = (TOP + TH / 2 - up) * n + this.oy;
    const R = r * n;
    for (let y = Math.floor(cy - R); y <= Math.ceil(cy + R); y++)
      for (let x = Math.floor(cx - R); x <= Math.ceil(cx + R); x++) {
        const ex = (x + 0.5 - cx) / R;
        const ey = (y + 0.5 - cy) / (R * 0.85);
        const d = ex * ex + ey * ey;
        if (d > 1) continue;
        // Cel light, then small leaf clusters: bright sprigs on the lit side, dark gaps in the shade.
        const light = ex + ey < -0.7 ? 1.3 : ex + ey > 0.5 ? 0.72 : 1;
        const sp = speck(Math.floor(x / n), Math.floor(y / n));
        const leaf = sp < 0.12 && ex + ey < 0.2 ? 1.14 : sp > 0.9 && ex + ey > -0.4 ? 0.84 : 1;
        this.px(x, y, shade(colour, light * leaf));
      }
  }

  /** A straight, square-brushed stroke w pixels thick, in art pixels from the ground centre (up is negative). */
  stroke(x0: number, y0: number, x1: number, y1: number, w: number, colour: string, id = true): void {
    if (id) this.id++;
    const n = this.n;
    const W = w * n;
    const steps = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) * 2 * n));
    const ox = (TW / 2) * n - Math.floor(W / 2) + this.ox;
    const oy = (TOP + TH / 2) * n - Math.floor(W / 2) + this.oy;
    for (let k = 0; k <= steps; k++) {
      const x = Math.round((x0 + ((x1 - x0) * k) / steps) * n);
      const y = Math.round((y0 + ((y1 - y0) * k) / steps) * n);
      for (let dy = 0; dy < W; dy++) for (let dx = 0; dx < W; dx++) this.px(ox + x + dx, oy + y + dy, colour);
    }
  }

  /** A frond or leaf: a thick stroke out and down, shaded on its underside. */
  leaf(x0: number, y0: number, x1: number, y1: number, colour: string): void {
    this.stroke(x0, y0, x1, y1, 3, colour);
    this.stroke(x0, y0 + 1, x1, y1 + 1, 2, shade(colour, 0.72), false);
  }

  /**
   * Ink pass: a 1px outline round the silhouette, and a line wherever two faces or shapes meet,
   * each tinted from the colour it borders rather than a flat ink.
   * Windows and stripes share their face's id, so they stay clean.
   */
  private ink(): void {
    const { w, h, data, ids } = this;
    const solid = (x: number, y: number) => x >= 0 && y >= 0 && x < w && y < h && ids[y * w + x] > 0;
    const edge: number[] = [];
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        const k = y * w + x;
        if (!ids[k]) {
          if (solid(x - 1, y) || solid(x + 1, y) || solid(x, y - 1) || solid(x, y + 1)) edge.push(k);
        } else if ((solid(x + 1, y) && ids[k + 1] !== ids[k]) || (solid(x, y + 1) && ids[k + w] !== ids[k])) edge.push(k);
      }
    // Coloured outlines: a silhouette pixel takes a 0.45x shade of the fill it touches (below
    // first, then the sides, then above). A face-edge pixel takes a 0.55x shade of its own colour.
    const ink = new Uint8ClampedArray(edge.length * 3);
    edge.forEach((k, e) => {
      const x = k % w;
      const y = (k - x) / w;
      let from = k;
      let f = 0.55;
      if (!ids[k]) {
        f = 0.45;
        from = [[x, y + 1], [x - 1, y], [x + 1, y], [x, y - 1]].map(([a, b]) => (solid(a, b) ? b * w + a : -1)).find((j) => j >= 0) ?? k;
      }
      for (let c = 0; c < 3; c++) ink[e * 3 + c] = data[from * 4 + c] * f;
    });
    edge.forEach((k, e) => {
      data.set([ink[e * 3], ink[e * 3 + 1], ink[e * 3 + 2], 255], k * 4);
      ids[k] = 65535;
    });
  }

  /** Runs the ink pass (unless bare) and returns the RGBA pixels. Pure, so tests read it without a canvas. */
  pixels(): Uint8ClampedArray {
    if (!this.inked) {
      this.inked = true;
      if (!this.bare) this.ink();
      for (const draw of this.overlay) draw(this);
    }
    return this.data;
  }

  finish(): Art {
    this.pixels();
    const c = document.createElement('canvas');
    c.width = this.w;
    c.height = this.h;
    c.getContext('2d')!.putImageData(new ImageData(new Uint8ClampedArray(this.data), this.w, this.h), 0, 0);
    const alpha = new Uint8ClampedArray(this.w * this.h);
    let top = 0;
    // Heights count from the footprint's ground centre, so badges sit over the whole building.
    const ground = (TOP + ((this.fa + this.fb) * TH) / 4) * this.n;
    for (let k = 0; k < alpha.length; k++) {
      alpha[k] = this.data[k * 4 + 3];
      if (alpha[k] === 255 && !top) top = ground - Math.floor(k / this.w);
    }
    return { canvas: c, alpha, height: top, n: this.n, w: this.fa * this.n, h: this.fb * this.n, cornerX: ((this.fb * TW) / 2) * this.n, cornerY: TOP * this.n };
  }
}

/** Stable per-pixel noise for sprite texture. */
function speck(x: number, y: number): number {
  let h = Math.imul(x * 73856093 ^ y * 19349663, 0x5bd1e995);
  h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}

function inTri(x: number, y: number, a: number[], b: number[], c: number[]): boolean {
  const s = (p: number[], q: number[]) => (x - q[0]) * (p[1] - q[1]) - (p[0] - q[0]) * (y - q[1]);
  const d1 = s(a, b);
  const d2 = s(b, c);
  const d3 = s(c, a);
  return !((d1 < 0 || d2 < 0 || d3 < 0) && (d1 > 0 || d2 > 0 || d3 > 0));
}

const within = (v: number, lo: number, hi: number) => v >= lo && v < hi;

/** A flat polygon in one-tile art pixels from the ground centre (up is negative), as one shape. */
function slab(p: Painter, pts: number[][], colour: string): void {
  p.id++;
  const xs = pts.map((q) => q[0]);
  const ys = pts.map((q) => q[1]);
  for (let y = Math.floor(Math.min(...ys)); y <= Math.ceil(Math.max(...ys)); y++)
    for (let x = Math.floor(Math.min(...xs)); x <= Math.ceil(Math.max(...xs)); x++)
      for (let k = 1; k + 1 < pts.length; k++)
        if (inTri(x + 0.5, y + 0.5, pts[0], pts[k], pts[k + 1])) {
          p.set(TW / 2 + x, TOP + TH / 2 + y, colour);
          break;
        }
}

/**
 * A soft transition from a flat piece to the grass round it: a half-transparent checker of the edge
 * colour on the ground just outside the silhouette, instead of a hard stair-stepped stop. Runs after
 * the ink pass. Only for pieces that stand alone; tiles that join up (paths, plots) would bleed.
 */
export function dither(p: Painter): void {
  const { w, h, data } = p;
  const solid = (x: number, y: number) => x >= 0 && y >= 0 && x < w && y < h && data[(y * w + x) * 4 + 3] === 255;
  const out: [number, number][] = [];
  for (let y = TOP * p.n; y < h; y++)
    for (let x = 0; x < w; x++) {
      if (data[(y * w + x) * 4 + 3] || (x + y) % 2) continue;
      const from = [[x, y - 1], [x - 1, y], [x + 1, y], [x, y + 1]].find(([a, b]) => solid(a, b));
      if (from) out.push([y * w + x, from[1] * w + from[0]]);
    }
  for (const [k, f] of out) data.set([data[f * 4] * 0.7, data[f * 4 + 1] * 0.7, data[f * 4 + 2] * 0.7, 110], k * 4);
}

/** Four corner posts of a box footprint, h pixels tall, for open-sided stalls and huts. */
function posts(p: Painter, inset: number, h: number, colour: string): void {
  const hw = TW / 2 - inset * 2 - 1;
  const hh = TH / 2 - inset - 1;
  for (const [x, y] of [[-hw, 0], [0, hh], [hw, 0], [0, -hh]]) p.stroke(x, y, x, y - h, 1, colour);
}

/**
 * The upgrade kit for buildings without their own level art: things a kampung adds round a building
 * as it does well. Level 2 fences the front with tidy wooden planks. Level 3 swaps them for a clean
 * stone wall with a light cap, two potted plants at the gate and a short lamp. It runs along the
 * whole footprint's front edges in native pixels after the ink pass, so the lines stay 1px on a
 * 3x3 lot as on a warung, and it stays low, so a levelled building never hides the ones behind it.
 */
function upgradeKit(p: Painter, level: number): void {
  if (level < 2) return;
  const wall = level >= 3;
  const n = p.n;
  const { gx, gy } = p;
  const half = (TH / 2) * n;
  // The two front edges run from the side corners to the front corner, at slope 1/2, one pixel in.
  const gate = 3;
  for (const side of [-1, 1]) {
    for (let k = 1; k < gx - gate; k++) {
      const x = side < 0 ? k : 2 * gx - 1 - k;
      const y = Math.round(gy + (k * half) / gx) - 1;
      if (wall) {
        // Stone courses with a staggered joint every fourth pixel, then a light cap.
        const joint = (k + (side < 0 ? 0 : 2)) % 4 === 0;
        p.px(x, y, 'S');
        p.px(x, y - 1, joint ? 'S' : 's');
        p.px(x, y - 2, joint ? 'S' : 's');
        p.px(x, y - 3, 'w');
      } else {
        // Two plank rails, and a post every fourth pixel.
        const post = k % 4 === 1;
        p.px(x, y - 1, post ? 'N' : 'n');
        p.px(x, y - 3, post ? 'N' : 'n');
        if (post) p.px(x, y - 2, 'N');
        if (post) p.px(x, y - 4, 'N');
      }
    }
  }
  if (!wall) return;
  // Potted plants either side of the gate, and a garden lamp by the right pot.
  const fy = gy + half - 2;
  for (const dx of [-gate - 2, gate + 1]) {
    for (const [ox, oy, c] of [[0, 0, 'o'], [1, 0, 'o'], [0, -1, 'o'], [1, -1, 'o'], [0, -2, 'G'], [1, -2, 'g'], [-1, -2, 'G'], [2, -2, 'G'], [0, -3, 'g'], [1, -3, 'G']] as [number, number, string][])
      p.px(gx + dx + ox, fy - Math.abs(dx) / 2 + oy, c);
  }
  for (let k = 0; k < 6; k++) p.px(gx + gate + 4, fy - 2 - k, 'S');
  p.px(gx + gate + 4, fy - 8, 'y');
  p.px(gx + gate + 3, fy - 8, 'y');
}

function minimarket(bands: string[]): (p: Painter, v?: string, level?: number) => void {
  return (p, _v, level = 1) => {
    p.shadow(1);
    p.box(1, 15, 'w', (face, u, j, i) => {
      if (face === 'T') return j === 0 && (u < 0.06 || u > 0.94) ? 'S' : 's';
      if (j >= 11) return bands[14 - j] ?? 'w';
      if (face === 'L' && within(u, 0.42, 0.62) && j < 7) return j === 6 ? 'S' : 'k';
      if (j >= 2 && j <= 8) return i % 4 === 0 ? 'w' : 'c';
      return undefined;
    });
    if (level >= 2) {
      // A tiang reklame by the road in the shop's colours, lower than the roof, and an ATM column at the
      // other corner. The shop reads as the busy branch without growing taller.
      p.stroke(-12, 3, -12, -10, 1, 'S');
      p.stroke(-13, -16, -11, -11, 3, bands[0]);
      p.stroke(-13, -13, -11, -12, 3, bands[2] ?? bands[1], false);
      p.stroke(10, 4, 10, -4, 3, 'S');
      p.set(TW / 2 + 10, TOP + TH / 2 - 3, 'c');
      p.set(TW / 2 + 11, TOP + TH / 2 - 3, 'c');
    }
  };
}

type ArtFn = (p: Painter, variant?: string, level?: number) => void;

/** Roof shape keys a rumah variant can carry, second after the roof colour. */
const ROOF_KEYS: Record<string, RoofShape> = { h: 'hip', g: 'gable', y: 'gableY', s: 'shed', f: 'flat' };

/** Sprites that draw their own level progression. Everything else gets the upgrade kit. */
const LEVELLED = new Set(['rumah', 'warung', 'posRonda', 'kantorRT', 'kosan', 'wifi', 'bankSampah', 'indomaret', 'alfamart', 'rumahMakan']);
/** Ground pieces and the tukang parkir level up without a fence round them. */
const NO_KIT = new Set(['parkir', 'biopori', 'drain', 'kebunSayur', 'sawah', 'kolamLele', 'kolamIkan', 'taman', 'sawahIrigasi', 'embung', 'aspalUlang', 'jalan', 'selokan']);

const ART: Record<string, ArtFn> = {
  // A house in a perumahan. The variant is up to three keys: roof colour, roof shape (h hip, g and
  // y pelana, s shed, f flat dak) and wall colour. Every house has a band of roster vents under the
  // eave and weep holes along its base; the minimalis ones (shed, flat) get batu alam cladding, and a
  // flat roof carries the tandon.
  rumah: (p, v = 'o', level = 1) => {
    const roof = v[0] ?? 'o';
    const shape = ROOF_KEYS[v[1]] ?? 'hip';
    const wall = v[2] ?? 't';
    const modern = shape === 'shed' || shape === 'flat';
    // Level 3 is a rumah tingkat: a lower ground floor, then an upper floor set one pixel in.
    const tall = level >= 3;
    const ground = tall ? 7 : 8;
    p.shadow(3);
    p.box(3, ground, wall, (face, u, j, i) => {
      if (face === 'T') return undefined;
      // Roster: a band of ventilation blocks under the eave, open and solid in turn.
      if (!tall && j === 7 && (face === 'R' || within(u, 0.12, 0.45))) return i % 2 ? 'S' : 'w';
      if (face === 'L' && within(u, 0.6, 0.82) && j < 6) return modern ? 'k' : 'N';
      if (face === 'L' && within(u, 0.15, 0.4) && within(j, 3, 6)) return j === 5 && modern ? 'S' : 'l';
      if (face === 'R' && (within(u, 0.2, 0.42) || within(u, 0.6, 0.82)) && within(j, 3, 6)) return 'l';
      // Batu alam on the corners of a minimalis front.
      if (modern && face === 'L' && (u < 0.12 || u > 0.86) && j < 7) return (i + j) % 3 ? 'S' : 's';
      // Weep holes: a small dark slot every few bricks just above the ground.
      if (j === 1 && i % 5 === 2) return 'S';
      return undefined;
    });
    if (tall) {
      p.box(4, 6, wall, (face, u, j, i) => {
        if (face === 'T') return undefined;
        if (j === 5 && (face === 'R' || within(u, 0.12, 0.45))) return i % 2 ? 'S' : 'w';
        if (face === 'L' && (within(u, 0.15, 0.4) || within(u, 0.6, 0.85)) && within(j, 1, 4)) return 'l';
        if (face === 'R' && within(u, 0.3, 0.7) && within(j, 1, 4)) return 'l';
        return undefined;
      }, ground);
      // A balcony rail along the front of the upper floor.
      p.id++;
      for (let x = -11; x <= -2; x++) p.set(TW / 2 + x, TOP + TH / 2 - ground - 2 + Math.round((x + 11) / 2), x & 1 ? 'S' : 'w');
    }
    const top = tall ? ground + 6 : 8;
    const inset = tall ? 4 : 3;
    // Rises keep every shape at or under the hipped roof's apex, so no house hides its neighbour.
    p.roofShape(shape, inset, top, shape === 'shed' ? 2 : shape === 'hip' ? (tall ? 7 : 8) : tall ? 4 : 5, roof, wall);
    // A tandon air on the deck of a flat roof, orange or blue.
    if (shape === 'flat') p.box(6, 3, roof === 'l' || roof === 'G' ? 'b' : 'o', (face) => (face === 'T' ? 'w' : undefined), top + 2);
    if (level === 2) {
      // A teras: a canopy in the roof colour out from the front-left wall over the door, on two posts.
      const at = (u: number, up: number) => [-10 + 10 * u, 5 * u - up];
      const out = (q: number[], k: number) => [q[0] - 2 * k, q[1] + k];
      const w1 = at(0.4, 7);
      const w2 = at(1, 7);
      const o1 = out(at(0.4, 5), 3);
      const o2 = out(at(1, 5), 3);
      p.stroke(o1[0], o1[1], o1[0], o1[1] + 5, 1, 'N');
      p.stroke(o2[0], o2[1], o2[0], o2[1] + 5, 1, 'N');
      slab(p, [w1, w2, o2, o1], roof);
    }
  },
  kantorRT: (p, _v, level = 1) => {
    if (level <= 1) {
      // Pak RT's own front room: a plain house with a zinc roof and a nameboard on a post.
      p.shadow(2);
      p.box(3, 10, 't', (face, u, j) => {
        if (face === 'L' && within(u, 0.42, 0.62) && j < 6) return 'N';
        if (face === 'R' && within(u, 0.25, 0.75) && within(j, 4, 7)) return 'l';
        return j === 0 ? 'n' : undefined;
      });
      p.roof(3, 10, 7, 's', (x) => (x % 3 === 0 ? 'S' : undefined));
      p.stroke(-10, 6, -10, -2, 1, 'N');
      p.stroke(-13, -5, -7, -2, 3, 'w');
      p.stroke(-12, -4, -9, -3, 1, 'k', false);
      return;
    }
    if (level >= 3) {
      // A pendopo-fronted office under a two-tier joglo roof: a wide, low hip with a steep crown.
      p.shadow(0);
      p.box(1, 9, 'w', (face, u, j, i) => {
        if (face === 'L' && within(u, 0.42, 0.6) && j < 7) return 'k';
        if (j < 1) return 'S';
        if (within(j, 3, 7) && i % 5 >= 2 && !(face === 'L' && within(u, 0.36, 0.66))) return 'l';
        return undefined;
      });
      // Teak pillars along the front.
      for (const x of [-12, -6, 6, 12]) p.stroke(x, 7 - Math.abs(x) / 2, x, -3 - Math.abs(x) / 2, 1, 'N');
      p.roof(0, 9, 4, 'N', (x, y) => ((x + y) % 5 === 0 ? 'n' : undefined));
      p.roof(5, 13, 6, 'R');
      const ax = TW / 2;
      const ay = TOP + TH / 2 - 13 - 6;
      for (let k = 1; k <= 5; k++) p.set(ax, ay - k, 'k');
      for (let k = 1; k <= 3; k++) {
        p.set(ax + k, ay - 5, 'r');
        p.set(ax + k, ay - 4, 'w');
      }
      return;
    }
    p.shadow(1);
    p.box(1, 11, 'w', (face, u, j, i) => {
      if (face === 'L' && within(u, 0.42, 0.6) && j < 7) return 'k';
      if (j < 1) return 'S';
      if (within(j, 4, 8) && i % 5 >= 2 && !(face === 'L' && within(u, 0.36, 0.66))) return 'l';
      return undefined;
    });
    p.roof(1, 11, 9, 'R');
    // Flag pole on the ridge: red over white. Short, so the Kantor never hides the houses behind it.
    const ax = TW / 2;
    const ay = TOP + TH / 2 - 11 - 9;
    for (let k = 1; k <= 5; k++) p.set(ax, ay - k, 'k');
    for (let k = 1; k <= 4; k++) {
      p.set(ax + k, ay - 5, 'r');
      p.set(ax + k, ay - 4, 'r');
      p.set(ax + k, ay - 3, 'w');
      p.set(ax + k, ay - 2, 'w');
    }
  },
  warung: (p, _v, level = 1) => {
    if (level <= 1) {
      // Warung tenda: a wooden gerobak counter under a blue terpal on bamboo poles, a red stool beside.
      p.shadow(4);
      posts(p, 4, 9, 'a');
      p.box(6, 4, 'n', (face, _u, j, i) => (face === 'L' && j === 2 ? (i % 3 ? 'y' : 'c') : undefined));
      p.roof(4, 9, 2, 'b', (x) => (x % 4 === 0 ? 'B' : undefined));
      p.stroke(9, 5, 9, 3, 2, 'r');
      return;
    }
    if (level >= 3) {
      // A whitewashed brick warung: tile roof, a yellow nameboard band, a striped awning and a red cooler.
      p.shadow(2);
      p.box(2, 9, 'w', (face, u, j, i) => {
        if (face === 'T') return undefined;
        if (j >= 7) return 'y';
        if (face === 'L' && within(u, 0.1, 0.9) && within(j, 2, 6)) return j === 2 ? 't' : i % 3 === 0 ? 'y' : i % 3 === 1 ? 'c' : 'p';
        if (face === 'R' && within(u, 0.3, 0.7) && j < 6) return 'N';
        return j === 0 ? 'S' : undefined;
      });
      p.roof(2, 9, 5, 'R');
      // Awning over the counter, red and white.
      p.id++;
      for (let x = -13; x <= -1; x++) for (let k = 0; k < 2; k++) p.set(TW / 2 + x, TOP + TH / 2 - 6 + k + Math.round((x + 13) / 2), Math.floor((x + 13) / 2) % 2 ? 'w' : 'r');
      p.stroke(10, 4, 11, 0, 3, 'r');
      p.set(TW / 2 + 10, TOP + TH / 2 - 1, 'w');
      return;
    }
    p.shadow(3);
    p.box(3, 8, 'n', (face, u, j, i) => {
      if (face === 'T') return undefined;
      if (face === 'L' && within(u, 0.12, 0.88) && within(j, 3, 7)) return j === 3 ? 't' : i % 3 === 0 ? 'y' : i % 3 === 1 ? 'c' : 'k';
      return j === 0 ? 'N' : undefined;
    });
    // Zinc roof with corrugations, sachet strips hanging from the eave.
    p.roof(3, 8, 4, 's', (x) => (x % 2 ? 'S' : undefined));
    for (const x of [-9, -6, -3]) p.stroke(x, -4 + (x + 12) / 2, x, -1 + (x + 12) / 2, 1, x === -6 ? 'p' : 'y');
  },
  posRonda: (p, _v, level = 1) => {
    // The kentongan: a slit log drum hanging by the post, at every level.
    const kentongan = () => {
      p.stroke(-9, -1, -9, -4, 2, 'n');
      p.set(TW / 2 - 9, TOP + TH / 2 - 3, 'N');
    };
    if (level <= 1) {
      // A bamboo balai-balai under a rumbia thatch, open on every side.
      p.shadow(4);
      posts(p, 4, 7, 'a');
      p.box(5, 2, 'a', (face, _u, _j, i) => (face !== 'T' && i % 2 ? 'n' : undefined));
      p.roof(4, 7, 5, 'a', (x, y) => ((x + 2 * y) % 3 === 0 ? 'n' : undefined));
      kentongan();
      return;
    }
    if (level >= 3) {
      // A siskamling post painted green and white, tile roof, a lamp under the eave.
      p.shadow(3);
      p.box(3, 8, 'w', (face, u, j) => {
        if (face === 'T') return undefined;
        if (j < 3) return 'G';
        if (face === 'L' && within(u, 0.15, 0.85) && within(j, 4, 7)) return 'k';
        return undefined;
      });
      p.roof(3, 8, 5, 'R');
      p.set(TW / 2 - 4, TOP + TH / 2 - 9, 'y');
      kentongan();
      return;
    }
    p.shadow(4);
    p.box(4, 7, 't', (face, u, j) => {
      if (face === 'T') return null;
      if (u < 0.14 || u > 0.86) return 't';
      if (within(j, 1, 3)) return 'n';
      if (face === 'L' && within(u, 0.45, 0.6) && within(j, 3, 6)) return 'o';
      return null;
    });
    p.roof(4, 7, 6, 'N', (x, y) => ((x + y) % 4 === 0 ? 'n' : undefined));
    kentongan();
  },
  // Variant 'y' runs the channel along the tile's y axis, so a column of selokan joins up.
  // Bare, with its own ink banks, so neighbouring channels join without an outline between them.
  selokan: (p, v) => {
    p.bare = true;
    p.ground((a0, b0) => {
      const [a, b] = v === 'y' ? [b0, a0] : [a0, b0];
      if (b < 0.26 || b > 0.74) return null;
      if (b < 0.31 || b > 0.69) return '#4a4a44';
      if (b < 0.38 || b > 0.62) return 's';
      return Math.floor(a * 6) % 3 === 0 && Math.abs(b - 0.5) < 0.05 ? 'w' : 'l';
    });
  },
  // Paving stones. Bare, so neighbouring path tiles join up without an outline between them.
  jalan: (p) => {
    p.bare = true;
    p.ground((a, b) => {
      if (a < 0.03 || a > 0.97 || b < 0.03 || b > 0.97) return 'n';
      const row = Math.floor(b * 4);
      const seam = Math.abs(((a * 4 + (row % 2) * 0.5) % 1) - 0.5) > 0.46 || (b * 4) % 1 < 0.1;
      return seam ? 's' : 't';
    });
  },
  wifi: (p, _v, level = 1) => {
    if (level <= 1) {
      // A bamboo pole lashed to a post, a pan antenna and a small router box at its foot.
      p.shadow(8);
      p.box(9, 3, 'S', (face, _u, j) => (face === 'L' && j === 1 ? 'c' : undefined));
      p.stroke(0, -3, 0, -20, 2, 'a');
      for (const y of [-8, -14]) p.set(TW / 2, TOP + TH / 2 + y, 'n');
      p.stroke(-3, -20, 3, -22, 2, 's');
      p.set(TW / 2, TOP + TH / 2 - 23, 'r');
      return;
    }
    p.shadow(6);
    p.box(5, 3, 'S');
    p.box(7, 28, 's', (face, _u, j) => (face !== 'T' && j % 4 === 0 ? 'S' : undefined), 3);
    const ax = TW / 2;
    const ay = TOP + TH / 2 - 32;
    for (const [dx, dy] of [[-4, -1], [-5, -3], [-4, -5], [4, -1], [5, -3], [4, -5], [-7, -3], [7, -3], [0, -2], [0, -3]]) p.set(ax + dx, ay + dy, dx === 0 ? 'r' : 'c');
  },
  // Kos-kosan: tall and narrow from day one, with a steel stair up the outside. Level 1 is two floors
  // of rooms under a pelana; level 2 adds a third floor, a flat dak with a tandon and a jemuran on it.
  kosan: (p, _v, level = 1) => {
    const top = level >= 2;
    const H = (top ? 3 : 2) * 6 + 1;
    p.shadow(2);
    p.box(2, H, 'o', (face, _u, j, i) => {
      if (face === 'T') return undefined;
      if (j < 1) return 'S';
      const f = (j - 1) % 6;
      // A door and a small window per room, a floor slab line between floors.
      if (face === 'L' && f === 5) return 'S';
      if (face === 'L' && i % 6 >= 2 && i % 6 < 4 && f < 4) return 'k';
      if (face === 'L' && i % 6 === 5 && within(f, 1, 3)) return 'l';
      if (face === 'R' && within(f, 1, 4) && i % 5 >= 3) return 'l';
      return undefined;
    });
    // The outside stair: a steel flight up the side wall.
    p.stroke(3, 5, 11, -5, 1, 'S');
    p.stroke(4, 3, 12, -7, 1, 'k', false);
    if (!top) {
      p.roofShape('gableY', 2, H, 5, 'R', 'o');
      return;
    }
    // A modern kost: flat dak beton with a parapet, the tandon and a jemuran on the deck.
    p.roofShape('flat', 2, H, 0, 'R', 'o');
    p.box(6, 3, 'b', (face) => (face === 'T' ? 'w' : undefined), H + 1);
    p.stroke(-9, -H - 2, -9, -H - 6, 1, 'S');
    p.stroke(-3, -H + 1, -3, -H - 3, 1, 'S');
    p.id++;
    ['p', 'y', 'w', 'r', 'g'].forEach((c, k) => {
      const x = TW / 2 - 8 + k;
      const y = TOP + TH / 2 - H - 5 + Math.round(k / 2);
      p.set(x, y, c);
      p.set(x, y + 1, c);
    });
  },
  // Open field: grass with chalk lines and a goalpost.
  // The ink pass draws the 1px edge. Inside it a light stone kerb, then sunken chalk lines: a 1px
  // white line with a 1px shadow under it, the same width on a 3x3 field as on one tile.
  lapangan: (p) => {
    p.ground((a, b, px) => {
      const e = Math.min(a, b, 1 - a, 1 - b);
      if (e < 1.2 * px) return 's';
      const chalk = (d: number) => Math.abs(d) < 0.6 * px;
      const under = (d: number) => d > 0.6 * px && d < 1.6 * px;
      const box = e - 0.1;
      if (chalk(box) || (e > 0.1 && chalk(a - 0.5))) return 'w';
      if (under(box) || (e > 0.1 && under(a - 0.5))) return '#3f6a2a';
      return Math.floor(a * 5) % 2 ? 'g' : 'G';
    });
    p.overlay.push(dither);
  },
  // A low shed with blue bins out front.
  // A TPS, the kampung's trash collection point: an open concrete bak heaped with bags and karung,
  // a green signboard on a post, no roof. Level 2 sorts it: the three standard bins (organik green,
  // anorganik yellow, B3 red) in a row, and an orange gerobak sampah parked beside.
  bankSampah: (p, _v, level = 1) => {
    p.shadow(3);
    // The bak: low rendered walls, the top showing what is inside.
    p.box(3, 4, 's', (face, _u, j, i) => {
      if (face === 'T') return null;
      if (j === 3) return 'w';
      return (i + j) % 4 === 0 ? 'S' : undefined;
    });
    // Inside: a heap of black and green bags and white karung, rising above the rim.
    for (const [dx, up, r, c] of [[-4, 4, 2.6, 'S'], [2, 4, 2.8, 'k'], [-1, 6, 2.6, 'w'], [4, 6, 2.2, 'G'], [-5, 7, 2, 'w']] as [number, number, number, string][]) p.blob(dx, up, r, c);
    // One bag that missed, by the front corner.
    p.blob(6, 1, 1.8, 'k');
    // The signboard: green, on a post at the left corner.
    p.stroke(-12, 2, -12, -9, 1, 'N');
    p.stroke(-14, -12, -9, -9, 3, 'G');
    p.set(TW / 2 - 12, TOP + TH / 2 - 11, 'w');
    p.set(TW / 2 - 11, TOP + TH / 2 - 10, 'w');
    if (level < 2) return;
    // Sorting bins along the front, and a gerobak sampah on the right.
    for (const [dx, c] of [[-5, 'g'], [-2, 'y'], [1, 'r']] as [number, string][]) {
      p.stroke(dx, 7 + dx / 4, dx, 4 + dx / 4, 2, c);
      p.set(TW / 2 + dx, TOP + TH / 2 + 3 + Math.round(dx / 4), 'S');
    }
    p.stroke(8, 2, 13, 0, 3, 'o');
    p.stroke(8, 4, 8, 4, 2, 'k');
    p.stroke(13, 2, 13, 2, 2, 'k');
  },
  indomaret: minimarket(['B', 'b', 'r', 'y']),
  alfamart: minimarket(['r', 'y', 'B', 'B']),
  parkir: (p) => {
    p.ground((a, b) => {
      if (a < 0.08 || a > 0.92 || b < 0.08 || b > 0.92) return null;
      return within(a % 0.33, 0, 0.05) && b > 0.15 && b < 0.85 ? 'a' : 'S';
    });
    p.box(7, 4, 'B', undefined, 0);
    p.box(7, 4, 'o', (face, _u, j) => (face !== 'T' && j === 2 ? 'y' : undefined), 4);
    p.box(7, 3, 't', undefined, 8);
  },
  // Bamboo poles lashed with rope. Bare, so the ink pass does not turn the lattice into a black net.
  scaffold: (p) => {
    p.bare = true;
    p.box(2, 13, 'a', (face, _u, j, i) => {
      if (face === 'T') return null;
      if (i % 6 === 0 && j % 4 === 0) return 'N';
      if (i % 6 === 0) return 'a';
      return j % 4 === 0 ? 'n' : null;
    });
  },
  // Build phase: a tower crane at the back corner, its jib over the site and a hook on a cable.
  crane: (p) => {
    p.shadow(10);
    // Concrete foot, then the lattice mast: yellow rails with dark cross-ties every few pixels.
    p.box(11, 2, 'S', undefined, 0);
    for (let k = 2; k < 40; k++) {
      p.set(TW / 2 + 7, TOP + TH / 2 - k, k % 4 === 0 ? 'N' : 'y');
      p.set(TW / 2 + 9, TOP + TH / 2 - k, k % 4 === 2 ? 'N' : 'a');
      if (k % 4 === 1) p.set(TW / 2 + 8, TOP + TH / 2 - k, 'N');
    }
    // Operator's cab under the jib.
    p.stroke(6, -40, 10, -40, 3, 'r');
    p.set(TW / 2 + 9, TOP + TH / 2 - 41, 'l');
    // The jib reaching over the site, the counter-jib and its concrete weight behind.
    p.stroke(-12, -44, 8, -44, 2, 'y');
    p.stroke(8, -44, 14, -44, 2, 'a');
    p.stroke(13, -43, 15, -43, 3, 'S');
    // Cable and hook, hanging over the middle of the site.
    for (let k = 42; k > 24; k--) p.set(TW / 2 - 6, TOP + TH / 2 - k, 'S');
    p.set(TW / 2 - 6, TOP + TH / 2 - 24, 'k');
    p.set(TW / 2 - 7, TOP + TH / 2 - 23, 'k');
    p.set(TW / 2 - 5, TOP + TH / 2 - 23, 'k');
  },
  // Permit phase: the plot is staked out with string, nothing built yet. Bare, so the string stays one pixel thin.
  patok: (p) => {
    p.bare = true;
    const corners: [number, number][] = [[-12, 0], [0, -6], [12, 0], [0, 6]];
    // String round the plot, a little above the ground.
    for (let c = 0; c < 4; c++) {
      const [x0, y0] = corners[c];
      const [x1, y1] = corners[(c + 1) % 4];
      const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
      for (let k = 0; k <= steps; k++) p.set(TW / 2 + Math.round(x0 + ((x1 - x0) * k) / steps), TOP + TH / 2 + Math.round(y0 + ((y1 - y0) * k) / steps) - 2, 'w');
    }
    // Wooden stakes at the corners, with a red-painted tip.
    for (const [x, y] of corners) {
      for (let k = 0; k < 4; k++) p.set(TW / 2 + x, TOP + TH / 2 + y - k, k === 3 ? 'r' : 'n');
      p.set(TW / 2 + x + 1, TOP + TH / 2 + y, 'N');
    }
  },
  // Scenery. These never go in the tap list, so the tile under them stays buildable.
  bush: (p) => {
    p.shadow(5);
    p.blob(-3, 3, 4, 'G');
    p.blob(3, 2, 3.5, 'g');
  },
  flowers: (p) => {
    // A few chunky blooms: four petals round a yellow heart, each outlined on its own.
    for (const [dx, dy, c] of [[-6, 0, 'r'], [5, 2, 'w'], [1, -3, 'p']] as const) {
      p.id++;
      const x = TW / 2 + dx;
      const y = TOP + TH / 2 + dy;
      for (const [ox, oy] of [[0, -1], [-1, 0], [1, 0], [0, 1]]) p.set(x + ox, y + oy, c);
      p.set(x, y, 'y');
    }
  },
  // Tall grass tufts: a few straight blades fanning out, dark at the root and bright at the tip.
  rumput: (p) => {
    p.bare = true;
    for (const [cx, cy] of [[-4, 1], [4, -1]])
      for (const [lean, h] of [[-2, 4], [-1, 5], [0, 6], [1, 5], [2, 3]])
        for (let k = 0; k < h; k++) {
          const x = TW / 2 + cx + Math.round((lean * k) / h);
          p.set(x, TOP + TH / 2 + cy - k, k < 2 ? '#3f6a2a' : k < h - 1 ? '#5f8a3c' : '#9cc155');
        }
  },
  // Trees have thick trunks and heavy, clumped crowns, so they read as solid at a glance.
  pisang: (p) => {
    p.shadow(4);
    p.box(6, 10, 'G', (face, _u, j) => (face !== 'T' && j % 4 === 3 ? 'g' : undefined));
    // Broad paddle leaves fanning up and out, then a top shoot.
    p.leaf(0, -10, -11, -16, 'g');
    p.leaf(0, -10, 11, -15, 'g');
    p.leaf(0, -12, -8, -22, 'g');
    p.leaf(0, -12, 8, -23, 'g');
    p.leaf(0, -12, 1, -26, 'g');
    p.blob(3, 9, 2.5, 'y');
  },
  kelapa: (p) => {
    p.shadow(5);
    // A thick trunk leaning in two straight segments, banded like a real palm.
    const top = [3, -28];
    p.stroke(-1, -1, 1, -14, 4, 'n');
    p.stroke(1, -14, top[0], top[1], 4, 'n', false);
    for (let k = 3; k < 28; k += 4) p.stroke(k < 14 ? -1 + (2 * k) / 14 : 1 + (2 * (k - 14)) / 14, -k, k < 14 ? -1 + (2 * k) / 14 : 1 + (2 * (k - 14)) / 14, -k, 4, 'N', false);
    // Six heavy fronds, each drooping in two straight steps.
    const [tx, ty] = top;
    for (const [dx, dy, ex, ey] of [[-7, -3, -13, 3], [7, -3, 13, 2], [-6, -6, -11, -8], [6, -6, 11, -9], [-3, -7, -6, -12], [3, -7, 7, -12]]) {
      p.leaf(tx, ty, tx + dx, ty + dy, 'g');
      p.leaf(tx + dx, ty + dy, tx + ex, ty + ey, 'g');
    }
    p.blob(tx - 1, -ty - 1, 2, 'n');
    p.blob(tx + 2, -ty - 2, 2, 'n');
  },
  pohon: (p) => {
    p.shadow(3);
    p.box(6, 9, 'N', (face, _u, j) => (face !== 'T' && j === 5 ? 'n' : undefined));
    // Three overlapping clumps make one full crown.
    p.blob(-6, 17, 7, 'G');
    p.blob(6, 18, 7, 'G');
    p.blob(0, 24, 9, 'g');
  },
};

/**
 * Long footprints, built from one-tile pieces with Painter.at(u, v): u runs along the map's x axis.
 * Pieces draw back to front (lower u + v first). A turned building is this art mirrored, so one
 * drawing covers both ways round.
 */
const LONG_ART: Record<string, ArtFn> = {
  // A row of stalls under striped awnings, each its own colour.
  pasarKaget: (p) => {
    for (const [u, awning] of [[0, 'r'], [1, 'b']] as [number, string][]) {
      p.at(u, 0);
      p.shadow(2);
      p.box(2, 5, 'n', (face, _u, j) => (face !== 'T' && j < 2 ? 'N' : undefined));
      p.box(1, 3, awning, (face, _u, _j, i) => (face !== 'T' ? (Math.floor(i / 3) % 2 ? 'w' : awning) : undefined), 8);
      p.box(5, 4, u ? 'g' : 'y', (face, _u, _j, i) => (face !== 'T' && i % 4 === 0 ? 'o' : undefined), 5);
    }
  },
  // Two kos blocks joined in a row, the rooms running the length of the lot.
  kosan: (p, v, level) => {
    p.at(0, 0);
    ART.kosan(p, v, level);
    p.at(1, 0);
    ART.kosan(p, v, level);
  },
  // The clinic, and a shaded waiting porch with a bench for the queue.
  posyandu: (p) => {
    p.at(0, 0);
    HIGHER_ART.posyandu(p);
    p.at(1, 0);
    p.shadow(3);
    p.box(7, 2, 'n', (face) => (face === 'T' ? 'N' : undefined));
    posts(p, 3, 8, 'n');
    p.roofShape('shed', 3, 8, 3, 'p', 't');
  },
  // The workshop, and an open bay with a car up for repair on the concrete.
  bengkel: (p, v, level) => {
    p.at(0, 0);
    CONTENT_ART.bengkel(p, v, level);
    p.at(1, 0);
    p.ground((a, b, px) => (Math.min(a, b, 1 - a, 1 - b) < px ? 'S' : 's'));
    p.box(5, 3, 'r', (face, u, j) => (face !== 'T' && j === 0 && (within(u, 0.15, 0.3) || within(u, 0.7, 0.85)) ? 'k' : undefined), 1);
    p.box(8, 3, 'r', (face, u) => (face !== 'T' && within(u, 0.15, 0.85) ? 'l' : undefined), 4);
    p.box(10, 2, 'k', undefined, 0);
  },
  // A 2x3 field: chalk lines round the edge and across the middle of its long side.
  lapangan: (p) => {
    p.groundLong((a, b, px) => {
      const e = Math.min(a, b, 1 - a, 1 - b);
      if (e < 1.2 * px) return 's';
      const chalk = (d: number) => Math.abs(d) < 0.6 * px;
      const under = (d: number) => d > 0.6 * px && d < 1.6 * px;
      const box = e - 0.07;
      const mid = p.fb >= p.fa ? b - 0.5 : a - 0.5;
      if (chalk(box) || (e > 0.07 && chalk(mid))) return 'w';
      if (under(box) || (e > 0.07 && under(mid))) return '#3f6a2a';
      return Math.floor((p.fb >= p.fa ? b : a) * 7) % 2 ? 'g' : 'G';
    });
    p.overlay.push(dither);
  },
};

const cache = new Map<string, Art>();

/** Paints a sprite at a level: its own level art if it has some, otherwise the base art plus the upgrade kit. */
export function paint(p: Painter, name: string, variant?: string, level = 1): void {
  const fn: ArtFn = ART[name] ?? HIGHER_ART[name] ?? CONTENT_ART[name] ?? ((q: Painter) => q.box(3, 8, 's'));
  fn(p, variant, level);
  if (!LEVELLED.has(name) && !NO_KIT.has(name) && !p.bare && level > 1) p.overlay.push((q) => upgradeKit(q, level));
}

/**
 * Isometric art for a sprite name. variant is a roof colour for rumah, or 'y' for a selokan. n is the
 * footprint: big buildings get their own art at n times the size. Unknown names get a plain box.
 */
export function iso(name: string, variant?: string, n = 1, level = 1, fa = 1, fb = 1): Art {
  const key = `${name}:${variant ?? ''}:${n}:${level}:${fa}x${fb}`;
  const hit = cache.get(key);
  if (hit) return hit;
  if (fa !== fb) {
    // A long footprint: its own art, or the one-tile sprite on every tile.
    const p = new Painter(1, fa, fb);
    const own = LONG_ART[name];
    if (own) own(p, variant, level);
    else
      for (let d = 0; d < fa + fb - 1; d++)
        for (let u = 0; u < fa; u++) {
          const v = d - u;
          if (v < 0 || v >= fb) continue;
          p.at(u, v);
          (ART[name] ?? HIGHER_ART[name] ?? CONTENT_ART[name] ?? ((q: Painter) => q.box(3, 8, 's')))(p, variant, level);
        }
    const art = p.finish();
    cache.set(key, art);
    return art;
  }
  // A big footprint is drawn at its own size, so its edges and outlines stay 1px.
  const p = new Painter(n);
  paint(p, name, variant, level);
  const art = p.finish();
  cache.set(key, art);
  return art;
}

export function isoURL(name: string, scale = 3, level = 1): string {
  const { canvas, alpha: a } = iso(name, undefined, 1, level);
  // Crop the empty headroom so the thumbnail fills its button.
  let top = 0;
  while (top < canvas.height && !a.slice(top * canvas.width, (top + 1) * canvas.width).some((v) => v)) top++;
  const h = canvas.height - top;
  const c = document.createElement('canvas');
  c.width = canvas.width * scale;
  c.height = h * scale;
  const ctx = c.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(canvas, 0, top, canvas.width, h, 0, 0, c.width, c.height);
  return c.toDataURL();
}
