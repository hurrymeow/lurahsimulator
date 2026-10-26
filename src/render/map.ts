import { rupiahShort } from '../format';
import { def } from '../sim/content';
import { GRID_H, GRID_W, type GameState, type ResourceId } from '../sim/types';
import { ICONS, ROOF_COLOURS, sprite } from './sprites';

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

const MIN_TILE = 32;
const POP_MS = 1200;
const BURST_MS = 600;

export class MapView {
  tile = 32;
  ox = 0;
  oy = 0;
  effects = true;
  private pops: Pop[] = [];
  private bursts: Burst[] = [];
  private grass: HTMLCanvasElement | null = null;
  ghost: Ghost | null = null;
  selected: number | null = null;

  constructor(private canvas: HTMLCanvasElement) {}

  resize(): void {
    const dpr = window.devicePixelRatio || 1;
    const { clientWidth: w, clientHeight: h } = this.canvas;
    this.canvas.width = Math.round(w * dpr);
    this.canvas.height = Math.round(h * dpr);
    // Tiles stay at least 32px so they are easy to hit. A smaller screen pans instead of shrinking.
    this.tile = Math.max(MIN_TILE, Math.floor(Math.min(w / GRID_W, h / GRID_H)));
    this.viewW = w;
    this.viewH = h;
    this.clampPan();
    this.grass = null;
  }

  private viewW = 0;
  private viewH = 0;
  private panX = 0;
  private panY = 0;

  private clampPan(): void {
    const gw = this.tile * GRID_W;
    const gh = this.tile * GRID_H;
    this.panX = gw <= this.viewW ? 0 : Math.max(this.viewW - gw, Math.min(0, this.panX));
    this.panY = gh <= this.viewH ? 0 : Math.max(this.viewH - gh, Math.min(0, this.panY));
    this.ox = Math.floor(gw <= this.viewW ? (this.viewW - gw) / 2 : this.panX);
    this.oy = Math.floor(gh <= this.viewH ? (this.viewH - gh) / 2 : this.panY);
  }

  panBy(dx: number, dy: number): void {
    this.panX += dx;
    this.panY += dy;
    this.clampPan();
  }

  /** True when the grid is bigger than the view, so dragging pans. */
  get scrolls(): boolean {
    return this.tile * GRID_W > this.viewW || this.tile * GRID_H > this.viewH;
  }

  tileAt(px: number, py: number): { x: number; y: number } | null {
    const x = Math.floor((px - this.ox) / this.tile);
    const y = Math.floor((py - this.oy) / this.tile);
    return x >= 0 && y >= 0 && x < GRID_W && y < GRID_H ? { x, y } : null;
  }

  /** Screen position of a tile centre, relative to the canvas. */
  tileCentre(x: number, y: number): { x: number; y: number } {
    return { x: this.ox + (x + 0.5) * this.tile, y: this.oy + (y + 0.5) * this.tile };
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

  private drawGrass(): HTMLCanvasElement {
    if (this.grass) return this.grass;
    const c = document.createElement('canvas');
    const t = this.tile;
    c.width = t * GRID_W;
    c.height = t * GRID_H;
    const ctx = c.getContext('2d')!;
    for (let y = 0; y < GRID_H; y++)
      for (let x = 0; x < GRID_W; x++) {
        ctx.fillStyle = (x + y) % 2 ? '#3d5f2b' : '#43672f';
        ctx.fillRect(x * t, y * t, t, t);
        const px = Math.max(2, Math.floor(t / 12));
        let seed = x * 31 + y * 17;
        for (let i = 0; i < 3; i++) {
          seed = (seed * 9301 + 49297) % 233280;
          const gx = (seed % 10) + 1;
          const gy = ((seed >> 4) % 10) + 1;
          ctx.fillStyle = '#577a3c';
          ctx.fillRect(x * t + gx * px, y * t + gy * px, px, px);
        }
      }
    this.grass = c;
    return c;
  }

  draw(s: GameState): void {
    const ctx = this.canvas.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const now = performance.now();
    const t = this.tile;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = '#0b0b0c';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.drawImage(this.drawGrass(), this.ox, this.oy);

    const sorted = [...s.buildings].sort((a, b) => a.y - b.y);
    for (const b of sorted) {
      const x = this.ox + b.x * t;
      const y = this.oy + b.y * t;
      const d = def(b.def);
      const recolor: [string, string] | undefined = b.def === 'rumah' ? ['o', ROOF_COLOURS[b.uid % ROOF_COLOURS.length]] : undefined;
      if (b.status === 'permit') {
        ctx.globalAlpha = 0.35;
        ctx.drawImage(sprite(d.sprite), x, y, t, t);
        ctx.globalAlpha = 1;
        ctx.drawImage(sprite('permit'), x, y, t, t);
        this.badge(ctx, x, y, `${b.timer}`);
      } else if (b.status === 'building') {
        ctx.globalAlpha = 0.5;
        ctx.drawImage(sprite(d.sprite), x, y, t, t);
        ctx.globalAlpha = 1;
        ctx.drawImage(sprite('scaffold'), x, y, t, t);
        this.badge(ctx, x, y, `${b.timer}`);
      } else if (b.status === 'mangkrak') {
        ctx.filter = 'grayscale(1) brightness(0.7)';
        ctx.drawImage(sprite(d.sprite), x, y, t, t);
        ctx.filter = 'none';
        ctx.drawImage(sprite('scaffold'), x, y, t, t);
        this.badge(ctx, x, y, '80%');
      } else if (b.status === 'damaged') {
        ctx.filter = 'sepia(1) brightness(0.6)';
        ctx.drawImage(sprite(d.sprite, recolor), x, y, t, t);
        ctx.filter = 'none';
        this.badge(ctx, x, y, '!');
      } else {
        const born = this.spawned.get(b.uid);
        const k = born === undefined ? 1 : Math.min(1, (now - born) / 350);
        if (k >= 1) this.spawned.delete(b.uid);
        const sc = 0.6 + 0.4 * (1 - (1 - k) ** 3);
        ctx.drawImage(sprite(d.sprite, recolor), x + (t * (1 - sc)) / 2, y + t * (1 - sc), t * sc, t * sc);
        if (b.level > 1) this.levelPips(ctx, x, y, b.level);
      }
      if (this.selected === b.uid) {
        ctx.strokeStyle = '#f4f4f5';
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 1, y + 1, t - 2, t - 2);
      }
    }

    if (this.ghost) {
      const g = this.ghost;
      const x = this.ox + g.x * t;
      const y = this.oy + g.y * t;
      ctx.globalAlpha = 0.6;
      ctx.drawImage(sprite(g.sprite), x, y, t, t);
      ctx.globalAlpha = 1;
      ctx.strokeStyle = g.ok ? '#4ade80' : '#f87171';
      ctx.lineWidth = 2;
      ctx.setLineDash(g.ok ? [] : [4, 3]);
      ctx.strokeRect(x + 1, y + 1, t - 2, t - 2);
      ctx.setLineDash([]);
    }

    this.bursts = this.bursts.filter((b) => now - b.born < BURST_MS);
    for (const b of this.bursts) {
      const k = (now - b.born) / BURST_MS;
      const c = this.tileCentre(b.x, b.y);
      ctx.strokeStyle = `rgba(250, 204, 21, ${1 - k})`;
      ctx.lineWidth = 3;
      ctx.strokeRect(c.x - (t / 2) * (1 + k), c.y - (t / 2) * (1 + k), t * (1 + k), t * (1 + k));
    }

    this.pops = this.pops.filter((p) => now - p.born < POP_MS);
    ctx.font = '700 16px "Atkinson Hyperlegible", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    // Pops on neighbouring tiles are wider than a tile, so nudge each one up until it clears the others.
    const placed: { x: number; y: number; w: number }[] = [];
    for (const p of this.pops) {
      const age = now - p.born;
      if (age < 0) continue;
      const k = age / POP_MS;
      const c = this.tileCentre(p.x, p.y);
      const rise = this.effects ? k * t * 0.8 : 0;
      const w = ctx.measureText(p.text).width + 20;
      let lift = p.dy;
      while (placed.some((o) => Math.abs(o.x - c.x) < (o.w + w) / 2 && Math.abs(o.y - (c.y - t * 0.4 - lift)) < 22)) lift += 22;
      placed.push({ x: c.x, y: c.y - t * 0.4 - lift, w });
      const py = c.y - t * 0.4 - rise - lift;
      ctx.globalAlpha = this.effects ? Math.min(1, 2 - 2 * k) : 1;
      ctx.fillStyle = 'rgba(11, 11, 12, 0.85)';
      ctx.fillRect(c.x - w / 2 - 2, py - 10, w + 4, 20);
      ctx.drawImage(sprite(p.res, undefined, ICONS), c.x - w / 2 + 2, py - 5, 10, 10);
      ctx.fillStyle = RES_COLOUR[p.res];
      ctx.fillText(p.text, c.x + 6, py + 1);
      ctx.globalAlpha = 1;
    }
  }

  private badge(ctx: CanvasRenderingContext2D, x: number, y: number, text: string): void {
    ctx.font = '700 16px "Atkinson Hyperlegible", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const w = Math.max(20, ctx.measureText(text).width + 8);
    ctx.fillStyle = '#0b0b0c';
    ctx.fillRect(x + this.tile - w, y, w, 20);
    ctx.fillStyle = '#f4f4f5';
    ctx.fillText(text, x + this.tile - w / 2, y + 11);
  }

  private levelPips(ctx: CanvasRenderingContext2D, x: number, y: number, level: number): void {
    for (let i = 0; i < level; i++) {
      ctx.fillStyle = '#0b0b0c';
      ctx.fillRect(x + 2 + i * 7, y + this.tile - 8, 6, 6);
      ctx.fillStyle = '#facc15';
      ctx.fillRect(x + 3 + i * 7, y + this.tile - 7, 4, 4);
    }
  }

  get busy(): boolean {
    return this.pops.length > 0 || this.bursts.length > 0;
  }
}
