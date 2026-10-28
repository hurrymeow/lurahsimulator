// Menu icons: each 16x16 icon sits on a dark bevelled plate that matches the UI chrome.
import { ICONS, sprite } from '../render/sprites';

/** Plate size in art pixels. The image is drawn at 2 canvas pixels per art pixel and shown at half that. */
const PLATE = 44;
const K = 2;
export const ICON_PX = PLATE;

const BASE = '#27272a';
const LIGHT = '#3f3f46';
const SHADE = '#18181b';
const EDGE = '#0b0b0c';
/** Menu id to its icon. Ids without an entry fall back to a name in ICONS. */
const MENU_ICON: Record<string, string> = { build: 'house', warga: 'pair', neighbours: 'chat', wacana: 'scroll', combo: 'book', settings: 'gear' };

const cache = new Map<string, string>();

function plate(ctx: CanvasRenderingContext2D): void {
  const fill = (x: number, y: number, w: number, h: number, c: string) => {
    ctx.fillStyle = c;
    ctx.fillRect(x * K, y * K, w * K, h * K);
  };
  fill(0, 0, PLATE, PLATE, EDGE);
  fill(1, 1, PLATE - 2, PLATE - 2, SHADE);
  fill(1, 1, PLATE - 3, PLATE - 3, LIGHT);
  fill(2, 2, PLATE - 4, PLATE - 4, BASE);
}

/** The icon for a menu action, or null when no icon matches. */
export function menuIconURL(id: string): string | null {
  const hit = cache.get(id);
  if (hit) return hit;
  const name = MENU_ICON[id] ?? id;
  if (!ICONS[name]) return null;
  const c = document.createElement('canvas');
  c.width = c.height = PLATE * K;
  const ctx = c.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;
  plate(ctx);
  const art = sprite(name, undefined, ICONS);
  const g = 2;
  const o = (PLATE - art.width * g) / 2;
  ctx.drawImage(art, o * K, o * K, art.width * g * K, art.height * g * K);
  const url = c.toDataURL();
  cache.set(id, url);
  return url;
}
