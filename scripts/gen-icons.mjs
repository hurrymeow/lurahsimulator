// Generates Pak Pejabat pixel icons with no dependencies. Run: npm run icons
import { writeFileSync, mkdirSync } from 'node:fs';
import { deflateSync } from 'node:zlib';

const BG = [0x0b, 0x0b, 0x0c];
// ART.md palette keys, as RGB. Icon colour exception is logged in DESIGN.md.
const COLORS = {
  k: [0x2a, 0x18, 0x10], w: [0xf6, 0xec, 0xd4], r: [0xdf, 0x4a, 0x2c], R: [0xa8, 0x32, 0x1f],
  y: [0xf4, 0xb9, 0x35], g: [0x86, 0xb8, 0x4c], G: [0x52, 0x7f, 0x34], N: [0x60, 0x36, 0x20],
  l: [0x82, 0xbf, 0xdc], n: [0xa8, 0x65, 0x2f],
};

// 16x16 glyph: a kampung house, a mustard sun and a tree under one roof of sky. Keys follow ART.md.
const GLYPH = [
  '................',
  '..yy.......GG...',
  '.yyyy.....GggG..',
  '.yyyy....GggggG.',
  '..yy.....GggggG.',
  '......rr..GGGG..',
  '.....rRRr...NN..',
  '....rrRRrr..NN..',
  '...rrrRRrrr.NN..',
  '..rrrrRRrrrrNN..',
  '..kkkkkkkkkk....',
  '..kwlwwwwlwk....',
  '..kwlwkkwlwk....',
  '..kwwwkkwwwk....',
  '..kkkkkkkkkk....',
  'GGGGGGGGGGGGGGGG',
];
GLYPH.forEach((r) => { if (r.length !== 16) throw new Error('bad row ' + r); });

function crc32(buf) {
  let c, crc = 0xffffffff;
  for (let n = 0; n < buf.length; n++) {
    c = (crc ^ buf[n]) & 0xff;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    crc = (crc >>> 8) ^ c;
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}

function png(size, padRatio) {
  const pad = Math.round(size * padRatio);
  const cell = Math.floor((size - pad * 2) / 16);
  const off = Math.floor((size - cell * 16) / 2);
  const raw = Buffer.alloc((size * 3 + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (size * 3 + 1)] = 0;
    for (let x = 0; x < size; x++) {
      const gx = Math.floor((x - off) / cell);
      const gy = Math.floor((y - off) / cell);
      let col = BG;
      if (gx >= 0 && gx < 16 && gy >= 0 && gy < 16) {
        col = COLORS[GLYPH[gy][gx]] ?? BG;
      }
      const i = y * (size * 3 + 1) + 1 + x * 3;
      raw[i] = col[0]; raw[i + 1] = col[1]; raw[i + 2] = col[2];
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 2; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

function svg() {
  const hex = (c) => '#' + c.map((v) => v.toString(16).padStart(2, '0')).join('');
  let rects = '';
  GLYPH.forEach((row, y) => [...row].forEach((ch, x) => {
    if (COLORS[ch]) rects += `<rect x="${x}" y="${y}" width="1" height="1" fill="${hex(COLORS[ch])}"/>`;
  }));
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" shape-rendering="crispEdges"><rect width="16" height="16" fill="${hex(BG)}"/>${rects}</svg>\n`;
}

mkdirSync('public/icons', { recursive: true });
writeFileSync('public/icons/icon-192.png', png(192, 0.06));
writeFileSync('public/icons/icon-512.png', png(512, 0.06));
writeFileSync('public/icons/maskable-512.png', png(512, 0.2));
writeFileSync('public/icons/apple-touch-icon.png', png(180, 0.1));
writeFileSync('public/icons/favicon.svg', svg());
console.log('icons written');
