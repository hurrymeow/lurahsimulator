import { dateLabel, rupiah } from './format';
import { MapView, RES_COLOUR } from './render/map';
import { iconURL } from './render/sprites';
import { def } from './sim/content';
import { checkPlace, place } from './sim/rules';
import { deserialize, serialize } from './sim/save';
import { buildCost, buildingAt, newGame, population, housing } from './sim/state';
import { tick } from './sim/tick';
import type { GameState, ResourceId, SimEffect } from './sim/types';
import { loadSettings, saveSettings, type Settings } from './settings';
import { storage } from './storage';
import { h, missingList } from './ui/dom';
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
export type ActionButton = { id: string; label: string; open: (app: App) => void };

export class App {
  s: GameState;
  settings: Settings;
  view: MapView;
  speed: Speed = 1;
  private acc = 0;
  private last = performance.now();
  private modalQueue: (Notice & { fanfare?: boolean })[] = [];
  log: Notice[] = [];
  placing: string | null = null;
  private storageOk: boolean;
  actions: ActionButton[] = [];
  eventHandlers: ((app: App, eventId: string) => void)[] = [];

  constructor() {
    const loaded = deserialize(storage.get(SAVE_KEY));
    this.s = loaded ?? newGame();
    this.storageOk = storage.set('pakrt.probe', '1');
    this.settings = loadSettings();
    this.view = new MapView(document.getElementById('map') as HTMLCanvasElement);
    this.applySettings();
    this.buildHud();
    this.bindMap();
    this.bindSpeed();
    new ResizeObserver(() => this.view.resize()).observe(document.getElementById('map')!);
    this.view.resize();
    if (!this.storageOk) this.notice({ title: 'Saving is off', body: 'This browser blocks storage. The game runs, but progress is lost when you close it.', tone: 'info' });
    else if (!loaded) this.modal({ title: 'Selamat datang, Pak RT', body: 'Place buildings to attract residents. Every month the kas fills or empties. Tap Build to start.', tone: 'info' });
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
        if (b) this.view.burst(b.x, b.y);
        this.haptic(20);
      } else if (f.kind === 'notice') {
        if (f.fanfare) this.modal(f);
        else this.notice(f);
      } else if (f.kind === 'event') {
        for (const handler of this.eventHandlers) handler(this, f.eventId);
      }
    }
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
      el.hidden = true;
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
    if (n.fanfare) this.haptic([30, 40, 30]);
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
        h('img', { src: iconURL(RES_META[id].icon), alt: '', width: 20, height: 20 }),
        h('span', { class: 'chip-label' }, RES_META[id].label),
        h('span', { class: 'chip-value' }, ''),
      ),
    );
    const pop = h('div', { class: 'chip', id: 'chip-pop', style: '--c:#f4f4f5' },
      h('img', { src: iconURL('people'), alt: '', width: 20, height: 20 }),
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
    set('rupiah', rupiah(r.rupiah), 'Rupiah');
    set('sabar', `${Math.round(r.sabar)}`, 'Sabar');
    set('orangDalam', `${Math.floor(r.orangDalam)}`, 'Orang Dalam');
    set('viral', `${Math.round(r.viral)}`, 'Viral');
    set('pop', `${population(this.s)}/${housing(this.s)}`, 'Residents');
    document.getElementById('chip-rupiah')!.classList.toggle('negative', r.rupiah < 0);
    document.getElementById('date')!.textContent = dateLabel(this.s.month);
    this.updatePlacing();
    for (const fn of this.refreshers) fn(this);
  }

  refreshers: ((app: App) => void)[] = [];

  private openStats(): void {
    openSheet('Kas & warga', [
      h('p', {}, `Rupiah pays for buildings. Sabar below 25 stops new residents; below 15 people leave. Orang Dalam skips permit queues. Viral unlocks some repairs and decays 10% a month.`),
      h('p', {}, `Earned ${rupiah(this.s.stats.earned)}. Spent ${rupiah(this.s.stats.spent)}. Arrived ${this.s.stats.arrived}. Left ${this.s.stats.left}.`),
    ]);
  }

  // ---------- speed ----------
  private bindSpeed(): void {
    const wrap = document.getElementById('speed')!;
    const labels: Record<Speed, string> = { 0: '❚❚', 1: '1x', 2: '2x', 4: '4x' };
    wrap.replaceChildren(
      ...SPEEDS.map((sp) =>
        h('button', { class: 'btn seg', 'data-speed': sp, 'aria-label': sp === 0 ? 'Pause' : `Speed ${sp}x`, onclick: () => this.setSpeed(sp) }, labels[sp]),
      ),
    );
    this.setSpeed(this.speed);
  }

  setSpeed(sp: Speed): void {
    this.speed = sp;
    document.querySelectorAll<HTMLButtonElement>('#speed .seg').forEach((b) => b.setAttribute('aria-pressed', String(Number(b.dataset.speed) === sp)));
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
      const t = this.view.tileAt(e.clientX - rect.left, e.clientY - rect.top);
      if (!t) return;
      if (this.placing) {
        const ok = checkPlace(this.s, this.placing, t.x, t.y).ok;
        this.view.ghost = { x: t.x, y: t.y, ok, sprite: def(this.placing).sprite };
        this.updatePlacing();
        return;
      }
      const b = buildingAt(this.s, t.x, t.y);
      if (b) this.inspect(b.uid);
      else this.notice({ title: 'Empty tile', body: 'Tap Build to put something here.', tone: 'info' });
    });
    document.getElementById('ticker')!.addEventListener('click', () => this.openLog());
  }

  inspect: (uid: number) => void = () => {};

  private openLog(): void {
    openSheet('Kampung log', this.log.length ? this.log.map((n) => h('div', { class: `log-row tone-${n.tone}` }, h('strong', {}, n.title), h('p', {}, n.body))) : [h('p', {}, 'Nothing yet.')]);
  }

  // ---------- placement ----------
  startPlacing(id: string): void {
    closeSheet();
    this.placing = id;
    this.view.ghost = null;
    this.view.selected = null;
    document.getElementById('actions')!.hidden = true;
    document.getElementById('placebar')!.hidden = false;
    this.updatePlacing();
  }

  stopPlacing(): void {
    this.placing = null;
    this.view.ghost = null;
    document.getElementById('actions')!.hidden = false;
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
    this.view.effects = this.settings.effects && !this.settings.reduceMotion;
    saveSettings(this.settings);
  }
}
