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
}

type Face = 'L' | 'R' | 'T';
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
  /** n is the footprint the canvas is sized for. Sprites always paint at n = 1; upscale() makes the big one. */
  constructor(readonly n = 1) {
    this.w = TW * n;
    this.h = (TOP + TH) * n;
    this.data = new Uint8ClampedArray(this.w * this.h * 4);
    this.ids = new Uint16Array(this.w * this.h);
  }

  set(x: number, y: number, c: string | null, alpha = 255): void {
    if (c === null || x < 0 || y < 0 || x >= this.w || y >= this.h) return;
    const n = parseInt(hex(c).slice(1), 16);
    const k = (y * this.w + x) * 4;
    this.data.set([(n >> 16) & 255, (n >> 8) & 255, n & 255, alpha], k);
    this.ids[k / 4] = alpha === 255 ? this.id : 0;
  }

  /** Ground-level paint. a runs along the tile's x axis, b along its y axis, both 0..1. */
  ground(paint: (a: number, b: number) => string | null): void {
    this.id++;
    const cy = TOP + TH / 2;
    for (let y = TOP; y < TOP + TH; y++)
      for (let x = 0; x < TW; x++) {
        const rx = (x + 0.5 - TW / 2) / (TW / 2);
        const ry = (y + 0.5 - cy) / (TH / 2);
        if (Math.abs(rx) + Math.abs(ry) > 1) continue;
        this.set(x, y, paint((rx + ry) / 2 + 0.5, (ry - rx) / 2 + 0.5));
      }
  }

  /** A box standing on the tile. inset shrinks the footprint, z lifts its base. */
  box(inset: number, h: number, colour: string, paint: Paint = () => undefined, z = 0): void {
    const hw = TW / 2 - inset * 2;
    const hh = TH / 2 - inset;
    const cx = TW / 2;
    const cy = TOP + TH / 2 - z;
    const base = (this.id += 3);
    const FACE_ID: Record<Face, number> = { L: base - 2, R: base - 1, T: base };
    for (let x = Math.floor(cx - hw); x < Math.ceil(cx + hw); x++) {
      const px = x + 0.5;
      const left = px < cx;
      const t = left ? (px - (cx - hw)) / hw : (cx + hw - px) / hw;
      const yb = cy + t * hh;
      const u = left ? t : 1 - t;
      const i = left ? x - Math.floor(cx - hw) : x - cx;
      for (let y = Math.floor(yb - h - hh); y <= Math.ceil(yb); y++) {
        const py = y + 0.5;
        const face: Face | null = py <= yb && py >= yb - h ? (left ? 'L' : 'R') : Math.abs(px - cx) / hw + Math.abs(py - (cy - h)) / hh <= 1 ? 'T' : null;
        if (!face) continue;
        const j = face === 'T' ? 0 : Math.floor(yb - py);
        const p = paint(face, u, j, i);
        if (p === null) continue;
        this.id = FACE_ID[face];
        // Baked ambient occlusion: walls darken toward the ground they stand on.
        const ao = face !== 'T' && z === 0 ? (j === 0 ? 0.78 : j === 1 ? 0.9 : 1) : 1;
        // Plain walls get faint plank or course lines, so they read as built, not flat.
        const grain = p === undefined && face !== 'T' && j % 3 === 2 ? 0.93 : 1;
        this.set(x, y, shade(p === undefined ? colour : p, FACE_SHADE[face] * ao * grain));
      }
    }
  }

  /** A hipped (limasan) roof over a box of the same inset and height. */
  roof(inset: number, h: number, rise: number, colour: string, paint: (x: number, y: number) => string | undefined = () => undefined): void {
    const hw = TW / 2 - inset * 2 + 2;
    const hh = TH / 2 - inset + 1;
    const cx = TW / 2;
    const cy = TOP + TH / 2 - h;
    const apex = [cx, cy - rise];
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
            const row = Math.floor(y - apex[1]);
            const course = row % 3 === 2 ? 0.86 : row % 3 === 0 ? 1.06 : 1;
            const joint = row % 3 !== 2 && (x + (Math.floor(row / 3) % 2) * 2) % 4 === 0 ? 0.93 : 1;
            this.set(x, y, shade(paint(x, y) ?? colour, f * course * joint));
          }
    }
  }

  shadow(inset: number): void {
    const hw = TW / 2 - inset * 2 + 2;
    const hh = TH / 2 - inset + 1;
    const cx = TW / 2 + 2;
    const cy = TOP + TH / 2;
    for (let y = TOP; y < TOP + TH; y++)
      for (let x = 0; x < TW; x++)
        if (Math.abs(x + 0.5 - cx) / hw + Math.abs(y + 0.5 - cy) / hh <= 1) this.set(x, y, INK, 90);
  }

  /** A round leafy clump centred r art pixels above the ground centre, cel-lit from the top left. */
  blob(dx: number, up: number, r: number, colour: string): void {
    this.id++;
    const cx = TW / 2 + dx;
    const cy = TOP + TH / 2 - up;
    for (let y = Math.floor(cy - r); y <= Math.ceil(cy + r); y++)
      for (let x = Math.floor(cx - r); x <= Math.ceil(cx + r); x++) {
        const ex = (x + 0.5 - cx) / r;
        const ey = (y + 0.5 - cy) / (r * 0.85);
        const d = ex * ex + ey * ey;
        if (d > 1) continue;
        // Cel light, then small leaf clusters: bright sprigs on the lit side, dark gaps in the shade.
        const light = ex + ey < -0.7 ? 1.3 : ex + ey > 0.5 ? 0.72 : 1;
        const n = speck(x, y);
        const leaf = n < 0.12 && ex + ey < 0.2 ? 1.14 : n > 0.9 && ex + ey > -0.4 ? 0.84 : 1;
        this.set(x, y, shade(colour, light * leaf));
      }
  }

  /** A straight, square-brushed stroke w pixels thick, in art pixels from the ground centre (up is negative). */
  stroke(x0: number, y0: number, x1: number, y1: number, w: number, colour: string, id = true): void {
    if (id) this.id++;
    const steps = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) * 2));
    const ox = TW / 2 - Math.floor(w / 2);
    const oy = TOP + TH / 2 - Math.floor(w / 2);
    for (let k = 0; k <= steps; k++) {
      const x = Math.round(x0 + ((x1 - x0) * k) / steps);
      const y = Math.round(y0 + ((y1 - y0) * k) / steps);
      for (let dy = 0; dy < w; dy++) for (let dx = 0; dx < w; dx++) this.set(ox + x + dx, oy + y + dy, colour);
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

  /**
   * The same art for an n x n footprint, with outlines kept 1px instead of scaled to n px.
   * Fills and face ids scale up pixel for pixel, and the ink pass has not run yet, so it runs on the
   * big canvas. Bare art (flat ground that paints its own border band) has no ink pass: its silhouette
   * band keeps only its outermost pixel, and the rest takes the colour just inside the band.
   */
  upscale(n: number): Painter {
    const q = new Painter(n);
    q.bare = this.bare;
    const { w, h, ids, data } = this;
    const solid = (x: number, y: number) => x >= 0 && y >= 0 && x < w && y < h && ids[y * w + x] > 0;
    // Bare art only: for each small pixel on the silhouette, the inner neighbour whose colour fills in for it.
    const inner = new Int32Array(w * h).fill(-1);
    if (this.bare)
      for (let y = 0; y < h; y++)
        for (let x = 0; x < w; x++) {
          if (!solid(x, y)) continue;
          const near = [[x, y + 1], [x - 1, y], [x + 1, y], [x, y - 1]];
          if (near.every(([a, b]) => solid(a, b))) continue;
          const edge = (a: number, b: number) => [[a, b + 1], [a - 1, b], [a + 1, b], [a, b - 1]].some(([c, d]) => !solid(c, d));
          const inside = near.find(([a, b]) => solid(a, b) && !edge(a, b));
          inner[y * w + x] = inside ? inside[1] * w + inside[0] : y * w + x;
        }
    const big = (x: number, y: number) => x >= 0 && y >= 0 && x < q.w && y < q.h && ids[Math.floor(y / n) * w + Math.floor(x / n)] > 0;
    for (let y = 0; y < q.h; y++)
      for (let x = 0; x < q.w; x++) {
        let from = Math.floor(y / n) * w + Math.floor(x / n);
        const to = y * q.w + x;
        q.ids[to] = ids[from];
        if (inner[from] >= 0 && big(x - 1, y) && big(x + 1, y) && big(x, y - 1) && big(x, y + 1)) from = inner[from];
        q.data.set(data.subarray(from * 4, from * 4 + 4), to * 4);
      }
    return q;
  }

  /** Runs the ink pass (unless bare) and returns the RGBA pixels. Pure, so tests read it without a canvas. */
  pixels(): Uint8ClampedArray {
    if (!this.bare) this.ink();
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
    for (let k = 0; k < alpha.length; k++) {
      alpha[k] = this.data[k * 4 + 3];
      if (alpha[k] === 255 && !top) top = (TOP + TH / 2) * this.n - Math.floor(k / this.w);
    }
    return { canvas: c, alpha, height: top, n: this.n };
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

/** Four corner posts of a box footprint, h pixels tall, for open-sided stalls and huts. */
function posts(p: Painter, inset: number, h: number, colour: string): void {
  const hw = TW / 2 - inset * 2 - 1;
  const hh = TH / 2 - inset - 1;
  for (const [x, y] of [[-hw, 0], [0, hh], [hw, 0], [0, -hh]]) p.stroke(x, y, x, y - h, 1, colour);
}

/**
 * The upgrade kit for buildings without their own level art: things a kampung adds round a building
 * as it does well. Level 2 fences the front with a bamboo pagar. Level 3 swaps it for a whitewashed
 * pagar tembok with tiled caps, two potted plants at the gate and a short lamp. All of it stands in
 * front and stays low, so a levelled building never hides the ones behind it.
 */
function upgradeKit(p: Painter, level: number): void {
  if (level < 2) return;
  const wall = level >= 3;
  // Both front edges, from the side corners to the front corner, with a gate gap in the middle.
  const edges: [number, number, number, number][] = [[-15, 0, -2, 6.5], [2, 6.5, 15, 0]];
  p.id++;
  for (const [x0, y0, x1, y1] of edges) {
    const steps = Math.round(Math.abs(x1 - x0));
    for (let k = 0; k <= steps; k++) {
      const x = Math.round(x0 + ((x1 - x0) * k) / steps) + TW / 2;
      const y = Math.round(y0 + ((y1 - y0) * k) / steps) + TOP + TH / 2;
      if (wall) {
        // Two courses of whitewash with a terracotta cap.
        p.set(x, y, 'w');
        p.set(x, y - 1, 'w');
        p.set(x, y - 2, 'R');
      } else {
        // Bamboo: a post every third pixel, two rails between.
        if (k % 3 === 0) p.set(x, y - 2, 'a');
        p.set(x, y - 1, k % 3 === 0 ? 'a' : 'n');
        p.set(x, y, 'a');
      }
    }
  }
  if (!wall) return;
  // Potted plants either side of the gate, and a garden lamp by the right pot.
  for (const dx of [-3, 3]) {
    p.stroke(dx, 7, dx, 6, 2, 'o');
    p.blob(dx, 3, 1.8, 'G');
  }
  p.stroke(6, 5, 6, -1, 1, 'S');
  p.set(TW / 2 + 6, TOP + TH / 2 - 2, 'y');
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

/** Sprites that draw their own level progression. Everything else gets the upgrade kit. */
const LEVELLED = new Set(['warung', 'posRonda', 'kantorRT', 'kosan', 'wifi', 'bankSampah', 'indomaret', 'alfamart']);
/** Ground pieces and the tukang parkir level up without a fence round them. */
const NO_KIT = new Set(['parkir', 'biopori', 'kebunSayur', 'sawah', 'kolamLele', 'kolamIkan', 'taman', 'sawahIrigasi', 'embung', 'aspalUlang', 'jalan', 'selokan']);

const ART: Record<string, ArtFn> = {
  rumah: (p, roof = 'o') => {
    p.shadow(3);
    p.box(3, 8, 't', (face, u, j) => {
      if (face === 'L' && within(u, 0.6, 0.82) && j < 6) return 'N';
      if (face === 'L' && within(u, 0.15, 0.4) && within(j, 3, 6)) return 'l';
      if (face === 'R' && (within(u, 0.2, 0.42) || within(u, 0.6, 0.82)) && within(j, 3, 6)) return 'l';
      return undefined;
    });
    p.roof(3, 8, 8, roof);
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
  // Paving stones. A cracked path ('retak') gets a dark split across it; left for months it turns
  // into potholes ('rusak') with a puddle and loose stones.
  jalan: (p, v) => {
    p.bare = true;
    p.ground((a, b) => {
      if (a < 0.03 || a > 0.97 || b < 0.03 || b > 0.97) return 'n';
      const row = Math.floor(b * 4);
      const seam = Math.abs(((a * 4 + (row % 2) * 0.5) % 1) - 0.5) > 0.46 || (b * 4) % 1 < 0.1;
      if (v === 'retak' || v === 'rusak') {
        // A zigzag split from one edge to the other, two straight steps so it reads as a crack.
        const line = a < 0.5 ? 0.3 + a * 0.5 : 0.8 - (a - 0.5) * 0.6;
        if (Math.abs(b - line) < 0.035) return '#4a3424';
      }
      if (v === 'rusak') {
        // Two potholes: a dark rim, muddy water, a glint of sky. Stones kicked out lie around them.
        for (const [ca, cb, r] of [[0.33, 0.62, 0.17], [0.7, 0.3, 0.12]]) {
          const d = Math.hypot(a - ca, (b - cb) * 1.1) / r;
          if (d < 0.55) return d < 0.25 && a < ca ? '#a9c6d6' : '#6f7f86';
          if (d < 1) return '#5b4030';
          if (d < 1.35 && (Math.floor(a * 23) + Math.floor(b * 17)) % 4 === 0) return 's';
        }
      }
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
  // Kos-kosan. Level 1 is one long row of rooms; level 2 adds a floor, a balcony rail and a jemuran.
  kosan: (p, _v, level = 1) => {
    if (level <= 1) {
      p.shadow(1);
      p.box(1, 8, 'o', (face, _u, j, i) => {
        if (face === 'T') return undefined;
        if (j < 1) return 'S';
        // A door every six pixels, each with its own small window.
        if (face === 'L' && i % 6 >= 2 && i % 6 < 4 && j < 6) return 'k';
        if (face === 'L' && i % 6 === 5 && within(j, 3, 5)) return 'l';
        if (face === 'R' && within(j, 3, 6) && i % 5 >= 2) return 'l';
        return undefined;
      });
      p.roof(1, 8, 5, 'R');
      return;
    }
    p.shadow(1);
    p.box(1, 15, 'o', (face, u, j, i) => {
      if (face === 'T') return undefined;
      if (j < 1) return 'S';
      if (face === 'L' && within(u, 0.42, 0.6) && j < 5) return 'k';
      if ((j >= 7 && j < 10) || (j >= 2 && j < 4 && !(face === 'L' && within(u, 0.36, 0.66)))) return i % 5 >= 2 ? 'l' : undefined;
      return undefined;
    });
    p.roof(1, 15, 6, 'R');
    // Balcony rail along the upper floor.
    p.id++;
    for (let x = -14; x <= -1; x++) p.set(TW / 2 + x, TOP + TH / 2 - 10 + Math.round((x + 14) / 2), (x & 1) ? 'S' : 'w');
    // A jemuran in front of the side wall: laundry in every colour in the kampung.
    p.stroke(5, 7, 5, -3, 1, 'S');
    p.stroke(13, 3, 13, -7, 1, 'S');
    p.id++;
    ['p', 'b', 'y', 'w', 'r', 'g', 'o'].forEach((c, k) => {
      const x = TW / 2 + 6 + k;
      const y = TOP + TH / 2 - 3 - Math.round(k / 2);
      p.set(x, y, c);
      p.set(x, y + 1, c);
      if (k % 2 === 0) p.set(x, y + 2, c);
    });
  },
  // Open field: grass with chalk lines and a goalpost.
  lapangan: (p) => {
    p.bare = true;
    p.ground((a, b) => {
      if (a < 0.06 || a > 0.94 || b < 0.06 || b > 0.94) return INK;
      if (a < 0.1 || a > 0.9 || b < 0.1 || b > 0.9 || Math.abs(a - 0.5) < 0.03) return 'w';
      return Math.floor(a * 5) % 2 ? 'g' : 'G';
    });
  },
  // A low shed with blue bins out front.
  bankSampah: (p, _v, level = 1) => {
    if (level <= 1) {
      // A lean-to of zinc on poles over a pile of karung, sacks of sorted plastic.
      p.shadow(4);
      posts(p, 3, 7, 'n');
      for (const [dx, up] of [[-4, 2], [1, 2], [-1, 5], [5, 3]]) p.blob(dx, up, 2.6, 'w');
      p.roof(3, 7, 3, 's', (x) => (x % 2 ? 'S' : undefined));
      return;
    }
    p.shadow(3);
    p.box(3, 7, 'a', (face, u, j) => {
      if (face === 'L' && within(u, 0.15, 0.85) && within(j, 2, 5)) return 'B';
      return j === 0 ? 'n' : undefined;
    });
    p.roof(3, 7, 4, 'B');
    p.box(8, 3, 'g', undefined, 0);
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

const cache = new Map<string, Art>();

/** Paints a sprite at a level: its own level art if it has some, otherwise the base art plus the upgrade kit. */
export function paint(p: Painter, name: string, variant?: string, level = 1): void {
  const fn: ArtFn = ART[name] ?? HIGHER_ART[name] ?? CONTENT_ART[name] ?? ((q: Painter) => q.box(3, 8, 's'));
  fn(p, variant, level);
  if (!LEVELLED.has(name) && !NO_KIT.has(name) && !p.bare) upgradeKit(p, level);
}

/**
 * Isometric art for a sprite name. variant is a roof colour for rumah, or 'y' for a selokan. n is the
 * footprint: big buildings get their own art at n times the size. Unknown names get a plain box.
 */
export function iso(name: string, variant?: string, n = 1, level = 1): Art {
  const key = `${name}:${variant ?? ''}:${n}:${level}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const p = new Painter();
  paint(p, name, variant, level);
  // A big footprint gets its own art, n times the size with 1px outlines, not the small art stretched.
  const art = (n > 1 ? p.upscale(n) : p).finish();
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
