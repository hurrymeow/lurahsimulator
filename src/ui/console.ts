// Console frame: the main screen after a 90s train-and-city builder. Two slim rows on top: time
// (play, speed, date, the 2045 meter) and money (the five resources). The goal floats as a pill on
// the map's top-left, opposite a small satellite view. At the bottom, the month as a thin line and
// a dock of three equal buttons: Build, Warga and Menu. Settings picks a light or dark frame.
import { t } from '../i18n';
import type { App } from '../app';
import { dateLabel, rupiahHud } from '../format';
import { damagedList, repairAll, repairCost } from '../sim/events';
import { TH, TW } from '../render/iso';
import { WORLD_OX, WORLD_OY } from '../render/scenery';
import { GRID_H, GRID_W } from '../sim/types';
import { h } from './dom';
import { menuIconURL } from './icons';
import { newTag, unseenBuildings } from './build';
import './console.css';

/** Panels with their own dock button. The Menu stops listing them, so nothing appears twice. */
const DOCK = ['build', 'warga'];

export function setupConsole(app: App): void {
  const stage = document.getElementById('stage')!;
  const map = document.getElementById('map') as HTMLCanvasElement;

  // ---------- top: a time row and a money row ----------
  const date = h('span', { class: 'cs-date', id: 'cs-date' });
  const clock = h('div', { class: 'cs-clock' }, document.getElementById('pause-btn')!, document.getElementById('speed-btn')!);
  const row1 = h('div', { class: 'cs-row cs', id: 'cs-row1' }, clock, date, document.getElementById('emas')!);
  const row2 = h('div', { class: 'cs-row cs', id: 'cs-row2' }, document.getElementById('hud')!);
  const status = document.getElementById('status')!;
  status.before(row1, row2);
  // The goal floats as a pill over the map's top-left corner, opposite the satellite view.
  const goal = document.getElementById('goal')!;
  goal.classList.add('cs-goal-float');
  stage.append(goal);
  status.remove();

  // ---------- bottom: the month as a thin line, and three equal dock buttons ----------
  const bar = document.getElementById('bottombar')!;
  const month = document.querySelector('.month-track')!;
  month.classList.add('cs-month');
  bar.prepend(month);
  const menuBtn = document.getElementById('menu-btn')!;
  const dock = DOCK.map((id) => {
    const action = app.actions.find((a) => a.id === id)!;
    action.dock = true;
    const icon = menuIconURL(id);
    const b = h('button', { class: 'btn cs-dock', id: `dock-${id}`, type: 'button', onclick: () => action.open(app) },
      icon ? h('img', { src: icon, alt: '', width: 24, height: 24, class: 'pixel' }) : null,
      h('span', { class: 'cs-dock-label' }, ''),
    );
    menuBtn.before(b);
    return { action, b };
  });
  // Build carries the NEW tag while something new waits on the Build screen.
  const buildBtn = dock.find((d) => d.action.id === 'build')?.b;
  if (buildBtn) {
    app.refreshers.push(() => {
      const fresh = unseenBuildings(app.s).length > 0;
      const tag = buildBtn.querySelector('[data-new]');
      if (fresh && !tag) buildBtn.append(newTag(true));
      else if (!fresh && tag) tag.remove();
      buildBtn.classList.toggle('has-new', fresh);
    });
  }
  // Menu gets an icon too, so the three bottom buttons read as one set.
  menuBtn.replaceChildren(h('span', { class: 'cs-menu-icon', 'aria-hidden': 'true' }, h('i'), h('i'), h('i')), h('span', { 'data-i18n': 'page.menu' }, t('page.menu')));
  menuBtn.removeAttribute('data-i18n');

  // ---------- satellite view ----------
  const sat = h('canvas', { width: 88, height: 60, id: 'cs-sat-map' }) as HTMLCanvasElement;
  const satBox = h('figure', { class: 'cs-sat cs', id: 'cs-sat', role: 'button', tabindex: '0' }, sat);
  stage.append(satBox);

  // Repair all: a small chip under the satellite view, only while something is broken.
  const fixAll = h('button', { class: 'btn cs cs-fix', id: 'cs-fix', type: 'button', hidden: true, onclick: () => {
    const { fixed, left, spent } = repairAll(app.s);
    if (!fixed.length) return app.notice({ title: t('cs.fixNone'), body: t('cs.fixNoneBody'), tone: 'bad' });
    for (const b of fixed) app.view.burst(b.x, b.y);
    app.tap(15);
    app.save();
    app.refresh();
    app.notice({ title: t('cs.fixDone', { n: fixed.length }), body: left ? t('cs.fixLeft', { n: left }) : t('cs.fixSpent', { cost: rupiahHud(spent) }), tone: left ? 'bad' : 'good' });
  } });
  stage.append(fixAll);

  // The date follows the month; the satellite label follows the language.
  app.refreshers.push(() => {
    date.textContent = dateLabel(app.s.month);
    for (const { action, b } of dock) b.querySelector('.cs-dock-label')!.textContent = action.label();
    satBox.setAttribute('aria-label', t('cs.satHelp'));
    // Out of the way while a building is being placed.
    satBox.hidden = !document.getElementById('placebar')!.hidden;
    const broken = damagedList(app.s);
    const total = broken.reduce((n, b) => n + repairCost(app.s, b), 0);
    fixAll.hidden = !broken.length || !document.getElementById('placebar')!.hidden || document.getElementById('app')!.classList.contains('home-open');
    fixAll.textContent = total ? t('cs.fixAll', { n: broken.length, cost: rupiahHud(total) }) : t('cs.fixAllFree', { n: broken.length });
    fixAll.classList.toggle('poor', total > app.s.res.rupiah);
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
