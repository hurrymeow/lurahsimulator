// Menu glyphs: 8x8 pixel art drawn in code, monochrome to match the UI chrome.
const PAL: Record<string, string> = { w: '#f4f4f5', m: '#a1a1aa' };

const GLYPHS: Record<string, string[]> = {
  build: ['........', '.wwwww..', 'wwwwwww.', '.wwwww..', '...w....', '...w....', '...w....', '...w....'],
  wacana: ['........', '.....ww.', '...wwww.', 'wwwwwww.', 'wwwwwww.', '...wwww.', '.w...ww.', '.w......'],
  combo: ['........', '.ww..ww.', 'w..ww..w', 'w..ww..w', 'w..ww..w', 'w..ww..w', '.wwwwww.', '........'],
  log: ['........', '.wwwwww.', '.wmmmmw.', '.wwwwww.', '.wmmmmw.', '.wwwwww.', '.wmmmmw.', '.wwwwww.'],
  stats: ['........', '......w.', '......w.', '...w..w.', '...w..w.', 'w..w..w.', 'w..w..w.', 'wwwwwwww'],
  howto: ['..www...', '.w...w..', '.....w..', '....w...', '...w....', '...w....', '........', '...w....'],
  settings: ['...ww...', '.wwwwww.', '.ww..ww.', 'www..www', 'www..www', '.ww..ww.', '.wwwwww.', '...ww...'],
  install: ['...ww...', '...ww...', '...ww...', '.wwwwww.', '..wwww..', '...ww...', 'w......w', 'wwwwwwww'],
  menu: ['........', 'wwwwwwww', 'wwwwwwww', '........', 'wwwwwwww', 'wwwwwwww', '........', 'wwwwwwww'],
};

const cache = new Map<string, string>();

export function glyphURL(name: string): string | null {
  const rows = GLYPHS[name];
  if (!rows) return null;
  const hit = cache.get(name);
  if (hit) return hit;
  const scale = 4;
  const c = document.createElement('canvas');
  c.width = c.height = 8 * scale;
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
