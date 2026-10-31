// 17 Agustus art, drawn in code like every other sprite (ART.md): the panjat pinang pole, the day banner,
// and the bunting and umbul-umbul the kampung puts up in July and August.
//
// The Merah Putih itself is never drawn: not on the greased pole, the ground or anyone's clothes
// (UU 24/2009). Red-and-white bunting is fine; the umbul-umbul are many-coloured, as most are.

import { PALETTE } from './sprites';

const P = PALETTE;
/** Many-coloured umbul-umbul and confetti: yellow, green, blue, pink, orange. Red and white come from the bunting. */
const FESTIVE = [P.y, P.g, P.b, P.p, P.o];

const cache = new Map<string, string>();

/** A canvas drawn at K canvas pixels per art pixel, returned as a data URL and cached by key. */
function art(key: string, w: number, h: number, k: number, draw: (dot: (x: number, y: number, col: string) => void) => void): string {
  const hit = cache.get(key);
  if (hit) return hit;
  const c = document.createElement('canvas');
  c.width = w * k;
  c.height = h * k;
  const ctx = c.getContext('2d')!;
  draw((x, y, col) => {
    ctx.fillStyle = col;
    ctx.fillRect(x * k, y * k, k, k);
  });
  const url = c.toDataURL();
  cache.set(key, url);
  return url;
}

/** Art size of the pole: 19 wide, 75 tall, shown at 4x as 76 by 300 to match the climbing track. */
export const POLE = { w: 19, h: 75 };

/** Prizes on the hoop, each a little picture: rows of palette keys, '.' for clear. */
const PRIZES: { x: number; art: string[] }[] = [
  // A bicycle: two wheels and a red frame.
  { x: 0, art: ['.rrr.', 'r.r.r', 'SkSkS', 'k.k.k', '.S.S.'] },
  // A desk fan: a blue head on a stand.
  { x: 5, art: ['.ll', 'lcl', '.ll', '.S.', 'SSS'] },
  // A bucket.
  { x: 11, art: ['BBB', 'bbb', 'bbb', '.B.'] },
  // A rice cooker: a white pot, pink lid.
  { x: 15, art: ['.pp.', 'pppp', 'wwww', 'wsww', 'ssss'] },
];

/**
 * The panjat pinang pole: a pinang trunk with growth rings, a wet grease shine down one side, mud at the foot,
 * and the prize hoop at the top with a bicycle, a fan, a bucket and a rice cooker hanging from it.
 */
export function poleURL(): string {
  return art('pole', POLE.w, POLE.h, 4, (dot) => {
    const { w, h } = POLE;
    const mid = Math.floor(w / 2);
    // Trunk: 3 wide, coloured outline, rings every 6 rows, grease shine on the left of the middle.
    for (let y = 0; y < h - 3; y++) {
      dot(mid - 2, y, P.N);
      dot(mid + 2, y, P.N);
      const ring = y % 6 === 5;
      dot(mid - 1, y, ring ? P.n : P.s);
      dot(mid, y, ring ? P.n : P.t);
      dot(mid + 1, y, ring ? P.N : P.n);
      if (y > 12 && y % 4 !== 0 && !ring) dot(mid - 1, y, P.w);
    }
    // Mud at the foot, where the climbers keep sliding back to.
    for (let x = 0; x < w; x++) {
      dot(x, h - 3, x % 3 ? P.n : P.N);
      dot(x, h - 2, P.N);
      if (x > 1 && x < w - 2) dot(x, h - 1, P.N);
    }
    // The hoop: a bamboo ring across the top, with strings down to each prize.
    for (let x = 0; x < w; x++) {
      dot(x, 4, P.a);
      dot(x, 5, P.n);
    }
    for (const p of PRIZES) {
      const cx = p.x + Math.floor(p.art[0].length / 2);
      dot(cx, 6, P.S);
      p.art.forEach((row, y) => [...row].forEach((ch, x) => ch !== '.' && dot(p.x + x, 7 + y, P[ch])));
    }
  });
}

/** Art size of the day banner: shown at 4x, 420 by 88 at the most. */
export const BANNER = { w: 105, h: 22 };

/** The day banner over the title: two firework bursts and confetti. The words stay in the HTML title. */
export function bannerURL(): string {
  return art('banner', BANNER.w, BANNER.h, 4, (dot) => {
    const { w, h } = BANNER;
    // Confetti: a fixed scatter, so the banner looks the same every year.
    let seed = 17;
    const rnd = () => {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      return seed / 0x7fffffff;
    };
    for (let i = 0; i < 70; i++) {
      const x = Math.floor(rnd() * w);
      const y = Math.floor(rnd() * h);
      const col = i % 3 === 0 ? P.r : i % 3 === 1 ? P.w : FESTIVE[i % FESTIVE.length];
      dot(x, y, col);
      if (i % 4 === 0 && x + 1 < w) dot(x + 1, y, col);
    }
    // Firework bursts: eight rays and a bright centre.
    const burst = (cx: number, cy: number, r: number, col: string) => {
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]])
        for (let k = 2; k <= r; k++) dot(cx + dx * k, cy + dy * k, k === r ? P.w : col);
      dot(cx, cy, P.w);
    };
    burst(16, 10, 6, P.y);
    burst(w - 18, 9, 6, P.o);
    burst(w / 2, 5, 4, P.p);
    // Red-and-white bunting along the bottom edge.
    for (let x = 0; x < w; x++) dot(x, h - 4, P.N);
    for (let x = 0; x + 3 < w; x += 4) {
      const col = (x / 4) % 2 ? P.w : P.r;
      dot(x, h - 3, col);
      dot(x + 1, h - 3, col);
      dot(x + 2, h - 3, col);
      dot(x + 1, h - 2, col);
    }
  });
}

/**
 * Red-and-white bunting slung between two points on the map, in canvas pixels. The string sags in the middle;
 * the pennants alternate red and white, each a small triangle with a dark edge.
 */
export function drawBunting(ctx: CanvasRenderingContext2D, ax: number, ay: number, bx: number, by: number, scale: number): void {
  const dist = Math.hypot(bx - ax, by - ay);
  if (dist < 8 * scale) return;
  const sag = Math.min(14, dist / 6) * scale / 2;
  const at = (k: number) => ({ x: ax + (bx - ax) * k, y: ay + (by - ay) * k + sag * 4 * k * (1 - k) });
  ctx.strokeStyle = P.N;
  ctx.lineWidth = Math.max(1, scale / 2);
  ctx.beginPath();
  for (let i = 0; i <= 16; i++) {
    const p = at(i / 16);
    if (i) ctx.lineTo(p.x, p.y);
    else ctx.moveTo(p.x, p.y);
  }
  ctx.stroke();
  const n = Math.max(3, Math.floor(dist / (6 * scale)));
  const half = 1.5 * scale;
  for (let i = 1; i < n; i++) {
    const p = at(i / n);
    ctx.fillStyle = i % 2 ? P.r : P.w;
    ctx.beginPath();
    ctx.moveTo(p.x - half, p.y);
    ctx.lineTo(p.x + half, p.y);
    ctx.lineTo(p.x, p.y + 3 * scale);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = i % 2 ? P.R : P.s;
    ctx.lineWidth = Math.max(1, scale / 3);
    ctx.stroke();
  }
}

/** An umbul-umbul: a tall bamboo pole with a long banner hanging from a curved tip. Foot at (x, y) in canvas pixels. */
export function drawUmbul(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number, colour: number): void {
  const s = scale;
  const top = y - 26 * s;
  ctx.fillStyle = P.N;
  ctx.fillRect(Math.round(x - s / 2), top, Math.max(1, s), 26 * s);
  ctx.fillStyle = P.a;
  ctx.fillRect(Math.round(x - s / 2), top, Math.max(1, s / 2), 26 * s);
  // The bent tip, then the banner: two colour blocks with a dark edge, tapering to a point.
  ctx.fillStyle = P.N;
  ctx.fillRect(x, top - s, 3 * s, s);
  const a = FESTIVE[colour % FESTIVE.length];
  const b = FESTIVE[(colour + 2) % FESTIVE.length];
  for (let k = 0; k < 12; k++) {
    const wide = k < 9 ? 3 : 12 - k;
    ctx.fillStyle = k < 6 ? a : b;
    ctx.fillRect(x + s, top + k * s, wide * s, s);
    ctx.fillStyle = P.N;
    ctx.fillRect(x + s + wide * s, top + k * s, Math.max(1, s / 2), s);
  }
}
