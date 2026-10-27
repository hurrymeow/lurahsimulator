// Placeholder pixel sprites, drawn from text maps at runtime. No external art.
// Warm storybook palette (terracotta, mustard, teal, cream, olive) kept punchy enough for a party
// game, read against a dark brown ink.
export const PALETTE: Record<string, string> = {
  k: '#2a1810', w: '#f6ecd4', r: '#df4a2c', R: '#a8321f', y: '#f4b935', b: '#3d72b4', B: '#27427c',
  g: '#86b84c', G: '#527f34', o: '#e57d2e', n: '#a8652f', N: '#603620', s: '#bdb4a3', S: '#6d635a',
  c: '#93d8cb', p: '#e57a9c', t: '#eac58f', a: '#f2b43a', l: '#82bfdc',
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
  kosan: [
    '............',
    'RRRRRRRRRRRR',
    'RRRRRRRRRRRR',
    'oooooooooooo',
    'ollooollooll',
    'ollooollooll',
    'oooooooooooo',
    'ollooollooll',
    'ollooollkkll',
    'oooooookkooo',
    'SSSSSSSSSSSS',
    '............',
  ],
  lapangan: [
    '............',
    '............',
    'gggggwwggggg',
    'GGGGGwwGGGGG',
    'wwwwwwwwwwww',
    'ggggwwwwgggg',
    'GGGGwwwwGGGG',
    'wwwwwwwwwwww',
    'gggggwwggggg',
    'GGGGGwwGGGGG',
    '............',
    '............',
  ],
  bankSampah: [
    '............',
    '............',
    '.BBBBBBBBBB.',
    'BBBBBBBBBBBB',
    '.aaaaaaaaaa.',
    '.aBBBaaBBBa.',
    '.aBBBaaBBBa.',
    '.aaaaaaaaaa.',
    '.nnnnnnnnnn.',
    '..gg....gg..',
    '..gg....gg..',
    '............',
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
  orangDalam: ['..NNNN..', '..NgGN..', 'NNNgGNNN', 'NRwwwwRN', 'NwRwwRwN', 'NwwRRwwN', 'NNNNNNNN', '........'],
  viral: ['BBBB.p.p', 'BccB.ppp', 'BccB..p.', 'BccB....', 'BccB....', 'BccB....', 'BBBB....', '........'],
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
/** Rumah roof shapes: hip, pelana either way, shed, flat dak. Keys of ROOF_KEYS in iso.ts. */
export const ROOF_SHAPES = ['h', 'g', 's', 'y', 'f'];
export const WALL_COLOURS = ['t', 'w', 's'];
