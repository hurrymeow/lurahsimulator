// Particles and screen-wide effects: construction dust, warung steam, coin arcs, combo pulse,
// day and night. All of it is skipped when effects are off, so the map still reads without it.
import type { Project } from './people';

interface Puff {
  kind: 'dust' | 'steam';
  /** Tile-space ground point, so particles stay put while the map pans. */
  fx: number;
  fy: number;
  /** Drift in art pixels per second. */
  vx: number;
  vy: number;
  born: number;
  life: number;
}

interface Coin {
  fx: number;
  fy: number;
  /** Landing point in CSS pixels on the canvas, usually the money chip. */
  to: { x: number; y: number };
  born: number;
  land?: () => void;
}

const MAX_PARTS = 160;
const COIN_MS = 750;
const PULSE_MS = 900;
/** One day lasts this many in-game months: 32 s at 1x. */
const DAY_MONTHS = 4;

export class Fx {
  private puffs: Puff[] = [];
  private coinsInFlight: Coin[] = [];
  private pulseAt = -Infinity;
  private emitted = new Map<string, number>();

  get count(): number {
    return this.puffs.length + this.coinsInFlight.length;
  }

  get busy(): boolean {
    return this.count > 0 || performance.now() - this.pulseAt < PULSE_MS;
  }

  clear(): void {
    this.puffs = [];
    this.coinsInFlight = [];
    this.pulseAt = -Infinity;
  }

  private add(p: Puff): void {
    if (this.puffs.length < MAX_PARTS) this.puffs.push(p);
  }

  /** A ring of dust when a building finishes. */
  dustRing(x: number, y: number, now: number): void {
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      this.add({ kind: 'dust', fx: x + 0.5, fy: y + 0.5, vx: Math.cos(a) * 26, vy: Math.sin(a) * 13 - 4, born: now, life: 700 + Math.random() * 300 });
    }
  }

  /** Calls emit at most once every gap ms for a key, so every site trickles at its own pace. */
  private every(key: string, gap: number, now: number, emit: () => void): void {
    if (now - (this.emitted.get(key) ?? -Infinity) < gap) return;
    this.emitted.set(key, now + Math.random() * gap * 0.5);
    emit();
  }

  /** Dust kicked up around a building site. */
  construct(x: number, y: number, now: number): void {
    this.every(`d${x},${y}`, 260, now, () =>
      this.add({ kind: 'dust', fx: x + 0.2 + Math.random() * 0.6, fy: y + 0.2 + Math.random() * 0.6, vx: (Math.random() - 0.5) * 10, vy: -6 - Math.random() * 6, born: now, life: 800 }),
    );
  }

  /** Steam off a warung's stove. */
  steam(x: number, y: number, now: number): void {
    this.every(`s${x},${y}`, 700, now, () => this.add({ kind: 'steam', fx: x + 0.5, fy: y + 0.5, vx: (Math.random() - 0.5) * 4, vy: -10, born: now, life: 1400 }));
  }

  /** Coins arc from a tile to the money chip. land runs as each one arrives. */
  coins(x: number, y: number, n: number, to: { x: number; y: number }, now: number, land?: () => void): void {
    for (let i = 0; i < n && this.coinsInFlight.length < 24; i++) this.coinsInFlight.push({ fx: x + 0.5, fy: y + 0.5, to, born: now + i * 90, land });
  }

  /** Fanfare tier only: a combo, unlock or ranking win. */
  pulse(now: number): void {
    this.pulseAt = now;
  }

  /** Dust and steam, drawn in front of the buildings. */
  drawPuffs(ctx: CanvasRenderingContext2D, project: Project, s: number, now: number, lift: (fx: number, fy: number) => number): void {
    this.puffs = this.puffs.filter((p) => now - p.born < p.life);
    for (const p of this.puffs) {
      const age = now - p.born;
      if (age < 0) continue;
      const k = age / p.life;
      const g = project(p.fx, p.fy);
      const t = age / 1000;
      const size = Math.round((p.kind === 'dust' ? 2 + k * 3 : 1 + k * 3) * s);
      // Steam starts at the roof, dust at the ground.
      const x = g.x + p.vx * t * s;
      const y = g.y + p.vy * t * s - (p.kind === 'steam' ? lift(p.fx, p.fy) : 0);
      ctx.globalAlpha = (1 - k) * (p.kind === 'dust' ? 0.7 : 0.55);
      ctx.fillStyle = p.kind === 'dust' ? '#c8b27a' : '#f4f4f5';
      ctx.fillRect(Math.round(x - size / 2), Math.round(y - size / 2), size, size);
    }
    ctx.globalAlpha = 1;
  }

  /** Coins fly on top of everything except the number pops. */
  drawCoins(ctx: CanvasRenderingContext2D, project: Project, s: number, now: number): void {
    this.coinsInFlight = this.coinsInFlight.filter((c) => {
      const age = now - c.born;
      if (age < 0) return true;
      const k = Math.min(1, age / COIN_MS);
      if (k >= 1) {
        c.land?.();
        return false;
      }
      const a = project(c.fx, c.fy);
      a.y -= 10 * s;
      const e = k * k * (3 - 2 * k);
      // Quadratic arc that peaks above the start before dropping toward the chip.
      const cx = (a.x + c.to.x) / 2;
      const cy = Math.min(a.y, c.to.y) - 60;
      const x = (1 - e) ** 2 * a.x + 2 * (1 - e) * e * cx + e * e * c.to.x;
      const y = (1 - e) ** 2 * a.y + 2 * (1 - e) * e * cy + e * e * c.to.y;
      // Spinning: the coin narrows and widens.
      const r = 3 * s;
      const wide = Math.max(s, Math.round(r * 2 * Math.abs(Math.cos(age / 70))));
      ctx.fillStyle = '#92400e';
      ctx.fillRect(Math.round(x - wide / 2) - 1, Math.round(y - r) - 1, wide + 2, r * 2 + 2);
      ctx.fillStyle = '#facc15';
      ctx.fillRect(Math.round(x - wide / 2), Math.round(y - r), wide, r * 2);
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(Math.round(x - wide / 2), Math.round(y - r), Math.max(1, Math.round(wide / 3)), s);
      return true;
    });
  }

  /** Golden edge glow that fades out after a fanfare. */
  drawPulse(ctx: CanvasRenderingContext2D, w: number, h: number, now: number): void {
    const age = now - this.pulseAt;
    if (age >= PULSE_MS) return;
    const k = 1 - age / PULSE_MS;
    const g = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.3, w / 2, h / 2, Math.max(w, h) * 0.75);
    g.addColorStop(0, 'rgba(250, 204, 21, 0)');
    g.addColorStop(1, `rgba(250, 204, 21, ${0.45 * k})`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }
}

/** Night level from 0 (day) to 1 (night) at a point in game time, measured in months. */
export function darkness(clock: number): number {
  const sun = Math.sin(((clock / DAY_MONTHS + 0.1) % 1) * Math.PI * 2);
  return Math.max(0, Math.min(1, (0.1 - sun) / 0.45));
}

/** Warm light at dawn and dusk, 0 to 1. */
export function dusk(clock: number): number {
  const sun = Math.sin(((clock / DAY_MONTHS + 0.1) % 1) * Math.PI * 2);
  return Math.max(0, 1 - Math.abs(sun - 0.05) / 0.3);
}

/** Navy over the map at night, amber at dusk. Drawn under badges and pops so they stay readable. */
export function drawTint(ctx: CanvasRenderingContext2D, w: number, h: number, clock: number): void {
  const d = darkness(clock);
  const a = dusk(clock);
  if (a > 0) {
    ctx.fillStyle = `rgba(251, 146, 60, ${0.14 * a})`;
    ctx.fillRect(0, 0, w, h);
  }
  if (d > 0) {
    ctx.fillStyle = `rgba(15, 23, 62, ${0.42 * d})`;
    ctx.fillRect(0, 0, w, h);
  }
}
