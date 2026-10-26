// Weather over the map: random rain showers with ripples on the ground, and waves splashing on the
// beach all the time (harder in the rain). Effects only. Everything is pixel-stepped rectangles
// in plain alpha, so a heavy shower costs a few hundred fillRects and one tint.

interface Drop {
  x: number;
  y: number;
  speed: number;
}

interface Splash {
  /** Screen position for ripples; world art position for shore splashes. */
  x: number;
  y: number;
  born: number;
  life: number;
  shore: boolean;
  /** Spray droplets: art-pixel offsets and velocities. */
  spray: { vx: number; vy: number }[];
}

const MAX_DROPS = 80;
const RAMP_MS = 3000;

export type WorldToScreen = (x: number, y: number) => { x: number; y: number };

export class Weather {
  private drops: Drop[] = [];
  private splashes: Splash[] = [];
  /** When the current shower starts and ends, in performance.now() ms. */
  private rainFrom = 0;
  private rainTo = 0;
  private next = 0;
  private last = 0;
  private lastShore = 0;
  private lastRipple = 0;

  /** Starts a shower now, for a set length. Used by debug tools and tests. */
  rain(now: number, ms = 20000): void {
    this.rainFrom = now;
    this.rainTo = now + ms;
    this.next = this.rainTo + 60000;
  }

  /** Rain strength, 0 to 1, easing in and out at either end of a shower. */
  intensity(now: number): number {
    if (now < this.rainFrom || now > this.rainTo) return 0;
    return Math.min(1, (now - this.rainFrom) / RAMP_MS, (this.rainTo - now) / RAMP_MS);
  }

  private schedule(now: number): void {
    if (!this.next) this.next = now + 25000 + Math.random() * 35000;
    if (now >= this.next && now > this.rainTo) {
      // A shower of 15 to 30 s, then 60 to 150 s of dry weather.
      this.rainFrom = now;
      this.rainTo = now + 15000 + Math.random() * 15000;
      this.next = this.rainTo + 60000 + Math.random() * 90000;
    }
  }

  draw(ctx: CanvasRenderingContext2D, w: number, h: number, s: number, now: number, toScreen: WorldToScreen, shore: { x: number; y: number }[]): void {
    const dt = Math.min(100, this.last ? now - this.last : 0) / 1000;
    this.last = now;
    this.schedule(now);
    const rain = this.intensity(now);

    // Waves break on the beach every so often, more often in the rain.
    if (shore.length && now - this.lastShore > (rain > 0 ? 60 : 110)) {
      this.lastShore = now;
      // Pick among the stretches of shore in view, so splashes land where someone can see them.
      const seen = shore.filter((p) => {
        const q = toScreen(p.x, p.y);
        return q.x > -20 && q.y > -20 && q.x < w + 20 && q.y < h + 20;
      });
      const p = seen[Math.floor(Math.random() * seen.length)];
      if (p)
        this.splashes.push({
          x: p.x + (Math.random() - 0.5) * 6,
          y: p.y + (Math.random() - 0.5) * 2,
          born: now,
          life: 900,
          shore: true,
          spray: Array.from({ length: 5 + Math.floor(Math.random() * 4) }, () => ({ vx: (Math.random() - 0.5) * 22, vy: -18 - Math.random() * 16 })),
        });
    }
    // Raindrops hitting the ground leave small ripples.
    if (rain > 0 && now - this.lastRipple > 40 / rain) {
      this.lastRipple = now;
      this.splashes.push({ x: Math.random() * w, y: h * 0.15 + Math.random() * h * 0.85, born: now, life: 380, shore: false, spray: [] });
    }

    // A shower cools and dims the light a little.
    if (rain > 0) {
      ctx.fillStyle = `rgba(30, 48, 78, ${0.18 * rain})`;
      ctx.fillRect(0, 0, w, h);
    }

    this.splashes = this.splashes.filter((p) => now - p.born < p.life);
    for (const p of this.splashes) {
      const k = (now - p.born) / p.life;
      const at = p.shore ? toScreen(p.x, p.y) : p;
      const x = Math.round(at.x);
      const y = Math.round(at.y);
      // A flat ring that widens and fades: four pixel dashes on a 2:1 diamond.
      const r = Math.round((p.shore ? 3 + k * 9 : 1 + k * 4) * s);
      ctx.fillStyle = p.shore ? `rgba(240, 250, 246, ${0.9 * (1 - k)})` : `rgba(214, 232, 255, ${0.75 * (1 - k)})`;
      ctx.fillRect(x - r - s, y, 2 * s, s);
      ctx.fillRect(x + r - s, y, 2 * s, s);
      ctx.fillRect(x - s, y - Math.round(r / 2), 2 * s, s);
      ctx.fillRect(x - s, y + Math.round(r / 2), 2 * s, s);
      // Spray droplets arc up and fall back.
      const t = (now - p.born) / 1000;
      for (const d of p.spray) {
        const dx = d.vx * t;
        const dy = d.vy * t + 40 * t * t;
        if (dy > 0) continue;
        const size = p.shore && k < 0.4 ? 2 * s : s;
        ctx.fillRect(Math.round(x + dx * s), Math.round(y + dy * s), size, size);
      }
    }

    // Falling streaks, slanted by the wind, drawn as two offset pixel bars.
    const want = Math.round(MAX_DROPS * rain);
    while (this.drops.length < want) this.drops.push({ x: Math.random() * (w + 80), y: Math.random() * h, speed: 420 + Math.random() * 260 });
    if (this.drops.length > want) this.drops.length = want;
    ctx.fillStyle = `rgba(210, 228, 255, ${0.55 * rain + 0.1})`;
    for (const d of this.drops) {
      d.y += d.speed * dt;
      d.x -= d.speed * 0.25 * dt;
      if (d.y > h + 10 || d.x < -10) {
        d.y = -10 - Math.random() * 40;
        d.x = Math.random() * (w + 80);
      }
      const x = Math.round(d.x);
      const y = Math.round(d.y);
      ctx.fillRect(x, y, s, 3 * s);
      ctx.fillRect(x - s, y + 3 * s, s, 3 * s);
    }
  }

  get busy(): boolean {
    return this.splashes.length > 0 || this.drops.length > 0;
  }
}
