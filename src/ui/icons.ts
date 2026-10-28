// Menu icons: the 16x16 art with a clear background, so it takes the colour of whatever it sits on.
import { ICONS, sprite } from '../render/sprites';

/** Icon size in art pixels. The image is drawn at 2 canvas pixels per art pixel and shown at half that. */
const PLATE = 32;
const K = 2;
export const ICON_PX = PLATE;

/** Menu id to its icon. Ids without an entry fall back to a name in ICONS. */
const MENU_ICON: Record<string, string> = { build: 'house', warga: 'pair', neighbours: 'chat', wacana: 'scroll', combo: 'book', settings: 'gear' };

const cache = new Map<string, string>();

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
  const art = sprite(name, undefined, ICONS);
  const g = 2;
  const o = (PLATE - art.width * g) / 2;
  ctx.drawImage(art, o * K, o * K, art.width * g * K, art.height * g * K);
  const url = c.toDataURL();
  cache.set(id, url);
  return url;
}
