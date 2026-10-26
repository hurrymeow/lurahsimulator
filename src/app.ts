import { eBody, eLabel, eName, bName, jName, getLang, initialLang, setLang, t, type Key, type Lang } from './i18n';
import { jobDef } from './data/jobs';
import { dateLabel, rupiah, rupiahHud } from './format';
import { MapView, RES_COLOUR } from './render/map';
import { iconURL } from './render/sprites';
import { def } from './sim/content';
import { eventDef } from './data/events';
import { checkChoice, eventCost, resolveEvent } from './sim/events';
import { checkPlace, place } from './sim/rules';
import { lotAt } from './sim/area';
import { promote } from './sim/grow';
import { RT_H, RT_W } from './sim/types';
import { acceptSK } from './sim/stages';
import { deserialize, serialize } from './sim/save';
import { buildCost, buildingAt, newGame, population, housing } from './sim/state';
import { tick } from './sim/tick';
import type { GameState, ResourceId, SimEffect } from './sim/types';
import { audio } from './audio';
import { loadSettings, saveSettings, type Settings } from './settings';
import { storage } from './storage';
import { reportExtra } from './ui/report';
import { h, missingList } from './ui/dom';
import { RIVAL_NAMES } from './data/ranking';
import { areaScore } from './sim/ranking';
import { closeSheet, openSheet, sheetOpen } from './ui/sheet';

export const MONTH_MS = 8000;
export const SPEEDS = [0, 1, 2, 4] as const;
export type Speed = (typeof SPEEDS)[number];
export const SAVE_KEY = 'pakrt.save';

interface Notice {
  /** Set on tutorial tips. Adds a way to switch all tips off. */
  tip?: { pics: Node; skip: () => void };
  title: string;
  body: string;
  tone: 'good' | 'bad' | 'info';
  /** Extra content under the body, such as the stat changes of an event. */
  extra?: Node;
  /** Extra class on the card. */
  cls?: string;
}

type ExplainId = ResourceId | 'pop';
const HINT_KEY = 'pakrt.hinted';

export const RES_META: Record<ResourceId, { label: () => string; icon: string }> = {
  rupiah: { label: () => t('res.rupiah'), icon: 'rupiah' },
  sabar: { label: () => t('res.sabar'), icon: 'sabar' },
  orangDalam: { label: () => t('res.orangDalam'), icon: 'orangDalam' },
  viral: { label: () => t('res.viral'), icon: 'viral' },
};

/** Extension points for later systems: extra action buttons and fx handlers. */
export type MenuGroup = 'kampung' | 'records' | 'game';
export type ActionButton = { id: string; label: () => string; open: (app: App) => void; group?: MenuGroup; icon?: string; show?: (app: App) => boolean };

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
  /** One RT's size in tiles. The map is 1, 2 or 4 of these across. */
  readonly rt = { w: RT_W, h: RT_H };
  /** True while the home screen is up. The sim waits. */
  held = false;
  
  constructor() {
    const loaded = deserialize(storage.get(SAVE_KEY));
    this.s = loaded ?? newGame();
    this.storageOk = storage.set('pakrt.probe', '1');
    this.settings = loadSettings();
    setLang(initialLang(this.settings.lang));
    this.applyStaticText();
    this.view = new MapView(document.getElementById('map') as HTMLCanvasElement);
    this.view.regrid();
    audio.init(this.settings);
    this.applySettings();
    this.buildHud();
    this.bindMap();
    this.bindSpeed();
    new ResizeObserver(() => this.view.resize()).observe(document.getElementById('map')!);
    this.view.resize();
    if (!this.storageOk) this.notice({ title: t('noticeSaveOff'), body: t('noticeSaveOffBody'), tone: 'info' });
    if (this.s.pendingEvent) this.showEvent();
    requestAnimationFrame((t) => this.frame(t));
  }

  // ---------- loop ----------
  get running(): boolean {
    return this.speed > 0 && !this.held && !sheetOpen() && this.modalQueue.length === 0 && !this.s.pendingEvent;
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
    this.view.clock = this.s.month + this.acc / MONTH_MS;
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
    this.flyCoins([...pops.values()].filter((p) => p.res === 'rupiah' && p.amount > 0));
    for (const f of fx) {
      if (f.kind === 'pop') continue;
      else if (f.kind === 'job') this.view.pop(f.x, f.y, 'viral', 0, t('sim.jobPick', { name: f.name, job: jName(jobDef(f.job)!) }));
      else if (f.kind === 'level') this.view.pop(f.x, f.y, 'viral', 0, t('sim.levelUp', { name: f.name, n: f.level }));
      else if (f.kind === 'built') {
        const b = this.s.buildings.find((o) => o.uid === f.uid);
        if (b) {
          this.view.burst(b.x, b.y);
          this.view.spawn(b.uid);
        }
        this.haptic(20);
        audio.play('build');
      } else if (f.kind === 'notice') {
        if (f.fanfare) this.view.pulse();
        if (f.fanfare) this.modal(f);
        else this.notice(f);
      } else if (f.kind === 'report') {
        const r = reportExtra(this.s, f.report);
        this.view.pulse();
        audio.play('fanfare');
        this.modal({ title: r.title, body: r.body, tone: 'info', extra: r.extra, cls: 'report-card' });
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

  /** Income coins arc into the money chip, which bumps as they land. A few per tick, biggest earners first. */
  private flyCoins(earn: { x: number; y: number; amount: number }[]): void {
    const chip = document.getElementById('chip-rupiah');
    const map = document.getElementById('map');
    if (!chip || !map || !this.view.effects) return;
    const c = chip.getBoundingClientRect();
    const m = map.getBoundingClientRect();
    const to = { x: c.left + c.width / 2 - m.left, y: c.top + c.height / 2 - m.top };
    const land = () => chip.animate?.([{ transform: 'scale(1.12)' }, { transform: 'scale(1)' }], { duration: 160 });
    let budget = 12;
    for (const p of earn.sort((a, b) => b.amount - a.amount)) {
      const n = Math.min(budget, p.amount >= 500_000 ? 3 : p.amount >= 150_000 ? 2 : 1);
      if (n <= 0) break;
      budget -= n;
      this.view.coins(p.x, p.y, n, to, land);
    }
  }

  // ---------- events ----------
  /** A pending event pauses the game until the player picks a choice. The first choice is always free. */
  showEvent(): void {
    const e = this.s.pendingEvent ? eventDef(this.s.pendingEvent) : undefined;
    const el = document.getElementById('modal')!;
    if (!e) return;
    const choices = e.choices.map((c, i) => {
      const check = checkChoice(this.s, c);
      const cost = eventCost(this.s, c);
      const label = eLabel(e, i, c).replace(/ · Rp [\d.]+/, '').replace(/ · \d Orang Inside/, '');
      const od = cost.orangDalam ? [`${cost.orangDalam} `, h('img', { src: iconURL('orangDalam'), alt: t('res.orangDalam'), width: 18, height: 18, class: 'inline-icon' })] : [];
      const price: Node[] = [...(cost.rupiah ? [document.createTextNode(rupiah(cost.rupiah))] : []), ...(cost.rupiah && od.length ? [document.createTextNode(' + ')] : []), ...od.map((x) => (x instanceof Node ? x : document.createTextNode(x)))];
      return h('div', { class: 'action' },
        h('button', { class: `btn ${i === 0 ? '' : 'btn-primary'}`, disabled: !check.ok, onclick: (ev: Event) => { ev.stopPropagation(); this.chooseEvent(i); } }, label, ...(price.length ? [' · ', ...price] : [])),
        check.ok ? null : missingList(check.missing),
      );
    });
    el.replaceChildren(
      h('div', { class: 'card event', role: 'dialog', 'aria-live': 'polite' },
        h('h2', {}, eName(e)),
        h('p', {}, eBody(e)),
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
    // The event card bypasses the queue, so show the outcome now, ahead of anything waiting.
    const n: Notice = { title: t('event.result'), body: out.text, tone: 'info', extra: this.outcomeChips(out) };
    this.log.unshift(n);
    this.modalQueue.unshift(n);
    this.showModal();
    this.save();
    this.refresh();
  }

  /** One chip per changed resource, plus the timed income modifier if the choice started one. */
  private outcomeChips(out: { delta?: Partial<Record<ResourceId, number>>; modifier?: { label: string; incomeMult: number; months: number } }): Node {
    const rows: Node[] = (Object.keys(RES_META) as ResourceId[])
      .filter((id) => out.delta?.[id])
      .map((id) => {
        const v = out.delta![id]!;
        const amt = id === 'rupiah' ? rupiah(Math.abs(v)) : String(Math.round(Math.abs(v) * 10) / 10);
        return h('div', { class: `outcome-chip ${v < 0 ? 'negative' : 'positive'}`, style: `--c:${RES_COLOUR[id]}`, role: 'text', 'aria-label': `${RES_META[id].label()} ${v < 0 ? '-' : '+'}${amt}` },
          h('img', { src: iconURL(RES_META[id].icon), alt: '', width: 24, height: 24 }),
          h('span', { class: 'outcome-value' }, `${v < 0 ? '▼ -' : '▲ +'}${amt}`),
        );
      });
    if (out.modifier) {
      const mult = String(out.modifier.incomeMult).replace('.', getLang() === 'id' ? ',' : '.');
      rows.push(h('div', { class: 'outcome-mod' }, t('event.mod', { label: out.modifier.label, mult, n: out.modifier.months })));
    }
    return h('div', { class: 'outcome-list' }, ...rows);
  }

  /** A short screen shake for bad news. Skipped when effects are off. */
  shake(): void {
    if (!this.view.effects) return;
    const stage = document.getElementById('map')!;
    stage.classList.remove('shake');
    void stage.offsetWidth;
    stage.classList.add('shake');
  }

  /** The player accepts the SK: the stage rises and the map grows. */
  accept(): void {
    const fx: SimEffect[] = [];
    if (!acceptSK(this.s, fx)) return;
    this.view.regrid();
    this.handleFx(fx);
    this.save();
    this.refresh();
  }

  /** The stage rises: the map grows and the new cells fill with AI RTs. */
  promote(): void {
    const fx: SimEffect[] = [];
    if (!promote(this.s, fx)) return;
    this.view.regrid();
    this.handleFx(fx);
    this.save();
    this.refresh();
  }

  save(): void {
    if (this.storageOk) this.storageOk = storage.set(SAVE_KEY, serialize(this.s));
  }

  newGame(): void {
    this.s = newGame();
    this.view.regrid();
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
    const ticker = document.getElementById('ticker')!;
    ticker.replaceChildren(h('strong', {}, n.title), h('span', {}, n.body));
    ticker.dataset.tone = n.tone;
    delete ticker.dataset.i18n;
  }

  /** Important message. Pauses the game until tapped. Never advances on a timer. */
  modal(n: Notice & { fanfare?: boolean }): void {
    this.log.unshift(n);
    this.modalQueue.push(n);
    if (this.modalQueue.length === 1) this.showModal();
  }

  /** True when a tip can show without stacking on another message. */
  get idle(): boolean {
    return this.modalQueue.length === 0 && !this.s.pendingEvent && !sheetOpen() && document.getElementById('howto')!.hidden;
  }

  private dropTips(): void {
    this.modalQueue = this.modalQueue.filter((m) => !m.tip);
    this.showModal();
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
      h('div', { class: `card ${n.fanfare ? 'fanfare' : ''} ${n.cls ?? ''}`, role: 'dialog', 'aria-live': 'polite' },
        n.fanfare ? h('div', { class: 'fanfare-tag' }, t('modal.new')) : null,
        h('h2', {}, n.title),
        h('p', {}, n.body),
        n.extra,
        n.tip?.pics,
        h('p', { class: 'tap-hint' }, t('modal.tap')),
        n.tip ? h('button', { class: 'btn tip-skip', onclick: (e: Event) => { e.stopPropagation(); n.tip!.skip(); this.dropTips(); } }, t('tip.skip')) : null,
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
    const chip = (id: ExplainId, icon: Node, label: string) =>
      h('button', { class: 'chip', type: 'button', id: `chip-${id}`, 'aria-label': label, style: `--c:${id === 'pop' ? '#f4f4f5' : RES_COLOUR[id]}`, onclick: () => this.explain(id) },
        icon,
        h('span', { class: 'chip-value' }, ''),
      );
    const img = (name: string) => h('img', { src: iconURL(name), alt: '', width: 18, height: 18 });
    const chips = (Object.keys(RES_META) as ResourceId[]).map((id) => chip(id, img(RES_META[id].icon), RES_META[id].label()));
    hud.replaceChildren(...chips, chip('pop', h('span', { class: 'chip-text' }, t('res.pop')), t('res.pop')));
    this.refresh();
  }

  /** Tap-to-dismiss card: what the resource is, what moves it, what the extremes do. */
  explain(id: ExplainId): void {
    if (!this.idle) return;
    this.tap();
    const row = (kind: 'up' | 'down' | 'edge') =>
      h('p', { class: `exp-row exp-${kind}` }, h('strong', {}, `${{ up: '▲', down: '▼', edge: '■' }[kind]} ${t(`exp.${kind}`)}`), ` ${t(`exp.${id}.${kind}` as Key)}`);
    const icon = id === 'pop' ? h('span', { class: 'chip-text' }, t('res.pop')) : h('img', { src: iconURL(RES_META[id].icon, 6), alt: '', width: 36, height: 36, class: 'pixel' });
    const title = id === 'pop' ? t('res.warga') : RES_META[id].label();
    this.modalQueue.push({ title, body: t(`exp.${id}.what` as Key), tone: 'info', extra: h('div', { class: 'exp', style: `--c:${id === 'pop' ? '#f4f4f5' : RES_COLOUR[id]}` }, icon, row('up'), row('down'), row('edge')) });
    this.showModal();
  }

  refresh(): void {
    const r = this.s.res;
    const set = (id: string, v: string, label: string) => {
      const chip = document.getElementById(`chip-${id}`);
      if (!chip) return;
      chip.querySelector('.chip-value')!.textContent = v;
      chip.setAttribute('aria-label', `${label} ${v}`);
    };
    set('rupiah', rupiahHud(r.rupiah), `${t('res.rupiah')} ${rupiah(r.rupiah)},`);
    set('sabar', `${Math.round(r.sabar)}`, t('res.sabar'));
    set('orangDalam', `${Math.floor(r.orangDalam)}`, t('res.orangDalam'));
    set('viral', `${Math.round(r.viral)}`, t('res.viral'));
    set('pop', `${population(this.s)}/${housing(this.s)}`, t('page.resourcesLabel'));
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
        this.hintChip(k, chip);
      }
    }
    this.lastRes = now;
  }

  /** The first time a chip moves, ring it so players find the tap. Remembered across sessions. */
  private hintChip(id: string, chip: HTMLElement): void {
    let seen: string[] = [];
    try { seen = JSON.parse(storage.get(HINT_KEY) ?? '[]'); } catch { /* fresh */ }
    if (seen.includes(id)) return;
    storage.set(HINT_KEY, JSON.stringify([...seen, id]));
    chip.classList.add('hint');
    chip.addEventListener('animationend', (e) => { if ((e as AnimationEvent).animationName === 'hint') chip.classList.remove('hint'); });
  }

  openStats(): void {
    const s = this.s;
    const RIVAL_NAME = RIVAL_NAMES[s.stage.current];
    const ranks = [...s.ranking].reverse().map((r) =>
      h('div', { class: `log-row tone-${r.won ? 'good' : 'bad'}` },
        h('strong', {}, r.won ? t('stats.won', { year: r.year }) : t('stats.lost', { year: r.year, rival: RIVAL_NAME })),
        h('p', {}, t('stats.usThem', { us: r.us, them: r.them })),
      ),
    );
    openSheet(t('stats.title'), [
      h('p', {}, t('stats.intro')),
      h('p', { class: 'meta' }, t('stats.totals', { earned: rupiah(s.stats.earned), spent: rupiah(s.stats.spent), arrived: s.stats.arrived, left: s.stats.left })),
      h('h3', {}, t('stats.emasTitle')),
      h('p', { class: 'meta' }, t('stats.emas', { n: s.emas.toFixed(2) })),
      h('h3', {}, t('stats.rankTitle', { rival: RIVAL_NAME })),
      h('p', { class: 'meta' }, t('stats.score', { n: areaScore(s) })),
      ...(ranks.length ? ranks : [h('p', { class: 'meta' }, t('stats.firstRank'))]),
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
    pause.setAttribute('aria-label', sp ? t('page.pause') : t('page.play'));
    pause.setAttribute('aria-pressed', String(!sp));
    const speed = document.getElementById('speed-btn')!;
    speed.textContent = `${this.pace}x`;
    speed.setAttribute('aria-label', t('page.speed', { n: this.pace }));
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
      const tile = this.view.tileAt(e.clientX - rect.left, e.clientY - rect.top, !this.placing);
      if (!tile) return;
      if (this.placing) {
        const ok = checkPlace(this.s, this.placing, tile.x, tile.y).ok;
        this.view.ghost = { x: tile.x, y: tile.y, ok, sprite: def(this.placing).sprite };
        this.updatePlacing();
        return;
      }
      const b = buildingAt(this.s, tile.x, tile.y);
      if (b) this.inspect(b.uid);
      else if (lotAt(tile.x, tile.y) === 'other') this.actions.find((a) => a.id === 'neighbours')?.open(this);
      else this.notice({ title: t('build.emptyTile'), body: t('build.emptyTileBody'), tone: 'info' });
    });
    document.getElementById('ticker')!.addEventListener('click', () => this.openLog());
  }

  inspect: (uid: number) => void = () => {};

  openLog(): void {
    openSheet(t('log.title'), this.log.length ? this.log.map((n) => h('div', { class: `log-row tone-${n.tone}` }, h('strong', {}, n.title), h('p', {}, n.body))) : [h('p', {}, t('page.nothingYet'))]);
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
      const cost = buildCost(this.s, def(this.placing));
      if (cost) this.view.pop(g.x, g.y, 'rupiah', -cost);
      this.haptic(15);
      audio.play('build');
      // Paths are free, so keep painting them until the player taps Cancel.
      if (def(this.placing).pathIncome) {
        this.view.ghost = null;
        this.updatePlacing();
      } else this.stopPlacing();
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
      info.replaceChildren(h('strong', {}, `${bName(d)} · ${rupiah(buildCost(this.s, d))}`), h('span', {}, t('build.tapTile')));
      btn.disabled = true;
      return;
    }
    const check = checkPlace(this.s, this.placing, g.x, g.y);
    g.ok = check.ok;
    btn.disabled = !check.ok;
    info.replaceChildren(h('strong', {}, `${bName(d)} · ${rupiah(buildCost(this.s, d))}`), check.ok ? h('span', {}, d.pathIncome ? t('build.instant') : t('build.permitShort', { permit: d.permitMonths, build: d.buildMonths })) : missingList(check.missing));
  }

  // ---------- language ----------
  /** Static page text carries data-i18n (text) or data-i18n-aria (aria-label). */
  applyStaticText(): void {
    document.querySelectorAll<HTMLElement>('[data-i18n]').forEach((el) => (el.textContent = t(el.dataset.i18n as Key)));
    document.querySelectorAll<HTMLElement>('[data-i18n-aria]').forEach((el) => el.setAttribute('aria-label', t(el.dataset.i18nAria as Key)));
  }

  /** Switches language live: relabels the page, HUD and speed buttons. Open panels are reopened by the caller. */
  setLanguage(lang: Lang): void {
    setLang(lang);
    this.settings.lang = lang;
    saveSettings(this.settings);
    this.applyStaticText();
    this.buildHud();
    this.setSpeed(this.speed);
  }

  // ---------- settings ----------
  applySettings(): void {
    document.documentElement.classList.toggle('large-text', this.settings.largeText);
    document.documentElement.classList.toggle('reduce-motion', this.settings.reduceMotion);
    document.documentElement.classList.toggle('high-contrast', this.settings.highContrast);
    this.view.effects = this.settings.effects && !this.settings.reduceMotion;
    document.documentElement.classList.toggle('no-effects', !this.view.effects);
    this.view.motion = !this.settings.reduceMotion;
    if (!this.view.effects) this.view.fx.clear();
    audio.set(this.settings);
    saveSettings(this.settings);
  }
}
