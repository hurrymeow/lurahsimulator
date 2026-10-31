// The level badge next to a building's name: a pixel gable roof with the level in it.
import { t } from '../i18n';
import { PALETTE } from '../render/sprites';
import { h } from './dom';

export type BadgeState = 'normal' | 'up' | 'max';

/** Art size: a 22px-wide roof, 11 rows tall, wider than it is tall so it reads as a roof and not a warning sign, with 3 rows above the peak for the upgrade arrow. */
const W = 22;
const ROOF = 11;
const TOP = 3;
/** Rows under the roof for the MAKS label at the top level. */
const LABEL = 6;
/** Canvas pixels per art pixel, and CSS pixels per art pixel. */
const K = 4;
const SHOW = 2;

/** 3x5 digits and the letters of MAKS. '#' is ink. */
const GLYPHS: Record<string, string[]> = {
  '0': ['###', '#.#', '#.#', '#.#', '###'],
  '1': ['.#.', '##.', '.#.', '.#.', '###'],
  '2': ['###', '..#', '###', '#..', '###'],
  '3': ['###', '..#', '.##', '..#', '###'],
  '4': ['#.#', '#.#', '###', '..#', '..#'],
  '5': ['###', '#..', '###', '..#', '###'],
  '6': ['###', '#..', '###', '#.#', '###'],
  '7': ['###', '..#', '.#.', '.#.', '.#.'],
  '8': ['###', '#.#', '###', '#.#', '###'],
  '9': ['###', '#.#', '###', '..#', '###'],
  M: ['#...#', '##.##', '#.#.#', '#...#', '#...#'],
  A: ['.#.', '#.#', '###', '#.#', '#.#'],
  K: ['#.#', '##.', '#..', '##.', '#.#'],
  S: ['.##', '#..', '.#.', '..#', '##.'],
};

/** Columns the roof covers on row r, inclusive. The slope widens down to the eave, which overhangs two pixels and droops at its tips. */
function roofRow(r: number): [number, number] | null {
  if (r < ROOF - 2) {
    const half = 2 + Math.floor((r * 7) / 8);
    return [W / 2 - half, W / 2 + half - 1];
  }
  if (r === ROOF - 2) return [0, W - 1];
  return null;
}

function inRoof(x: number, y: number): boolean {
  if (y === ROOF - 1) return x === 0 || x === W - 1;
  const span = y >= 0 && y < ROOF ? roofRow(y) : null;
  return !!span && x >= span[0] && x <= span[1];
}

const cache = new Map<string, string>();

/** A data URL of the badge, drawn in palette colours with a coloured outline (ART.md). */
function badgeURL(level: number, state: BadgeState): string {
  const key = `${level}:${state}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const max = state === 'max';
  const rows = TOP + ROOF + (max ? LABEL : 0);
  const c = document.createElement('canvas');
  c.width = W * K;
  c.height = rows * K;
  const ctx = c.getContext('2d')!;
  const dot = (x: number, y: number, col: string) => {
    ctx.fillStyle = PALETTE[col];
    ctx.fillRect(x * K, y * K, K, K);
  };
  // Terracotta with a dark brown edge; gold with a brown edge at the top level.
  const [fill, edge, ink] = max ? ['y', 'n', 'N'] : ['n', 'N', 'w'];
  for (let y = 0; y < ROOF; y++)
    for (let x = 0; x < W; x++) {
      if (!inRoof(x, y)) continue;
      const rim = !inRoof(x - 1, y) || !inRoof(x + 1, y) || !inRoof(x, y - 1) || !inRoof(x, y + 1);
      dot(x, TOP + y, rim ? edge : fill);
    }
  const text = (s: string, top: number, col: string) => {
    const width = [...s].reduce((n, ch) => n + GLYPHS[ch][0].length + 1, -1);
    let x = Math.floor((W - width) / 2);
    for (const ch of s) {
      const g = GLYPHS[ch];
      g.forEach((row, gy) => [...row].forEach((p, gx) => p === '#' && dot(x + gx, top + gy, col)));
      x += g[0].length + 1;
    }
  };
  // The number sits in the lower half of the roof.
  text(String(Math.min(level, 99)), TOP + 4, ink);
  if (max) {
    dot(W / 2, TOP + 2, 'w');
    text('MAKS', TOP + ROOF + 1, 'N');
  }
  // An affordable upgrade: a small green arrow over the peak.
  if (state === 'up') {
    dot(W / 2 - 1, 0, 'g');
    dot(W / 2, 0, 'g');
    for (let x = W / 2 - 2; x <= W / 2 + 1; x++) dot(x, 1, x === W / 2 - 2 || x === W / 2 + 1 ? 'G' : 'g');
  }
  const url = c.toDataURL();
  cache.set(key, url);
  return url;
}

/** The badge as an image. Its alt text says the level, so the number is read out too. */
export function levelBadge(level: number, state: BadgeState): HTMLElement {
  const rows = TOP + ROOF + (state === 'max' ? LABEL : 0);
  return h('img', {
    class: 'level-badge pixel',
    src: badgeURL(level, state),
    width: W * SHOW,
    height: rows * SHOW,
    alt: state === 'max' ? t('insp.badgeMax', { n: level }) : t('insp.badge', { n: level }),
    'data-state': state,
    'data-level': String(level),
  });
}
