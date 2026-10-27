// Menu glyphs: 12x12 pixel art drawn in code. White and grey match the UI chrome, mustard picks out the key part.
const PAL: Record<string, string> = { w: '#f4f4f5', m: '#a1a1aa', y: '#e8b04a' };
const SIZE = 12;
export const GLYPH_PX = SIZE * 3;

export const GLYPHS: Record<string, string[]> = {
  build: ['............', '.....yy.....', '....yyyy....', '...yyyyyy...', '..yyyyyyyy..', '.yyyyyyyyyy.', '..wwwwwwww..', '..wwwmmwww..', '..wwwmmwww..', '..wwwmmwww..', '..wwwwwwww..', '............'],
  warga: ['............', '..www..mmm..', '.wwwww.mmm..', '.wwwww.mmm..', '..www...m...', '.wwwww.mmmm.', 'wwwwwwwmmmmm', 'wwwwwwwmmmmm', 'wwwwwwwmmmmm', 'wwwwwwwmmmmm', '............', '............'],
  neighbours: ['.....mm.....', '..wwwwwww...', '.wwwwwwwww..', '..wwwwwww...', '.....mm.....', '...wwwwwww..', '..wwwwwwwww.', '...wwwwwww..', '.....mm.....', '.....mm.....', '....mmmm....', '............'],
  wacana: ['............', '........w...', '.......ww.y.', '..wwwwwww...', '.wwwwwwwww.y', '.wwwwwwwww..', '..wwwwwww.y.', '..mm.ww.....', '..mm........', '..mm........', '............', '............'],
  combo: ['............', '..wwwwwwww..', '..wmwwwwww..', '..wmwwyyww..', '..wmwyyyyw..', '..wmwwyyww..', '..wmwwwwww..', '..wmwwwwww..', '..wwwwwwww..', '..mmmmmmmm..', '............', '............'],
  log: ['............', '..wwwwwwww..', '..w......w..', '..w.mmmm.w..', '..w......w..', '..w.mmmm.w..', '..w......w..', '..w.mmmm.w..', '..w......w..', '..wwwwwwww..', '............', '............'],
  stats: ['............', '.........yy.', '.........yy.', '.....ww..yy.', '.....ww..yy.', '.....ww..yy.', '.ww..ww..yy.', '.ww..ww..yy.', '.ww..ww..yy.', '.ww..ww..yy.', 'mmmmmmmmmmmm', '............'],
  howto: ['............', '...wwwwww...', '..ww....ww..', '..ww....ww..', '........ww..', '......www...', '.....ww.....', '.....ww.....', '............', '.....ww.....', '.....ww.....', '............'],
  settings: ['.....ww.....', '.w..wwww..w.', '.wwwwwwwwww.', '..wwwwwwww..', '..www..www..', 'wwww....wwww', 'wwww....wwww', '..www..www..', '..wwwwwwww..', '.wwwwwwwwww.', '.w..wwww..w.', '.....ww.....'],
  install: ['.....ww.....', '.....ww.....', '.....ww.....', '.....ww.....', '..wwwwwwww..', '...wwwwww...', '....wwww....', '.....ww.....', '............', 'w..........w', 'wwwwwwwwwwww', '............'],
};

const cache = new Map<string, string>();

export function glyphURL(name: string): string | null {
  const rows = GLYPHS[name];
  if (!rows) return null;
  const hit = cache.get(name);
  if (hit) return hit;
  const scale = GLYPH_PX / SIZE;
  const c = document.createElement('canvas');
  c.width = c.height = GLYPH_PX;
  const ctx = c.getContext('2d')!;
  rows.forEach((row, y) =>
    [...row].forEach((ch, x) => {
      if (!PAL[ch]) return;
      ctx.fillStyle = PAL[ch];
      ctx.fillRect(x * scale, y * scale, scale, scale);
    }),
  );
  const url = c.toDataURL();
  cache.set(name, url);
  return url;
}
