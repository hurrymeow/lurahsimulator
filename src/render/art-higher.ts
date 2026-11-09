import type { Painter } from './iso';
import { prism } from './massing';

// Sprites for the RW and Kelurahan buildings. Same rules as ART.md: straight isometric
// boxes, palette keys, the ink pass from Painter.finish. Registered in iso.ts.
// Only `import type` from iso.ts, so there is no import cycle.

const within = (v: number, lo: number, hi: number) => v >= lo && v < hi;

export const HIGHER_ART: Record<string, (p: Painter) => void> = {
  // RW
  portal: (p) => {
    p.shadow(6);
    // Two posts and a red-and-white boom between them.
    // The front post stands inside the tile (UI.md rule 17).
    p.stroke(-8, -3, -8, -13, 3, 'S');
    p.stroke(8, 1, 8, -9, 3, 'S');
    p.stroke(-8, -10, 8, -4, 2, 'r');
    for (const k of [-5, -1, 3]) p.stroke(k, -10 + ((k + 8) * 3) / 8, k + 2, -10 + ((k + 10) * 3) / 8, 2, 'w', false);
    p.stroke(8, -10, 8, -11, 3, 'y', false);
  },
  // Aspal Ulang: the back half of the road already resurfaced in fresh black, the front half old and grey
  // with its worn lines, a small yellow road roller on the new side and cones along the join.
  aspalUlang: (p) => {
    p.ground((a, b) => {
      if (a < 0.04 || a > 0.96 || b < 0.04 || b > 0.96) return null;
      if (a < 0.5) return (Math.floor(a * 60) + Math.floor(b * 60)) % 9 === 0 ? '#4a423c' : '#3b3430';
      if (within(b, 0.47, 0.53) && Math.floor(a * 8) % 2 === 0) return 'y';
      return within(a, 0.7, 0.74) ? 'S' : 's';
    });
    p.shadow(2);
    // The roller: a steel drum in front, a low yellow body behind it with the driver's seat and an exhaust.
    prism(p, 0.16, 0.28, 0.34, 0.56, 3, 'S', (face) => (face === 'T' ? 's' : undefined));
    prism(p, 0.16, 0.3, 0.56, 0.72, 3, 'y', (face, _u, j) => (face !== 'T' && j === 0 ? 'k' : undefined));
    prism(p, 0.2, 0.26, 0.62, 0.68, 1, 'k', undefined, 3);
    prism(p, 0.27, 0.29, 0.66, 0.68, 3, 'S', undefined, 3);
    // Cones along the join between new and old.
    // Drawn after the ink pass in native pixels, so each cone stays a bright orange speck with a white band.
    p.overlay.push((q) => {
      for (const b of [0.18, 0.42, 0.66, 0.88]) {
        const X = Math.round(q.gx + (0.52 - b) * 16 * q.n);
        const Y = Math.round(q.gy - 8 * q.n + (0.52 + b) * 8 * q.n);
        for (const [dx, dy, c] of [[0, 0, '#e57d2e'], [1, 0, '#c4601e'], [0, -1, '#f6ecd4'], [1, -1, '#f6ecd4'], [0, -2, '#e57d2e']] as [number, number, string][]) q.px(X + dx, Y + dy, c);
      }
    });
  },
};
