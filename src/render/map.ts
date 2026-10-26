import { rupiahShort } from '../format';
import { def } from '../sim/content';
import { GRID_H, GRID_W, type Building, type GameState, type ResourceId } from '../sim/types';
import { iso, TH, TOP, TW, type Art } from './iso';
import { ICONS, PALETTE, ROOF_COLOURS, sprite } from './sprites';

export const RES_COLOUR: Record<ResourceId, string> = {
  rupiah: '#4ade80',
  sabar: '#60a5fa',
  orangDalam: '#fbbf24',
  viral: '#f472b6',
};

interface Pop {
  x: number;
  y: number;
  text: string;
  res: ResourceId;
  born: number;
  dy: number;
}

interface Burst {
  x: number;
  y: number;
  born: number;
}

export interface Ghost {
  x: number;
  y: number;
  ok: boolean;
  sprite: string;
}

interface Hit {
  x: number;
  y: number;
  left: number;
  top: number;
  art: Art;
}

/** Diamonds are at least 32px tall, so the tap area matches a 32px square. */
const MIN_SCALE = 2;
const POP_MS = 1200;
const BURST_MS = 600;
/** Dirt edge under the map, in art pixels. */
const DEPTH = 6;
/** Art-pixel size of the whole map, from the left corner to the right and from the headroom to the dirt edge. */
const MAP_W = ((GRID_W + GRID_H) * TW) / 2;
const MAP_H = TOP + ((GRID_W + GRID_H) * TH) / 2 + DEPTH;

export class MapView {
  /** Art pixels to CSS pixels. */
  scale = MIN_SCALE;
  /** Diamond height in CSS pixels, the narrowest part of a tap target. */
  tile = TH * MIN_SCALE;
  /** CSS position of tile (0,0)'s top corner. */
  ox = 0;
  oy = 0;
  effects = true;
  private pops: Pop[] = [];
  private bursts: Burst[] = [];
  private ground: HTMLCanvasElement | null = null;
  private hits: Hit[] = [];
  ghost: Ghost | null = null;
  selected: number | null = null;

  constructor(private canvas: HTMLCanvasElement) {}

  private viewW = 0;
  private viewH = 0;
  private panX = 0;
  private panY = 0;
  private centred = false;

  resize(): void {
    const dpr = window.devicePixelRatio || 1;
    const { clientWidth: w, clientHeight: h } = this.canvas;
    this.canvas.width = Math.round(w * dpr);
    this.canvas.height = Math.round(h * dpr);
    // Whole-number scale keeps pixels crisp. A small screen pans instead of shrinking tiles.
    this.scale = Math.max(MIN_SCALE, Math.floor(Math.min(w / MAP_W, h / MAP_H)));
    this.tile = TH * this.scale;
    this.viewW = w;
    this.viewH = h;
    if (!this.centred && w > 0) {
      // Open on the middle of the kampung, where the Kantor RT stands.
      this.panX = (w - MAP_W * this.scale) / 2;
      this.panY = (h - MAP_H * this.scale) / 2;
      this.centred = true;
    }
    this.clampPan();
  }

  private clampPan(): void {
    const gw = MAP_W * this.scale;
    const gh = MAP_H * this.scale;
    this.panX = gw <= this.viewW ? 0 : Math.max(this.viewW - gw, Math.min(0, this.panX));
    this.panY = gh <= this.viewH ? 0 : Math.max(this.viewH - gh, Math.min(0, this.panY));
    const left = Math.floor(gw <= this.viewW ? (this.viewW - gw) / 2 : this.panX);
    const top = Math.floor(gh <= this.viewH ? (this.viewH - gh) / 2 : this.panY);
    this.ox = left + (GRID_H * TW * this.scale) / 2;
    this.oy = top + TOP * this.scale;
  }

  panBy(dx: number, dy: number): void {
    this.panX += dx;
    this.panY += dy;
    this.clampPan();
  }

  /** True when the map is bigger than the view, so dragging pans. */
  get scrolls(): boolean {
    return MAP_W * this.scale > this.viewW || MAP_H * this.scale > this.viewH;
  }

  /** CSS position of a tile's top corner. */
  private corner(x: number, y: number): { x: number; y: number } {
    return { x: this.ox + ((x - y) * TW * this.scale) / 2, y: this.oy + ((x + y) * TH * this.scale) / 2 };
  }

  /**
   * Tile under a point. With buildings on, a tap on a tall building's body picks that building's
   * tile, front-most first, instead of the ground tile behind it.
   */
  tileAt(px: number, py: number, buildings = false): { x: number; y: number } | null {
    if (buildings)
      for (let k = this.hits.length - 1; k >= 0; k--) {
        const h = this.hits[k];
        const ax = Math.floor((px - h.left) / this.scale);
        const ay = Math.floor((py - h.top) / this.scale);
        if (ax >= 0 && ay >= 0 && ax < h.art.canvas.width && ay < h.art.canvas.height && h.art.alpha[ay * h.art.canvas.width + ax] > 0) return { x: h.x, y: h.y };
      }
    const a = (px - this.ox) / ((TW * this.scale) / 2);
    const b = (py - this.oy) / ((TH * this.scale) / 2);
    const x = Math.floor((a + b) / 2);
    const y = Math.floor((b - a) / 2);
    return x >= 0 && y >= 0 && x < GRID_W && y < GRID_H ? { x, y } : null;
  }

  /** Screen position of a tile's ground centre, relative to the canvas. */
  tileCentre(x: number, y: number): { x: number; y: number } {
    const c = this.corner(x, y);
    return { x: c.x, y: c.y + (TH * this.scale) / 2 };
  }

  pop(x: number, y: number, res: ResourceId, amount: number): void {
    const text = res === 'rupiah' ? rupiahShort(amount) : `${amount > 0 ? '+' : ''}${Math.round(amount * 10) / 10}`;
    // Several resources on one tile stack upward instead of overlapping.
    const stack = this.pops.filter((p) => p.x === x && p.y === y && performance.now() - p.born < POP_MS).length;
    this.pops.push({ x, y, text, res, born: performance.now(), dy: stack * 22 });
  }

  private spawned = new Map<number, number>();

  /** A finished building pops in with a short scale-up. */
  spawn(uid: number): void {
    if (this.effects) this.spawned.set(uid, performance.now());
  }

  burst(x: number, y: number): void {
    if (this.effects) this.bursts.push({ x, y, born: performance.now() });
  }

  /** Grass diamonds plus the dirt edge, drawn once at art resolution. */
  private drawGround(): HTMLCanvasElement {
    if (this.ground) return this.ground;
    const c = document.createElement('canvas');
    c.width = MAP_W;
    c.height = MAP_H;
    const ctx = c.getContext('2d')!;
    const img = ctx.createImageData(MAP_W, MAP_H);
    const put = (x: number, y: number, col: string) => {
      const n = parseInt(col.slice(1), 16);
      img.data.set([(n >> 16) & 255, (n >> 8) & 255, n & 255, 255], (y * MAP_W + x) * 4);
    };
    const mx = (GRID_H * TW) / 2;
    for (let y = 0; y < MAP_H; y++)
      for (let x = 0; x < MAP_W; x++) {
        const rx = (x + 0.5 - mx) / (TW / 2);
        const ry = (y + 0.5 - TOP) / (TH / 2);
        const a = (rx + ry) / 2;
        const b = (ry - rx) / 2;
        const tx = Math.floor(a);
        const ty = Math.floor(b);
        if (tx >= 0 && ty >= 0 && tx < GRID_W && ty < GRID_H) {
          const seed = (x * 7919 + y * 104729) % 97;
          put(x, y, seed < 3 ? '#577a3c' : (tx + ty) % 2 ? '#3d5f2b' : '#43672f');
          continue;
        }
        // Dirt edge below the two front sides of the diamond.
        const front = x < mx + ((GRID_W - GRID_H) * TW) / 2;
        const edge = front ? TOP + (GRID_H * TH) / 2 + (x + 0.5) / 2 : TOP + ((GRID_W + GRID_H) * TH) / 2 - (x + 0.5 - (mx + ((GRID_W - GRID_H) * TW) / 2)) / 2;
        if (y + 0.5 > edge && y + 0.5 <= edge + DEPTH) put(x, y, front ? PALETTE.n : PALETTE.N);
      }
    ctx.putImageData(img, 0, 0);
    this.ground = c;
    return c;
  }

  /** Draws art for a tile. Returns where it landed, for tap picking. */
  private art(ctx: CanvasRenderingContext2D, art: Art, x: number, y: number, grow = 1): Hit {
    const c = this.corner(x, y);
    const s = this.scale;
    const left = c.x - (TW * s) / 2;
    const top = c.y - TOP * s;
    if (grow < 1) {
      // Scale up from the tile's ground centre, so the building rises out of its plot.
      const gx = c.x;
      const gy = c.y + (TH * s) / 2;
      const w = art.canvas.width * s * grow;
      const h = art.canvas.height * s * grow;
      ctx.drawImage(art.canvas, gx - w / 2, gy - (TOP + TH / 2) * s * grow, w, h);
    } else ctx.drawImage(art.canvas, left, top, art.canvas.width * s, art.canvas.height * s);
    return { x, y, left, top, art };
  }

  /** Flat 2D sprite standing on the tile centre, used for the permit sign. */
  private sign(ctx: CanvasRenderingContext2D, name: string, x: number, y: number): void {
    const c = this.tileCentre(x, y);
    const src = sprite(name);
    const w = src.width * this.scale;
    ctx.drawImage(src, c.x - w / 2, c.y - w, w, w);
  }

  private diamond(ctx: CanvasRenderingContext2D, x: number, y: number, grow = 0): void {
    const c = this.tileCentre(x, y);
    const hw = ((TW * this.scale) / 2) * (1 + grow);
    const hh = ((TH * this.scale) / 2) * (1 + grow);
    ctx.beginPath();
    ctx.moveTo(c.x, c.y - hh);
    ctx.lineTo(c.x + hw, c.y);
    ctx.lineTo(c.x, c.y + hh);
    ctx.lineTo(c.x - hw, c.y);
    ctx.closePath();
  }

  /** Top of a tile's art, in CSS pixels, for badges and pops. */
  private artTop(x: number, y: number, art: Art | null): number {
    return this.tileCentre(x, y).y - (art ? art.height : 0) * this.scale;
  }

  private variant(s: GameState, b: Building): string | undefined {
    if (b.def === 'rumah') return ROOF_COLOURS[b.uid % ROOF_COLOURS.length];
    if (b.def !== 'selokan') return undefined;
    const has = (dx: number, dy: number) => s.buildings.some((o) => o.def === 'selokan' && o.x === b.x + dx && o.y === b.y + dy);
    return !has(1, 0) && !has(-1, 0) && (has(0, 1) || has(0, -1)) ? 'y' : undefined;
  }

  draw(s: GameState): void {
    const ctx = this.canvas.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const now = performance.now();
    const sc = this.scale;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = '#0b0b0c';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.drawImage(this.drawGround(), this.ox - (GRID_H * TW * sc) / 2, this.oy - TOP * sc, MAP_W * sc, MAP_H * sc);

    const sel = s.buildings.find((b) => b.uid === this.selected);
    if (sel) {
      this.diamond(ctx, sel.x, sel.y);
      ctx.fillStyle = 'rgba(244, 244, 245, 0.25)';
      ctx.fill();
    }
    if (this.ghost) {
      this.diamond(ctx, this.ghost.x, this.ghost.y);
      ctx.fillStyle = this.ghost.ok ? 'rgba(74, 222, 128, 0.35)' : 'rgba(248, 113, 113, 0.35)';
      ctx.fill();
    }

    // Back to front: tiles further up the screen draw first.
    const sorted = [...s.buildings].sort((a, b) => a.x + a.y - (b.x + b.y) || a.x - b.x);
    const tops = new Map<number, number>();
    this.hits = [];
    for (const b of sorted) {
      const d = def(b.def);
      const art = iso(d.sprite, this.variant(s, b));
      if (b.status === 'permit') {
        ctx.globalAlpha = 0.35;
        this.hits.push(this.art(ctx, art, b.x, b.y));
        ctx.globalAlpha = 1;
        this.sign(ctx, 'permit', b.x, b.y);
      } else if (b.status === 'building') {
        ctx.globalAlpha = 0.5;
        this.hits.push(this.art(ctx, art, b.x, b.y));
        ctx.globalAlpha = 1;
        this.art(ctx, iso('scaffold'), b.x, b.y);
      } else if (b.status === 'mangkrak') {
        ctx.filter = 'grayscale(1) brightness(0.7)';
        this.hits.push(this.art(ctx, art, b.x, b.y));
        ctx.filter = 'none';
        this.art(ctx, iso('scaffold'), b.x, b.y);
      } else if (b.status === 'damaged') {
        ctx.filter = 'sepia(1) brightness(0.6)';
        this.hits.push(this.art(ctx, art, b.x, b.y));
        ctx.filter = 'none';
      } else {
        const born = this.spawned.get(b.uid);
        const k = born === undefined ? 1 : Math.min(1, (now - born) / 350);
        if (k >= 1) this.spawned.delete(b.uid);
        this.hits.push(this.art(ctx, art, b.x, b.y, 0.6 + 0.4 * (1 - (1 - k) ** 3)));
        if (b.level > 1) this.levelPips(ctx, b.x, b.y, b.level);
      }
      tops.set(b.y * GRID_W + b.x, this.artTop(b.x, b.y, b.status === 'building' || b.status === 'mangkrak' ? iso('scaffold') : art));
    }

    // Badges sit above every building so a taller neighbour in front never hides them.
    for (const b of sorted) {
      const label = b.status === 'permit' || b.status === 'building' ? `${b.timer}` : b.status === 'mangkrak' ? '80%' : b.status === 'damaged' ? '!' : null;
      if (label) this.badge(ctx, this.tileCentre(b.x, b.y).x, tops.get(b.y * GRID_W + b.x)! - 12, label);
    }

    if (this.ghost) {
      const g = this.ghost;
      ctx.globalAlpha = 0.6;
      this.art(ctx, iso(g.sprite), g.x, g.y);
      ctx.globalAlpha = 1;
      this.diamond(ctx, g.x, g.y);
      ctx.strokeStyle = g.ok ? '#4ade80' : '#f87171';
      ctx.lineWidth = 2;
      ctx.setLineDash(g.ok ? [] : [4, 3]);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    if (sel) {
      this.diamond(ctx, sel.x, sel.y);
      ctx.strokeStyle = '#f4f4f5';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    this.bursts = this.bursts.filter((b) => now - b.born < BURST_MS);
    for (const b of this.bursts) {
      const k = (now - b.born) / BURST_MS;
      ctx.strokeStyle = `rgba(250, 204, 21, ${1 - k})`;
      ctx.lineWidth = 3;
      this.diamond(ctx, b.x, b.y, k);
      ctx.stroke();
    }

    this.pops = this.pops.filter((p) => now - p.born < POP_MS);
    ctx.font = '700 16px "Atkinson Hyperlegible", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    // Pops on neighbouring tiles are wider than a tile, so nudge each one up until it clears the others.
    const placed: { x: number; y: number; w: number }[] = [];
    const rise = this.tile * 1.2;
    for (const p of this.pops) {
      const age = now - p.born;
      if (age < 0) continue;
      const k = age / POP_MS;
      const cx = this.tileCentre(p.x, p.y).x;
      const base = (tops.get(p.y * GRID_W + p.x) ?? this.tileCentre(p.x, p.y).y) - 14;
      const w = ctx.measureText(p.text).width + 20;
      let lift = p.dy;
      while (placed.some((o) => Math.abs(o.x - cx) < (o.w + w) / 2 && Math.abs(o.y - (base - lift)) < 22)) lift += 22;
      placed.push({ x: cx, y: base - lift, w });
      const py = base - (this.effects ? k * rise : 0) - lift;
      ctx.globalAlpha = this.effects ? Math.min(1, 2 - 2 * k) : 1;
      ctx.fillStyle = 'rgba(11, 11, 12, 0.85)';
      ctx.fillRect(cx - w / 2 - 2, py - 10, w + 4, 20);
      ctx.drawImage(sprite(p.res, undefined, ICONS), cx - w / 2 + 2, py - 5, 10, 10);
      ctx.fillStyle = RES_COLOUR[p.res];
      ctx.fillText(p.text, cx + 6, py + 1);
      ctx.globalAlpha = 1;
    }
  }

  private badge(ctx: CanvasRenderingContext2D, cx: number, cy: number, text: string): void {
    ctx.font = '700 16px "Atkinson Hyperlegible", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const w = Math.max(20, ctx.measureText(text).width + 8);
    ctx.fillStyle = '#0b0b0c';
    ctx.fillRect(cx - w / 2, cy - 10, w, 20);
    ctx.strokeStyle = '#f4f4f5';
    ctx.lineWidth = 1;
    ctx.strokeRect(cx - w / 2 + 0.5, cy - 9.5, w - 1, 19);
    ctx.fillStyle = '#f4f4f5';
    ctx.fillText(text, cx, cy + 1);
  }

  /** Level pips along the tile's front corner. */
  private levelPips(ctx: CanvasRenderingContext2D, x: number, y: number, level: number): void {
    const c = this.tileCentre(x, y);
    const by = c.y + (TH * this.scale) / 2 - 10;
    const left = c.x - (level * 7) / 2;
    for (let i = 0; i < level; i++) {
      ctx.fillStyle = '#0b0b0c';
      ctx.fillRect(left + i * 7, by, 6, 6);
      ctx.fillStyle = '#facc15';
      ctx.fillRect(left + 1 + i * 7, by + 1, 4, 4);
    }
  }

  get busy(): boolean {
    return this.pops.length > 0 || this.bursts.length > 0;
  }
}
