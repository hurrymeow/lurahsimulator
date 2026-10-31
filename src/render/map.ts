import { rupiahShort } from '../format';
import { def } from '../sim/content';
import { sizeOf, tilesOf, type Placed } from '../sim/state';
import { sizeFor } from '../sim/content';
import { GRID_H, GRID_W, RT_H, RT_W, type Building, type GameState, type ResourceId } from '../sim/types';
import { Atmosphere } from './atmosphere';
import { drawBunting, drawUmbul } from './agustus';
import { agustusan } from '../sim/lomba';
import { permitEta, queueBerkas } from '../sim/staff';
import { drawTint, darkness, dusk, Fx } from './fx';
import { iso, TH, TOP, TW, type Art } from './iso';
import { t } from '../i18n';
import { Crowd } from './people';
import { Weather } from './weather';
import { placeBadge, type BadgeBox } from './badge';
import { buildWorld, clouds, decoAt, farRoofs, layoutWorld, HORIZON, shorePoints, SEA, SKY, SUN_SIZE, SUN_X, SUN_Y, sunArt, WORLD_H, WORLD_OX, WORLD_OY, WORLD_W, worldTrees } from './scenery';
import { ICONS, ROOF_COLOURS, ROOF_SHAPES, WALL_COLOURS, sprite } from './sprites';

/** Resource colours for page elements: CSS variables, so they follow the Light or Dark theme. */
export const RES_VAR: Record<ResourceId, string> = { rupiah: 'var(--rupiah)', sabar: 'var(--sabar)', orangDalam: 'var(--orang)', viral: 'var(--viral)' };

/** Resource colours for the canvas, where text sits on its own dark box. */
export const RES_COLOUR: Record<ResourceId, string> = {
  rupiah: '#4ade80',
  sabar: '#60a5fa',
  orangDalam: '#fbbf24',
  viral: '#f472b6',
};

/** Flat pieces cast no contact shadow. */
const FLAT_AO = new Set(['selokan', 'biopori', 'kolamIkan', 'kolamPancing', 'kebunSayur', 'sawah', 'kolamLele', 'parkir', 'jalan', 'aspalUlang', 'sawahIrigasi', 'embung', 'taman']);

/** Ground pieces first, then the standing ones, each keeping its back-to-front order. Walkers join only the second group. */
export function groundFirst<T extends { def: string }>(sorted: T[]): { ground: T[]; standing: T[] } {
  return { ground: sorted.filter((b) => FLAT_AO.has(b.def)), standing: sorted.filter((b) => !FLAT_AO.has(b.def)) };
}

let aoCache: HTMLCanvasElement | null = null;

/** A soft dark oval, squashed to the ground plane, for ambient occlusion under buildings. */
function contactShadow(): HTMLCanvasElement {
  if (aoCache) return aoCache;
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 64;
  const ctx = c.getContext('2d')!;
  ctx.scale(1, 0.5);
  const g = ctx.createRadialGradient(64, 64, 8, 64, 64, 64);
  g.addColorStop(0, 'rgba(26, 14, 8, 0.62)');
  g.addColorStop(0.5, 'rgba(26, 14, 8, 0.38)');
  g.addColorStop(1, 'rgba(26, 14, 8, 0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  return (aoCache = c);
}

let haloCache: HTMLCanvasElement | null = null;

function sunHalo(): HTMLCanvasElement {
  if (haloCache) return haloCache;
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const ctx = c.getContext('2d')!;
  const g = ctx.createRadialGradient(64, 64, 16, 64, 64, 64);
  g.addColorStop(0, 'rgba(255, 236, 170, 0.75)');
  g.addColorStop(1, 'rgba(255, 236, 170, 0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  return (haloCache = c);
}

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

/** A footprint and the art drawn for it: w x h tiles on the map; square art n tiles a side, or long art fa x fb. */
export type Shape = { w: number; h: number; n: number; fa: number; fb: number };

/** How a building's footprint and art line up, turned or not. A building kept small draws at its old square size. */
export function shapeOf(b: Placed): Shape {
  const [fa, fb] = b.small ? [b.small, b.small] : sizeFor(b.def);
  const { w, h } = sizeOf(b);
  return fa === fb ? { w, h, n: fa, fa: 1, fb: 1 } : { w, h, n: 1, fa, fb };
}

/** The ghost's shape, falling back to a square of n. */
const ghostShape = (g: Ghost): Shape => (g.tiles ? { w: 1, h: 1, n: 1, fa: 1, fb: 1 } : { w: g.w ?? g.n, h: g.h ?? g.n, n: g.fa && g.fa !== g.fb ? 1 : g.n, fa: g.fa ?? 1, fb: g.fb ?? 1 });

export interface Ghost {
  x: number;
  y: number;
  ok: boolean;
  sprite: string;
  /** Tiles on each side. */
  n: number;
  /** A path being laid: every tile on it. x,y is then the last tile tapped. */
  tiles?: { x: number; y: number; ok: boolean; have: boolean }[];
  /** Draw the sprite mirrored, for a building that has been turned. */
  flip?: boolean;
  /** A non-square footprint: tiles along x (w) and y (h) on the map, and the art's own sides (fa, fb). */
  w?: number;
  h?: number;
  fa?: number;
  fb?: number;
  /** A building being moved keeps its look: its house variant and its level. */
  variant?: string;
  level?: number;
}

interface Hit {
  x: number;
  y: number;
  left: number;
  top: number;
  art: Art;
  /** CSS pixels per art pixel, over the map scale: n for small art stretched over an n-tile footprint, 1 for art drawn at its footprint's size. */
  k: number;
  /** Drawn mirrored. */
  flip: boolean;
}

/** Diamonds are at least 32px tall, so the tap area matches a 32px square. */
const MIN_SCALE = 2;
/** Zoom stays on whole-number scales so pixels stay crisp. 1 is an overview: tiles get small, but taps still land. */
export const ZOOM_MIN = 1;
export const ZOOM_MAX = 6;
/** Grids at least this wide open at half size. */
const HALF_ZOOM_GRID_W = 52;
const POP_MS = 1200;
const BURST_MS = 600;
/** Margin below the map's front corner, in art pixels, so the bottom row is not flush with the edge. */
const DEPTH = 6;
/** Art-pixel size of the whole map, from the left corner to the right and from the headroom to the dirt edge. Follows the grid. */
let MAP_W = 0;
let MAP_H = 0;
/** Extra pan below the grid's front corner, in tiles. The sea carries on past the world's edge, so it never runs out. */
const PAN_BELOW = 7;
/** How far dragging can go around the grid, in art pixels from tile (0,0)'s top corner. Up far enough to see the mountains. */
let PAN_LEFT = 0;
let PAN_TOP = 0;
let PAN_W = 0;
let PAN_H = 0;

function measure(): void {
  MAP_W = ((GRID_W + GRID_H) * TW) / 2;
  MAP_H = TOP + ((GRID_W + GRID_H) * TH) / 2 + DEPTH;
  PAN_LEFT = (GRID_H * TW) / 2 + TW;
  PAN_TOP = WORLD_OY - HORIZON + 150;
  PAN_W = PAN_LEFT + (GRID_W * TW) / 2 + TW;
  PAN_H = PAN_TOP + ((GRID_W + GRID_H) * TH) / 2 + PAN_BELOW * TH;
}
measure();

export class MapView {
  /** Art pixels to CSS pixels. */
  scale = MIN_SCALE;
  /** Diamond height in CSS pixels, the narrowest part of a tap target. */
  tile = TH * MIN_SCALE;
  /** CSS position of tile (0,0)'s top corner. */
  ox = 0;
  oy = 0;
  effects = true;
  /** Walkers and idle loops move. Off with reduce motion. */
  motion = true;
  /** Game time is held (manual or auto pause). Walkers stand still; weather and idle loops go on. */
  frozen = false;
  /** Real ms spent paused, taken off the world clock so ambient motion stops, and when the last frame drew. */
  private pausedFor = 0;
  private lastDraw = 0;
  /** Game time in months, fractional, for day and night. */
  clock = 0;
  readonly crowd = new Crowd();
  readonly fx = new Fx();
  private readonly air = new Atmosphere();
  readonly weather = new Weather();
  /** Income squash per tile key, by start time. */
  private bounces = new Map<number, number>();
  /** Night level this frame, 0 to 1. */
  private night = 0;
  private lights: { x: number; y: number; after: number }[] = [];
  private pops: Pop[] = [];
  private bursts: Burst[] = [];
  private world: HTMLCanvasElement | null = null;
  private hits: Hit[] = [];
  ghost: Ghost | null = null;
  /** While placing: 1 for every tile a valid footprint can cover, so the free spots light up. */
  valid: Uint8Array | null = null;
  /** A building being moved is hidden from its old spot while its ghost shows the new one. */
  hidden: number | null = null;
  selected: number | null = null;

  constructor(private canvas: HTMLCanvasElement) {}

  private viewW = 0;
  private viewH = 0;
  private panX = 0;
  private panY = 0;
  private centred = false;
  /** Scale the player zoomed to. Null follows the screen size. */
  private zoomed: number | null = null;

  /** The grid changed size: lay the world out again, redraw it and open on the player's RT. */
  regrid(): void {
    layoutWorld();
    measure();
    this.world = null;
    this.centred = false;
    // A grown map opens at its own default size, half size for the Kelurahan.
    this.zoomed = null;
    this.resize();
  }

  /** The box changed shape under the camera (home screen opens or closes): open on the kampung again. */
  recentre(): void {
    this.centred = false;
    this.resize();
  }

  resize(): void {
    const dpr = window.devicePixelRatio || 1;
    const { clientWidth: w, clientHeight: h } = this.canvas;
    this.canvas.width = Math.round(w * dpr);
    this.canvas.height = Math.round(h * dpr);
    // Whole-number scale keeps pixels crisp. A small screen pans instead of shrinking tiles.
    // Kelurahan is 52 tiles wide, so it opens at half size. Its lots take 2x2 tiles and still tap like one RT tile.
    this.scale = this.zoomed ?? Math.max(GRID_W >= HALF_ZOOM_GRID_W ? MIN_SCALE / 2 : MIN_SCALE, Math.floor(Math.min(w / MAP_W, h / MAP_H)));
    this.tile = TH * this.scale;
    this.viewW = w;
    this.viewH = h;
    if (!this.centred && w > 0) {
      // Open on the middle of the kampung, where the Kantor RT stands.
      this.panX = w / 2 - (((RT_W - RT_H) * TW) / 4 + PAN_LEFT) * this.scale;
      this.panY = h / 2 - (((RT_W + RT_H) * TH) / 4 + PAN_TOP) * this.scale;
      this.centred = true;
    }
    this.clampPan();
  }

  private clampPan(): void {
    const gw = PAN_W * this.scale;
    const gh = PAN_H * this.scale;
    this.panX = gw <= this.viewW ? 0 : Math.max(this.viewW - gw, Math.min(0, this.panX));
    this.panY = gh <= this.viewH ? 0 : Math.max(this.viewH - gh, Math.min(0, this.panY));
    const left = Math.floor(gw <= this.viewW ? (this.viewW - gw) / 2 : this.panX);
    const top = Math.floor(gh <= this.viewH ? (this.viewH - gh) / 2 : this.panY);
    this.ox = left + PAN_LEFT * this.scale;
    this.oy = top + PAN_TOP * this.scale;
  }

  /**
   * Zooms by whole steps, keeping the ground under (cx, cy) in place: the mouse pointer, or the middle
   * of a pinch. Returns false at either end of the range.
   */
  zoomBy(steps: number, cx = this.viewW / 2, cy = this.viewH / 2): boolean {
    const next = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, this.scale + steps));
    if (next === this.scale) return false;
    // Art-pixel point under the anchor, measured from tile (0,0)'s top corner.
    const ax = (cx - this.ox) / this.scale;
    const ay = (cy - this.oy) / this.scale;
    this.zoomed = next;
    this.scale = next;
    this.tile = TH * next;
    this.panX = cx - ax * next - PAN_LEFT * next;
    this.panY = cy - ay * next - PAN_TOP * next;
    this.clampPan();
    return true;
  }

  panBy(dx: number, dy: number): void {
    this.panX += dx;
    this.panY += dy;
    this.clampPan();
  }

  /** The ground tile at the middle of the view, or null when it is off the grid. */
  centreTile(): { x: number; y: number } | null {
    return this.tileAt(this.viewW / 2, this.viewH / 2);
  }

  /** True when a tile's centre is inside the view with a margin, so the ghost is not born off screen. */
  inView(x: number, y: number, margin = 48): boolean {
    const c = this.tileCentre(x, y);
    return c.x > margin && c.y > margin && c.x < this.viewW - margin && c.y < this.viewH - margin;
  }

  /** Pans so a tile sits in the middle of the view. */
  centreOn(x: number, y: number): void {
    const c = this.tileCentre(x, y);
    this.panBy(this.viewW / 2 - c.x, this.viewH / 2 - c.y);
  }

  /** True when the map is bigger than the view, so dragging pans. */
  get scrolls(): boolean {
    return PAN_W * this.scale > this.viewW || PAN_H * this.scale > this.viewH;
  }

  /** CSS position of a tile's top corner. */
  private corner(x: number, y: number): { x: number; y: number } {
    return { x: this.ox + ((x - y) * TW * this.scale) / 2, y: this.oy + ((x + y) * TH * this.scale) / 2 };
  }

  /** Ground tile under a point. Taps hit a building's base tiles, never its sprite, so a tall building cannot hide the one behind it. */
  tileAt(px: number, py: number): { x: number; y: number } | null {
    const a = (px - this.ox) / ((TW * this.scale) / 2);
    const b = (py - this.oy) / ((TH * this.scale) / 2);
    const x = Math.floor((a + b) / 2);
    const y = Math.floor((b - a) / 2);
    return x >= 0 && y >= 0 && x < GRID_W && y < GRID_H ? { x, y } : null;
  }

  /** Screen position of a tile's ground centre, relative to the canvas. */
  /**
   * July and August from the second year: bunting from the Kantor RT's roof to the nearest few buildings, and an
   * umbul-umbul on each free tile in front of it. Drawn before the night tint, so it darkens with the kampung.
   */
  private agustus(ctx: CanvasRenderingContext2D, sorted: Building[], tops: Map<number, number>): void {
    const k = sorted.find((b) => b.def === 'kantorRT');
    const kTop = k && tops.get(k.y * GRID_W + k.x);
    if (!k || kTop === undefined) return;
    const from = { x: this.tileCentre(k.x, k.y).x, y: kTop + 4 * this.scale };
    const near = sorted
      .filter((b) => b !== k && tops.has(b.y * GRID_W + b.x) && Math.abs(b.x - k.x) + Math.abs(b.y - k.y) <= 4)
      .sort((a, b) => Math.abs(a.x - k.x) + Math.abs(a.y - k.y) - (Math.abs(b.x - k.x) + Math.abs(b.y - k.y)))
      .slice(0, 3);
    for (const b of near) drawBunting(ctx, from.x, from.y, this.tileCentre(b.x, b.y).x, tops.get(b.y * GRID_W + b.x)! + 4 * this.scale, this.scale);
    let colour = 0;
    for (const p of [{ x: k.x, y: k.y + 1 }, { x: k.x + 1, y: k.y }]) {
      if (p.x >= GRID_W || p.y >= GRID_H || this.occupied.has(p.y * GRID_W + p.x) || !this.onScreen(p.x, p.y)) continue;
      const c = this.tileCentre(p.x, p.y);
      drawUmbul(ctx, c.x, c.y, this.scale, colour++);
    }
  }

  /** A pile of map folders, bottom centre at (x, y): manila with a dark edge, each a little askew. */
  private folders(ctx: CanvasRenderingContext2D, x: number, y: number, n: number): void {
    const s = this.scale;
    for (let i = 0; i < n; i++) {
      const dx = (i % 2 ? 1 : -1) * s;
      const fy = y - (i + 1) * 2 * s;
      ctx.fillStyle = '#603620';
      ctx.fillRect(x - 4 * s + dx, fy, 8 * s, 2 * s);
      ctx.fillStyle = i % 3 === 2 ? '#e57d2e' : '#eac58f';
      ctx.fillRect(x - 4 * s + dx + s, fy, 6 * s, s);
    }
  }

  tileCentre(x: number, y: number): { x: number; y: number } {
    const c = this.corner(x, y);
    return { x: c.x, y: c.y + (TH * this.scale) / 2 };
  }

  pop(x: number, y: number, res: ResourceId, amount: number, label?: string): void {
    const text = label ?? (res === 'rupiah' ? rupiahShort(amount) : `${amount > 0 ? '+' : ''}${Math.round(amount * 10) / 10}`);
    // Several resources on one tile stack upward instead of overlapping.
    const stack = this.pops.filter((p) => p.x === x && p.y === y && performance.now() - p.born < POP_MS).length;
    this.pops.push({ x, y, text, res, born: performance.now(), dy: stack * 22 });
    if (this.effects && amount > 0) this.bounces.set(y * GRID_W + x, performance.now());
  }

  private spawned = new Map<number, number>();

  /** A finished building pops in with a short scale-up. */
  spawn(uid: number): void {
    if (this.effects) this.spawned.set(uid, performance.now());
  }

  burst(x: number, y: number): void {
    if (!this.effects) return;
    this.bursts.push({ x, y, born: performance.now() });
    this.fx.dustRing(x, y, performance.now());
  }

  /** Where the Place buttons go: the ghost's bottom corner, and its top corner for when there is no room below. Canvas pixels. */
  ghostAnchor(): { x: number; below: number; above: number } | null {
    const g = this.ghost;
    if (!g) return null;
    const sh = ghostShape(g);
    const c = this.tileCentre(g.x + (sh.w - 1) / 2, g.y + (sh.h - 1) / 2);
    const hh = (TH * this.scale * (sh.w + sh.h)) / 4;
    return { x: c.x, below: c.y + hh, above: c.y - hh };
  }

  /** The kampung and the land around it, drawn once at art resolution. */
  drawWorld(): HTMLCanvasElement {
    return (this.world ??= buildWorld());
  }

  /** Draws art for a tile. Returns where it landed, for tap picking. */
  /** CSS position of a ground point in tile space, where (x + 0.5, y + 0.5) is a tile centre. */
  project = (fx: number, fy: number): { x: number; y: number } => ({
    x: this.ox + ((fx - fy) * TW * this.scale) / 2,
    y: this.oy + ((fx + fy) * TH * this.scale) / 2,
  });

  /** squash flattens the art for an income bounce, anchored on the ground. */
  private art(ctx: CanvasRenderingContext2D, art: Art, x: number, y: number, grow = 1, squash = 0, n = 1, flip = false): Hit {
    const c = this.corner(x, y);
    const s = this.scale;
    // A bigger footprint covers n tiles a side. Art from iso(name, variant, n) is already that big, with
    // 1px outlines, so it draws at the map scale; small art stretches by n (the ghost row, scenery).
    // The art's top corner lands on the tile's top corner, which also lines up long art.
    const g = s * n;
    const k = g / art.n;
    const left = c.x - art.cornerX * k;
    const top = c.y - art.cornerY * k;
    if (flip) {
      ctx.save();
      ctx.translate(c.x, 0);
      ctx.scale(-1, 1);
      ctx.translate(-c.x, 0);
    }
    if (grow < 1 || squash) {
      // Scale up from the footprint's ground centre, so the building rises out of its plot.
      const gx = left + (art.cornerX + ((art.w - art.h) * TW) / 4) * k;
      const gy = top + (art.cornerY + ((art.w + art.h) * TH) / 4) * k;
      const sx = grow * (1 + squash / 2);
      const sy = grow * (1 - squash);
      ctx.drawImage(art.canvas, gx - (gx - left) * sx, gy - (gy - top) * sy, art.canvas.width * k * sx, art.canvas.height * k * sy);
    } else ctx.drawImage(art.canvas, left, top, art.canvas.width * k, art.canvas.height * k);
    if (flip) ctx.restore();
    return { x, y, left, top, art, k: k / s, flip };
  }

  /** Flat 2D sprite standing on the tile centre, used for the permit sign. */
  private sign(ctx: CanvasRenderingContext2D, name: string, x: number, y: number): void {
    const c = this.tileCentre(x, y);
    const src = sprite(name);
    const w = src.width * this.scale;
    ctx.drawImage(src, c.x - w / 2, c.y - w, w, w);
  }

  /** The ground outline of a w x h footprint, grown by a fraction round its centre. */
  private diamond(ctx: CanvasRenderingContext2D, x: number, y: number, grow = 0, w = 1, h = w): void {
    const c = this.tileCentre(x + (w - 1) / 2, y + (h - 1) / 2);
    const at = (cx: number, cy: number) => {
      const p = this.corner(cx, cy);
      return [c.x + (p.x - c.x) * (1 + grow), c.y + (p.y - c.y) * (1 + grow)];
    };
    const pts = [at(x, y), at(x + w, y), at(x + w, y + h), at(x, y + h)];
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (const q of pts.slice(1)) ctx.lineTo(q[0], q[1]);
    ctx.closePath();
  }

  /** A pixel arrow bobbing over the ghost, so the building in hand is found at a glance. */
  private ghostArrow(ctx: CanvasRenderingContext2D, x: number, y: number, sh: Shape, sprite: string, now: number): void {
    const top = this.artTop(x, y, iso(sprite, undefined, sh.n, 1, sh.fa, sh.fb), sh);
    const c = this.tileCentre(x + (sh.w - 1) / 2, y + (sh.h - 1) / 2);
    const u = Math.max(2, Math.round(this.scale));
    const bob = this.motion ? (Math.floor(now / 300) % 2) * u : 0;
    const ax = Math.round(c.x);
    const ay = Math.round(top - 6 * u + bob);
    // A 7-pixel-wide chevron in mustard with a dark amber rim, art-pixel steps only.
    const rows = [7, 5, 3, 1];
    ctx.fillStyle = '#8a4f12';
    rows.forEach((w, i) => ctx.fillRect(ax - ((w + 2) * u) / 2, ay + (i - 1) * u, (w + 2) * u, u * 2));
    ctx.fillStyle = '#f4b935';
    rows.forEach((w, i) => ctx.fillRect(ax - (w * u) / 2, ay + (i - 1) * u, w * u, u));
  }

  /** Top of a tile's art, in CSS pixels, for badges and pops. */
  private artTop(x: number, y: number, art: Art | null, sh: Pick<Shape, 'w' | 'h' | 'n'> = { w: 1, h: 1, n: 1 }): number {
    return this.tileCentre(x + (sh.w - 1) / 2, y + (sh.h - 1) / 2).y - (art ? (art.height * sh.n) / art.n : 0) * this.scale;
  }

  /** Tiles holding a selokan and tiles holding anything, rebuilt each frame so lookups stay O(1) on a big map. */
  private selokan = new Set<number>();
  private occupied = new Set<number>();

  /** True when a tile's art could reach the screen. Margin covers the tallest sprite and the walkers. */
  private onScreen(x: number, y: number): boolean {
    const c = this.corner(x, y);
    const m = 80 * this.scale;
    return c.x > -m && c.x < this.viewW + m && c.y > -m && c.y < this.viewH + m * 2;
  }

  /** How a building is drawn. The map and the ghost of a building being moved both use it, so they always match. */
  look(b: Building): Shape & { sprite: string; variant?: string; level: number; flip: boolean } {
    return { sprite: def(b.def).sprite, variant: this.variant(b), level: b.level, flip: b.rot === 1, ...shapeOf(b) };
  }

  variant(b: Building): string | undefined {
    // Houses vary by roof colour, roof shape and wall colour, like a perumahan built over the years.
    if (b.def === 'rumah') return ROOF_COLOURS[b.uid % ROOF_COLOURS.length] + ROOF_SHAPES[Math.floor(b.uid / 5) % ROOF_SHAPES.length] + WALL_COLOURS[Math.floor(b.uid / 2) % WALL_COLOURS.length];
    if (b.def !== 'selokan' && b.def !== 'biopori') return undefined;
    const has = (dx: number, dy: number) => this.selokan.has((b.y + dy) * GRID_W + b.x + dx);
    return !has(1, 0) && !has(-1, 0) && (has(0, 1) || has(0, -1)) ? 'y' : undefined;
  }

  draw(s: GameState): void {
    const ctx = this.canvas.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const now = performance.now();
    // Ambient motion (scenery, walkers, idle buildings, weather) runs on a world clock that stops while time is
    // paused. Feedback for what the player does (ghost, bursts, pops) keeps real time.
    if (this.frozen && this.lastDraw) this.pausedFor += now - this.lastDraw;
    this.lastDraw = now;
    const world = now - this.pausedFor;
    const sc = this.scale;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;
    const wx = this.ox - WORLD_OX * sc;
    const wy = this.oy - WORLD_OY * sc;
    // Past the world's edges the sky and sea carry on.
    ctx.fillStyle = SEA;
    ctx.fillRect(0, 0, this.viewW, this.viewH);
    ctx.fillStyle = SKY;
    ctx.fillRect(0, 0, this.viewW, Math.max(0, wy + HORIZON * sc));
    // Only the part of the world on screen, so a big map costs the same as a small one.
    const sx = Math.max(0, Math.floor(-wx / sc));
    const sy = Math.max(0, Math.floor(-wy / sc));
    const sw = Math.min(WORLD_W - sx, Math.ceil(this.viewW / sc) + 2);
    const sh = Math.min(WORLD_H - sy, Math.ceil(this.viewH / sc) + 2);
    if (sw > 0 && sh > 0) ctx.drawImage(this.drawWorld(), sx, sy, sw, sh, wx + sx * sc, wy + sy * sc, sw * sc, sh * sc);
    this.drawBackdrop(ctx, wx, wy, world);

    const sel = s.buildings.find((b) => b.uid === this.selected);
    // Ambient occlusion: a soft contact shadow pooled round the foot of every standing building.
    const ao = contactShadow();
    this.selokan.clear();
    this.occupied.clear();
    // AI-run RTs draw like the player's buildings but cannot be tapped or animated.
    const ai = new Set<number>();
    const all: Building[] = [...s.buildings];
    for (const n of s.neighbours) for (const b of n.buildings) { all.push(b); ai.add(b.uid); }
    for (const b of all) {
      for (const p of tilesOf(b)) this.occupied.add(p.y * GRID_W + p.x);
      if (b.def === 'selokan' || b.def === 'biopori') this.selokan.add(b.y * GRID_W + b.x);
    }
    for (const b of all) {
      if (FLAT_AO.has(b.def) || !this.onScreen(b.x, b.y)) continue;
      const { w: fw, h: fh } = sizeOf(b);
      const c = this.tileCentre(b.x + (fw - 1) / 2, b.y + (fh - 1) / 2);
      const w = TW * 1.5 * sc * ((fw + fh) / 2);
      ctx.drawImage(ao, c.x - w / 2, c.y - w / 4, w, w / 2);
    }

    if (sel) {
      this.diamond(ctx, sel.x, sel.y, 0, sizeOf(sel).w, sizeOf(sel).h);
      ctx.fillStyle = 'rgba(244, 244, 245, 0.25)';
      ctx.fill();
    }
    if (this.valid && this.ghost && !this.ghost.tiles) {
      // Every free spot gets a faint diamond, so it is plain the building goes on the grid.
      ctx.beginPath();
      const hw = (TW * sc) / 2;
      const hh = (TH * sc) / 2;
      for (let y = 0; y < GRID_H; y++)
        for (let x = 0; x < GRID_W; x++) {
          if (!this.valid[y * GRID_W + x]) continue;
          const c = this.tileCentre(x, y);
          if (c.x < -hw || c.y < -hh || c.x > this.viewW + hw || c.y > this.viewH + hh) continue;
          ctx.moveTo(c.x, c.y - hh + 2);
          ctx.lineTo(c.x + hw - 4, c.y);
          ctx.lineTo(c.x, c.y + hh - 2);
          ctx.lineTo(c.x - hw + 4, c.y);
          ctx.closePath();
        }
      ctx.fillStyle = 'rgba(246, 236, 212, 0.26)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(246, 236, 212, 0.55)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    if (this.ghost) {
      for (const g of this.ghost.tiles ?? [this.ghost]) {
        const gs = ghostShape(this.ghost);
        this.diamond(ctx, g.x, g.y, 0, gs.w, gs.h);
        ctx.fillStyle = g.ok ? 'rgba(74, 222, 128, 0.35)' : 'rgba(248, 113, 113, 0.35)';
        ctx.fill();
      }
    }

    // Back to front: tiles further up the screen draw first. Walkers slot in by the same depth.
    // A big building sorts by its front tile, so it draws over what stands behind it and under what stands in front.
    const front = (b: Building) => b.x + b.y + sizeOf(b).w + sizeOf(b).h - 2;
    const sorted = all.sort((a, b) => front(a) - front(b) || a.x - b.x);
    const tops = new Map<number, number>();
    this.hits = [];
    // Scenery on empty tiles joins the same back-to-front order, but never the tap list.
    const deco: { x: number; y: number; name: string }[] = [];
    for (let d = 0; d < GRID_W + GRID_H - 1; d++)
      for (let x = Math.max(0, d - GRID_H + 1); x <= Math.min(d, GRID_W - 1); x++) {
        const y = d - x;
        if (!this.onScreen(x, y) || this.occupied.has(y * GRID_W + x)) continue;
        const name = decoAt(x, y);
        if (name && !(this.ghost && this.ghost.x === x && this.ghost.y === y)) deco.push({ x, y, name });
      }
    // From 2 stars the scenery edge thins and the neighbours' roofs show beyond the road.
    if (s.stage.current === 'rt' && s.stage.stars.rt >= 2) for (const r of farRoofs()) if (this.onScreen(r.x, r.y)) deco.push(r);
    deco.sort((a, b) => a.x + a.y - (b.x + b.y) || a.x - b.x);
    let di = 0;
    const decoUntil = (depth: number, x: number) => {
      for (; di < deco.length && (deco[di].x + deco[di].y < depth || (deco[di].x + deco[di].y === depth && deco[di].x < x)); di++) this.art(ctx, iso(deco[di].name), deco[di].x, deco[di].y);
    };
    this.night = this.effects ? darkness(this.clock) : 0;
    this.lights = [];
    this.crowd.bubbles = this.effects && !this.frozen;
    this.crowd.update(s, world, this.motion && !this.frozen, darkness(this.clock));
    this.crowd.begin();
    const drawOne = (b: Building): void => {
      if (!this.onScreen(b.x, b.y) || b.uid === this.hidden) return;
      const sh = this.look(b);
      const { sprite, variant, n, level, flip } = sh;
      const art = iso(sprite, variant, n, level, sh.fa, sh.fb);
      // Site sprites (stakes, scaffold) are one per tile on a long lot; the crane stands on its back tile.
      const site = (name: string, all = true): Hit | undefined => {
        if (sh.fa === sh.fb) return this.art(ctx, iso(name, undefined, n), b.x, b.y, 1, 0, n, flip);
        let first: Hit | undefined;
        for (const t of tilesOf(b).sort((p, q) => p.x + p.y - (q.x + q.y))) {
          const hit = this.art(ctx, iso(name), t.x, t.y, 1, 0, 1, flip);
          first ??= hit;
          if (!all) break;
        }
        return first;
      };
      if (ai.has(b.uid)) {
        this.art(ctx, art, b.x, b.y, 1, 0, n, flip);
        tops.set(b.y * GRID_W + b.x, this.artTop(b.x, b.y, art, sh));
        return;
      }
      if (b.status === 'permit') {
        // Waiting for a permit: nothing is built yet. The plot is staked out with string, under the permit sign.
        this.hits.push(site('patok')!);
        this.sign(ctx, 'permit', b.x, b.y);
      } else if (b.status === 'building') {
        // Being built: the half-made building in its scaffold, with a crane over the site.
        ctx.globalAlpha = 0.5;
        this.hits.push(this.art(ctx, art, b.x, b.y, 1, 0, n, flip));
        ctx.globalAlpha = 1;
        site('scaffold');
        site('crane', false);
        if (this.effects) this.fx.construct(b.x, b.y, world);
      } else if (b.status === 'mangkrak') {
        ctx.filter = 'grayscale(1) brightness(0.7)';
        this.hits.push(this.art(ctx, art, b.x, b.y, 1, 0, n, flip));
        ctx.filter = 'none';
        site('scaffold');
      } else if (b.status === 'damaged') {
        // A broken path greys out as a whole tile; other buildings tint brown.
        ctx.filter = b.def === 'jalan' ? 'grayscale(1) brightness(0.78) contrast(1.1)' : 'sepia(1) brightness(0.6)';
        this.hits.push(this.art(ctx, art, b.x, b.y, 1, 0, n, flip));
        ctx.filter = 'none';
        if (b.def === 'jalan') {
          this.cracks(ctx, b);
          // A broken path must read at a glance: a red tint and an orange edge that breathes slowly
          // (steady with reduce motion), so it stands out from the sandy paths round it.
          const pulse = this.motion ? 0.5 + 0.5 * Math.sin(now / 420) : 1;
          this.diamond(ctx, b.x, b.y);
          ctx.fillStyle = `rgba(220, 38, 38, ${0.2 + 0.15 * pulse})`;
          ctx.fill();
          ctx.strokeStyle = `rgba(234, 88, 12, ${0.55 + 0.45 * pulse})`;
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      } else if (b.noRoad) {
        ctx.filter = 'grayscale(1) brightness(0.75)';
        this.hits.push(this.art(ctx, art, b.x, b.y, 1, 0, n, flip));
        ctx.filter = 'none';
      } else {
        const born = this.spawned.get(b.uid);
        const k = born === undefined ? 1 : Math.min(1, (now - born) / 350);
        if (k >= 1) this.spawned.delete(b.uid);
        this.hits.push(this.art(ctx, art, b.x, b.y, 0.6 + 0.4 * (1 - (1 - k) ** 3), this.squash(b, now), n, flip));
        if (b.level > 1) this.levelPips(ctx, b.x + sh.w - 1, b.y + sh.h - 1, b.level);
        this.idle(ctx, b, world);
      }
      const siteArt = (name: string) => (sh.fa === sh.fb ? iso(name, undefined, n) : iso(name));
      const topArt = b.status === 'building' ? siteArt('crane') : b.status === 'mangkrak' ? siteArt('scaffold') : b.status === 'permit' ? siteArt('patok') : art;
      tops.set(b.y * GRID_W + b.x, this.artTop(b.x, b.y, topArt, topArt === art || sh.fa === sh.fb ? sh : { ...sh, n: 1 }));
    };
    // Flat pieces are ground: paths, fields and ponds draw first, so no walker or building ever hides under them.
    const { ground, standing } = groundFirst(sorted);
    for (const b of ground) drawOne(b);
    for (const b of standing) {
      decoUntil(front(b), b.x);
      this.crowd.drawUntil(ctx, front(b) + 1, this.project, sc, world, this.motion && !this.frozen);
      drawOne(b);
    }

    decoUntil(Infinity, 0);
    this.crowd.drawUntil(ctx, Infinity, this.project, sc, world, this.motion && !this.frozen);
    this.fx.drawPuffs(ctx, this.project, sc, now, (fx, fy) => {
      const k = Math.floor(fy) * GRID_W + Math.floor(fx);
      return this.project(fx, fy).y - (tops.get(k) ?? this.project(fx, fy).y);
    });
    if (agustusan(s)) this.agustus(ctx, sorted, tops);
    if (this.effects) {
      this.air.draw(ctx, this.viewW, this.viewH, world, this.night, dusk(this.clock), this.motion);
      drawTint(ctx, this.viewW, this.viewH, this.clock);
      this.drawLights(ctx);
      this.weather.draw(ctx, this.viewW, this.viewH, sc, world, (x, y) => ({ x: wx + x * sc, y: wy + y * sc }), shorePoints());
    }

    // Badges sit above every building so a taller neighbour in front never hides them.
    const badges: BadgeBox[] = [];
    for (const b of sorted) {
      if (!tops.has(b.y * GRID_W + b.x)) continue;
      const label = b.status === 'permit' ? `${permitEta(s, b)}` : b.status === 'building' ? `${b.timer}` : b.status === 'mangkrak' ? '80%' : b.status === 'damaged' ? '!' : b.noRoad ? t('map.noRoad') : null;
      if (label) this.badge(ctx, this.tileCentre(b.x, b.y).x, tops.get(b.y * GRID_W + b.x)! - 12, label, badges, b.status === 'damaged');
    }
    // The permit queue as a pile of folders on the Kantor RT: one for every two waiting, up to six.
    const berkas = queueBerkas(s);
    if (berkas > 0) {
      const k = s.buildings.find((b) => b.def === 'kantorRT');
      const top = k && tops.get(k.y * GRID_W + k.x);
      if (k && top !== undefined) this.folders(ctx, this.tileCentre(k.x, k.y).x + 6 * this.scale, top + 2 * this.scale, Math.min(6, Math.ceil(berkas / 2)));
    }
    // A clean sweep at the 17 Agustus lomba: the trophy stands on the Kantor RT for a year.
    if ((s.pialaUntil ?? -1) > s.month) {
      const k = s.buildings.find((b) => b.def === 'kantorRT');
      const top = k && tops.get(k.y * GRID_W + k.x);
      if (k && top !== undefined) {
        const cup = sprite('piala');
        const w = cup.width * this.scale;
        ctx.drawImage(cup, this.tileCentre(k.x, k.y).x - w / 2, top - w + 2 * this.scale, w, w);
      }
    }
    // Speech bubbles go last of all, above buildings, window lights, weather and badges.
    this.crowd.drawBubbles(ctx);

    if (this.ghost) {
      const g = this.ghost;
      for (const p of g.tiles ?? [g]) {
        if ('have' in p && p.have) continue;
        const sh = ghostShape(g);
        // The ghost breathes, so the eye finds it at once. Steady with reduce motion.
        const breath = this.motion ? 0.5 + 0.5 * Math.sin(now / 260) : 0.5;
        ctx.globalAlpha = p.ok ? 0.72 + 0.2 * breath : 0.5;
        if (!p.ok) ctx.filter = 'grayscale(1) sepia(1) hue-rotate(-50deg) saturate(4)';
        this.art(ctx, iso(g.sprite, g.variant, sh.n, g.level, sh.fa, sh.fb), p.x, p.y, 1, 0, sh.n, g.flip);
        ctx.filter = 'none';
        ctx.globalAlpha = 1;
        // A building being moved shows its level pips too, as it does standing on the map.
        if (!g.tiles && (g.level ?? 1) > 1) this.levelPips(ctx, p.x + sh.w - 1, p.y + sh.h - 1, g.level!);
        this.diamond(ctx, p.x, p.y, 0, sh.w, sh.h);
        ctx.strokeStyle = p.ok ? '#4ade80' : '#f87171';
        ctx.lineWidth = p.ok ? 2 + Math.round(breath) : 2;
        if (!g.tiles) this.ghostArrow(ctx, p.x, p.y, sh, g.sprite, now);
        ctx.setLineDash(p.ok ? [] : [4, 3]);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }
    if (sel) {
      this.diamond(ctx, sel.x, sel.y, 0, sizeOf(sel).w, sizeOf(sel).h);
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

    this.fx.drawPulse(ctx, this.viewW, this.viewH, now);
    this.fx.drawCoins(ctx, this.project, sc, now);
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

  /** Coins arc from a tile to a point on the canvas, such as the money chip. */
  coins(x: number, y: number, n: number, to: { x: number; y: number }, land?: () => void): void {
    if (this.effects) this.fx.coins(x, y, n, to, performance.now(), land);
  }

  /** Fanfare-tier glow around the map edge. */
  pulse(): void {
    if (this.effects) this.fx.pulse(performance.now());
  }

  /**
   * The sun bobs and blinks, and the trees round the kampung bounce in a slow wave. Both are
   * ambient life, so they hold still with reduce motion.
   */
  private drawBackdrop(ctx: CanvasRenderingContext2D, wx: number, wy: number, now: number): void {
    const s = this.scale;
    const t = this.motion ? now : 0;
    // Blink for 150 ms every 3.2 s, with a quick double blink every third time.
    const beat = t % 9600;
    const blink = this.motion && [0, 3200, 3450, 6400].some((at) => beat >= at && beat < at + 150);
    const bob = Math.round(Math.sin(t / 450) * 2);
    const sun = sunArt(blink);
    // A warm halo round the sun, like light blooming through haze.
    const halo = sunHalo();
    const hr = SUN_SIZE * 2.4 * s;
    ctx.drawImage(halo, wx + SUN_X * s - hr / 2, wy + (SUN_Y + bob) * s - hr / 2, hr, hr);
    ctx.drawImage(sun, wx + (SUN_X - SUN_SIZE / 2) * s, wy + (SUN_Y - SUN_SIZE / 2 + bob) * s, SUN_SIZE * s, SUN_SIZE * s);

    // Clouds slide slowly to and fro, and now and then one twitches up a pixel and settles.
    clouds().forEach((c, i) => {
      const dx = Math.round(Math.sin(t / c.period * Math.PI * 2 + c.phase) * c.sway);
      const tick = Math.floor(t / 650);
      const twitch = this.motion && ((tick * 7 + i * 13) % 23 === 0) ? -1 : 0;
      const left = wx + (c.x + dx) * s;
      const top = wy + (c.y + twitch) * s;
      if (left > this.viewW || left + c.art.width * s < 0 || top > this.viewH || top + c.art.height * s < 0) return;
      ctx.drawImage(c.art, left, top, c.art.width * s, c.art.height * s);
    });

    // Ground anchor row in tree art: the stretch grows upward from the roots.
    const anchor = TOP + TH / 2;
    for (const tree of worldTrees()) {
      const art = iso(tree.name);
      const left = wx + tree.x * s;
      const top = wy + tree.y * s;
      const w = art.canvas.width * s;
      const h = art.canvas.height * s;
      if (left > this.viewW || left + w < 0 || top > this.viewH || top + h < 0) continue;
      // One art pixel of stretch and squash, so pixels stay whole.
      const dh = Math.round(Math.sin(t / 700 + (tree.tx * 0.9 + tree.ty * 0.4)) * 1.4);
      const f = (anchor + dh) / anchor;
      ctx.drawImage(art.canvas, left, top + anchor * s * (1 - f), w, h * f);
    }
  }

  /** Lit windows, skipping any hidden behind a building drawn in front of them. */
  private drawLights(ctx: CanvasRenderingContext2D): void {
    const s = this.scale;
    ctx.globalAlpha = this.night;
    ctx.fillStyle = '#fde68a';
    for (const l of this.lights) {
      const cx = l.x + s;
      const cy = l.y + s;
      const hidden = this.hits.slice(l.after).some((h) => {
        const ax = Math.floor((cx - h.left) / (s * h.k));
        const ay = Math.floor((cy - h.top) / (s * h.k));
        return ax >= 0 && ay >= 0 && ax < h.art.canvas.width && ay < h.art.canvas.height && h.art.alpha[ay * h.art.canvas.width + ax] > 0;
      });
      if (!hidden) ctx.fillRect(l.x, l.y, 2 * s, 3 * s);
    }
    ctx.globalAlpha = 1;
  }

  /** A building that just earned squashes down and springs back. */
  private squash(b: Building, now: number): number {
    const key = b.y * GRID_W + b.x;
    const t = this.bounces.get(key);
    if (t === undefined) return 0;
    const k = (now - t) / 320;
    if (k >= 1 || k < 0) {
      this.bounces.delete(key);
      return 0;
    }
    return 0.12 * Math.sin(k * Math.PI) * (1 - k);
  }

  /** Small loops on working buildings: the wifi light blinks, warung steam rises, the tukang parkir waves. */
  private idle(ctx: CanvasRenderingContext2D, b: Building, now: number): void {
    const c = this.tileCentre(b.x, b.y);
    const s = this.scale;
    const px = (x: number, y: number, col: string) => {
      ctx.fillStyle = col;
      ctx.fillRect(Math.round(c.x + x * s), Math.round(c.y + y * s), s, s);
    };
    if (b.def === 'wifi' && (!this.motion || Math.floor((now + b.uid * 211) / 450) % 3 === 0)) {
      ctx.fillStyle = 'rgba(239, 68, 68, 0.35)';
      ctx.fillRect(Math.round(c.x - 2 * s), Math.round(c.y - 37 * s), 4 * s, 4 * s);
      px(-1, -36, '#fca5a5');
      px(0, -36, '#ef4444');
    } else if (b.def === 'warung' && this.effects) this.fx.steam(b.x, b.y, now);
    else if (b.def === 'rumah' && this.night > 0) {
      // Windows light up after dark. They draw over the night tint, so note which buildings sit in front.
      for (const [x, y] of [[-8, -5], [2, -3], [6, -5]]) this.lights.push({ x: Math.round(c.x + (b.rot ? -x : x) * s), y: Math.round(c.y + y * s), after: this.hits.length });
    } else if (b.def === 'parkir') {
      // Waves at everyone, faster when someone walks past. Even pedestrians get the prit.
      const gap = this.crowd.near(b.x, b.y, 2) ? 140 : 420;
      const up = !this.motion || Math.floor((now + b.uid * 97) / gap) % 2 === 0;
      const arm = up ? [[2, -8], [3, -9], [3, -10]] : [[2, -8], [3, -8], [4, -9]];
      for (const [x, y] of arm) px(x, y, '#ea580c');
      const hand = up ? [3, -11] : [5, -10];
      px(hand[0], hand[1], '#d6b38a');
    }
  }

  /**
   * Cracks across the whole tile, in art pixels from its centre: a long split corner to corner and
   * two branches, mirrored per tile so neighbours do not repeat. Each crack is a dark line with a
   * light lip below it, so it reads as cut into the ground.
   */
  private cracks(ctx: CanvasRenderingContext2D, b: Building): void {
    const c = this.tileCentre(b.x, b.y);
    const s = this.scale;
    const m = b.uid % 2 ? -1 : 1;
    const lines = [
      [[-13, -1], [-8, 1], [-4, -1], [0, 1], [5, -1], [9, 1], [13, 0]],
      [[-2, -6], [-1, -3], [1, -1]],
      [[3, 1], [4, 3], [2, 5], [3, 6]],
      [[-7, 0], [-8, 3], [-6, 4]],
    ];
    const path = (dy: number) => {
      ctx.beginPath();
      for (const line of lines)
        line.forEach(([x, y], i) => (i ? ctx.lineTo : ctx.moveTo).call(ctx, Math.round(c.x + x * m * s), Math.round(c.y + (y + dy) * s)));
    };
    ctx.lineWidth = s;
    ctx.lineJoin = 'miter';
    path(1);
    ctx.strokeStyle = 'rgba(244, 244, 245, 0.55)';
    ctx.stroke();
    path(0);
    ctx.strokeStyle = 'rgba(24, 24, 27, 0.9)';
    ctx.stroke();
  }

  /** warn: a repair is needed, so the badge is warning orange instead of black. */
  private badge(ctx: CanvasRenderingContext2D, cx: number, cy0: number, text: string, placed: BadgeBox[], warn = false): void {
    ctx.font = '700 16px "Atkinson Hyperlegible", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const w = Math.max(20, ctx.measureText(text).width + 8);
    const cy = placeBadge(placed, cx, cy0, w);
    ctx.fillStyle = warn ? '#c2410c' : '#0b0b0c';
    ctx.fillRect(cx - w / 2, cy - 10, w, 20);
    ctx.strokeStyle = warn ? '#fff7ed' : '#f4f4f5';
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
    return this.pops.length > 0 || this.bursts.length > 0 || this.fx.busy;
  }
}
