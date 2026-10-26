// Isometric pixel art, rasterised in code at 1 art pixel per canvas pixel. No external art.
import { PALETTE } from './sprites';

/** Art-pixel size of one ground diamond. The view scales these up by a whole number. */
export const TW = 32;
export const TH = 16;
/** Headroom above a tile's top corner, so tall buildings fit in the art canvas. */
export const TOP = 40;

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

const FACE_SHADE: Record<Face, number> = { L: 1, R: 0.78, T: 1.12 };

class Painter {
  readonly w = TW;
  readonly h = TOP + TH;
  readonly data: Uint8ClampedArray;
  top = 0;
  constructor() {
    this.data = new Uint8ClampedArray(this.w * this.h * 4);
  }

  set(x: number, y: number, c: string | null, alpha = 255): void {
    if (c === null || x < 0 || y < 0 || x >= this.w || y >= this.h) return;
    const n = parseInt(hex(c).slice(1), 16);
    const k = (y * this.w + x) * 4;
    this.data.set([(n >> 16) & 255, (n >> 8) & 255, n & 255, alpha], k);
    this.top = Math.max(this.top, TOP + TH / 2 - y);
  }

  /** Ground-level paint. a runs along the tile's x axis, b along its y axis, both 0..1. */
  ground(paint: (a: number, b: number) => string | null): void {
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
        this.set(x, y, p === undefined ? shade(colour, FACE_SHADE[face]) : shade(p, FACE_SHADE[face]));
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
    for (const [p, q, f] of tris)
      for (let y = Math.floor(apex[1]); y <= Math.ceil(F[1]); y++)
        for (let x = Math.floor(L[0]); x < Math.ceil(R[0]); x++)
          if (inTri(x + 0.5, y + 0.5, p, q, apex)) this.set(x, y, shade(paint(x, y) ?? colour, f));
  }

  shadow(inset: number): void {
    const hw = TW / 2 - inset * 2 + 2;
    const hh = TH / 2 - inset + 1;
    const cx = TW / 2 + 2;
    const cy = TOP + TH / 2;
    for (let y = TOP; y < TOP + TH; y++)
      for (let x = 0; x < TW; x++)
        if (Math.abs(x + 0.5 - cx) / hw + Math.abs(y + 0.5 - cy) / hh <= 1) this.set(x, y, '#000000', 70);
  }

  /** A round leafy clump centred r art pixels above the ground centre, lit from the top left. */
  blob(dx: number, up: number, r: number, colour: string): void {
    const cx = TW / 2 + dx;
    const cy = TOP + TH / 2 - up;
    for (let y = Math.floor(cy - r); y <= Math.ceil(cy + r); y++)
      for (let x = Math.floor(cx - r); x <= Math.ceil(cx + r); x++) {
        const ex = (x + 0.5 - cx) / r;
        const ey = (y + 0.5 - cy) / (r * 0.85);
        const d = ex * ex + ey * ey;
        if (d > 1) continue;
        const lit = ex + ey < -0.5 ? 1.25 : ex + ey > 0.6 ? 0.75 : 1;
        this.set(x, y, shade(colour, (x * 7 + y * 3) % 11 === 0 ? lit * 0.85 : lit));
      }
  }

  finish(): Art {
    const c = document.createElement('canvas');
    c.width = this.w;
    c.height = this.h;
    c.getContext('2d')!.putImageData(new ImageData(new Uint8ClampedArray(this.data), this.w, this.h), 0, 0);
    const alpha = new Uint8ClampedArray(this.w * this.h);
    for (let k = 0; k < alpha.length; k++) alpha[k] = this.data[k * 4 + 3];
    return { canvas: c, alpha, height: this.top };
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
  selokan: (p, v) =>
    p.ground((a0, b0) => {
      const [a, b] = v === 'y' ? [b0, a0] : [a0, b0];
      if (b < 0.28 || b > 0.72) return null;
      if (b < 0.36 || b > 0.64) return 's';
      return Math.floor(a * 10 + b * 3) % 3 === 0 ? 'l' : 'b';
    }),
  wifi: (p) => {
    p.shadow(6);
    p.box(5, 3, 'S');
    p.box(7, 28, 's', (face, _u, j) => (face !== 'T' && j % 4 === 0 ? 'S' : undefined), 3);
    const ax = TW / 2;
    const ay = TOP + TH / 2 - 32;
    for (const [dx, dy] of [[-4, -1], [-5, -3], [-4, -5], [4, -1], [5, -3], [4, -5], [-7, -3], [7, -3], [0, -2], [0, -3]]) p.set(ax + dx, ay + dy, dx === 0 ? 'r' : 'c');
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
  scaffold: (p) =>
    p.box(2, 13, 'S', (face, _u, j, i) => {
      if (face === 'T') return null;
      if (j === 12 && i % 3 === 0) return 'y';
      return i % 6 === 0 || j % 4 === 0 || (i + j) % 6 === 0 ? undefined : null;
    }),
  // Scenery. These never go in the tap list, so the tile under them stays buildable.
  bush: (p) => {
    p.shadow(5);
    p.blob(-3, 3, 4, 'G');
    p.blob(3, 2, 3.5, 'g');
  },
  flowers: (p) => {
    // Three small clumps: a stem pixel with a petal on top.
    for (const [dx, dy, c] of [[-6, 0, 'y'], [-3, 3, 'p'], [5, 1, 'w'], [2, -2, 'y']] as const) {
      p.set(TW / 2 + dx, TOP + TH / 2 + dy, 'G');
      p.set(TW / 2 + dx, TOP + TH / 2 + dy - 1, c);
    }
  },
  rumput: (p) => {
    for (const [dx, dy] of [[-4, 1], [-3, 0], [-2, 1], [3, -1], [4, -2], [5, -1]]) p.set(TW / 2 + dx, TOP + TH / 2 + dy, '#577a3c');
  },
  pisang: (p) => {
    p.shadow(5);
    p.box(7, 9, 'G');
    for (const [dx, up, r] of [[-5, 12, 4], [5, 13, 4], [0, 15, 4], [-2, 10, 3], [3, 10, 3]]) p.blob(dx, up, r, 'g');
  },
  kelapa: (p) => {
    p.shadow(5);
    // A slightly leaning trunk, then fronds that droop on both sides.
    for (let k = 0; k < 26; k++) {
      const x = TW / 2 + Math.round(Math.sin(k / 9) * 2);
      p.set(x, TOP + TH / 2 - k, k % 3 ? 'n' : 'N');
      p.set(x + 1, TOP + TH / 2 - k, 'N');
    }
    const tx = TW / 2 + Math.round(Math.sin(26 / 9) * 2);
    const ty = TOP + TH / 2 - 26;
    for (let k = 1; k <= 9; k++) {
      const droop = Math.round((k * k) / 12);
      for (const dir of [-1, 1]) {
        p.set(tx + dir * k, ty + droop, 'G');
        p.set(tx + dir * k, ty + droop - 1, 'g');
        p.set(tx + Math.round(dir * k * 0.5), ty - Math.round(k * 0.6) + Math.round(droop / 2), 'g');
      }
    }
    p.set(tx, ty + 1, 'n');
    p.set(tx + 1, ty + 1, 'N');
  },
  pohon: (p) => {
    p.shadow(4);
    p.box(7, 8, 'N');
    p.blob(0, 16, 8, 'G');
    p.blob(-3, 19, 4, 'g');
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
