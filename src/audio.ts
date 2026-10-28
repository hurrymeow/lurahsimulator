import type { Settings } from './settings';

/**
 * All sound is synthesised with Web Audio, so there is nothing to download or license.
 * The context is created on the first tap, since browsers block audio before a gesture.
 */
export type Sfx = 'tap' | 'build' | 'event' | 'fanfare' | 'first' | 'bad';

const MUSIC_MIX = 0.5;
const BEAT = 60 / 96 / 2;
const BAR = 8 * BEAT;

// Pentatonic melody over a I - vi - IV - V loop, 8 bars. [midi note or 0 for a rest, length in 8ths].
const TUNE: [number, number][][] = [
  [[69, 2], [72, 1], [74, 1], [76, 2], [74, 2]], [[72, 2], [69, 2], [67, 4]],
  [[65, 2], [69, 1], [72, 1], [74, 2], [72, 2]], [[71, 2], [74, 2], [79, 2], [0, 2]],
  [[76, 2], [74, 1], [72, 1], [69, 2], [72, 2]], [[74, 2], [72, 2], [69, 4]],
  [[65, 2], [67, 1], [69, 1], [72, 2], [69, 2]], [[67, 2], [71, 2], [72, 4]],
];
const ROOTS = [45, 45, 41, 43];
const CHORDS = [[57, 60, 64], [57, 60, 64], [53, 57, 60], [55, 59, 62]];

const hz = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

class Audio {
  private ctx: AudioContext | null = null;
  private sfxOut!: GainNode;
  private musicOut!: GainNode;
  private bus: GainNode | null = null;
  private timer = 0;
  private bar = 0;
  private at = 0;
  private sfxVol = 1;
  private musicVol = 0.5;

  /** Hooks the first tap and the tab visibility. Call once. */
  init(s: Settings): void {
    this.set(s);
    addEventListener('pointerdown', () => this.start(), { once: true, capture: true });
    addEventListener('keydown', () => this.start(), { once: true, capture: true });
    document.addEventListener('click', (e) => this.onClick(e), true);
    document.addEventListener('visibilitychange', () => {
      if (!this.ctx) return;
      if (document.hidden) void this.ctx.suspend();
      else void this.ctx.resume();
      this.music();
    });
  }

  /** One tap sound for every enabled button, so no control needs its own call. */
  private onClick(e: MouseEvent): void {
    const el = e.target instanceof Element ? e.target.closest('button, [role="button"]') : null;
    if (el && !el.matches(':disabled, [aria-disabled="true"]')) this.play('tap');
  }

  set(s: Settings): void {
    this.sfxVol = s.sfxVol / 100;
    this.musicVol = s.musicVol / 100;
    if (this.ctx) {
      this.sfxOut.gain.value = this.sfxVol;
      this.musicOut.gain.value = this.musicVol * MUSIC_MIX;
      this.music();
    }
  }

  start(): void {
    if (!this.ctx) {
      try {
        const C = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        this.ctx = new C();
        this.sfxOut = this.ctx.createGain();
        this.sfxOut.gain.value = this.sfxVol;
        this.sfxOut.connect(this.ctx.destination);
        this.musicOut = this.ctx.createGain();
        this.musicOut.gain.value = this.musicVol * MUSIC_MIX;
        this.musicOut.connect(this.ctx.destination);
      } catch {
        this.ctx = null;
        return;
      }
    }
    if (this.ctx.state === 'suspended' && !document.hidden) void this.ctx.resume();
    this.music();
  }

  /** True once the first tap has created the context. Used by tests. */
  get running(): boolean {
    return !!this.ctx && !!this.bus;
  }

  play(name: Sfx): void {
    if (!this.ctx || !this.sfxVol) return;
    switch (name) {
      case 'tap': this.tone(660, 0, 0.06, 0.04, 'square'); break;
      case 'build': this.tone(392, 0, 0.1, 0.16); this.tone(523, 0.08, 0.16, 0.16); break;
      case 'event': this.tone(784, 0, 0.12, 0.14); this.tone(659, 0.1, 0.2, 0.14); break;
      case 'bad': this.tone(196, 0, 0.3, 0.18, 'sawtooth'); this.tone(147, 0.12, 0.35, 0.16, 'sawtooth'); break;
      case 'first': [523, 659, 784, 1047, 1319, 1568].forEach((f, k) => this.tone(f, k * 0.07, 0.35, 0.16)); break;
      case 'fanfare': [523, 659, 784, 1047].forEach((f, k) => this.tone(f, k * 0.09, 0.4, 0.15)); break;
    }
  }

  /** Short blip so the player hears the new SFX level while dragging the slider. */
  preview(): void {
    this.start();
    this.play('tap');
  }

  private tone(freq: number, delay: number, len: number, vol: number, type: OscillatorType = 'triangle'): void {
    const ctx = this.ctx!;
    const t = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, t + len);
    osc.connect(g).connect(this.sfxOut);
    osc.start(t);
    osc.stop(t + len + 0.02);
  }

  private music(): void {
    const on = this.ctx && this.musicVol > 0 && !document.hidden;
    if (!on) {
      clearTimeout(this.timer);
      this.timer = 0;
      this.bus?.disconnect();
      this.bus = null;
      return;
    }
    if (this.bus) return;
    this.bus = this.ctx!.createGain();
    this.bus.connect(this.musicOut);
    this.bar = 0;
    this.at = this.ctx!.currentTime + 0.1;
    this.tick();
  }

  // Bars are scheduled one at a time, a bar ahead, so no single tap pays for the whole loop.
  private tick(): void {
    const ctx = this.ctx!;
    while (this.at < ctx.currentTime + BAR) {
      this.playBar(this.at, this.bar);
      this.bar = (this.bar + 1) % TUNE.length;
      this.at += BAR;
    }
    this.timer = window.setTimeout(() => this.tick(), BAR * 500);
  }

  private playBar(t0: number, b: number): void {
    const ctx = this.ctx!;
    const out = this.bus!;
    const note = (m: number, at: number, len: number, vol: number, type: OscillatorType) => {
      const t = t0 + at * BEAT;
      const d = len * BEAT;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = type;
      o.frequency.value = hz(m);
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(vol, t + 0.01);
      g.gain.exponentialRampToValueAtTime(vol * 0.4, t + Math.min(d, 0.15));
      g.gain.exponentialRampToValueAtTime(0.0005, t + d);
      o.connect(g).connect(out);
      o.start(t);
      o.stop(t + d + 0.02);
    };
    let at = 0;
    for (const [m, l] of TUNE[b]) {
      if (m) note(m, at, l * 0.9, 0.07, 'square');
      at += l;
    }
    const r = ROOTS[b % 4];
    for (let k = 0; k < 8; k += 2) note(k % 4 ? r + 7 : r, k, 1.6, 0.16, 'triangle');
    for (let k = 1; k < 8; k += 2) CHORDS[b % 4].forEach((m) => note(m, k, 0.6, 0.025, 'triangle'));
  }
}

export const audio = new Audio();
