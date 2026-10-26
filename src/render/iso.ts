// Isometric pixel art, rasterised in code at 1 art pixel per canvas pixel. No external art.
// Party-game look: flat cel shading, a warm storybook palette and a bold ink outline round every shape and
// along every face edge. Geometry stays straight and isometric so the map never gets busy.
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

class Painter {
  readonly w = TW;
  readonly h = TOP + TH;
  readonly data: Uint8ClampedArray;
  /** Which shape or face painted each pixel. Ink lines go where two of them meet. */
  readonly ids: Uint16Array;
  /** Id stamped by set(). Bumped per face, roof plane and clump. */
  id = 1;
  /** Skip the ink pass, for specks too small to outline. */
  bare = false;
  constructor() {
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
        this.set(x, y, shade(p === undefined ? colour : p, FACE_SHADE[face] * ao));
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
          if (inTri(x + 0.5, y + 0.5, p, q, apex)) this.set(x, y, shade(paint(x, y) ?? colour, f));
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
        this.set(x, y, shade(colour, ex + ey < -0.7 ? 1.3 : ex + ey > 0.5 ? 0.72 : 1));
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
   * Ink pass: a 1px outline round the silhouette, and a line wherever two faces or shapes meet.
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
    const n = parseInt(INK.slice(1), 16);
    for (const k of edge) {
      data.set([(n >> 16) & 255, (n >> 8) & 255, n & 255, 255], k * 4);
      ids[k] = 65535;
    }
  }

  finish(): Art {
    if (!this.bare) this.ink();
    const c = document.createElement('canvas');
    c.width = this.w;
    c.height = this.h;
    c.getContext('2d')!.putImageData(new ImageData(new Uint8ClampedArray(this.data), this.w, this.h), 0, 0);
    const alpha = new Uint8ClampedArray(this.w * this.h);
    let top = 0;
    for (let k = 0; k < alpha.length; k++) {
      alpha[k] = this.data[k * 4 + 3];
      if (alpha[k] === 255 && !top) top = TOP + TH / 2 - Math.floor(k / this.w);
    }
    return { canvas: c, alpha, height: top };
  }
}

function inTri(x: number, y: number, a: number[], b: number[], c: number[]): boolean {
  const s = (p: number[], q: number[]) => (x - q[0]) * (p[1] - q[1]) - (p[0] - q[0]) * (y - q[1]);
  const d1 = s(a, b);
  const d2 = s(b, c);
  const d3 = s(c, a);
  return !((d1 < 0 || d2 < 0 || d3 < 0) && (d1 > 0 || d2 > 0 || d3 > 0));
}

const within = (v: number, lo: number, hi: number) => v >= lo && v < hi;

function minimarket(bands: string[]): (p: Painter) => void {
  return (p) => {
    p.shadow(1);
    p.box(1, 15, 'w', (face, u, j, i) => {
      if (face === 'T') return j === 0 && (u < 0.06 || u > 0.94) ? 'S' : 's';
      if (j >= 11) return bands[14 - j] ?? 'w';
      if (face === 'L' && within(u, 0.42, 0.62) && j < 7) return j === 6 ? 'S' : 'k';
      if (j >= 2 && j <= 8) return i % 4 === 0 ? 'w' : 'c';
      return undefined;
    });
  };
}

const ART: Record<string, (p: Painter, variant?: string) => void> = {
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
  kantorRT: (p) => {
    p.shadow(1);
    p.box(1, 11, 'w', (face, u, j, i) => {
      if (face === 'L' && within(u, 0.42, 0.6) && j < 7) return 'k';
      if (j < 1) return 'S';
      if (within(j, 4, 8) && i % 5 >= 2 && !(face === 'L' && within(u, 0.36, 0.66))) return 'l';
      return undefined;
    });
    p.roof(1, 11, 9, 'R');
    // Flag pole on the ridge: red over white.
    const ax = TW / 2;
    const ay = TOP + TH / 2 - 11 - 9;
    for (let k = 1; k <= 9; k++) p.set(ax, ay - k, 'k');
    for (let k = 1; k <= 4; k++) {
      p.set(ax + k, ay - 9, 'r');
      p.set(ax + k, ay - 8, 'r');
      p.set(ax + k, ay - 7, 'w');
      p.set(ax + k, ay - 6, 'w');
    }
  },
  warung: (p) => {
    p.shadow(3);
    p.box(3, 8, 'n', (face, u, j, i) => {
      if (face === 'T') return undefined;
      if (face === 'L' && within(u, 0.12, 0.88) && within(j, 3, 7)) return j === 3 ? 't' : i % 3 === 0 ? 'y' : i % 3 === 1 ? 'c' : 'k';
      return j === 0 ? 'N' : undefined;
    });
    p.roof(3, 8, 5, 'r', (x) => (Math.floor(x / 2) % 2 ? 'w' : undefined));
  },
  posRonda: (p) => {
    p.shadow(4);
    p.box(4, 7, 't', (face, u, j) => {
      if (face === 'T') return null;
      if (u < 0.14 || u > 0.86) return 't';
      if (within(j, 1, 3)) return 'n';
      if (face === 'L' && within(u, 0.45, 0.6) && within(j, 3, 6)) return 'o';
      return null;
    });
    p.roof(4, 7, 6, 'N', (x, y) => ((x + y) % 4 === 0 ? 'n' : undefined));
  },
  // Variant 'y' runs the channel along the tile's y axis, so a column of selokan joins up.
  // Bare, with its own ink banks, so neighbouring channels join without an outline between them.
  selokan: (p, v) => {
    p.bare = true;
    p.ground((a0, b0) => {
      const [a, b] = v === 'y' ? [b0, a0] : [a0, b0];
      if (b < 0.26 || b > 0.74) return null;
      if (b < 0.31 || b > 0.69) return INK;
      if (b < 0.38 || b > 0.62) return 's';
      return Math.floor(a * 6) % 3 === 0 && Math.abs(b - 0.5) < 0.05 ? 'w' : 'l';
    });
  },
  wifi: (p) => {
    p.shadow(6);
    p.box(5, 3, 'S');
    p.box(7, 28, 's', (face, _u, j) => (face !== 'T' && j % 4 === 0 ? 'S' : undefined), 3);
    const ax = TW / 2;
    const ay = TOP + TH / 2 - 32;
    for (const [dx, dy] of [[-4, -1], [-5, -3], [-4, -5], [4, -1], [5, -3], [4, -5], [-7, -3], [7, -3], [0, -2], [0, -3]]) p.set(ax + dx, ay + dy, dx === 0 ? 'r' : 'c');
  },
  // Two floors of rooms with a tin roof.
  kosan: (p) => {
    p.shadow(1);
    p.box(1, 15, 'o', (face, u, j, i) => {
      if (face === 'T') return undefined;
      if (j < 1) return 'S';
      if (face === 'L' && within(u, 0.42, 0.6) && j < 5) return 'k';
      if ((j >= 7 && j < 10) || (j >= 2 && j < 4 && !(face === 'L' && within(u, 0.36, 0.66)))) return i % 5 >= 2 ? 'l' : undefined;
      return undefined;
    });
    p.roof(1, 15, 6, 'R');
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
  bankSampah: (p) => {
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
  rumput: (p) => {
    p.bare = true;
    for (const [dx, dy] of [[-4, 1], [-3, 0], [-2, 1], [3, -1], [4, -2], [5, -1]]) p.set(TW / 2 + dx, TOP + TH / 2 + dy, '#3f6a2a');
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

/** Isometric art for a sprite name. variant is a roof colour for rumah, or 'y' for a selokan. Unknown names get a plain box. */
export function iso(name: string, variant?: string): Art {
  const key = `${name}:${variant ?? ''}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const p = new Painter();
  (ART[name] ?? ((q: Painter) => q.box(3, 8, 's')))(p, variant);
  const art = p.finish();
  cache.set(key, art);
  return art;
}

export function isoURL(name: string, scale = 3): string {
  const { canvas } = iso(name);
  // Crop the empty headroom so the thumbnail fills its button.
  let top = 0;
  const a = iso(name).alpha;
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
