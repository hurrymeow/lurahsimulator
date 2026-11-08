// Staff portraits for every hire, in Inem's 44x60 slot: the specials' hand-picked looks, and generic hires dressed
// for their job with a face seeded by their staff id. All drawn in code from parts: skin, hair, outfit and
// a prop. Each special is a recognisable TYPE (a TV news anchor, a radio traffic reporter), never one real person
// or anyone else's character (GAME-DESIGN.md section 5). ART.md rules: flat two-tone fills lit from the top left,
// and a 1px coloured outline, a dark shade of whatever it borders, never black.

import { PALETTE as P } from './sprites';

/**
 * Art pixels. Shown at 44x60 CSS px, so one art pixel is 2 CSS px, the same as the map at its
 * smallest zoom: outlines, seams and eyes are as thick as a walker's. Layout below is written on a
 * 44x60 half-pixel grid (D) and snapped down to art pixels; faces are drawn natively.
 */
export const PORTRAIT = { w: 22, h: 30 };
const D = 2;

type Hair = 'short' | 'side' | 'long' | 'bun' | 'curly' | 'bald' | 'ponytail' | 'mullet' | 'pompadour' | 'grey';
type Outfit = 'suit' | 'dress' | 'hoodie' | 'kebaya' | 'tshirt' | 'safari' | 'vest' | 'blouse' | 'sequin' | 'tracksuit' | 'tank' | 'batik';
type Prop = 'mic' | 'phone' | 'glasses' | 'sunglasses' | 'headset' | 'headphones' | 'cap' | 'headband' | 'tie' | 'bowtie' | 'pencil' | 'screwdriver' | 'mustache' | 'chain'
  | 'beret' | 'helmet' | 'peci' | 'lanyard' | 'waistbag' | 'notebook';

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
  const c = [n >> 16, (n >> 8) & 255, n & 255].map((v) => Math.min(255, Math.round(v * k)));
  return `#${c.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

/** A 22x30 grid of colours; null is clear. */
type Grid = (string | null)[][];

/** Rosy cheeks and the tongue (ART.md, Faces). */
const ROSY = '#f07f86';

/**
 * The line pass (ART.md, Outlines): where a part in front meets one behind, the pixel behind takes a
 * 0.55x shade of its own colour. At 2 CSS px an art pixel, a line on the face or the arms would be as
 * heavy as an eye, and walkers carry none, so only parts in `lined` take one: the back hair and the
 * chest, giving a line round the collar. Details share their part's id.
 */
function seams(g: Grid, ids: number[][], lined: Set<number>): Grid {
  const { w, h } = PORTRAIT;
  const out = g.map((row) => [...row]);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const c = g[y][x];
      if (!c) continue;
      const a = ids[y][x];
      if (!lined.has(a)) continue;
      const front = [[x, y - 1], [x, y + 1], [x - 1, y], [x + 1, y]].some(([u, v]) => g[v]?.[u] && ids[v][u] > a);
      if (front) out[y][x] = shade(c, 0.55);
    }
  return out;
}

function paint(look: Look): Grid {
  const { w, h } = PORTRAIT;
  const g: Grid = Array.from({ length: h }, () => Array<string | null>(w).fill(null));
  const ids: number[][] = Array.from({ length: h }, () => Array<number>(w).fill(0));
  // The part being painted; a higher id is in front.
  let cur = 1;
  let next = 1;
  const part = (id?: number) => (cur = id ?? (next += 10));
  const lined = new Set<number>();
  /** One art pixel. */
  const dot = (x: number, y: number, c: string) => {
    if (x >= 0 && y >= 0 && x < w && y < h) {
      g[y][x] = c;
      ids[y][x] = cur;
    }
  };
  /** Native rows and columns, inclusive. */
  const box = (x0: number, y0: number, x1: number, y1: number, c: string) => {
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) dot(x, y, c);
  };
  // Layout helpers on the half-pixel grid.
  const set = (x: number, y: number, c: string) => dot(Math.floor(x / D), Math.floor(y / D), c);
  const rect = (x0: number, y0: number, x1: number, y1: number, c: string) => box(Math.floor(x0 / D), Math.floor(y0 / D), Math.floor(x1 / D), Math.floor(y1 / D), c);
  /** An ellipse, tested at the middle of each art pixel. keep gets that point on the half-pixel grid. */
  const oval = (cx: number, cy: number, rx: number, ry: number, c: string, keep?: (x: number, y: number) => boolean) => {
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        const u = x * D + 0.5;
        const v = y * D + 0.5;
        if (((u - cx) / rx) ** 2 + ((v - cy) / ry) ** 2 <= 1 && (!keep || keep(u, v))) dot(x, y, c);
      }
  };
  const skinDark = shade(look.skin, 0.86);
  const skinLight = shade(look.skin, 1.08);
  const hairDark = shade(look.hairColour, 0.7);
  const hairLight = shade(look.hairColour, look.hairColour === HAIR.grey ? 1.12 : 1.6);
  const [main, second] = look.colours;
  const mainDark = shade(main, 0.78);
  const mainLight = shade(main, 1.14);
  const has = (p: Prop) => look.props.includes(p);

  // Hair that falls behind the head and shoulders, rounded at the ends.
  lined.add(part());
  if (look.hair === 'long') {
    oval(22, 30, 13, 19, look.hairColour, (_x, y) => y >= 18);
    oval(22, 30, 13, 19, hairDark, (x, y) => y >= 30 && x <= 12);
    oval(22, 30, 13, 19, hairDark, (x, y) => y >= 30 && x >= 32);
  }
  if (look.hair === 'mullet') rect(13, 26, 30, 44, hairDark);
  if (look.hair === 'ponytail') {
    oval(35, 22, 4, 7, look.hairColour);
    oval(36, 26, 2, 4, hairDark);
  }

  // Arms at the sides, then the shoulders and chest: a rounded top lit from the top left, the shade
  // curving round the right side.
  const body = (_x: number, y: number) => y >= 44;
  const inBody = (x: number, y: number) => ((x - 22) / 19) ** 2 + ((y - 58) / 15) ** 2 <= 1;
  lined.add(part());
  oval(8, 57, 6, 11, main, (x, y) => y >= 47 && inBody(x, y));
  oval(36, 57, 6, 11, mainDark, (x, y) => y >= 47 && inBody(x, y));
  oval(22, 58, 14, 15, main, body);
  oval(30, 60, 9, 15, mainDark, (x, y) => body(x, y) && ((x - 22) / 14) ** 2 + ((y - 58) / 15) ** 2 <= 1);
  oval(17, 50, 6, 3, mainLight, (x, y) => body(x, y) && ((x - 22) / 14) ** 2 + ((y - 58) / 15) ** 2 <= 1);
  const torso = cur;
  // The neck, with a soft shadow under the chin rather than a line.
  part();
  rect(19, 37, 24, 45, look.skin);
  rect(22, 37, 24, 45, skinDark);
  rect(19, 38, 24, 39, shade(look.skin, 0.78));
  part(torso);

  switch (look.outfit) {
    case 'suit':
      // A white shirt in a V, the jacket's lapels either side.
      for (let y = 44; y < 60; y++) for (let x = 22 - (y - 44) / 3; x <= 21 + (y - 44) / 3; x++) set(Math.round(x), y, second);
      break;
    case 'dress':
    case 'kebaya':
      // A scooped neckline; the kebaya gets lace dots in the second colour.
      oval(22, 44, 6, 3, look.skin, (_x, y) => y >= 44);
      if (look.outfit === 'kebaya') for (let y = 24; y < 30; y += 2) for (let x = 3 + ((y >> 1) % 2) * 2; x < 19; x += 4) dot(x, y, second);
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
      for (let y = 23; y < 30; y += 2) for (let x = 2 + ((y >> 1) % 2) * 2; x < 20; x += 4) dot(x, y, P.w);
      rect(19, 44, 24, 59, P.w);
      break;
    case 'tracksuit':
      rect(19, 44, 24, 46, second);
      rect(4, 48, 6, 59, second);
      rect(37, 48, 39, 59, second);
      break;
    case 'batik':
      // A collar, then a repeating diamond motif in the second colour.
      rect(19, 44, 24, 45, second);
      for (let y = 47; y < 60; y += 4)
        for (let x = 6 + ((y - 47) % 8 ? 2 : 0); x < 38; x += 4) {
          set(x, y, second);
          set(x - 1, y + 1, second);
          set(x + 1, y + 1, second);
          set(x, y + 2, second);
        }
      break;
    case 'tank':
      // Bare shoulders, a vest top in the outfit colour.
      oval(22, 58, 19, 15, look.skin, (x, y) => y >= 44 && (x < 12 || x > 31));
      rect(12, 46, 14, 59, main);
      rect(29, 46, 31, 59, main);
      break;
  }

  // Ears behind the head, then the head: an oval lit from the top left, a soft shade down the right
  // and a lighter cheek on the left.
  part();
  oval(11, 28, 2, 3, look.skin);
  oval(33, 28, 2, 3, skinDark);
  part();
  const head = cur;
  // The jaw tapers to a softer chin below the cheeks.
  const jaw = (x: number, y: number) => y <= 30 || Math.abs(x + 0.5 - 22) <= 10.5 - (y - 30) * 0.8;
  oval(22, 27, 10, 12, look.skin, jaw);
  oval(22, 27, 10, 12, skinDark, (x, y) => jaw(x, y) && ((x - 20) / 10) ** 2 + ((y - 25) / 12) ** 2 > 0.78 && x > 21);
  oval(17, 24, 4, 5, skinLight);

  // Hair on top of the head.
  part();
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

  // A light sheen on the hair, top left, where the light falls.
  if (look.hair !== 'bald')
    for (let y = 0; y < 11; y++)
      for (let x = 0; x < 11; x++)
        if (2 * x + y === 22 && g[y][x] === look.hairColour && ids[y][x] === cur && g[y + 1]?.[x] === look.hairColour) dot(x, y, hairLight);

  // The face (ART.md, Faces), in art pixels like a walker's: ink eyes, rosy cheeks and a smile. No
  // brows: at this size they sit on the eyes and read as a frown.
  part(head);
  const ink = P.k;
  const mouth = shade(look.skin, 0.55);
  box(8, 12, 8, 13, ink);
  if (look.face === 'wink') {
    // A happy closed arc.
    dot(12, 13, ink);
    dot(13, 12, ink);
    dot(14, 13, ink);
  } else box(13, 12, 13, 13, ink);
  dot(7, 15, ROSY);
  dot(14, 15, shade(ROSY, 0.9));
  if (look.face === 'grin') {
    // An open smile with a pink tongue.
    box(9, 16, 12, 16, ink);
    box(10, 17, 11, 17, ROSY);
    dot(9, 17, ink);
    dot(12, 17, ink);
  } else {
    box(10, 17, 11, 17, mouth);
    dot(9, 16, mouth);
    dot(12, 16, mouth);
  }

  // Props, front to back. Thin ones (mustache, glasses) belong to the face; the rest are their own parts.
  if (has('mustache')) box(9, 15, 12, 15, look.hairColour);
  if (has('glasses')) {
    // A thin rim either side of each eye, joined by a bridge: a full frame would read as a visor.
    for (const x of [7, 9, 10, 11, 12, 14]) dot(x, 12, P.S);
  }
  part();
  if (has('sunglasses')) {
    box(7, 12, 9, 13, P.k);
    box(12, 12, 14, 13, P.k);
    box(10, 12, 11, 12, P.k);
    dot(7, 12, P.l);
    dot(12, 12, P.l);
  }
  part();
  if (has('cap')) {
    oval(22, 16, 12, 6, second === P.w ? main : second, (_x, y) => y <= 18);
    rect(22, 17, 37, 19, shade(second === P.w ? main : second, 0.75));
  }
  part();
  if (has('headband')) rect(11, 18, 33, 19, second);
  part();
  if (has('beret')) {
    // A green beret tipped to one side, with a small badge.
    oval(20, 15, 12, 5, P.G, (_x, y) => y <= 18);
    rect(10, 17, 32, 18, shade(P.G, 0.8));
    rect(14, 14, 15, 15, P.y);
  }
  part();
  if (has('helmet')) {
    // A site helmet: a dome and a brim.
    oval(22, 18, 12, 9, P.y, (_x, y) => y <= 18);
    rect(9, 18, 35, 19, P.h);
    rect(21, 10, 23, 18, shade(P.y, 0.85));
  }
  part();
  if (has('peci')) {
    // A black peci, flat-topped, straight across the brow.
    rect(12, 12, 32, 18, P.k);
    rect(12, 12, 32, 12, P.S);
  }
  part();
  if (has('lanyard')) {
    // A strap round the neck to an ID card.
    box(9, 22, 9, 23, P.b);
    box(12, 22, 12, 23, P.b);
    box(9, 24, 12, 27, P.w);
    box(10, 25, 11, 25, P.b);
  }
  part();
  if (has('waistbag')) {
    // A bag slung across the chest for the iuran.
    for (let x = 8; x <= 34; x++) set(x, 46 + Math.round((x - 8) / 2.2), P.N);
    rect(26, 52, 35, 57, P.n);
    rect(26, 52, 35, 52, P.N);
    set(33, 54, P.y);
  }
  part();
  if (has('notebook')) {
    oval(9, 52, 3, 3, look.skin);
    rect(4, 43, 12, 50, P.y);
    rect(5, 44, 11, 44, P.w);
    rect(5, 46, 11, 46, P.w);
    rect(5, 48, 11, 48, P.w);
  }
  part();
  if (has('headset')) {
    // A band over the head to one ear, and a thin boom to the mouth.
    oval(22, 20, 12, 11, P.S, (x, y) => y <= 16 && (((x - 22) / 12) ** 2 + ((y - 20) / 11) ** 2 > 0.75));
    rect(9, 25, 11, 30, P.S);
    for (let x = 12; x <= 18; x++) set(x, 31 + (x > 15 ? 1 : 0), P.S);
  }
  part();
  if (has('headphones')) {
    oval(22, 20, 13, 12, P.k, (x, y) => y <= 17 && (((x - 22) / 13) ** 2 + ((y - 20) / 12) ** 2 > 0.78));
    rect(8, 24, 11, 31, P.r);
    rect(33, 24, 36, 31, P.r);
  }
  part();
  if (has('pencil')) {
    rect(33, 19, 34, 26, P.y);
    rect(33, 26, 34, 27, P.t);
  }
  part();
  if (has('tie')) {
    rect(21, 45, 22, 46, P.r);
    rect(20, 47, 23, 56, P.r);
    rect(22, 47, 23, 56, P.R);
  }
  part();
  if (has('bowtie')) {
    rect(17, 44, 20, 47, P.r);
    rect(23, 44, 26, 47, P.r);
    rect(21, 45, 22, 46, P.R);
  }
  part();
  if (has('chain')) for (let x = 15; x <= 28; x++) set(x, 46 + Math.round(3 * Math.sin(((x - 15) / 13) * Math.PI)), P.y);
  part();
  if (has('mic')) {
    // A hand-held mic in the right hand.
    rect(33, 40, 36, 44, P.S);
    oval(34.5, 39, 2.5, 2.5, P.s);
    oval(34, 50, 3, 3, look.skin);
    rect(34, 44, 35, 49, P.k);
  }
  part();
  if (has('phone')) {
    oval(9, 50, 3, 3, look.skin);
    rect(6, 41, 11, 49, P.k);
    rect(7, 42, 10, 47, P.l);
  }
  part();
  if (has('screwdriver')) {
    oval(35, 51, 3, 3, look.skin);
    rect(34, 43, 36, 49, P.y);
    rect(35, 37, 35, 43, P.s);
  }
  return seams(g, ids, lined);
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

/** The outfit each role wears (decisions/staff-requests.md section 1): the job reads from the clothes. */
const ROLE_LOOK: Record<string, Pick<Look, 'outfit' | 'colours' | 'props'>> = {
  hansip: { outfit: 'safari', colours: [P.G, P.g], props: ['beret'] },
  pu: { outfit: 'vest', colours: [P.o, P.l], props: ['helmet'] },
  supir: { outfit: 'suit', colours: [P.S, P.w], props: ['peci'] },
  bendahara: { outfit: 'batik', colours: [P.n, P.a], props: [] },
  adminWa: { outfit: 'hoodie', colours: [P.c, P.w], props: ['phone'] },
  asisten: { outfit: 'tshirt', colours: [P.w, P.l], props: ['lanyard'] },
  sekretaris: { outfit: 'suit', colours: [P.B, P.w], props: [] },
  penagih: { outfit: 'tshirt', colours: [P.r, P.w], props: ['waistbag', 'notebook'] },
  satpol: { outfit: 'safari', colours: [P.t, P.N], props: ['cap'] },
};
const SKINS = Object.values(SKIN);
const HAIRS: Hair[] = ['short', 'side', 'long', 'bun', 'curly', 'ponytail', 'grey', 'bald'];
const HAIR_COLOURS = [HAIR.black, HAIR.black, HAIR.brown, HAIR.red];
const FACES: Look['face'][] = ['calm', 'grin', 'calm', 'wink'];

/** A small integer hash, so the same staff id always gives the same face. */
const hash = (n: number, salt: number) => {
  let x = (n * 2654435761 + salt * 40503) >>> 0;
  x ^= x >>> 15;
  x = Math.imul(x, 2246822519) >>> 0;
  return (x ^ (x >>> 13)) >>> 0;
};

/** A generic hire's look: the outfit of their job, the face seeded by their staff id, so it lasts for good. */
export function staffLook(role: string, id: number): Look {
  const job = ROLE_LOOK[role] ?? ROLE_LOOK.asisten;
  const hair = HAIRS[hash(id, 2) % HAIRS.length];
  const capped = job.props.some((p) => p === 'beret' || p === 'helmet' || p === 'peci' || p === 'cap');
  return {
    skin: SKINS[hash(id, 1) % SKINS.length],
    // Long hair would hang out from under a beret or helmet oddly, so headwear gets a short cut.
    hair: capped && (hair === 'long' || hair === 'bun' || hair === 'ponytail') ? 'short' : hair,
    hairColour: hair === 'grey' ? HAIR.grey : HAIR_COLOURS[hash(id, 3) % HAIR_COLOURS.length],
    ...job,
    props: [...job.props, ...(hash(id, 4) % 4 === 0 ? (['glasses'] as Prop[]) : [])],
    face: FACES[hash(id, 5) % FACES.length],
  };
}

export const ROLES_WITH_LOOK = Object.keys(ROLE_LOOK);

const cache = new Map<string, string>();

/** A special's portrait as a data URL, or null for someone without one. Drawn at 2 canvas pixels per art pixel. */
export function portraitURL(id: string | undefined): string | null {
  if (!id || !LOOKS[id]) return null;
  return draw(id, LOOKS[id]);
}

/** A generic hire's portrait: their job's outfit, their own face. */
export const staffPortraitURL = (role: string, id: number): string => draw(`staff:${role}:${id}`, staffLook(role, id));

function draw(key: string, look: Look): string {
  const hit = cache.get(key);
  if (hit) return hit;
  const g = outline(paint(look));
  // Drawn at 2 canvas pixels per art pixel, the size of the img (44x60).
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
  cache.set(key, url);
  return url;
}

/** For tests: the painted grid of a look, outline included. */
export const portraitGrid = (id: string): Grid => outline(paint(LOOKS[id]));
export const staffGrid = (role: string, id: number): Grid => outline(paint(staffLook(role, id)));
