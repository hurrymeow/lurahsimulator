// Placeholder pixel sprites, drawn from text maps at runtime. No external art.
export const PALETTE: Record<string, string> = {
  k: '#1b1b1f', w: '#f4f4f5', r: '#dc2626', R: '#991b1b', y: '#facc15', b: '#2563eb', B: '#1e3a8a',
  g: '#22c55e', G: '#15803d', o: '#ea580c', n: '#92400e', N: '#5b2b0b', s: '#9ca3af', S: '#4b5563',
  c: '#67e8f9', p: '#f472b6', t: '#d6b38a', a: '#fbbf24', l: '#60a5fa',
};

export const SPRITES: Record<string, string[]> = {
  warung: [
    '............',
    '..rwrwrwrw..',
    '.rwrwrwrwrw.',
    'rwrwrwrwrwrw',
    'kkkkkkkkkkkk',
    '.n.yy..cc.n.',
    '.n.yy..cc.n.',
    '.nnnnnnnnnn.',
    '.nttttttttn.',
    '.nttttttttn.',
    '.nnnnnnnnnn.',
    '............',
  ],
  posRonda: [
    '............',
    '....nnnn....',
    '...nNNNNn...',
    '..nNNNNNNn..',
    '.nNNNNNNNNn.',
    '..t......t..',
    '..t..oo..t..',
    '..t..oo..t..',
    '..tttttttt..',
    '..t......t..',
    '..t......t..',
    '............',
  ],
  selokan: [
    '............',
    '............',
    '............',
    'ssssssssssss',
    'SbSbSbSbSbSb',
    'bbbbbbbbbbbb',
    'SbSbSbSbSbSb',
    'ssssssssssss',
    '............',
    '............',
    '............',
    '............',
  ],
  wifi: [
    '..c......c..',
    '...c.cc.c...',
    '.....ss.....',
    '.....ss.....',
    '....s..s....',
    '....s..s....',
    '...s.ss.s...',
    '...s....s...',
    '..s..ss..s..',
    '..s......s..',
    '.s........s.',
    'SSSSSSSSSSSS',
  ],
  indomaret: [
    '............',
    'bbbbbbbbbbbb',
    'rrrrrrrrrrrr',
    'yyyyyyyyyyyy',
    'wwwwwwwwwwww',
    'wccwccwccwcw',
    'wccwccwccwcw',
    'wwwwwwwwwwww',
    'wcccwkkwcccw',
    'wcccwkkwcccw',
    'wwwwwkkwwwww',
    '............',
  ],
  alfamart: [
    '............',
    'rrrrrrrrrrrr',
    'yyyyyyyyyyyy',
    'BBBBBBBBBBBB',
    'wwwwwwwwwwww',
    'wcwccwccwccw',
    'wcwccwccwccw',
    'wwwwwwwwwwww',
    'wcccwkkwcccw',
    'wcccwkkwcccw',
    'wwwwwkkwwwww',
    '............',
  ],
  kantorRT: [
    '.....k......',
    '.....rr.....',
    '.....ww.....',
    '.....k......',
    '..RRRRRRRR..',
    '.RRRRRRRRRR.',
    'RRRRRRRRRRRR',
    '.wwwwwwwwww.',
    '.wllwkkwllw.',
    '.wllwkkwllw.',
    '.wwwwkkwwww.',
    '............',
  ],
  rumah: [
    '............',
    '............',
    '.....oo.....',
    '....oooo....',
    '...oooooo...',
    '..oooooooo..',
    '.oooooooooo.',
    '..tttttttt..',
    '..tllttNNt..',
    '..tllttNNt..',
    '..ttttttNNt.',
    '............',
  ],
  parkir: [
    '............',
    '....aaaa....',
    '...aaaaaa...',
    '....tttt....',
    '....tkkt....',
    '....tttt....',
    '...oooooo...',
    '..toooooot..',
    '..t.oooo.t..',
    '....SS.SS...',
    '....SS.SS...',
    '............',
  ],
  permit: [
    '............',
    '...wwwwww...',
    '...wkkkkw...',
    '...wwwwww...',
    '...wkkkww...',
    '...wwwwww...',
    '...wkkkkw...',
    '...wwwrrr...',
    '...wwrrrrr..',
    '...wwwrrr...',
    '............',
    '............',
  ],
  scaffold: [
    'y.y.y.y.y.y.',
    'SSSSSSSSSSSS',
    '.S...S...S..',
    '..S..S..S...',
    '...S.S.S....',
    'SSSSSSSSSSSS',
    '.S...S...S..',
    '..S..S..S...',
    '...S.S.S....',
    'SSSSSSSSSSSS',
    '.S...S...S..',
    'y.y.y.y.y.y.',
  ],
};

export const ICONS: Record<string, string[]> = {
  rupiah: ['........', 'gggggggg', 'gGwwwwGg', 'gwGGGGwg', 'gwGGGGwg', 'gGwwwwGg', 'gggggggg', '........'],
  sabar: ['........', '.ll..ll.', 'llllllll', 'llllllll', '.llllll.', '..llll..', '...ll...', '........'],
  orangDalam: ['........', '.aaa....', 'a...a...', 'a...aaaa', 'a...a.a.', '.aaa..a.', '........', '........'],
  viral: ['...p....', '...pp...', '..ppp...', '..pppp.p', '.pppppp.', '.ppwwpp.', '..pwwp..', '...pp...'],
  people: ['........', '..ww....', '..ww.ww.', '.wwwwww.', '.ww.ww..', '.ww.ww..', '.ww.ww..', '........'],
};

const cache = new Map<string, HTMLCanvasElement>();

function swap(map: string[], from?: string, to?: string): string[] {
  return from && to ? map.map((row) => row.replaceAll(from, to)) : map;
}

/** Renders a text map to a 1px-per-pixel canvas. Cached by key. */
export function sprite(name: string, recolor?: [string, string], set: Record<string, string[]> = SPRITES): HTMLCanvasElement {
  const key = `${name}:${recolor?.join('>') ?? ''}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const map = swap(set[name] ?? SPRITES.permit, recolor?.[0], recolor?.[1]);
  const size = map.length;
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const ctx = c.getContext('2d')!;
  map.forEach((row, y) =>
    [...row].forEach((ch, x) => {
      const col = PALETTE[ch];
      if (!col) return;
      ctx.fillStyle = col;
      ctx.fillRect(x, y, 1, 1);
    }),
  );
  cache.set(key, c);
  return c;
}

export function iconURL(name: string, scale = 4): string {
  const src = sprite(name, undefined, ICONS);
  const c = document.createElement('canvas');
  c.width = src.width * scale;
  c.height = src.height * scale;
  const ctx = c.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(src, 0, 0, c.width, c.height);
  return c.toDataURL();
}

export const ROOF_COLOURS = ['o', 'p', 'G', 'l', 'R'];
