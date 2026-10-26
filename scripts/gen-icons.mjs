// Generates Mono Dark pixel icons with no dependencies. Run: npm run icons
import { writeFileSync, mkdirSync } from 'node:fs';
import { deflateSync } from 'node:zlib';

const BG = [0x0b, 0x0b, 0x0c];
const FG = [0xf4, 0xf4, 0xf5];
const MID = [0x71, 0x71, 0x7a];

// 16x16 glyph: a kampung house with a pos-ronda kentongan. # = fg, + = mid.
const GLYPH = [
  '................',
  '.......##.......',
  '......####......',
  '.....######.....',
  '....########....',
  '...##########...',
  '..############..',
  '.##############.',
  '...##########...',
  '...##++##++##...',
  '...##++##++##...',
  '...##########...',
  '...####..####...',
  '...####..####...',
  '...####..####...',
  '................',
];

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
        const ch = GLYPH[gy][gx];
        if (ch === '#') col = FG;
        else if (ch === '+') col = MID;
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
    if (ch === '#') rects += `<rect x="${x}" y="${y}" width="1" height="1" fill="${hex(FG)}"/>`;
    if (ch === '+') rects += `<rect x="${x}" y="${y}" width="1" height="1" fill="${hex(MID)}"/>`;
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
