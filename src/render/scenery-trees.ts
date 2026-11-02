// Small scenery trees for the woods, plantations and islands round the kampung, drawn natively at
// their own size instead of shrunk from the buildable tree sprites (shrinking breaks their outlines).
// Same rules as every sprite: whole pixels, two-tone cel shading lit from the top left, and a 1px
// coloured outline in a 0.45x shade of the fill it touches (ART.md, Outlines).

export type SceneryTreeName = 'pohon' | 'kelapa' | 'pisang' | 'bush' | 'sawit';

export interface SceneryTree {
  canvas: HTMLCanvasElement;
  /** The root pixel inside the canvas: the trunk's foot, where the tree meets the ground. */
  rx: number;
  ry: number;
}

const cache = new Map<string, SceneryTree>();

function hash(x: number, y: number): number {
  let h = (x * 374761393 + y * 668265263) ^ 0x2c1b3c6d;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

const hex = (c: string) => parseInt(c.slice(1), 16);

/** A small pixel buffer with a coloured outline pass. */
class Px {
  readonly c: (number | null)[];
  constructor(readonly w: number, readonly h: number) {
    this.c = new Array(w * h).fill(null);
  }
  set(x: number, y: number, col: string): void {
    x = Math.round(x);
    y = Math.round(y);
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
    this.c[y * this.w + x] = hex(col);
  }
  has(x: number, y: number): boolean {
    return x >= 0 && y >= 0 && x < this.w && y < this.h && this.c[y * this.w + x] !== null;
  }
  /** Outline: each empty pixel next to a fill takes a 0.45x shade of it, the fill below first, then the sides, then above. */
  finish(): HTMLCanvasElement {
    const out = this.c.slice();
    for (let y = 0; y < this.h; y++)
      for (let x = 0; x < this.w; x++) {
        if (this.c[y * this.w + x] !== null) continue;
        let src: number | null = null;
        for (const [dx, dy] of [[0, 1], [-1, 0], [1, 0], [0, -1]]) {
          const xx = x + dx;
          const yy = y + dy;
          if (xx < 0 || yy < 0 || xx >= this.w || yy >= this.h) continue;
          const v = this.c[yy * this.w + xx];
          if (v !== null) {
            src = v;
            break;
          }
        }
        if (src !== null) out[y * this.w + x] = (Math.round(((src >> 16) & 255) * 0.45) << 16) | (Math.round(((src >> 8) & 255) * 0.45) << 8) | Math.round((src & 255) * 0.45);
      }
    const cv = document.createElement('canvas');
    cv.width = this.w;
    cv.height = this.h;
    const ctx = cv.getContext('2d')!;
    const img = ctx.createImageData(this.w, this.h);
    out.forEach((v, i) => {
      if (v === null) return;
      img.data.set([(v >> 16) & 255, (v >> 8) & 255, v & 255, 255], i * 4);
    });
    ctx.putImageData(img, 0, 0);
    return cv;
  }
}

/**
 * A tropical canopy tree, not a ball of foliage: a short trunk forking into two or three flat, wide
 * tiers of leaves with ragged edges, each tier lit on its top left and closed by a dark underside, so
 * the crown reads as layered shade like a trembesi or mahogany.
 */
function pohon(H: number, v: number): SceneryTree {
  const W = Math.round(H * 1.15) + 4;
  const p = new Px(W, H + 3);
  const rx = Math.floor(W / 2) + (v % 2 ? 0 : -1);
  const ry = H + 1;
  const th = Math.max(3, Math.round(H * 0.38));
  const thick = H >= 15 ? 2 : 1;
  // Trunk, with a fork into the crown.
  for (let y = 0; y < th; y++)
    for (let t = 0; t < thick; t++) p.set(rx + t, ry - y, t === 0 ? '#7a4a2a' : '#5a3420');
  const fork = Math.round(th * 0.6);
  for (let k = 1; k <= 2; k++) {
    p.set(rx - k, ry - fork - k, '#6a3e24');
    p.set(rx + thick - 1 + k, ry - fork - k - 1, '#5a3420');
  }
  // Tiers from the top down: narrower above, wider below, each a flat ragged slab.
  const tiers = H >= 13 ? 3 : 2;
  const top = ry - H + 1;
  const crownH = ry - th + 1 - top;
  const LIT = ['#9ccc5c', '#86b84c'];
  const BASE = '#5f9a3c';
  const SHADE = '#457a30';
  const UNDER = '#2f5a24';
  for (let i = 0; i < tiers; i++) {
    const cy = top + Math.round(((i + 0.5) / tiers) * crownH);
    const half = (W / 2 - 2) * (0.62 + 0.38 * (i / Math.max(1, tiers - 1))) * (0.9 + hash(v, i) * 0.2);
    const cx = rx + (hash(v + 7, i) - 0.5) * 3;
    const ry2 = Math.max(1.5, crownH / tiers / 1.4);
    for (let y = Math.floor(cy - ry2 - 1); y <= Math.ceil(cy + ry2); y++)
      for (let x = Math.floor(cx - half - 1); x <= Math.ceil(cx + half + 1); x++) {
        const dx = (x - cx) / half;
        const dy = (y - cy) / ry2;
        // Flat slab: square-ish ends, a ragged rim from noise.
        const edge = 1 - (hash(x * 3 + v, y * 5 + i) - 0.5) * 0.5;
        if (dx * dx * dx * dx + dy * dy > edge) continue;
        const col = dy > 0.55 ? UNDER : dy < -0.35 ? (dx < 0.2 ? LIT[hash(x, y + v) < 0.3 ? 0 : 1] : BASE) : dx > 0.45 ? SHADE : BASE;
        p.set(x, y, col);
      }
  }
  return { canvas: p.finish(), rx, ry };
}

/** A coconut palm: a thin ringed trunk leaning a little, a crown of drooping fronds and a few nuts. */
function kelapa(H: number, v: number): SceneryTree {
  const W = Math.round(H * 1.1) + 6;
  const p = new Px(W, H + 3);
  const rx = Math.floor(W / 2);
  const ry = H + 1;
  const th = Math.round(H * 0.72);
  const lean = (v % 2 ? 1 : -1) * (1.5 + (v % 3));
  for (let y = 0; y < th; y++) {
    const x = rx + lean * (y / th) ** 2;
    p.set(x, ry - y, y % 3 === 0 ? '#6e5236' : '#8a6a45');
    if (y < 3) p.set(x + 1, ry - y, '#6e5236');
  }
  const cx = rx + lean;
  const cy = ry - th;
  const L = H * 0.42;
  for (let f = 0; f < 7; f++) {
    const ang = Math.PI * (0.05 + f / 6.0 * 0.9) + (hash(v, f) - 0.5) * 0.25;
    const dir = Math.cos(ang) < 0 ? -1 : 1;
    for (let s = 1; s <= L; s++) {
      const u = s / L;
      const x = cx + Math.cos(ang) * s * 1.2;
      const y = cy - Math.sin(ang) * s * 0.6 + u * u * L * 0.7;
      p.set(x, y, u < 0.5 ? '#86b84c' : '#5f9a3c');
      // Leaflets hang under the rib.
      if (s > 1) p.set(x, y + 1, dir < 0 ? '#6a9e3e' : '#4a7a30');
    }
  }
  p.set(cx - 1, cy + 1, '#7a5a2a');
  p.set(cx + 1, cy + 1, '#6a4a22');
  return { canvas: p.finish(), rx, ry };
}

/**
 * An oil palm (sawit): a short, stout trunk shaggy with old frond bases and a big round rosette of
 * stiff, arching fronds, darker and denser than a coconut, with an orange fruit bunch at its heart.
 */
function sawit(H: number, v: number): SceneryTree {
  const W = Math.round(H * 1.35) + 6;
  const p = new Px(W, H + 3);
  const rx = Math.floor(W / 2);
  const ry = H + 1;
  const th = Math.round(H * 0.42);
  for (let y = 0; y < th; y++) {
    p.set(rx, ry - y, y % 2 ? '#5a4a2a' : '#6e5a32');
    p.set(rx + 1, ry - y, y % 2 ? '#4a3c22' : '#5a4a2a');
    if (y % 2 === 0 && y > 1) p.set(rx - 1, ry - y, '#4f6a2a');
  }
  const cx = rx + 0.5;
  const cy = ry - th;
  const L = H * 0.56;
  for (let f = 0; f < 11; f++) {
    const ang = Math.PI * (f / 10) + (hash(v, f) - 0.5) * 0.2;
    for (let s = 1; s <= L; s++) {
      const u = s / L;
      const x = cx + Math.cos(ang) * s * 1.15;
      const y = cy - Math.sin(ang) * s * 0.75 + u * u * L * 0.45;
      const lit = Math.cos(ang) < 0.2 && Math.sin(ang) > 0.3;
      p.set(x, y, lit ? (u < 0.6 ? '#6fa844' : '#4f8a34') : u < 0.6 ? '#3f7a2c' : '#2f6224');
    }
  }
  p.set(cx - 1, cy + 1, '#c2502a');
  p.set(cx, cy + 1, '#d8663a');
  p.set(cx, cy + 2, '#a8401f');
  return { canvas: p.finish(), rx, ry };
}

/** A banana plant: a short pale stem and a few broad, arching leaves, a little torn. */
function pisang(H: number, v: number): SceneryTree {
  const W = Math.round(H * 1.1) + 4;
  const p = new Px(W, H + 3);
  const rx = Math.floor(W / 2);
  const ry = H + 1;
  const th = Math.round(H * 0.45);
  for (let y = 0; y < th; y++) p.set(rx, ry - y, y % 4 === 0 ? '#7a9a3e' : '#9ab650');
  const cy = ry - th;
  const L = H * 0.55;
  for (let f = 0; f < 4; f++) {
    const ang = Math.PI * (0.15 + f * 0.23) + (hash(v, f) - 0.5) * 0.2;
    for (let s = 1; s <= L; s++) {
      const u = s / L;
      const x = rx + Math.cos(ang) * s;
      const y = cy - Math.sin(ang) * s * 0.9 + u * u * L * 0.5;
      p.set(x, y, '#9ccc5c');
      if (hash(Math.round(x) + v, Math.round(y)) > 0.25) p.set(x, y + 1, '#5f9a3c');
    }
  }
  return { canvas: p.finish(), rx, ry };
}

/** A low, uneven bush: a flat clump lit on top, darker underneath. */
function bush(H: number, v: number): SceneryTree {
  const W = Math.round(H * 1.3) + 4;
  const h = Math.max(3, Math.round(H * 0.5));
  const p = new Px(W, h + 3);
  const rx = Math.floor(W / 2);
  const ry = h + 1;
  const half = W / 2 - 2;
  for (let y = ry - h + 1; y <= ry; y++)
    for (let x = rx - Math.ceil(half); x <= rx + Math.ceil(half); x++) {
      const dx = (x - rx) / half;
      const dy = (y - (ry - h / 2)) / (h / 2);
      if (dx * dx + dy * dy > 1 - (hash(x + v, y) - 0.5) * 0.5) continue;
      p.set(x, y, dy < -0.3 ? (dx < 0.3 ? '#8fbf55' : '#6fa244') : dy > 0.4 ? '#3f6e2c' : dx > 0.5 ? '#4f8236' : '#5f9a3c');
    }
  return { canvas: p.finish(), rx, ry };
}

const DRAW: Record<SceneryTreeName, (H: number, v: number) => SceneryTree> = { pohon, kelapa, sawit, pisang, bush };

/** A scenery tree of a kind at a height in pixels, in one of four variants. Cached. */
export function sceneryTree(name: SceneryTreeName, height: number, variant: number): SceneryTree {
  const H = Math.max(6, Math.round(height));
  const v = variant & 3;
  const key = `${name}:${H}:${v}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const t = DRAW[name](H, v);
  cache.set(key, t);
  return t;
}
