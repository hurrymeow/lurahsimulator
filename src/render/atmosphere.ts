// Ambient light over the map, after the HD-2D look: a warm sun grade, slow god rays from the top
// left, a heavy vignette and drifting dust motes that turn into fireflies after dark. Every layer
// is cached at view size and drawn with one drawImage, so a frame costs a few blits. Effects only.

interface Mote {
  x: number;
  y: number;
  vx: number;
  vy: number;
  phase: number;
  size: number;
}

const MOTES = 28;

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
  private grade: HTMLCanvasElement | null = null;
  private rays: HTMLCanvasElement | null = null;
  private vignette: HTMLCanvasElement | null = null;
  private glow: HTMLCanvasElement | null = null;
  private motes: Mote[] = [];
  private last = 0;

  /** Rebuilds the cached layers when the view changes size. */
  private build(w: number, h: number): void {
    const dpr = window.devicePixelRatio || 1;
    this.w = w;
    this.h = h;

    // Warm key light from the top left, cooler and dimmer toward the bottom right.
    let [c, ctx] = layer(w, h, dpr);
    let g = ctx.createLinearGradient(0, 0, w * 0.6, h);
    g.addColorStop(0, 'rgba(255, 186, 84, 0.8)');
    g.addColorStop(0.45, 'rgba(255, 160, 64, 0.3)');
    g.addColorStop(1, 'rgba(36, 20, 10, 0.6)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    this.grade = c;

    // God rays: soft diagonal shafts, brightest at the top and fading as they fall.
    [c, ctx] = layer(w, h, dpr);
    ctx.save();
    ctx.translate(-w * 0.2, -h * 0.1);
    ctx.rotate(-0.5);
    for (const [x, width, a] of [[0.05, 0.1, 0.22], [0.24, 0.05, 0.16], [0.36, 0.14, 0.18], [0.58, 0.06, 0.12], [0.7, 0.1, 0.1]]) {
      g = ctx.createLinearGradient(0, 0, 0, h * 1.3);
      g.addColorStop(0, `rgba(255, 226, 160, ${a})`);
      g.addColorStop(0.7, 'rgba(255, 226, 160, 0)');
      ctx.fillStyle = g;
      ctx.fillRect(x * w * 1.6, 0, width * w, h * 1.4);
    }
    ctx.restore();
    this.rays = c;

    // A deep warm vignette, as if the kampung were a diorama under a lamp.
    [c, ctx] = layer(w, h, dpr);
    g = ctx.createRadialGradient(w / 2, h * 0.48, Math.min(w, h) * 0.3, w / 2, h * 0.5, Math.hypot(w, h) * 0.62);
    g.addColorStop(0, 'rgba(26, 14, 8, 0)');
    g.addColorStop(0.6, 'rgba(26, 14, 8, 0.18)');
    g.addColorStop(1, 'rgba(26, 14, 8, 0.72)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    this.vignette = c;

    // One soft glow sprite for every mote.
    [c, ctx] = layer(16, 16, 1);
    g = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
    g.addColorStop(0, 'rgba(255, 255, 255, 1)');
    g.addColorStop(0.3, 'rgba(255, 255, 255, 0.5)');
    g.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 16, 16);
    this.glow = c;

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
   * motes hold still and the rays stop breathing.
   */
  draw(ctx: CanvasRenderingContext2D, w: number, h: number, now: number, night: number, dusk: number, motion: boolean): void {
    if (w <= 0 || h <= 0) return;
    if (w !== this.w || h !== this.h || !this.grade) this.build(w, h);
    const dt = Math.min(100, this.last ? now - this.last : 0) / 1000;
    this.last = now;
    const day = 1 - night;
    const t = motion ? now / 1000 : 0;

    ctx.save();
    ctx.globalCompositeOperation = 'soft-light';
    ctx.globalAlpha = 0.5 + 0.5 * day;
    ctx.drawImage(this.grade!, 0, 0, w, h);

    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = day * (0.75 + 0.25 * Math.sin(t * 0.6)) * (1 - 0.4 * dusk);
    if (ctx.globalAlpha > 0.01) ctx.drawImage(this.rays!, 0, 0, w, h);

    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 0.75 + 0.25 * night;
    ctx.drawImage(this.vignette!, 0, 0, w, h);

    // Dust in the sunlight by day, fireflies by night.
    ctx.globalCompositeOperation = 'lighter';
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
    ctx.restore();
  }

  private tints = new Map<string, HTMLCanvasElement>();

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
