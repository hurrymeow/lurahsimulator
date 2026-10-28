// Local test render of the in-game screen, dressed like a 90s train-and-city builder: a cream frame,
// a build palette on the left, a satellite view, a status box and a two-line tab row along the
// bottom. The map in the middle is the real MapView on a sample kampung. Open /mockup.html (dev server or live site).
import '@fontsource/atkinson-hyperlegible/latin-400.css';
import '@fontsource/atkinson-hyperlegible/latin-700.css';
import './mockup.css';
import { setLang } from '../i18n';
import { dateLabel, rupiah } from '../format';
import { MapView } from '../render/map';
import { isoURL, TH, TW } from '../render/iso';
import { iconURL } from '../render/sprites';
import { buildWorld, WORLD_OX, WORLD_OY } from '../render/scenery';
import { refreshAccess } from '../sim/access';
import { def } from '../sim/content';
import { addBuilding, addResident, buildingAt, byUid, housing, newGame } from '../sim/state';
import { GRID_H, GRID_W, type GameState } from '../sim/types';

const lang = new URLSearchParams(location.search).get('lang') === 'en' ? 'en' : 'id';
setLang(lang);

const WORDS = {
  en: {
    system: 'SYSTEM', sat: 'SATELLITE', build: 'BUILD', project: 'PROJECT', palette: 'Build', place: 'Place', demolish: 'Demolish',
    status: 'Status', income: 'Income', type: 'Type', level: 'Level', state: 'State', working: 'Working', none: 'Tap a building',
    warga: 'Warga', pause: 'Pause', play: 'Play', option: 'OPTION', perMonth: '/ month',
    tabs: [['REPORT', 'log & news'], ['TREASURY', 'kas & ranking'], ['WARGA', 'jobs & levels'], ['POLICY', 'wacana']],
  },
  id: {
    system: 'SISTEM', sat: 'SATELIT', build: 'BANGUN', project: 'PROYEK', palette: 'Bangun', place: 'Pasang', demolish: 'Bongkar',
    status: 'Status', income: 'Pemasukan', type: 'Tipe', level: 'Level', state: 'Kondisi', working: 'Jalan', none: 'Ketuk bangunan',
    warga: 'Warga', pause: 'Jeda', play: 'Main', option: 'OPSI', perMonth: '/ bulan',
    tabs: [['LAPORAN', 'log & berita'], ['KAS', 'kas & peringkat'], ['WARGA', 'kerja & level'], ['WACANA', 'kebijakan']],
  },
}[lang];

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
function el<K extends keyof HTMLElementTagNameMap>(tag: K, attrs: Record<string, string> = {}, ...kids: (Node | string)[]): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  e.append(...kids);
  return e;
}

/** A starter kampung a few months in, so the screen has something to show. */
function sample(): GameState {
  const s = newGame(4242);
  const cx = Math.floor(GRID_W / 2);
  const cy = Math.floor(GRID_H / 2);
  const add = (id: string, dx: number, dy: number) => {
    if (!buildingAt(s, cx + dx, cy + dy)) addBuilding(s, id, cx + dx, cy + dy, 'active');
  };
  for (const [dx, dy] of [[-2, 1], [2, 1], [-3, -1], [-3, 1], [3, 3], [-1, -3], [1, -3], [-2, 3], [3, 1]]) add('rumah', dx, dy);
  add('warung', -1, -1);
  add('posRonda', 1, -1);
  add('wifi', 3, -1);
  add('biopori', -2, -1);
  refreshAccess(s);
  for (let i = 0; i < 5; i++) addResident(s);
  s.month = 3;
  s.res.rupiah = 10_774_418;
  return s;
}

const s = sample();
const view = new MapView($<HTMLCanvasElement>('mk-map'));
view.regrid();
// Open on the overview, looking a little toward the hills behind the kampung, like the reference's view.
view.zoomBy(-1);
view.panBy(30, 70);
view.selected = s.buildings.find((b) => b.def === 'kantorRT')?.uid ?? null;
let paused = false;
let speed = 1;

// ---------- title bar and money bar ----------
$('mk-system').textContent = WORDS.system;
$('mk-date').append(el('span', {}, dateLabel(s.month)), el('span', {}, '14:00'));
const chip = (text: string) => el('span', { class: 'mk-chip' }, text);
const icon = (name: string) => el('img', { src: iconURL(name, 2), alt: '', width: '16', height: '16', class: 'pixel' });
$('mk-money').append(
  el('div', { class: 'mk-money-row' }, chip('Rp'), el('b', { class: 'mk-num' }, rupiah(s.res.rupiah).replace('Rp ', '')), chip(WORDS.warga), el('b', { class: 'mk-num' }, `${s.residents.length}/${housing(s)}`)),
  el('div', { class: 'mk-money-row mk-res' },
    el('span', {}, icon('sabar'), ` ${Math.round(s.res.sabar)}`),
    el('span', {}, icon('orangDalam'), ` ${Math.round(s.res.orangDalam)}`),
    el('span', {}, icon('viral'), ` ${Math.round(s.res.viral)}`),
  ),
);

// ---------- left rail and build palette ----------
const palette = $('mk-palette');
const rail = $('mk-rail');
const railTab = (label: string, on: boolean, click: () => void) => {
  const b = el('button', { class: `mk-rail-tab${on ? ' on' : ''}`, 'aria-pressed': String(on) }, el('span', {}, label));
  b.addEventListener('click', click);
  return b;
};
let railOpen: 'build' | 'project' | null = 'build';
function drawRail(): void {
  rail.replaceChildren(
    railTab(WORDS.project, railOpen === 'project', () => { railOpen = railOpen === 'project' ? null : 'project'; drawRail(); }),
    el('span', { class: 'mk-rail-swap', 'aria-hidden': 'true' }, '⇕'),
    railTab(WORDS.build, railOpen === 'build', () => { railOpen = railOpen === 'build' ? null : 'build'; drawRail(); }),
  );
  palette.hidden = railOpen !== 'build';
}
const PALETTE_ITEMS = ['jalan', 'rumah', 'warung', 'posRonda', 'wifi', 'biopori'];
let picked = 'jalan';
let mode: 'place' | 'demolish' = 'place';
function drawPalette(): void {
  const list = el('div', { class: 'mk-pal-list' });
  for (const id of PALETTE_ITEMS) {
    const b = el('button', { class: `mk-pal-item${id === picked ? ' on' : ''}`, 'aria-pressed': String(id === picked) }, el('img', { src: isoURL(def(id).sprite, 2), alt: '', class: 'pixel' }), el('span', {}, def(id).name));
    b.addEventListener('click', () => { picked = id; drawPalette(); });
    list.append(b);
  }
  const modeBtn = (m: typeof mode, label: string) => {
    const b = el('button', { class: `mk-mode${mode === m ? ' on' : ''}`, 'aria-pressed': String(mode === m) }, label);
    b.addEventListener('click', () => { mode = m; drawPalette(); });
    return b;
  };
  palette.replaceChildren(el('h2', { class: 'mk-pal-title' }, WORDS.palette), list, el('div', { class: 'mk-modes' }, modeBtn('place', WORDS.place), modeBtn('demolish', WORDS.demolish)));
}
drawRail();
drawPalette();

// ---------- status box ----------
let statusTab: 'status' | 'income' = 'status';
function drawStatus(): void {
  const b = view.selected === null ? undefined : byUid(s, view.selected);
  const d = b ? def(b.def) : null;
  const tab = (id: typeof statusTab, label: string) => {
    const x = el('button', { class: `mk-chip-tab${statusTab === id ? ' on' : ''}`, 'aria-pressed': String(statusTab === id) }, label);
    x.addEventListener('click', () => { statusTab = id; drawStatus(); });
    return x;
  };
  const row = (k: string, v: string) => el('div', { class: 'mk-row' }, el('span', { class: 'mk-k' }, k), el('span', { class: 'mk-v' }, v));
  const rows = !b || !d
    ? [row(WORDS.type, WORDS.none)]
    : statusTab === 'status'
      ? [row(WORDS.type, d.name), row(WORDS.level, `Lv ${b.level}`), row(WORDS.state, WORDS.working)]
      : [row(WORDS.type, d.name), row(WORDS.income, d.income ? `${rupiah(d.income)} ${WORDS.perMonth}` : '–')];
  const pause = el('button', { class: 'mk-btn', 'aria-label': paused ? WORDS.play : WORDS.pause }, paused ? '▶' : '❚❚');
  pause.addEventListener('click', () => { paused = !paused; drawStatus(); });
  const fast = el('button', { class: 'mk-btn' }, `${speed}x`);
  fast.addEventListener('click', () => { speed = speed === 3 ? 1 : speed + 1; drawStatus(); });
  $('mk-status').replaceChildren(
    el('div', { class: 'mk-info' }, el('div', { class: 'mk-chip-tabs' }, tab('status', WORDS.status), tab('income', WORDS.income)), ...rows),
    el('div', { class: 'mk-time' }, pause, fast),
  );
}
drawStatus();

// ---------- bottom tabs ----------
let tabOn = -1;
function drawTabs(): void {
  const tabs = WORDS.tabs.map(([big, small], i) => {
    const b = el('button', { class: `mk-tab${tabOn === i ? ' on' : ''}` }, el('span', { class: 'mk-tab-big' }, big), el('span', { class: 'mk-tab-small' }, small));
    b.addEventListener('click', () => { tabOn = tabOn === i ? -1 : i; drawTabs(); });
    return b;
  });
  $('mk-tabs').replaceChildren(...tabs, el('button', { class: 'mk-option' }, el('span', {}, WORDS.option)));
}
drawTabs();

// ---------- map input ----------
const canvas = $<HTMLCanvasElement>('mk-map');
let drag: { x: number; y: number; moved: number } | null = null;
canvas.addEventListener('pointerdown', (e) => {
  canvas.setPointerCapture(e.pointerId);
  drag = { x: e.clientX, y: e.clientY, moved: 0 };
});
canvas.addEventListener('pointermove', (e) => {
  if (!drag) return;
  view.panBy(e.clientX - drag.x, e.clientY - drag.y);
  drag.moved += Math.abs(e.clientX - drag.x) + Math.abs(e.clientY - drag.y);
  drag.x = e.clientX;
  drag.y = e.clientY;
});
canvas.addEventListener('pointerup', (e) => {
  if (drag && drag.moved < 8) {
    const r = canvas.getBoundingClientRect();
    const tile = view.tileAt(e.clientX - r.left, e.clientY - r.top);
    const b = tile ? buildingAt(s, tile.x, tile.y) : undefined;
    view.selected = b && b.def !== 'jalan' ? b.uid : null;
    drawStatus();
  }
  drag = null;
});
canvas.addEventListener('wheel', (e) => {
  e.preventDefault();
  const r = canvas.getBoundingClientRect();
  view.zoomBy(e.deltaY < 0 ? 1 : -1, e.clientX - r.left, e.clientY - r.top);
}, { passive: false });
$('mk-zin').addEventListener('click', () => view.zoomBy(1));
$('mk-zout').addEventListener('click', () => view.zoomBy(-1));
new ResizeObserver(() => view.resize()).observe(canvas);

// ---------- satellite view ----------
// The kampung and a ring of land round it, shrunk from the world art. The frame marks what the map shows.
const sat = $<HTMLCanvasElement>('mk-sat');
$('mk-sat-label').textContent = WORDS.sat;
const PAD = 6;
const crop = {
  x: WORLD_OX - ((GRID_H + PAD) * TW) / 2,
  y: WORLD_OY - PAD * TH - 40,
  w: ((GRID_W + GRID_H + 2 * PAD) * TW) / 2,
  h: ((GRID_W + GRID_H + 2 * PAD) * TH) / 2 + 40,
};
const satBase = document.createElement('canvas');
satBase.width = sat.width;
satBase.height = sat.height;
{
  const g = satBase.getContext('2d')!;
  g.imageSmoothingEnabled = true;
  g.drawImage(buildWorld(), crop.x, crop.y, crop.w, crop.h, 0, 0, sat.width, sat.height);
}
const toSat = (wx: number, wy: number) => ({ x: ((wx - crop.x) / crop.w) * sat.width, y: ((wy - crop.y) / crop.h) * sat.height });
function drawSat(): void {
  const g = sat.getContext('2d')!;
  g.drawImage(satBase, 0, 0);
  // Buildings as roof-coloured dots, the selected one in white.
  for (const b of s.buildings) {
    if (b.def === 'jalan') continue;
    const p = toSat(WORLD_OX + ((b.x - b.y) * TW) / 2, WORLD_OY + ((b.x + b.y + 1) * TH) / 2);
    g.fillStyle = b.uid === view.selected ? '#ffffff' : b.def === 'rumah' ? '#df4a2c' : '#f6ecd4';
    g.fillRect(Math.round(p.x) - 1, Math.round(p.y) - 1, 2, 2);
  }
  // What the map shows, in world art pixels.
  const sc = view.scale;
  const wx0 = WORLD_OX - view.ox / sc;
  const wy0 = WORLD_OY - view.oy / sc;
  const a = toSat(wx0, wy0);
  const b = toSat(wx0 + canvas.clientWidth / sc, wy0 + canvas.clientHeight / sc);
  g.strokeStyle = '#fff6c8';
  g.lineWidth = 1;
  g.strokeRect(Math.round(a.x) + 0.5, Math.round(a.y) + 0.5, Math.round(b.x - a.x), Math.round(b.y - a.y));
}
sat.addEventListener('click', (e) => {
  const r = sat.getBoundingClientRect();
  const wx = crop.x + ((e.clientX - r.left) / r.width) * crop.w;
  const wy = crop.y + ((e.clientY - r.top) / r.height) * crop.h;
  const sc = view.scale;
  // Pan so that world point lands in the middle of the map.
  view.panBy(canvas.clientWidth / 2 - (view.ox + (wx - WORLD_OX) * sc), canvas.clientHeight / 2 - (view.oy + (wy - WORLD_OY) * sc));
});

// ---------- loop ----------
view.clock = 0.35;
view.frozen = true;
function frame(): void {
  view.frozen = paused;
  view.draw(s);
  drawSat();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// ?debug exposes the mockup for screenshots.
if (new URLSearchParams(location.search).has('debug')) (window as unknown as { mk: unknown }).mk = { s, view };
