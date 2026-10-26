// Ambient light over the map, after the HD-2D look: a warm sun grade, slow god rays from the top
// left, a heavy vignette and drifting dust motes that turn into fireflies after dark. Every layer
// is baked at view size with plain alpha, so a frame costs one full-screen blit plus the motes.
// Effects only.

interface Mote {
  x: number;
  y: number;
  vx: number;
  vy: number;
  phase: number;
  size: number;
}

const MOTES = 28;
const LEAVES = 10;
const LEAF_COLOURS = ['#e57d2e', '#f4b935', '#df4a2c', '#c9a14a'];
const LEAF_EDGES = ['#7a3e14', '#7d5a14', '#6e2212', '#5e4a20'];

interface Leaf {
  x: number;
  y: number;
  vx: number;
  vy: number;
  phase: number;
  colour: string;
  edge: string;
}

function layer(w: number, h: number, dpr: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(w * dpr));
  c.height = Math.max(1, Math.round(h * dpr));
  const ctx = c.getContext('2d')!;
  ctx.scale(dpr, dpr);
  return [c, ctx];
}

export class Atmosphere {
  private w = 0;
  private h = 0;
  /** Grade, god rays and vignette baked into one layer, so daylight costs a single plain blit. */
  private day: HTMLCanvasElement | null = null;
  /** Just a deeper vignette, faded in after dark. */
  private dark: HTMLCanvasElement | null = null;
  private glow: HTMLCanvasElement | null = null;
  private motes: Mote[] = [];
  private tints = new Map<string, HTMLCanvasElement>();
  private leaves: Leaf[] = [];
  private last = 0;

  /** Rebuilds the cached layers when the view changes size. */
  private build(w: number, h: number): void {
    const dpr = window.devicePixelRatio || 1;
    this.w = w;
    this.h = h;

    // Blend modes like soft-light cost a full-screen pass per frame on slow phones, so every layer
    // is painted once with plain alpha and baked together.
    const vignette = (c: CanvasRenderingContext2D, edge: number) => {
      const g = c.createRadialGradient(w / 2, h * 0.48, Math.min(w, h) * 0.3, w / 2, h * 0.5, Math.hypot(w, h) * 0.62);
      g.addColorStop(0, 'rgba(26, 14, 8, 0)');
      g.addColorStop(0.6, `rgba(26, 14, 8, ${edge * 0.25})`);
      g.addColorStop(1, `rgba(26, 14, 8, ${edge})`);
      c.fillStyle = g;
      c.fillRect(0, 0, w, h);
    };

    const [day, ctx] = layer(w, h, dpr);
    // Warm key light from the top left, warm shade toward the bottom right.
    let g = ctx.createLinearGradient(0, 0, w * 0.6, h);
    g.addColorStop(0, 'rgba(255, 186, 84, 0.22)');
    g.addColorStop(0.45, 'rgba(255, 170, 80, 0.06)');
    g.addColorStop(1, 'rgba(36, 20, 10, 0.22)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    // God rays: soft diagonal shafts, brightest at the top and fading as they fall.
    ctx.save();
    ctx.translate(-w * 0.2, -h * 0.1);
    ctx.rotate(-0.5);
    for (const [x, width, a] of [[0.05, 0.1, 0.2], [0.24, 0.05, 0.14], [0.36, 0.14, 0.16], [0.58, 0.06, 0.1], [0.7, 0.1, 0.09]]) {
      g = ctx.createLinearGradient(0, 0, 0, h * 1.3);
      g.addColorStop(0, `rgba(255, 230, 170, ${a})`);
      g.addColorStop(0.7, 'rgba(255, 230, 170, 0)');
      ctx.fillStyle = g;
      ctx.fillRect(x * w * 1.6, 0, width * w, h * 1.4);
    }
    ctx.restore();
    // A deep warm vignette, as if the kampung were a diorama under a lamp.
    vignette(ctx, 0.62);
    this.day = day;

    const [dark, dctx] = layer(w, h, dpr);
    vignette(dctx, 0.8);
    this.dark = dark;

    // One soft glow sprite for every mote.
    const [glow, gctx] = layer(16, 16, 1);
    g = gctx.createRadialGradient(8, 8, 0, 8, 8, 8);
    g.addColorStop(0, 'rgba(255, 255, 255, 1)');
    g.addColorStop(0.3, 'rgba(255, 255, 255, 0.5)');
    g.addColorStop(1, 'rgba(255, 255, 255, 0)');
    gctx.fillStyle = g;
    gctx.fillRect(0, 0, 16, 16);
    this.glow = glow;
    this.tints.clear();

    this.leaves = Array.from({ length: LEAVES }, (_, i) => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: 10 + Math.random() * 14,
      vy: 14 + Math.random() * 12,
      phase: Math.random() * Math.PI * 2,
      colour: LEAF_COLOURS[i % LEAF_COLOURS.length],
      edge: LEAF_EDGES[i % LEAF_EDGES.length],
    }));
    this.motes = Array.from({ length: MOTES }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: 3 + Math.random() * 6,
      vy: -2 - Math.random() * 5,
      phase: Math.random() * Math.PI * 2,
      size: 6 + Math.random() * 10,
    }));
  }

  /**
   * Draws over the map and under badges and pops. night and dusk are 0 to 1. With motion off the
   * motes hold still.
   */
  draw(ctx: CanvasRenderingContext2D, w: number, h: number, now: number, night: number, dusk: number, motion: boolean): void {
    if (w <= 0 || h <= 0) return;
    if (w !== this.w || h !== this.h || !this.day) this.build(w, h);
    const dt = Math.min(100, this.last ? now - this.last : 0) / 1000;
    this.last = now;
    const day = 1 - night;
    const t = motion ? now / 1000 : 0;

    ctx.save();
    // Day and night layers cross-fade, so most frames draw just one of them.
    if (day > 0.01) {
      ctx.globalAlpha = day * (1 - 0.3 * dusk);
      ctx.drawImage(this.day!, 0, 0, w, h);
    }
    if (night > 0.01) {
      ctx.globalAlpha = night;
      ctx.drawImage(this.dark!, 0, 0, w, h);
    }

    // Dust in the sunlight by day, fireflies by night.
    for (const m of this.motes) {
      if (motion) {
        m.x += (m.vx + Math.sin(t + m.phase) * 4) * dt;
        m.y += (m.vy + Math.cos(t * 0.7 + m.phase) * 3) * dt;
        if (m.x > w + 10) m.x = -10;
        if (m.y < -10) m.y = h + 10;
      }
      const twinkle = 0.5 + 0.5 * Math.sin(t * (night > 0.5 ? 3 : 1.4) + m.phase * 3);
      const fireflies = night > 0.5;
      const s = fireflies ? m.size * 0.8 : m.size;
      ctx.globalAlpha = (fireflies ? 0.9 : 0.35) * twinkle;
      ctx.drawImage(this.tinted(fireflies ? '#d9f25a' : '#ffe2a0'), m.x - s / 2, m.y - s / 2, s, s);
    }
    // Leaves tumble down and across on the breeze, flipping between a flat and an edge-on shape.
    ctx.globalAlpha = 1 - night * 0.6;
    for (const l of this.leaves) {
      if (motion) {
        l.x += (l.vx + Math.sin(t * 1.3 + l.phase) * 18) * dt;
        l.y += l.vy * dt;
        if (l.y > h + 8) {
          l.y = -8;
          l.x = Math.random() * w - w * 0.2;
        }
        if (l.x > w + 8) l.x = -8;
      }
      const flat = Math.sin(t * 4 + l.phase) > 0;
      const x = Math.round(l.x / 2) * 2;
      const y = Math.round(l.y / 2) * 2;
      // Outlined in a dark shade of its own colour, like the walkers.
      ctx.fillStyle = l.edge;
      ctx.fillRect(x - 2, y - 2, flat ? 10 : 6, flat ? 6 : 8);
      ctx.fillStyle = l.colour;
      ctx.fillRect(x, y, flat ? 6 : 2, flat ? 2 : 4);
    }
    ctx.restore();
  }


  /** The glow sprite in one colour, cached. */
  private tinted(colour: string): HTMLCanvasElement {
    const hit = this.tints.get(colour);
    if (hit) return hit;
    const [c, ctx] = layer(16, 16, 1);
    ctx.drawImage(this.glow!, 0, 0);
    ctx.globalCompositeOperation = 'source-in';
    ctx.fillStyle = colour;
    ctx.fillRect(0, 0, 16, 16);
    this.tints.set(colour, c);
    return c;
  }
}
