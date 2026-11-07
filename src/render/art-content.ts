import { dither, type Painter, type RoofShape } from './iso';

// Sprites for the content wave: selokan, decorations, farm, shops and facilities. Same rules as ART.md:
// straight isometric boxes, palette keys, the ink pass from Painter.finish. Registered in iso.ts.
// Only `import type` from iso.ts, so there is no import cycle.

const within = (v: number, lo: number, hi: number) => v >= lo && v < hi;
const TW = 32;
const TH = 16;
const TOP = 40;

/** A shopfront: a walled box under a roof of the given shape, a door, and a coloured band of awning above a window. */
const shopfront = (wall: string, roof: string, awning: string, opts: { height?: number; rise?: number; inset?: number; door?: string; shape?: RoofShape } = {}) => (p: Painter): void => {
  const { height = 8, rise = 5, inset = 3, door = 'N', shape = 'hip' } = opts;
  p.shadow(inset);
  p.box(inset, height, wall, (face, u, j, i) => {
    if (face === 'T') return undefined;
    if (face === 'L' && within(u, 0.62, 0.84) && j < height - 3) return door;
    if (face === 'L' && within(u, 0.14, 0.56) && within(j, 2, height - 3)) return 'l';
    if (face === 'R' && within(u, 0.2, 0.8) && within(j, 2, height - 3) && i % 5 >= 1) return 'l';
    if (j >= height - 2) return i % 4 < 2 ? awning : 'w';
    return undefined;
  });
  p.roofShape(shape, inset, height, shape === 'shed' ? Math.max(3, rise - 1) : rise, roof, wall);
};

export const CONTENT_ART: Record<string, (p: Painter, variant?: string, level?: number) => void> = {
  // Selokan: a concrete channel across the tile, edge to edge so neighbours line up, with a plank bridge over it.
  // Bare, so the kerbs and their ink line are drawn here.
  drain: (p, v) => {
    p.bare = true;
    p.ground((a0, b0, px) => {
      // a runs along the channel, b across it. Variant 'y' turns it, so a column of selokan joins up like a row.
      const [a, b] = v === 'y' ? [b0, a0] : [a0, b0];
      if (b < 0.06 || b > 0.94) return null;
      const bridge = within(a, 0.44, 0.56);
      const edge = b < 0.06 + px || b > 0.94 - px;
      if (bridge && !edge) {
        // Planks lie across, a dark gap between each, an ink rail along each end.
        if (b < 0.12 + px || b > 0.88 - px) return 'N';
        return Math.floor((a - 0.44) * 32) % 2 ? 'n' : 't';
      }
      if (b < 0.26 || b > 0.74) {
        if (edge) return 'S';
        // Poured slabs: a seam every quarter, a light face, and the far kerb a shade darker.
        if (Math.abs(((a * 4) % 1) - 0.5) < px * 0.6 && !within(a, 0.37, 0.63)) return 'S';
        return b < 0.26 ? 's' : 'S';
      }
      // The wall drops into the water, so the near strip is shade, then ripples drift along the channel.
      if (b < 0.34) return 'b';
      if (b > 0.66) return 'B';
      const r = (a * 9 + b * 4) % 1;
      return r < 0.14 ? 'w' : r < 0.4 ? 'c' : 'l';
    });
  },

  // Decorations. Small, low and bright, so they read as nice-to-have beside the working buildings.
  potBunga: (p) => {
    p.shadow(8);
    p.box(6, 4, 'n', (face, _u, j) => (face !== 'T' && j === 3 ? 'N' : undefined));
    p.blob(0, 6, 3.5, 'G');
    for (const [dx, up, c] of [[-2, 8, 'r'], [2, 9, 'y'], [0, 10, 'p']] as const) p.blob(dx, up, 1.6, c);
  },
  bangku: (p) => {
    p.shadow(5);
    p.box(6, 3, 'N');
    p.box(4, 2, 't', undefined, 3);
    p.box(6, 5, 'n', undefined, 5);
  },
  // Flat pond: bare, so it draws its own stone rim.
  kolamIkan: (p) => {
    p.bare = true;
    p.ground((a, b, px) => {
      // A stone kerb two pixels wide, then a lighter coping, at any size.
      const e = Math.min(a, b, 1 - a, 1 - b);
      if (e < 2 * px) return 'S';
      if (e < 4 * px) return 's';
      if (within(a, 0.3, 0.43) && within(b, 0.4, 0.48)) return 'o';
      if (within(a, 0.56, 0.68) && within(b, 0.55, 0.62)) return 'y';
      return within(a, 0.7, 0.78) && within(b, 0.25, 0.32) ? 'w' : 'l';
    });
    p.overlay.push(dither);
  },
  tamanBermain: (p) => {
    p.ground((a, b, px) => (Math.min(a, b, 1 - a, 1 - b) < px ? null : Math.floor((a + b) * 6) % 2 ? 'g' : 'G'));
    p.overlay.push(dither);
    p.box(7, 5, 'S');
    p.stroke(-10, -6, 10, -1, 3, 'o');
    p.blob(-11, 8, 2, 'r');
    p.blob(11, 4, 2, 'b');
  },
  airMancur: (p) => {
    p.shadow(3);
    p.ground((a, b) => {
      const d = Math.hypot(a - 0.5, b - 0.5);
      return d > 0.44 ? null : d > 0.38 ? 'S' : d > 0.31 ? 's' : 'l';
    });
    p.box(6, 6, 's');
    p.stroke(0, -6, 0, -17, 2, 'c');
    p.stroke(0, -17, -7, -9, 1, 'l');
    p.stroke(0, -17, 7, -9, 1, 'l');
    p.blob(0, 18, 3, 'c');
    p.overlay.push(dither);
  },

  // Farm. Flat plots are bare and draw their own pematang edge so neighbouring plots join up.
  kandangAyam: (p) => {
    p.shadow(4);
    p.box(5, 6, 'n', (face, u, j) => (face === 'L' && within(u, 0.3, 0.7) && within(j, 1, 4) ? 'N' : undefined));
    p.roof(5, 6, 4, 'y');
    p.blob(7, 2, 2.2, 'w');
    p.set(TW / 2 + 9, TOP + TH / 2 - 3, 'r');
  },
  kolamLele: (p) => {
    p.bare = true;
    p.ground((a, b, px) => {
      const e = Math.min(a, b, 1 - a, 1 - b);
      if (e < 1.2 * px) return 'B';
      if (e < 2.4 * px) return 'b';
      // Murky green water, as a lele pond is: the fish show as dark shapes moving in it.
      return Math.floor((a * 7 + b * 3) * 2) % 5 === 0 ? '#9cc4a0' : '#7fae8e';
    });
  },

  // Praktik Bidan: a cream house with a pink pelana, a teal door, and the practice board on a post by the corner.
  bidan: (p) => {
    shopfront('w', 'p', 'c', { shape: 'gable', door: 'c' })(p);
    // The post stands on its own tile (UI.md rule 17), so the board rides a little higher.
    p.stroke(11, 2, 11, -7, 1, 'N');
    p.stroke(9, -11, 14, -8, 3, 'w');
    p.stroke(10, -10, 13, -9, 1, 'p', false);
  },
  // Panggung Senam: a low plank stage, a merah putih banner on two posts at the back, and a grey toa on a pole.
  // Drawn in one-tile coordinates, so on its 2x2 lot every edge stays a 1px line.
  panggungSenam: (p) => {
    // Wide, not tall: as high as a 1x1 building, its size shows as width (ART.md).
    p.low();
    p.shadow(2);
    p.box(2, 3, 'n', (face, _u, j) => (face === 'T' ? null : j === 2 ? 't' : undefined));
    // The deck, painted in native pixels: box() leaves an open top's back corner to the roof that usually covers it.
    p.id++;
    const n = p.n;
    const cx = (TW / 2) * n + p.ox;
    const cy = (TOP + TH / 2) * n - 3 * p.zs + p.oy;
    const hw = (TW / 2 - 4) * n;
    const hh = (TH / 2 - 2) * n;
    for (let y = Math.floor(cy - hh); y <= Math.ceil(cy + hh); y++)
      for (let x = Math.floor(cx - hw); x <= Math.ceil(cx + hw); x++)
        if (Math.abs(x + 0.5 - cx) / hw + Math.abs(y + 0.5 - cy) / hh <= 1) p.px(x, y, Math.floor((x - y * 2) / (3 * p.zs)) % 2 ? 't' : 'a');
    // The banner: red over white, on two bamboo posts standing on the back of the stage.
    p.stroke(-6, -6, -6, -16, 1, 'N');
    p.stroke(6, -6, 6, -16, 1, 'N');
    p.stroke(-6, -16, 6, -16, 3, 'r');
    p.stroke(-6, -13, 6, -13, 2, 'w', false);
    // The toa on the front corner: louder than the instructor.
    p.stroke(9, 2, 9, -11, 1, 'S');
    p.stroke(8, -13, 11, -11, 2, 's');
  },
  // Kolam Pancing: a green pond in a stone kerb, a plank jetty, and two rods out over the water.
  kolamPancing: (p) => {
    p.ground((a, b, px) => {
      const e = Math.min(a, b, 1 - a, 1 - b);
      if (e < 2 * px) return 'S';
      if (e < 4 * px) return 's';
      if (within(a, 0.42, 0.58) && b > 0.62) return Math.floor(b * 40) % 2 ? 'n' : 't';
      const r = (a * 7 + b * 3) % 1;
      return r < 0.08 ? 'w' : r < 0.5 ? 'c' : 'l';
    });
    p.overlay.push(dither);
    // Two short rods off the jetty end, each with a white float on the water.
    p.overlay.push((q) => {
      const n = q.n;
      const cx = q.gx;
      const cy = q.gy;
      for (const [x0, y0, x1, y1] of [[0, 2, -5, -2], [1, 3, 6, -1]]) {
        const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) * n;
        for (let k = 0; k <= steps; k++) q.px(Math.round(cx + (x0 + ((x1 - x0) * k) / steps) * n), Math.round(cy + (y0 + ((y1 - y0) * k) / steps) * n), 'N');
        q.px(cx + x1 * n, cy + (y1 + 3) * n, 'w');
      }
    });
  },
};
