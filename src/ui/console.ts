// Console skin: a cream frame round the map after a 90s train-and-city builder. A title bar with
// SYSTEM and the date, a rail with Build and Wacana, a satellite view that pans the map, and a row
// of quick tabs. Every control opens a panel the Menu already has. Off by default (Settings).
import { t, type Key } from '../i18n';
import type { App } from '../app';
import { dateLabel } from '../format';
import { TH, TW } from '../render/iso';
import { WORLD_OX, WORLD_OY } from '../render/scenery';
import { GRID_H, GRID_W } from '../sim/types';
import { h } from './dom';
import { openSettings } from './settings';
import './console.css';

const open = (app: App, id: string) => app.actions.find((a) => a.id === id)?.open(app);
const on = () => document.documentElement.classList.contains('skin-console');

const TABS: { id: string; big: Key; small: Key }[] = [
  { id: 'log', big: 'cs.log', small: 'cs.logSub' },
  { id: 'stats', big: 'cs.kas', small: 'cs.kasSub' },
  { id: 'warga', big: 'cs.warga', small: 'cs.wargaSub' },
  { id: 'wacana', big: 'cs.wacana', small: 'cs.wacanaSub' },
];

export function setupConsole(app: App): void {
  const root = document.getElementById('app')!;
  const stage = document.getElementById('stage')!;
  const map = document.getElementById('map') as HTMLCanvasElement;

  // ---------- title bar ----------
  const system = h('button', { class: 'cs-system', id: 'cs-system', type: 'button', onclick: () => openSettings(app) });
  const date = h('span', { class: 'cs-date', id: 'cs-date' });
  const title = h('header', { class: 'cs-title cs', id: 'cs-title' }, h('span', { class: 'cs-name' }, document.title.toUpperCase()), system, date);
  root.insertBefore(title, document.getElementById('hud'));

  // ---------- rail ----------
  const railTab = (id: string) => h('button', { class: 'cs-rail-tab', id: `cs-rail-${id}`, type: 'button', onclick: () => open(app, id) }, h('span', {}, ''));
  const build = railTab('build');
  const policy = railTab('wacana');
  stage.append(h('nav', { class: 'cs-rail cs', id: 'cs-rail' }, policy, h('span', { class: 'cs-rail-swap', 'aria-hidden': 'true' }, '⇕'), build));

  // ---------- satellite view ----------
  const sat = h('canvas', { width: 128, height: 88, id: 'cs-sat-map' }) as HTMLCanvasElement;
  const satLabel = h('span', { class: 'cs-sat-label', 'aria-hidden': 'true' });
  const satBox = h('figure', { class: 'cs-sat cs', id: 'cs-sat', role: 'button', tabindex: '0' }, satLabel, sat);
  stage.append(satBox);

  // ---------- quick tabs ----------
  const tabs = TABS.map((tb) => h('button', { class: 'cs-tab', id: `cs-tab-${tb.id}`, type: 'button', onclick: () => open(app, tb.id) }, h('span', { class: 'cs-tab-big' }, ''), h('span', { class: 'cs-tab-small' }, '')));
  root.insertBefore(h('nav', { class: 'cs-tabs cs', id: 'cs-tabs' }, ...tabs), document.getElementById('howto'));

  // Labels follow the language; the date follows the month.
  app.refreshers.push(() => {
    system.textContent = t('cs.system');
    date.textContent = dateLabel(app.s.month);
    build.firstElementChild!.textContent = t('menu.build');
    policy.firstElementChild!.textContent = t('menu.wacana');
    satLabel.textContent = t('cs.sat');
    satBox.setAttribute('aria-label', t('cs.satHelp'));
    TABS.forEach((tb, i) => {
      tabs[i].firstElementChild!.textContent = t(tb.big);
      tabs[i].lastElementChild!.textContent = t(tb.small);
    });
    // Out of the way while a building is being placed.
    satBox.hidden = !document.getElementById('placebar')!.hidden;
  });
  app.refresh();

  // The kampung and a ring of land round it, shrunk from the world art. The frame marks what the map shows.
  let world: HTMLCanvasElement | null = null;
  const base = document.createElement('canvas');
  base.width = sat.width;
  base.height = sat.height;
  const PAD = 6;
  const crop = () => ({
    x: WORLD_OX - ((GRID_H + PAD) * TW) / 2,
    y: WORLD_OY - PAD * TH - 40,
    w: ((GRID_W + GRID_H + 2 * PAD) * TW) / 2,
    h: ((GRID_W + GRID_H + 2 * PAD) * TH) / 2 + 40,
  });
  const toSat = (c: ReturnType<typeof crop>, wx: number, wy: number) => ({ x: ((wx - c.x) / c.w) * sat.width, y: ((wy - c.y) / c.h) * sat.height });
  const draw = () => {
    const view = app.view;
    const w = view.drawWorld();
    const c = crop();
    if (w !== world) {
      // A new stage regrids the world: shrink it again.
      world = w;
      const g = base.getContext('2d')!;
      g.clearRect(0, 0, base.width, base.height);
      g.drawImage(w, c.x, c.y, c.w, c.h, 0, 0, base.width, base.height);
    }
    const g = sat.getContext('2d')!;
    g.drawImage(base, 0, 0);
    for (const b of app.s.buildings) {
      if (b.def === 'jalan') continue;
      const p = toSat(c, WORLD_OX + ((b.x - b.y) * TW) / 2, WORLD_OY + ((b.x + b.y + 1) * TH) / 2);
      g.fillStyle = b.def === 'rumah' ? '#df4a2c' : '#f6ecd4';
      g.fillRect(Math.round(p.x) - 1, Math.round(p.y) - 1, 2, 2);
    }
    const sc = view.scale;
    const wx0 = WORLD_OX - view.ox / sc;
    const wy0 = WORLD_OY - view.oy / sc;
    const a = toSat(c, wx0, wy0);
    const b = toSat(c, wx0 + map.clientWidth / sc, wy0 + map.clientHeight / sc);
    g.strokeStyle = '#fff6c8';
    g.lineWidth = 1;
    g.strokeRect(Math.round(a.x) + 0.5, Math.round(a.y) + 0.5, Math.round(b.x - a.x), Math.round(b.y - a.y));
  };
  // A few times a second is plenty for a map overview, and nothing at all while the skin is off.
  let frame = 0;
  const tick = () => {
    if (on() && frame++ % 10 === 0) draw();
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);

  const look = (cx: number, cy: number) => {
    const r = sat.getBoundingClientRect();
    const c = crop();
    const wx = c.x + ((cx - r.left) / r.width) * c.w;
    const wy = c.y + ((cy - r.top) / r.height) * c.h;
    const view = app.view;
    const sc = view.scale;
    // Pan so that world point lands in the middle of the map.
    view.panBy(map.clientWidth / 2 - (view.ox + (wx - WORLD_OX) * sc), map.clientHeight / 2 - (view.oy + (wy - WORLD_OY) * sc));
    draw();
  };
  satBox.addEventListener('click', (e) => look(e.clientX, e.clientY));
  satBox.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const r = sat.getBoundingClientRect();
    look(r.left + r.width / 2, r.top + r.height / 2);
  });
}
