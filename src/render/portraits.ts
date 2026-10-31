// Staff portraits for the special hires, at Inem's size (44x60), drawn in code from parts: skin, hair, outfit and
// a prop. Each special is a recognisable TYPE (a TV news anchor, a radio traffic reporter), never one real person
// or anyone else's character (GAME-DESIGN.md section 5). ART.md rules: flat two-tone fills lit from the top left,
// and a 1px coloured outline, a dark shade of whatever it borders, never black.

import { PALETTE as P } from './sprites';

export const PORTRAIT = { w: 44, h: 60 };

type Hair = 'short' | 'side' | 'long' | 'bun' | 'curly' | 'bald' | 'ponytail' | 'mullet' | 'pompadour' | 'grey';
type Outfit = 'suit' | 'dress' | 'hoodie' | 'kebaya' | 'tshirt' | 'safari' | 'vest' | 'blouse' | 'sequin' | 'tracksuit' | 'tank';
type Prop = 'mic' | 'phone' | 'glasses' | 'sunglasses' | 'headset' | 'headphones' | 'cap' | 'headband' | 'tie' | 'bowtie' | 'pencil' | 'screwdriver' | 'mustache' | 'chain';

export interface Look {
  skin: string;
  hair: Hair;
  hairColour: string;
  outfit: Outfit;
  /** Main and second outfit colours. */
  colours: [string, string];
  props: Prop[];
  /** A wink, a grin or a calm face. */
  face?: 'grin' | 'wink' | 'calm';
}

const SKIN = { light: '#eab384', medium: '#e2a675', tan: '#c28f65', deep: '#a37854' };
const HAIR = { black: '#20130d', brown: '#462a1c', grey: '#bdb4a3', red: '#7a4a30' };

/** Every special's look, by special id. */
export const LOOKS: Record<string, Look> = {
  pakBreaking: { skin: SKIN.medium, hair: 'side', hairColour: HAIR.black, outfit: 'suit', colours: [P.B, P.w], props: ['tie'], face: 'calm' },
  mbakGosip: { skin: SKIN.light, hair: 'long', hairColour: HAIR.brown, outfit: 'dress', colours: [P.p, P.w], props: ['mic'], face: 'wink' },
  omMotivasi: { skin: SKIN.tan, hair: 'bald', hairColour: HAIR.black, outfit: 'suit', colours: [P.S, P.w], props: ['headset', 'tie'], face: 'grin' },
  broKripto: { skin: SKIN.medium, hair: 'short', hairColour: HAIR.black, outfit: 'hoodie', colours: [P.k, P.y], props: ['sunglasses', 'phone', 'chain'], face: 'grin' },
  buSinetron: { skin: SKIN.light, hair: 'bun', hairColour: HAIR.black, outfit: 'kebaya', colours: [P.R, P.a], props: [], face: 'calm' },
  masKonten: { skin: SKIN.tan, hair: 'short', hairColour: HAIR.brown, outfit: 'tshirt', colours: [P.o, P.w], props: ['cap', 'phone'], face: 'grin' },
  pakPurna: { skin: SKIN.medium, hair: 'grey', hairColour: HAIR.grey, outfit: 'safari', colours: [P.t, P.n], props: ['glasses', 'mustache', 'pencil'], face: 'calm' },
  // The 90s types.
  bangLawak: { skin: SKIN.deep, hair: 'curly', hairColour: HAIR.black, outfit: 'tshirt', colours: [P.y, P.r], props: ['headphones'], face: 'grin' },
  omLaluLintas: { skin: SKIN.tan, hair: 'short', hairColour: HAIR.black, outfit: 'vest', colours: [P.o, P.l], props: ['cap', 'headset'], face: 'calm' },
  buJuruKetik: { skin: SKIN.light, hair: 'bun', hairColour: HAIR.brown, outfit: 'blouse', colours: [P.l, P.w], props: ['glasses', 'pencil'], face: 'calm' },
  pakKuis: { skin: SKIN.medium, hair: 'pompadour', hairColour: HAIR.black, outfit: 'sequin', colours: [P.a, P.y], props: ['bowtie', 'mic'], face: 'grin' },
  mbakSenam: { skin: SKIN.medium, hair: 'ponytail', hairColour: HAIR.brown, outfit: 'tracksuit', colours: [P.p, P.c], props: ['headband'], face: 'grin' },
  bangRentalPS: { skin: SKIN.tan, hair: 'mullet', hairColour: HAIR.black, outfit: 'tank', colours: [P.b, P.S], props: ['screwdriver'], face: 'calm' },
};

/** A colour scaled toward black: the shade for outlines and the dark half of a fill. */
function shade(hex: string, k: number): string {
  const n = parseInt(hex.slice(1), 16);
  const c = [n >> 16, (n >> 8) & 255, n & 255].map((v) => Math.round(v * k));
  return `#${c.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

/** A 44x60 grid of colours; null is clear. */
type Grid = (string | null)[][];

function paint(look: Look): Grid {
  const { w, h } = PORTRAIT;
  const g: Grid = Array.from({ length: h }, () => Array<string | null>(w).fill(null));
  const set = (x: number, y: number, c: string) => {
    if (x >= 0 && y >= 0 && x < w && y < h) g[y][x] = c;
  };
  const rect = (x0: number, y0: number, x1: number, y1: number, c: string) => {
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, c);
  };
  const oval = (cx: number, cy: number, rx: number, ry: number, c: string, keep?: (x: number, y: number) => boolean) => {
    for (let y = Math.floor(cy - ry); y <= cy + ry; y++)
      for (let x = Math.floor(cx - rx); x <= cx + rx; x++)
        if (((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1 && (!keep || keep(x, y))) set(x, y, c);
  };
  const skinDark = shade(look.skin, 0.9);
  const hairDark = shade(look.hairColour, 0.7);
  const [main, second] = look.colours;
  const mainDark = shade(main, 0.78);
  const has = (p: Prop) => look.props.includes(p);

  // Hair that falls behind the head and shoulders.
  if (look.hair === 'long') {
    rect(9, 18, 34, 48, look.hairColour);
    rect(9, 30, 12, 48, hairDark);
  }
  if (look.hair === 'mullet') rect(13, 26, 30, 44, hairDark);
  if (look.hair === 'ponytail') {
    oval(35, 22, 4, 7, look.hairColour);
    oval(36, 26, 2, 4, hairDark);
  }

  // Shoulders and outfit: a rounded top, lit from the left.
  const body = (_x: number, y: number) => y >= 44;
  oval(22, 58, 19, 15, main, body);
  oval(30, 58, 11, 13, mainDark, (x, y) => body(x, y) && x > 26);
  // The neck.
  rect(19, 37, 24, 45, look.skin);
  rect(23, 37, 24, 45, skinDark);

  switch (look.outfit) {
    case 'suit':
      // A white shirt in a V, the jacket's lapels either side.
      for (let y = 44; y < 60; y++) for (let x = 22 - (y - 44) / 3; x <= 21 + (y - 44) / 3; x++) set(Math.round(x), y, second);
      break;
    case 'dress':
    case 'kebaya':
      // A scooped neckline; the kebaya gets lace dots in the second colour.
      oval(22, 44, 6, 3, look.skin, (_x, y) => y >= 44);
      if (look.outfit === 'kebaya') for (let y = 48; y < 60; y += 3) for (let x = 6 + (y % 2); x < 38; x += 4) set(x, y, second);
      else for (let y = 49; y < 60; y += 4) for (let x = 8 + (y % 3); x < 37; x += 5) set(x, y, second);
      break;
    case 'hoodie':
      // A hood behind the neck, strings in the second colour.
      rect(14, 41, 29, 45, main);
      set(20, 47, second);
      set(20, 48, second);
      set(23, 47, second);
      set(23, 48, second);
      break;
    case 'tshirt':
      rect(18, 44, 25, 45, look.skin);
      rect(13, 51, 30, 53, second);
      break;
    case 'safari':
      // Khaki with two breast pockets and a collar.
      rect(19, 44, 24, 45, second);
      rect(10, 50, 15, 54, second);
      rect(28, 50, 33, 54, second);
      break;
    case 'vest':
      // A shirt in the second colour under a high-visibility vest with a silver stripe.
      rect(18, 44, 25, 59, second);
      rect(6, 52, 37, 53, P.w);
      break;
    case 'blouse':
      oval(22, 44, 5, 3, look.skin, (_x, y) => y >= 44);
      rect(21, 47, 22, 59, second);
      break;
    case 'sequin':
      // Sequins: bright dots all over the jacket.
      for (let y = 46; y < 60; y += 2) for (let x = 5 + (y % 4); x < 39; x += 4) set(x, y, P.w);
      rect(19, 44, 24, 59, P.w);
      break;
    case 'tracksuit':
      rect(19, 44, 24, 46, second);
      rect(4, 48, 6, 59, second);
      rect(37, 48, 39, 59, second);
      break;
    case 'tank':
      // Bare shoulders, a vest top in the outfit colour.
      oval(22, 58, 19, 15, look.skin, (x, y) => y >= 44 && (x < 12 || x > 31));
      rect(12, 46, 14, 59, main);
      rect(29, 46, 31, 59, main);
      break;
  }

  // The head: an oval lit from the left, ears either side.
  oval(22, 27, 10, 12, look.skin);
  oval(22, 27, 10, 12, skinDark, (x, y) => ((x - 21) / 10) ** 2 + ((y - 26) / 12) ** 2 > 0.8 && x > 22);
  oval(11, 28, 2, 3, look.skin);
  oval(33, 28, 2, 3, skinDark);

  // Hair on top of the head.
  const top = (y0: number, y1: number) => oval(22, 22, 11, 10, look.hairColour, (_x, y) => y >= y0 && y <= y1);
  switch (look.hair) {
    case 'short':
      top(12, 19);
      rect(11, 19, 13, 24, look.hairColour);
      rect(31, 19, 33, 24, hairDark);
      break;
    case 'side':
      top(12, 20);
      rect(11, 19, 14, 25, look.hairColour);
      rect(31, 19, 33, 23, hairDark);
      // The parting.
      rect(16, 13, 16, 18, hairDark);
      break;
    case 'grey':
      top(13, 18);
      rect(11, 20, 12, 27, look.hairColour);
      rect(32, 20, 33, 27, hairDark);
      break;
    case 'long':
    case 'ponytail':
    case 'mullet':
      top(12, 20);
      rect(11, 18, 13, 30, look.hairColour);
      rect(31, 18, 33, 30, hairDark);
      break;
    case 'bun':
      top(12, 19);
      oval(22, 10, 5, 4, look.hairColour);
      oval(24, 11, 3, 2, hairDark);
      rect(11, 18, 12, 26, look.hairColour);
      rect(32, 18, 33, 26, hairDark);
      break;
    case 'curly':
      // A round, bumpy crown.
      oval(22, 18, 13, 9, look.hairColour, (_x, y) => y <= 22);
      for (let x = 10; x <= 34; x += 3) oval(x, 12 + ((x * 7) % 3), 2, 2, look.hairColour);
      for (let x = 12; x <= 32; x += 4) set(x, 15, hairDark);
      break;
    case 'pompadour':
      // A tall, shiny wave over the forehead.
      oval(21, 12, 10, 7, look.hairColour, (_x, y) => y <= 18);
      rect(11, 17, 13, 24, look.hairColour);
      rect(31, 17, 33, 24, hairDark);
      rect(15, 8, 22, 8, P.w);
      break;
    case 'bald':
      // A fringe at the sides and a shine on the crown.
      rect(11, 21, 12, 27, look.hairColour);
      rect(32, 21, 33, 27, hairDark);
      rect(17, 17, 19, 17, P.w);
      break;
  }

  // The face: brows, eyes, cheeks and a mouth.
  const ink = P.k;
  const browY = 23;
  rect(16, browY, 19, browY, hairDark);
  rect(25, browY, 28, browY, hairDark);
  rect(17, 26, 18, 27, ink);
  if (look.face === 'wink') rect(25, 27, 28, 27, ink);
  else rect(26, 26, 27, 27, ink);
  set(17, 26, P.w);
  if (look.face !== 'wink') set(26, 26, P.w);
  rect(14, 30, 15, 30, P.p);
  rect(28, 30, 29, 30, shade(P.p, 0.9));
  if (look.face === 'grin') {
    rect(18, 33, 26, 33, ink);
    rect(19, 34, 25, 34, P.R);
    rect(20, 35, 24, 35, ink);
  } else {
    rect(19, 33, 25, 33, shade(look.skin, 0.55));
    set(18, 32, shade(look.skin, 0.55));
    set(26, 32, shade(look.skin, 0.55));
  }

  // Props, front to back.
  if (has('mustache')) rect(18, 31, 26, 31, look.hairColour);
  if (has('glasses')) {
    for (const cx of [17, 26]) {
      rect(cx - 2, 25, cx + 2, 25, P.S);
      rect(cx - 2, 28, cx + 2, 28, P.S);
      rect(cx - 2, 25, cx - 2, 28, P.S);
      rect(cx + 2, 25, cx + 2, 28, P.S);
    }
    rect(20, 26, 23, 26, P.S);
  }
  if (has('sunglasses')) {
    rect(14, 25, 20, 28, P.k);
    rect(24, 25, 30, 28, P.k);
    rect(20, 26, 24, 26, P.k);
    rect(15, 25, 16, 25, P.l);
    rect(25, 25, 26, 25, P.l);
  }
  if (has('cap')) {
    oval(22, 16, 12, 6, second === P.w ? main : second, (_x, y) => y <= 18);
    rect(22, 17, 37, 19, shade(second === P.w ? main : second, 0.75));
  }
  if (has('headband')) rect(11, 18, 33, 19, second);
  if (has('headset')) {
    // A band over the head to one ear, and a thin boom to the mouth.
    oval(22, 20, 12, 11, P.S, (x, y) => y <= 16 && (((x - 22) / 12) ** 2 + ((y - 20) / 11) ** 2 > 0.75));
    rect(9, 25, 11, 30, P.S);
    for (let x = 12; x <= 18; x++) set(x, 31 + (x > 15 ? 1 : 0), P.S);
  }
  if (has('headphones')) {
    oval(22, 20, 13, 12, P.k, (x, y) => y <= 17 && (((x - 22) / 13) ** 2 + ((y - 20) / 12) ** 2 > 0.78));
    rect(8, 24, 11, 31, P.r);
    rect(33, 24, 36, 31, P.r);
  }
  if (has('pencil')) {
    rect(33, 19, 34, 26, P.y);
    rect(33, 26, 34, 27, P.t);
  }
  if (has('tie')) {
    rect(21, 45, 22, 46, P.r);
    rect(20, 47, 23, 56, P.r);
    rect(22, 47, 23, 56, P.R);
  }
  if (has('bowtie')) {
    rect(17, 44, 20, 47, P.r);
    rect(23, 44, 26, 47, P.r);
    rect(21, 45, 22, 46, P.R);
  }
  if (has('chain')) for (let x = 15; x <= 28; x++) set(x, 46 + Math.round(3 * Math.sin(((x - 15) / 13) * Math.PI)), P.y);
  if (has('mic')) {
    // A hand-held mic in the right hand.
    rect(33, 40, 36, 44, P.S);
    oval(34.5, 39, 2.5, 2.5, P.s);
    oval(34, 50, 3, 3, look.skin);
    rect(34, 44, 35, 49, P.k);
  }
  if (has('phone')) {
    oval(9, 50, 3, 3, look.skin);
    rect(6, 41, 11, 49, P.k);
    rect(7, 42, 10, 47, P.l);
  }
  if (has('screwdriver')) {
    oval(35, 51, 3, 3, look.skin);
    rect(34, 43, 36, 49, P.y);
    rect(35, 37, 35, 43, P.s);
  }
  return g;
}

/** The coloured outline: every clear pixel next to a filled one takes a dark shade of its neighbour. */
function outline(g: Grid): Grid {
  const { w, h } = PORTRAIT;
  const out = g.map((row) => [...row]);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      if (g[y][x]) continue;
      const n = [g[y - 1]?.[x], g[y + 1]?.[x], g[y][x - 1], g[y][x + 1]].find((c) => c);
      if (n) out[y][x] = shade(n, 0.45);
    }
  return out;
}

const cache = new Map<string, string>();

/** A special's portrait as a data URL, or null for someone without one. Drawn at 2 canvas pixels per art pixel. */
export function portraitURL(id: string | undefined): string | null {
  if (!id || !LOOKS[id]) return null;
  const hit = cache.get(id);
  if (hit) return hit;
  const g = outline(paint(LOOKS[id]));
  const k = 2;
  const c = document.createElement('canvas');
  c.width = PORTRAIT.w * k;
  c.height = PORTRAIT.h * k;
  const ctx = c.getContext('2d')!;
  g.forEach((row, y) =>
    row.forEach((col, x) => {
      if (!col) return;
      ctx.fillStyle = col;
      ctx.fillRect(x * k, y * k, k, k);
    }),
  );
  const url = c.toDataURL();
  cache.set(id, url);
  return url;
}

/** For tests: the painted grid of a look, outline included. */
export const portraitGrid = (id: string): Grid => outline(paint(LOOKS[id]));
