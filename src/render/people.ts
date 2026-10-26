// Residents walking between buildings, ojol riders, and the tukang parkir's wave. Purely visual:
// nothing here touches the simulation.
import { GRID_H, GRID_W, type GameState, type JobId } from '../sim/types';
import { doorsOf, findPath, type Pt } from './path';

/** More walkers than this cost frame time and crowd a 9x13 map. */
export const MAX_WALKERS = 16;
/** Ditches and parking lots are flat, so people walk over them. */
const FLAT = new Set(['selokan', 'parkir']);
const WALK_SPEED = 0.9;
const OJOL_SPEED = 2.8;

type Kind = JobId;

export interface Walker {
  id: number;
  kind: Kind;
  shirt: string;
  fx: number;
  fy: number;
  path: Pt[];
  /** ms left standing at a door before the next trip. */
  wait: number;
  face: 1 | -1;
  /** Distance walked, drives the leg cycle. */
  stride: number;
}

const SHIRTS: Record<Kind, string> = {
  none: '#f4f4f5',
  pns: '#c8b27a',
  ojol: '#22c55e',
  influencer: '#f472b6',
  buzzer: '#f97316',
};
/** Unemployed residents wear one of these, so the crowd is not all white. */
const CASUAL = ['#f4f4f5', '#60a5fa', '#dc2626', '#67e8f9', '#fbbf24'];

// Art-pixel frames. f skin, h hair, s shirt, d trousers, k shoes, p phone, G helmet, m bike, w tyre, x spoke.
const WALK: string[][] = [
  ['..hhh..', '..fff..', '..fff..', '.sssss.', '.sssss.', '.fsssf.', '..ddd..', '..d.d..', '..d.d..', '..k.k..'],
  ['..hhh..', '..fff..', '..fff..', '.sssss.', '.sssss.', '.fsssf.', '..ddd..', '.d...d.', '.d...d.', '.k...k.'],
];
const PHONE: string[][] = WALK.map((f) => f.map((row, i) => (i === 3 ? '.ssssfp' : i === 4 ? '.sssss.' : i === 5 ? '.fsss..' : row)));
const OJOL: string[][] = [
  ['....GGG....', '....Gff....', '....sss....', '...ssss.m..', '...ssssfm..', '.mmmddmmmm.', 'mmmmmmmmmmm', '.wxw...wxw.', '..w.....w..'],
  ['....GGG....', '....Gff....', '....sss....', '...ssss.m..', '...ssssfm..', '.mmmddmmmm.', 'mmmmmmmmmmm', '.www...www.', '..x.....x..'],
];
const INK: Record<string, string> = { f: '#e0ac69', h: '#1b1b1f', d: '#374151', k: '#0b0b0c', p: '#f4f4f5', G: '#15803d', m: '#dc2626', w: '#0b0b0c', x: '#9ca3af' };

const cache = new Map<string, HTMLCanvasElement>();

/** A frame rasterised once at art resolution, mirrored when facing left. */
function frame(rows: string[], shirt: string, face: 1 | -1): HTMLCanvasElement {
  const key = `${rows.join('/')}:${shirt}:${face}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const c = document.createElement('canvas');
  c.width = rows[0].length;
  c.height = rows.length;
  const ctx = c.getContext('2d')!;
  rows.forEach((row, y) =>
    [...row].forEach((ch, x) => {
      if (ch === '.') return;
      ctx.fillStyle = ch === 's' ? shirt : INK[ch];
      ctx.fillRect(face === 1 ? x : c.width - 1 - x, y, 1, 1);
    }),
  );
  cache.set(key, c);
  return c;
}

export type Project = (fx: number, fy: number) => { x: number; y: number };

export class Crowd {
  people: Walker[] = [];
  private order: Walker[] = [];
  private cursor = 0;
  private blocked = new Uint8Array(GRID_W * GRID_H);
  private last = 0;

  private walkable = (x: number, y: number) => !this.blocked[y * GRID_W + x];

  /** Inside the grid: no building. Outside it, only ojol riders use the ring road one tile out. */
  private free(x: number, y: number, ojol: boolean): boolean {
    if (x >= 0 && y >= 0 && x < GRID_W && y < GRID_H) return this.walkable(x, y);
    return ojol && x >= -1 && y >= -1 && x <= GRID_W && y <= GRID_H;
  }

  /** findPath over the grid plus its ring road, shifted so the ring sits at 0. */
  private route(from: Pt, to: Pt, ojol: boolean): Pt[] | null {
    const path = findPath(GRID_W + 2, GRID_H + 2, (x, y) => this.free(x - 1, y - 1, ojol), { x: from.x + 1, y: from.y + 1 }, { x: to.x + 1, y: to.y + 1 });
    return path && path.map((t) => ({ x: t.x - 1, y: t.y - 1 }));
  }

  private ring(): Pt {
    const k = Math.floor(Math.random() * 2 * (GRID_W + GRID_H + 2));
    if (k < GRID_W + 1) return { x: k, y: k % 2 ? -1 : GRID_H };
    const j = k - GRID_W - 1;
    return { x: j % 2 ? -1 : GRID_W, y: Math.min(GRID_H, (j >> 1) - 1) };
  }

  /** Matches walkers to residents and moves them. With motion off they stand still. */
  update(s: GameState, now: number, motion: boolean): void {
    const dt = Math.min(100, this.last ? now - this.last : 0);
    this.last = now;
    this.blocked.fill(0);
    const sites: Pt[] = [];
    const homes: Pt[] = [];
    for (const b of s.buildings) {
      if (FLAT.has(b.def)) continue;
      this.blocked[b.y * GRID_W + b.x] = 1;
      if (b.status !== 'active') continue;
      sites.push(b);
      if (b.def === 'rumah') homes.push(b);
    }

    const residents = s.residents.slice(0, MAX_WALKERS);
    const ids = new Set(residents.map((r) => r.id));
    this.people = this.people.filter((p) => ids.has(p.id));
    for (const r of residents) {
      let p = this.people.find((o) => o.id === r.id);
      const kind: Kind = r.job;
      if (!p) {
        const home = homes[r.id % Math.max(1, homes.length)];
        const start = (home && this.pick(doorsOf(GRID_W, GRID_H, this.walkable, home))) ?? this.randomFree();
        if (!start) continue;
        p = { id: r.id, kind, shirt: '', fx: start.x + 0.5, fy: start.y + 0.5, path: [], wait: 400 + Math.random() * 2500, face: Math.random() < 0.5 ? 1 : -1, stride: 0 };
        this.people.push(p);
      }
      p.kind = kind;
      p.shirt = kind === 'none' ? CASUAL[r.id % CASUAL.length] : SHIRTS[kind];
      if (motion) this.move(p, dt, sites);
    }
  }

  private pick<T>(list: T[]): T | undefined {
    return list[Math.floor(Math.random() * list.length)];
  }

  private randomFree(): Pt | undefined {
    for (let i = 0; i < 20; i++) {
      const x = Math.floor(Math.random() * GRID_W);
      const y = Math.floor(Math.random() * GRID_H);
      if (this.walkable(x, y)) return { x, y };
    }
    return undefined;
  }

  private move(p: Walker, dt: number, sites: Pt[]): void {
    const tx = Math.floor(p.fx);
    const ty = Math.floor(p.fy);
    // A new building went up under this walker: step out to its door.
    if (!this.free(tx, ty, true)) {
      const out = this.pick(doorsOf(GRID_W, GRID_H, this.walkable, { x: tx, y: ty })) ?? this.randomFree();
      if (out) Object.assign(p, { fx: out.x + 0.5, fy: out.y + 0.5, path: [] });
      return;
    }
    if (p.path.length === 0) {
      p.wait -= dt;
      if (p.wait > 0) {
        // Idle: glance the other way now and then.
        if (Math.random() < dt / 1800) p.face = p.face === 1 ? -1 : 1;
        return;
      }
      p.path = this.plan(p, { x: tx, y: ty }, sites) ?? [];
      p.wait = p.kind === 'ojol' ? 300 + Math.random() * 600 : 1200 + Math.random() * 3000;
      return;
    }
    const next = p.path[0];
    if (!this.free(next.x, next.y, p.kind === 'ojol')) {
      p.path = [];
      return;
    }
    const speed = p.kind === 'ojol' ? OJOL_SPEED : WALK_SPEED;
    const dx = next.x + 0.5 - p.fx;
    const dy = next.y + 0.5 - p.fy;
    const dist = Math.hypot(dx, dy);
    const step = (speed * dt) / 1000;
    // Screen x grows with fx and shrinks with fy.
    if (dx - dy !== 0) p.face = dx - dy > 0 ? 1 : -1;
    p.stride += step;
    if (step >= dist) {
      p.fx = next.x + 0.5;
      p.fy = next.y + 0.5;
      p.path.shift();
    } else {
      p.fx += (dx / dist) * step;
      p.fy += (dy / dist) * step;
    }
  }

  /** Walkers go to a building's door. Ojol riders zip to a far-off free tile or round the ring road. */
  private plan(p: Walker, from: Pt, sites: Pt[]): Pt[] | null {
    for (let i = 0; i < 4; i++) {
      let to: Pt | undefined;
      if (p.kind === 'ojol') {
        to = Math.random() < 0.5 ? this.ring() : this.randomFree();
        if (to && Math.abs(to.x - from.x) + Math.abs(to.y - from.y) < 4) continue;
      } else {
        const site = this.pick(sites);
        to = site && this.pick(doorsOf(GRID_W, GRID_H, this.walkable, site));
      }
      if (!to) continue;
      const path = this.route(from, to, p.kind === 'ojol');
      if (path && path.length) return path;
    }
    return null;
  }

  /** Call once per frame before drawUntil. Sorts back to front. */
  begin(): void {
    this.order = [...this.people].sort((a, b) => a.fx + a.fy - (b.fx + b.fy));
    this.cursor = 0;
  }

  /** Draws every walker standing behind depth (x + y of a tile centre). */
  drawUntil(ctx: CanvasRenderingContext2D, depth: number, project: Project, scale: number, now: number, motion: boolean): void {
    while (this.cursor < this.order.length && this.order[this.cursor].fx + this.order[this.cursor].fy < depth) {
      this.draw(ctx, this.order[this.cursor++], project, scale, now, motion);
    }
  }

  private draw(ctx: CanvasRenderingContext2D, p: Walker, project: Project, s: number, now: number, motion: boolean): void {
    const g = project(p.fx, p.fy);
    const moving = motion && p.path.length > 0;
    const leg = moving ? Math.floor(p.stride * (p.kind === 'ojol' ? 6 : 5)) % 2 : 0;
    const rows = p.kind === 'ojol' ? OJOL[leg] : p.kind === 'influencer' || p.kind === 'buzzer' ? PHONE[leg] : WALK[leg];
    const img = frame(rows, p.shirt, p.face);
    // Idle walkers breathe: a one-pixel bob every second or so.
    const bob = !moving && motion && Math.floor((now + p.id * 377) / 600) % 2 ? 1 : 0;
    const w = img.width * s;
    const h = img.height * s;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(Math.round(g.x - w / 2), Math.round(g.y - s), w, 2 * s);
    if (moving && p.kind === 'ojol') {
      // Speed lines behind the bike.
      ctx.fillStyle = 'rgba(244, 244, 245, 0.5)';
      for (let i = 0; i < 2; i++) ctx.fillRect(Math.round(g.x - p.face * (w / 2 + (3 + i * 2) * s)) - (p.face === 1 ? 2 * s : 0), Math.round(g.y - (4 + i * 2) * s), 2 * s, s);
    }
    ctx.drawImage(img, Math.round(g.x - w / 2), Math.round(g.y - h + s - bob * s), w, h);
  }

  /** Walkers within reach of a tile, so the tukang parkir knows to wave harder. */
  near(x: number, y: number, r: number): boolean {
    return this.people.some((p) => Math.abs(p.fx - x - 0.5) + Math.abs(p.fy - y - 0.5) < r);
  }
}
