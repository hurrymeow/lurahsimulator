// Residents walking between buildings, ojol riders, and the tukang parkir's wave. Purely visual:
// nothing here touches the simulation.
import { footprintOf, tilesOf } from '../sim/state';
import { lotAt } from '../sim/area';
import { GRID_H, GRID_W, type GameState, type JobId } from '../sim/types';
import { doorsOf, findPath, type Pt } from './path';

/** More walkers than this cost frame time and crowd a 9x13 map. */
export const MAX_WALKERS = 16;
/** Ditches and parking lots are flat, so people walk over them. */
/** Cost of a step on open ground, against 1 on a path. Above 1 makes walkers detour onto paths. */
const WALK_OFF_PATH = 2.5;
const FLAT = new Set(['selokan', 'parkir', 'jalan', 'aspalUlang', 'sawahIrigasi', 'embung', 'taman']);
const VIP_ID = -1;
const WALK_SPEED = 0.9;
const OJOL_SPEED = 2.8;

type Kind = JobId | 'vip';

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
  vip: '#8a9a4a',
  none: '#f6ecd4',
  pns: '#c9a86a',
  ojol: '#4fae3e',
  influencer: '#e57a9c',
  buzzer: '#e57d2e',
  kaderPosyandu: '#e8a0b4',
  calo: '#6a5a8a',
};
/** Unemployed residents wear one of these, so the crowd is not all cream. */
const CASUAL = ['#f6ecd4', '#5a9bd0', '#df4a2c', '#5fb3a6', '#f4b935'];

// Art-pixel frames, 7x10 for walkers and 11x9 for ojol riders.
// h hair, H hair shine, f skin, F skin shade, e eye, s shirt, S shirt shade, c collar, b belt,
// d trousers, D trousers shade, k shoes, p phone. Ojol: G helmet, g helmet shine, v visor,
// m bike, M bike shade, L headlight, w tyre, x spoke.
const WALK: string[][] = [
  ['..hhh..', '.hHhhh.', '.hefeh.', '..fFf..', '.sscsS.', 'fssssSf', '..bbb..', '..d.D..', '..d.D..', '..k.k..'],
  ['..hhh..', '.hHhhh.', '.hefeh.', '..fFf..', '.sscsS.', 'fssssSf', '..bbb..', '.d...D.', '.d...D.', '.k...k.'],
];
const PHONE: string[][] = WALK.map((f) => f.map((row, i) => (i === 4 ? '.sscsfp' : i === 5 ? 'fssssS.' : row)));
// The Kecamatan inspector: the phone pose with a wide peci on top, so the phone reads as a clipboard.
const VIP: string[][] = PHONE.map((f) => f.map((row, i) => (i === 0 ? '.hhhhh.' : row)));
const OJOL: string[][] = [
  ['....GgG....', '....Gvf....', '....sss....', '...ssSs.m..', '...ssSSfm..', '.mmmddmmmL.', 'MmmmmmmmmmM', '.wxw...wxw.', '..w.....w..'],
  ['....GgG....', '....Gvf....', '....sss....', '...ssSs.m..', '...ssSSfm..', '.mmmddmmmL.', 'MmmmmmmmmmM', '.www...www.', '..x.....x..'],
];
const INK: Record<string, string> = {
  f: '#e7b07a', F: '#c98c5a', e: '#2a1810', c: '#fbf6ea', b: '#6a4a2c', d: '#4a4f72', D: '#363a58', k: '#3a2618', p: '#f6ecd4',
  G: '#4fae3e', g: '#8fd46a', v: '#2f3a52', m: '#df4a2c', M: '#a8321f', L: '#fff2b0', w: '#2a1810', x: '#bdb4a3',
};
/** Hair colours, picked per resident so the crowd varies. */
const HAIR = ['#2a1810', '#4a2c1c', '#6b3e22', '#1f2430', '#8a5a32'];

function shade(c: string, f: number): string {
  const n = parseInt(c.slice(1), 16);
  const ch = (s: number) => Math.max(0, Math.min(255, Math.round(((n >> s) & 255) * f)));
  return `#${((ch(16) << 16) | (ch(8) << 8) | ch(0)).toString(16).padStart(6, '0')}`;
}

const cache = new Map<string, HTMLCanvasElement>();

/**
 * A frame rasterised once at art resolution, mirrored when facing left. The 1px outline is
 * coloured, not black: each outline pixel is a dark shade of the fill it borders, so hair gets a
 * dark brown edge, a red shirt a deep red one, and so on.
 */
function frame(rows: string[], shirt: string, hair: string, face: 1 | -1): HTMLCanvasElement {
  const key = `${rows.join('/')}:${shirt}:${hair}:${face}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const c = document.createElement('canvas');
  c.width = rows[0].length + 2;
  c.height = rows.length + 2;
  const ctx = c.getContext('2d')!;
  const colour = (ch: string): string =>
    ch === 's' ? shirt : ch === 'S' ? shade(shirt, 0.74) : ch === 'h' ? hair : ch === 'H' ? shade(hair, 1.9) : INK[ch];
  const at = (x: number, y: number): string | null => {
    const ch = rows[y]?.[x];
    return ch === undefined || ch === '.' ? null : ch;
  };
  const px = (x: number, y: number) => ctx.fillRect(face === 1 ? x + 1 : c.width - 2 - x, y + 1, 1, 1);
  for (let y = -1; y <= rows.length; y++)
    for (let x = -1; x <= rows[0].length; x++) {
      if (at(x, y)) continue;
      // Prefer the fill below, then the sides, then above, so feet and heads get their own edge.
      const next = at(x, y + 1) ?? at(x - 1, y) ?? at(x + 1, y) ?? at(x, y - 1);
      if (!next) continue;
      ctx.fillStyle = shade(colour(next), next === 'e' || next === 'w' || next === 'k' ? 1 : 0.45);
      px(x, y);
    }
  rows.forEach((row, y) =>
    [...row].forEach((ch, x) => {
      if (ch === '.') return;
      ctx.fillStyle = colour(ch);
      px(x, y);
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
  /** Tiles that belong to another RT. Walkers stay in their own. Rebuilt when the map grows. */
  private foreign = new Uint8Array(0);
  private onPath = new Uint8Array(GRID_W * GRID_H);
  private last = 0;

  private walkable = (x: number, y: number) => !this.blocked[y * GRID_W + x];

  /** Inside the grid: no building. Outside it, only ojol riders use the ring road one tile out. */
  private free(x: number, y: number, ojol: boolean): boolean {
    if (x >= 0 && y >= 0 && x < GRID_W && y < GRID_H) return this.walkable(x, y);
    return ojol && x >= -1 && y >= -1 && x <= GRID_W && y <= GRID_H;
  }

  /** findPath over the grid plus its ring road, shifted so the ring sits at 0. */
  private route(from: Pt, to: Pt, ojol: boolean): Pt[] | null {
    const path = findPath(GRID_W + 2, GRID_H + 2, (x, y) => this.free(x - 1, y - 1, ojol), { x: from.x + 1, y: from.y + 1 }, { x: to.x + 1, y: to.y + 1}, (x, y) => this.stepCost(x - 1, y - 1));
    return path && path.map((t) => ({ x: t.x - 1, y: t.y - 1 }));
  }

  /** Walkers prefer paths and the ring road over open ground. */
  private stepCost(x: number, y: number): number {
    if (x < 0 || y < 0 || x >= GRID_W || y >= GRID_H) return 1;
    return this.onPath[y * GRID_W + x] ? 1 : WALK_OFF_PATH;
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
    if (this.foreign.length !== GRID_W * GRID_H) {
      this.foreign = new Uint8Array(GRID_W * GRID_H);
      for (let y = 0; y < GRID_H; y++) for (let x = 0; x < GRID_W; x++) if (lotAt(x, y) === 'other') this.foreign[y * GRID_W + x] = 1;
      this.blocked = new Uint8Array(GRID_W * GRID_H);
      this.onPath = new Uint8Array(GRID_W * GRID_H);
    }
    this.blocked.set(this.foreign);
    this.onPath.fill(0);
    const sites: Pt[] = [];
    const homes: Pt[] = [];
    for (const b of s.buildings) {
      if (b.def === 'jalan' && b.status === 'active') this.onPath[b.y * GRID_W + b.x] = 1;
      if (FLAT.has(b.def)) continue;
      for (const p of tilesOf(b)) this.blocked[p.y * GRID_W + p.x] = 1;
      if (b.status !== 'active') continue;
      const door = { x: b.x, y: b.y, n: footprintOf(b.def) };
      sites.push(door);
      if (b.def === 'rumah') homes.push(door);
    }

    const residents = s.residents.slice(0, MAX_WALKERS);
    const ids = new Set(residents.map((r) => r.id));
    // The inspector walks the map during the last month before the visit.
    const vip = s.inspection?.visitAt !== undefined && s.inspection.visitAt - s.month <= 1;
    if (vip) ids.add(VIP_ID);
    this.people = this.people.filter((p) => ids.has(p.id));
    if (vip && !this.people.some((o) => o.id === VIP_ID)) {
      const start = this.ring();
      this.people.push({ id: VIP_ID, kind: 'vip', shirt: SHIRTS.vip, fx: Math.min(GRID_W - 0.5, Math.max(0.5, start.x + 0.5)), fy: Math.min(GRID_H - 0.5, Math.max(0.5, start.y + 0.5)), path: [], wait: 0, face: 1, stride: 0 });
    }
    const guest = this.people.find((o) => o.id === VIP_ID);
    if (guest && motion) this.move(guest, dt, sites);
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
    const rows = p.kind === 'ojol' ? OJOL[leg] : p.kind === 'vip' ? VIP[leg] : p.kind === 'influencer' || p.kind === 'buzzer' ? PHONE[leg] : WALK[leg];
    const img = frame(rows, p.shirt, HAIR[Math.abs(p.id) % HAIR.length], p.face);
    // Idle walkers breathe: a one-pixel bob every second or so.
    const bob = !moving && motion && Math.floor((now + p.id * 377) / 600) % 2 ? 1 : 0;
    const w = img.width * s;
    const h = img.height * s;
    ctx.fillStyle = 'rgba(42, 24, 16, 0.35)';
    ctx.fillRect(Math.round(g.x - w / 2), Math.round(g.y - s), w, 2 * s);
    if (moving && p.kind === 'ojol') {
      // Speed lines behind the bike.
      ctx.fillStyle = 'rgba(246, 236, 212, 0.7)';
      for (let i = 0; i < 2; i++) ctx.fillRect(Math.round(g.x - p.face * (w / 2 + (3 + i * 2) * s)) - (p.face === 1 ? 2 * s : 0), Math.round(g.y - (4 + i * 2) * s), 2 * s, s);
    }
    // The frame's outline adds a pixel all round, so the feet sit one art pixel above the bottom.
    ctx.drawImage(img, Math.round(g.x - w / 2), Math.round(g.y - h + 2 * s - bob * s), w, h);
  }

  /** Walkers within reach of a tile, so the tukang parkir knows to wave harder. */
  near(x: number, y: number, r: number): boolean {
    return this.people.some((p) => Math.abs(p.fx - x - 0.5) + Math.abs(p.fy - y - 0.5) < r);
  }
}
