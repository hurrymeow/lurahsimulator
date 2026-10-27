// Menu icons in the style of an old isometric city-builder's tool panel: each sits on a cream,
// bevelled plate. Panels that are about things in the kampung show a tiny scene drawn from the map's
// own sprites; abstract ones (log, stats, settings) show their glyph in ink.
import { iso, TH, TOP, TW } from '../render/iso';
import { GLYPHS } from './glyphs';

/** Plate size in art pixels. The image is drawn at 2 canvas pixels per art pixel and shown at half that. */
const PLATE = 44;
const K = 2;
export const ICON_PX = PLATE;

const CREAM = '#efe3c2';
const LIGHT = '#fff8e6';
const SHADE = '#c9b68a';
const EDGE = '#4a3423';
/** Glyph inks on the plate: dark brown, muted brown, and a brick red for the key part. */
const INKS: Record<string, string> = { w: '#3b2a1c', m: '#8a7556', y: '#c8502d' };

/** Sprites standing in each scene, with their offset from the plate's ground centre in art pixels. */
const SCENES: Record<string, { name: string; level?: number; variant?: string; dx: number; dy: number }[]> = {
  build: [{ name: 'jalan', dx: 0, dy: 0 }, { name: 'warung', level: 2, dx: 0, dy: 0 }, { name: 'scaffold', dx: 0, dy: 0 }],
  warga: [{ name: 'rumah', variant: 'o', dx: -6, dy: -2 }, { name: 'rumah', variant: 'G', dx: 6, dy: 2 }],
  neighbours: [{ name: 'kantorRT', level: 1, dx: -7, dy: -3 }, { name: 'rumah', variant: 'p', dx: 7, dy: 3 }],
  wacana: [{ name: 'kantorRT', level: 2, dx: 0, dy: 0 }],
  combo: [{ name: 'posRonda', level: 2, dx: -6, dy: -2 }, { name: 'warung', level: 2, dx: 6, dy: 2 }],
};

const cache = new Map<string, string>();

function plate(ctx: CanvasRenderingContext2D): void {
  const fill = (x: number, y: number, w: number, h: number, c: string) => {
    ctx.fillStyle = c;
    ctx.fillRect(x * K, y * K, w * K, h * K);
  };
  fill(0, 0, PLATE, PLATE, EDGE);
  fill(1, 1, PLATE - 2, PLATE - 2, SHADE);
  fill(1, 1, PLATE - 3, PLATE - 3, LIGHT);
  fill(2, 2, PLATE - 4, PLATE - 4, CREAM);
}

/** The icon for a menu action, or null when it has neither a scene nor a glyph. */
export function menuIconURL(id: string): string | null {
  const hit = cache.get(id);
  if (hit) return hit;
  const scene = SCENES[id];
  const glyph = GLYPHS[id];
  if (!scene && !glyph) return null;
  const c = document.createElement('canvas');
  c.width = c.height = PLATE * K;
  const ctx = c.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;
  plate(ctx);
  if (scene) {
    const arts = scene.map((s) => ({ s, art: iso(s.name, s.variant, 1, s.level ?? 1) }));
    // Stand the scene on the plate: the tallest sprite's top clears the top edge, and the ground
    // diamond stays on the plate when there is room for both.
    const tall = Math.max(...arts.map(({ s, art }) => art.height - s.dy));
    const ground = Math.min(PLATE - 3 - TH / 2, 4 + tall);
    ctx.save();
    ctx.beginPath();
    ctx.rect(2 * K, 2 * K, (PLATE - 4) * K, (PLATE - 4) * K);
    ctx.clip();
    for (const { s, art } of arts) {
      // Put the art's ground centre on the plate's centre column, `ground` rows down.
      const x = PLATE / 2 - TW / 2 + s.dx;
      const y = ground - (TOP + TH / 2) + s.dy;
      ctx.drawImage(art.canvas, x * K, y * K, art.canvas.width * K, art.canvas.height * K);
    }
    ctx.restore();
  } else {
    const g = 3;
    const o = (PLATE - 12 * g) / 2;
    glyph!.forEach((row, y) =>
      [...row].forEach((ch, x) => {
        if (!INKS[ch]) return;
        ctx.fillStyle = INKS[ch];
        ctx.fillRect((o + x * g) * K, (o + y * g) * K, g * K, g * K);
      }),
    );
  }
  const url = c.toDataURL();
  cache.set(id, url);
  return url;
}
