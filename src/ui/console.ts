// Console frame: the main screen after a 90s train-and-city builder. A slim title bar with the
// name and the date, and a small satellite view that pans the map. Every panel lives in the Menu,
// so the frame adds no buttons of its own. Settings picks a light or dark frame.
import { t } from '../i18n';
import type { App } from '../app';
import { dateLabel } from '../format';
import { TH, TW } from '../render/iso';
import { WORLD_OX, WORLD_OY } from '../render/scenery';
import { GRID_H, GRID_W } from '../sim/types';
import { h } from './dom';
import { menuIconURL } from './icons';
import './console.css';

export function setupConsole(app: App): void {
  const root = document.getElementById('app')!;
  const stage = document.getElementById('stage')!;
  const map = document.getElementById('map') as HTMLCanvasElement;

  // ---------- top bar: time controls beside the date, like a city builder's clock ----------
  const date = h('span', { class: 'cs-date', id: 'cs-date' });
  const clock = h('div', { class: 'cs-clock' }, document.getElementById('pause-btn')!, document.getElementById('speed-btn')!);
  const title = h('header', { class: 'cs-title cs', id: 'cs-title' }, clock, date);
  root.insertBefore(title, document.getElementById('hud'));

  // ---------- bottom bar: a dock of the most used panels beside Menu, and the month as a thin line ----------
  const bar = document.getElementById('bottombar')!;
  const month = document.querySelector('.month-track')!;
  month.classList.add('cs-month');
  bar.prepend(month);
  const menuBtn = document.getElementById('menu-btn')!;
  const DOCK: { id: string; label: () => string }[] = [
    { id: 'build', label: () => t('menu.build') },
    { id: 'warga', label: () => t('menu.warga') },
  ];
  const dock = DOCK.map((d) => {
    const icon = menuIconURL(d.id);
    const b = h('button', { class: 'btn cs-dock', id: `dock-${d.id}`, type: 'button', onclick: () => app.actions.find((a) => a.id === d.id)?.open(app) },
      icon ? h('img', { src: icon, alt: '', width: 28, height: 28, class: 'pixel' }) : null,
      h('span', {}, ''),
    );
    return { d, b };
  });
  for (const { b } of dock) menuBtn.before(b);
  // Menu gets an icon too, so the three bottom buttons read as one set.
  if (!menuBtn.querySelector('.cs-menu-icon')) {
    const label = h('span', { 'data-i18n': 'page.menu' }, menuBtn.textContent ?? '');
    menuBtn.removeAttribute('data-i18n');
    menuBtn.replaceChildren(h('span', { class: 'cs-menu-icon', 'aria-hidden': 'true' }, h('i'), h('i'), h('i')), label);
  }

  // ---------- top: two compact rows. Prototype: ?top=a|b|c picks the arrangement. ----------
  // a: clock + resources / goal + date + 2045
  // b: resources + date / clock + goal + 2045
  // c: clock + date + 2045 / resources, with the goal floating on the map
  const layout = (['a', 'b', 'c'] as const).find((k) => new URLSearchParams(location.search).get('top') === k) ?? 'a';
  document.documentElement.dataset.top = layout;
  const hud = document.getElementById('hud')!;
  const goal = document.getElementById('goal')!;
  const emas = document.getElementById('emas')!;
  const row1 = h('div', { class: 'cs-row cs', id: 'cs-row1' });
  const row2 = h('div', { class: 'cs-row cs', id: 'cs-row2' });
  if (layout === 'a') {
    row1.append(clock, hud);
    row2.append(goal, date, emas);
  } else if (layout === 'b') {
    row1.append(hud, date);
    row2.append(clock, goal, emas);
  } else {
    row1.append(clock, date, emas);
    row2.append(hud);
    // The goal floats as a pill over the map's top-left corner, opposite the satellite view.
    stage.append(goal);
    goal.classList.add('cs-goal-float');
  }
  title.replaceWith(row1);
  row1.after(row2);
  document.getElementById('status')!.hidden = true;

  // ---------- satellite view ----------
  const sat = h('canvas', { width: 88, height: 60, id: 'cs-sat-map' }) as HTMLCanvasElement;
  const satBox = h('figure', { class: 'cs-sat cs', id: 'cs-sat', role: 'button', tabindex: '0' }, sat);
  stage.append(satBox);

  // The date follows the month; the satellite label follows the language.
  app.refreshers.push(() => {
    date.textContent = dateLabel(app.s.month);
    for (const { d, b } of dock) b.lastElementChild!.textContent = d.label();
    satBox.setAttribute('aria-label', t('cs.satHelp'));
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
  // A few times a second is plenty for a map overview.
  let frame = 0;
  const tick = () => {
    if (frame++ % 10 === 0) draw();
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
