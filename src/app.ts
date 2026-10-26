import { dateLabel, rupiah, rupiahHud } from './format';
import { MapView, RES_COLOUR } from './render/map';
import { iconURL } from './render/sprites';
import { def } from './sim/content';
import { eventDef } from './data/events';
import { checkChoice, eventCost, resolveEvent } from './sim/events';
import { checkPlace, place } from './sim/rules';
import { deserialize, serialize } from './sim/save';
import { buildCost, buildingAt, newGame, population, housing } from './sim/state';
import { tick } from './sim/tick';
import type { GameState, ResourceId, SimEffect } from './sim/types';
import { audio } from './audio';
import { loadSettings, saveSettings, type Settings } from './settings';
import { storage } from './storage';
import { h, missingList } from './ui/dom';
import { RIVAL_NAME } from './data/ranking';
import { score } from './sim/ranking';
import { closeSheet, openSheet, sheetOpen } from './ui/sheet';

export const MONTH_MS = 8000;
export const SPEEDS = [0, 1, 2, 4] as const;
export type Speed = (typeof SPEEDS)[number];
const SAVE_KEY = 'pakrt.save';

interface Notice {
  title: string;
  body: string;
  tone: 'good' | 'bad' | 'info';
}

export const RES_META: Record<ResourceId, { label: string; icon: string }> = {
  rupiah: { label: 'Rupiah', icon: 'rupiah' },
  sabar: { label: 'Sabar', icon: 'sabar' },
  orangDalam: { label: 'Orang Dalam', icon: 'orangDalam' },
  viral: { label: 'Viral', icon: 'viral' },
};

/** Extension points for later systems: extra action buttons and fx handlers. */
export type MenuGroup = 'kampung' | 'records' | 'game';
export type ActionButton = { id: string; label: string; open: (app: App) => void; group?: MenuGroup; icon?: string };

export class App {
  s: GameState;
  settings: Settings;
  view: MapView;
  speed: Speed = 1;
  /** Speed to resume at after a pause. */
  private pace: Exclude<Speed, 0> = 1;
  private acc = 0;
  private last = performance.now();
  private modalQueue: (Notice & { fanfare?: boolean })[] = [];
  log: Notice[] = [];
  placing: string | null = null;
  private storageOk: boolean;
  actions: ActionButton[] = [];
  
  constructor() {
    const loaded = deserialize(storage.get(SAVE_KEY));
    this.s = loaded ?? newGame();
    this.storageOk = storage.set('pakrt.probe', '1');
    this.settings = loadSettings();
    this.view = new MapView(document.getElementById('map') as HTMLCanvasElement);
    audio.init(this.settings);
    this.applySettings();
    this.buildHud();
    this.bindMap();
    this.bindSpeed();
    new ResizeObserver(() => this.view.resize()).observe(document.getElementById('map')!);
    this.view.resize();
    if (!this.storageOk) this.notice({ title: 'Saving is off', body: 'This browser blocks storage. The game runs, but progress is lost when you close it.', tone: 'info' });
    if (this.s.pendingEvent) this.showEvent();
    requestAnimationFrame((t) => this.frame(t));
  }

  // ---------- loop ----------
  get running(): boolean {
    return this.speed > 0 && !sheetOpen() && this.modalQueue.length === 0 && !this.s.pendingEvent;
  }

  private frame(now: number): void {
    const dt = Math.min(250, now - this.last);
    this.last = now;
    if (this.running) {
      this.acc += dt * this.speed;
      while (this.acc >= MONTH_MS) {
        this.acc -= MONTH_MS;
        this.runTick();
        if (!this.running) break;
      }
    }
    const bar = document.getElementById('month-progress');
    if (bar) bar.style.width = `${(this.acc / MONTH_MS) * 100}%`;
    this.view.draw(this.s);
    requestAnimationFrame((t) => this.frame(t));
  }

  runTick(): void {
    this.handleFx(tick(this.s));
    this.save();
    this.refresh();
  }

  handleFx(fx: SimEffect[]): void {
    // One pop per tile and resource, so income and upkeep on the same tile do not overlap.
    const pops = new Map<string, { x: number; y: number; res: ResourceId; amount: number }>();
    for (const f of fx) {
      if (f.kind !== 'pop') continue;
      const key = `${f.x},${f.y},${f.res}`;
      const p = pops.get(key);
      if (p) p.amount += f.amount;
      else pops.set(key, { ...f });
    }
    for (const p of pops.values()) if (Math.abs(p.amount) >= (p.res === 'rupiah' ? 1 : 0.5)) this.view.pop(p.x, p.y, p.res, p.amount);
    for (const f of fx) {
      if (f.kind === 'pop') continue;
      else if (f.kind === 'built') {
        const b = this.s.buildings.find((o) => o.uid === f.uid);
        if (b) {
          this.view.burst(b.x, b.y);
          this.view.spawn(b.uid);
        }
        this.haptic(20);
        audio.play('build');
      } else if (f.kind === 'notice') {
        if (f.fanfare) this.modal(f);
        else this.notice(f);
      } else if (f.kind === 'event') {
        this.haptic(25);
        audio.play('event');
        this.showEventSoon = true;
      }
    }
    if (this.showEventSoon) {
      this.showEventSoon = false;
      if (this.modalQueue.length === 0) this.showEvent();
    }
  }

  private showEventSoon = false;

  // ---------- events ----------
  /** A pending event pauses the game until the player picks a choice. The first choice is always free. */
  showEvent(): void {
    const e = this.s.pendingEvent ? eventDef(this.s.pendingEvent) : undefined;
    const el = document.getElementById('modal')!;
    if (!e) return;
    const choices = e.choices.map((c, i) => {
      const check = checkChoice(this.s, c);
      const cost = eventCost(this.s, c);
      const label = c.label.replace(/ · Rp [\d.]+/, '').replace(/ · \d Orang Dalam/, '');
      const price = [cost.rupiah ? rupiah(cost.rupiah) : '', cost.orangDalam ? `${cost.orangDalam} Orang Dalam` : ''].filter(Boolean).join(' + ');
      return h('div', { class: 'action' },
        h('button', { class: `btn ${i === 0 ? '' : 'btn-primary'}`, disabled: !check.ok, onclick: () => this.chooseEvent(i) }, price ? `${label} · ${price}` : label),
        check.ok ? null : missingList(check.missing),
      );
    });
    el.replaceChildren(
      h('div', { class: 'card event', role: 'dialog', 'aria-live': 'polite' },
        h('h2', {}, e.name),
        h('p', {}, e.body),
        ...choices,
      ),
    );
    el.onclick = null;
    el.hidden = false;
    this.shake();
  }

  private chooseEvent(i: number): void {
    const fx: SimEffect[] = [];
    const out = resolveEvent(this.s, fx, i);
    if (!out.ok) return;
    document.getElementById('modal')!.hidden = true;
    this.handleFx(fx);
    this.notice({ title: 'Event result', body: out.text, tone: 'info' });
    this.save();
    this.refresh();
  }

  /** A short screen shake for bad news. Skipped when effects are off. */
  shake(): void {
    if (!this.view.effects) return;
    const stage = document.getElementById('map')!;
    stage.classList.remove('shake');
    void stage.offsetWidth;
    stage.classList.add('shake');
  }

  save(): void {
    if (this.storageOk) this.storageOk = storage.set(SAVE_KEY, serialize(this.s));
  }

  newGame(): void {
    this.s = newGame();
    this.log = [];
    this.save();
    this.refresh();
  }

  // ---------- feedback ----------
  haptic(ms: number | number[]): void {
    if (this.settings.haptics && 'vibrate' in navigator) {
      try {
        navigator.vibrate(ms);
      } catch {
        /* unsupported */
      }
    }
  }

  /** Haptic plus a UI click for button presses. */
  tap(ms = 15): void {
    this.haptic(ms);
    audio.play('tap');
  }

  notice(n: Notice): void {
    this.log.unshift(n);
    this.log.length = Math.min(this.log.length, 40);
    const t = document.getElementById('ticker')!;
    t.replaceChildren(h('strong', {}, n.title), h('span', {}, n.body));
    t.dataset.tone = n.tone;
  }

  /** Important message. Pauses the game until tapped. Never advances on a timer. */
  modal(n: Notice & { fanfare?: boolean }): void {
    this.log.unshift(n);
    this.modalQueue.push(n);
    if (this.modalQueue.length === 1) this.showModal();
  }

  private showModal(): void {
    const n = this.modalQueue[0];
    const el = document.getElementById('modal')!;
    if (!n) {
      if (this.s.pendingEvent) this.showEvent();
      else el.hidden = true;
      return;
    }
    el.replaceChildren(
      h('div', { class: `card ${n.fanfare ? 'fanfare' : ''}`, role: 'dialog', 'aria-live': 'polite' },
        n.fanfare ? h('div', { class: 'fanfare-tag' }, '★ New ★') : null,
        h('h2', {}, n.title),
        h('p', {}, n.body),
        h('p', { class: 'tap-hint' }, 'Tap to continue'),
      ),
    );
    el.hidden = false;
    if (n.fanfare) {
      this.haptic([30, 40, 30]);
      audio.play('fanfare');
    }
    el.onclick = () => {
      this.modalQueue.shift();
      this.showModal();
    };
  }

  // ---------- HUD ----------
  private buildHud(): void {
    const hud = document.getElementById('hud')!;
    const chips = (Object.keys(RES_META) as ResourceId[]).map((id) =>
      h('div', { class: 'chip', id: `chip-${id}`, style: `--c:${RES_COLOUR[id]}` },
        h('img', { src: iconURL(RES_META[id].icon), alt: '', width: 18, height: 18 }),
        h('span', { class: 'chip-label' }, RES_META[id].label),
        h('span', { class: 'chip-value' }, ''),
      ),
    );
    const pop = h('div', { class: 'chip', id: 'chip-pop', style: '--c:#f4f4f5' },
      h('img', { src: iconURL('people'), alt: '', width: 18, height: 18 }),
      h('span', { class: 'chip-label' }, 'Warga'),
      h('span', { class: 'chip-value' }, ''),
    );
    hud.replaceChildren(...chips, pop);
    hud.onclick = () => this.openStats();
    this.refresh();
  }

  refresh(): void {
    const r = this.s.res;
    const set = (id: string, v: string, label: string) => {
      const chip = document.getElementById(`chip-${id}`);
      if (!chip) return;
      chip.querySelector('.chip-value')!.textContent = v;
      chip.setAttribute('aria-label', `${label} ${v}`);
    };
    set('rupiah', rupiahHud(r.rupiah), `Rupiah ${rupiah(r.rupiah)},`);
    set('sabar', `${Math.round(r.sabar)}`, 'Sabar');
    set('orangDalam', `${Math.floor(r.orangDalam)}`, 'Orang Dalam');
    set('viral', `${Math.round(r.viral)}`, 'Viral');
    set('pop', `${population(this.s)}/${housing(this.s)}`, 'Residents');
    document.getElementById('chip-rupiah')!.classList.toggle('negative', r.rupiah < 0);
    this.flashChanges();
    const emas = document.getElementById('emas-value');
    if (emas) emas.textContent = `${this.s.emas.toFixed(2)}%`;
    const emasBar = document.getElementById('emas-fill');
    if (emasBar) emasBar.style.width = `${Math.max(0.5, this.s.emas)}%`;
    document.getElementById('date')!.textContent = dateLabel(this.s.month);
    this.updatePlacing();
    for (const fn of this.refreshers) fn(this);
  }

  refreshers: ((app: App) => void)[] = [];
  private lastRes: Record<string, number> = {};

  /** Chips flash briefly when a resource moves. Skipped when effects are off. */
  private flashChanges(): void {
    const now: Record<string, number> = { ...this.s.res, pop: population(this.s) };
    if (this.view.effects) {
      for (const [k, v] of Object.entries(now)) {
        const was = this.lastRes[k];
        if (was === undefined || Math.round(was) === Math.round(v)) continue;
        const chip = document.getElementById(`chip-${k}`);
        if (!chip) continue;
        chip.classList.remove('flash-up', 'flash-down');
        void chip.offsetWidth;
        chip.classList.add(v > was ? 'flash-up' : 'flash-down');
      }
    }
    this.lastRes = now;
  }

  openStats(): void {
    const s = this.s;
    const ranks = [...s.ranking].reverse().map((r) =>
      h('div', { class: `log-row tone-${r.won ? 'good' : 'bad'}` },
        h('strong', {}, `Year ${r.year}: ${r.won ? 'You won' : `${RIVAL_NAME} won`}`),
        h('p', {}, `Us ${r.us}, them ${r.them}`),
      ),
    );
    openSheet('Kas, warga, ranking', [
      h('p', {}, 'Rupiah pays for buildings. Sabar below 25 stops new residents, below 15 people leave. Orang Dalam skips permit queues. Viral lifts shop income and decays 10% a month.'),
      h('p', { class: 'meta' }, `Earned ${rupiah(s.stats.earned)}. Spent ${rupiah(s.stats.spent)}. Arrived ${s.stats.arrived}. Left ${s.stats.left}.`),
      h('h3', {}, 'Indonesia Emas 2045'),
      h('p', { class: 'meta' }, `${s.emas.toFixed(2)}% done. Wacana and winning the yearly ranking nudge it. Frozen projects pull it back.`),
      h('h3', {}, `Ranking vs ${RIVAL_NAME}`),
      h('p', { class: 'meta' }, `Your score now: ${score(s)}. Scored every year end from residents, working buildings, combos, Sabar and Emas.`),
      ...(ranks.length ? ranks : [h('p', { class: 'meta' }, 'First ranking at the end of year 1.')]),
    ]);
  }

  // ---------- speed ----------
  // Two buttons: pause/play, and one that cycles 1x, 2x, 4x.
  private bindSpeed(): void {
    document.getElementById('pause-btn')!.addEventListener('click', () => this.setSpeed(this.speed ? 0 : this.pace));
    document.getElementById('speed-btn')!.addEventListener('click', () => this.setSpeed(this.pace === 1 ? 2 : this.pace === 2 ? 4 : 1));
    this.setSpeed(this.speed);
  }

  setSpeed(sp: Speed): void {
    this.speed = sp;
    if (sp) this.pace = sp;
    const pause = document.getElementById('pause-btn')!;
    pause.textContent = sp ? '❚❚' : '▶';
    pause.setAttribute('aria-label', sp ? 'Pause' : 'Play');
    pause.setAttribute('aria-pressed', String(!sp));
    const speed = document.getElementById('speed-btn')!;
    speed.textContent = `${this.pace}x`;
    speed.setAttribute('aria-label', `Speed ${this.pace}x. Tap to change.`);
  }

  // ---------- map input ----------
  private bindMap(): void {
    const canvas = document.getElementById('map') as HTMLCanvasElement;
    let down: { x: number; y: number; lastX: number; lastY: number; moved: boolean } | null = null;
    canvas.addEventListener('pointerdown', (e) => {
      canvas.setPointerCapture(e.pointerId);
      down = { x: e.clientX, y: e.clientY, lastX: e.clientX, lastY: e.clientY, moved: false };
    });
    canvas.addEventListener('pointermove', (e) => {
      if (!down) return;
      if (Math.hypot(e.clientX - down.x, e.clientY - down.y) > 8) down.moved = true;
      if (down.moved) this.view.panBy(e.clientX - down.lastX, e.clientY - down.lastY);
      down.lastX = e.clientX;
      down.lastY = e.clientY;
    });
    canvas.addEventListener('pointercancel', () => (down = null));
    canvas.addEventListener('pointerup', (e) => {
      const wasDrag = down?.moved;
      down = null;
      if (wasDrag) return;
      const rect = canvas.getBoundingClientRect();
      const t = this.view.tileAt(e.clientX - rect.left, e.clientY - rect.top, !this.placing);
      if (!t) return;
      if (this.placing) {
        const ok = checkPlace(this.s, this.placing, t.x, t.y).ok;
        this.view.ghost = { x: t.x, y: t.y, ok, sprite: def(this.placing).sprite };
        this.updatePlacing();
        return;
      }
      const b = buildingAt(this.s, t.x, t.y);
      if (b) this.inspect(b.uid);
      else this.notice({ title: 'Empty tile', body: 'Open Menu, then Build, to put something here.', tone: 'info' });
    });
    document.getElementById('ticker')!.addEventListener('click', () => this.openLog());
  }

  inspect: (uid: number) => void = () => {};

  openLog(): void {
    openSheet('Kampung log', this.log.length ? this.log.map((n) => h('div', { class: `log-row tone-${n.tone}` }, h('strong', {}, n.title), h('p', {}, n.body))) : [h('p', {}, 'Nothing yet.')]);
  }

  // ---------- placement ----------
  startPlacing(id: string): void {
    closeSheet();
    this.placing = id;
    this.view.ghost = null;
    this.view.selected = null;
    document.getElementById('mainbar')!.hidden = true;
    document.getElementById('placebar')!.hidden = false;
    this.updatePlacing();
  }

  stopPlacing(): void {
    this.placing = null;
    this.view.ghost = null;
    document.getElementById('mainbar')!.hidden = false;
    document.getElementById('placebar')!.hidden = true;
  }

  confirmPlace(): void {
    const g = this.view.ghost;
    if (!this.placing || !g) return;
    const r = place(this.s, this.placing, g.x, g.y);
    if (r.ok) {
      this.view.burst(g.x, g.y);
      this.view.pop(g.x, g.y, 'rupiah', -buildCost(this.s, def(this.placing)));
      this.haptic(15);
      audio.play('build');
      this.stopPlacing();
      this.save();
      this.refresh();
    }
  }

  private updatePlacing(): void {
    if (!this.placing) return;
    const d = def(this.placing);
    const info = document.getElementById('place-info')!;
    const btn = document.getElementById('place-ok') as HTMLButtonElement;
    const g = this.view.ghost;
    if (!g) {
      info.replaceChildren(h('strong', {}, `${d.name} · ${rupiah(buildCost(this.s, d))}`), h('span', {}, 'Tap a tile.'));
      btn.disabled = true;
      return;
    }
    const check = checkPlace(this.s, this.placing, g.x, g.y);
    g.ok = check.ok;
    btn.disabled = !check.ok;
    info.replaceChildren(h('strong', {}, `${d.name} · ${rupiah(buildCost(this.s, d))}`), check.ok ? h('span', {}, `Permit ${d.permitMonths} mo, build ${d.buildMonths} mo.`) : missingList(check.missing));
  }

  // ---------- settings ----------
  applySettings(): void {
    document.documentElement.classList.toggle('large-text', this.settings.largeText);
    document.documentElement.classList.toggle('reduce-motion', this.settings.reduceMotion);
    document.documentElement.classList.toggle('high-contrast', this.settings.highContrast);
    this.view.effects = this.settings.effects && !this.settings.reduceMotion;
    audio.set(this.settings);
    saveSettings(this.settings);
  }
}
