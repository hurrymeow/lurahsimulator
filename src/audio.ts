import type { Settings } from './settings';

/**
 * All sound is synthesised with Web Audio, so there is nothing to download or license.
 * The context is created on the first tap, since browsers block audio before a gesture.
 */
export type Sfx = 'tap' | 'build' | 'event' | 'fanfare' | 'first' | 'bad' | Sfx17;

/**
 * 17 Agustus sounds. Every tune here is original: they sound like 17an through the instruments (a school drumband,
 * kendang, angklung, a slide whistle), never by quoting a song. Indonesia Raya is never used or changed (UU 24/2009).
 */
export type Sfx17 = 'drumband' | 'koplo' | 'angklung' | 'slideUp' | 'slideDown' | 'hop' | 'crunch' | 'cheer';

// The drumband's march, in 2/4 at 120 bpm: [midi note or 0 for a rest, length in 16ths]. Original, pentatonic.
const MARCH: [number, number][] = [
  [72, 2], [72, 1], [74, 1], [76, 2], [79, 2], [76, 2], [74, 2], [72, 4],
  [74, 2], [76, 2], [79, 2], [81, 2], [79, 6], [0, 2],
];
// The angklung's rising call: each note is shaken, so it repeats fast.
const ANGKLUNG = [67, 69, 72, 76, 79];

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
      default: this.play17(name);
    }
  }

  private play17(name: Sfx17): void {
    switch (name) {
      case 'drumband': {
        // A snare roll that swells, a bass drum on the downbeat, then glockenspiel and pianika play the march.
        for (let k = 0; k < 16; k++) this.noise(k * 0.045, 0.05, 0.03 + k * 0.006, 'highpass', 2200);
        this.drum(0.72, 70, 0.3);
        const s16 = 0.125;
        let at = 0.75;
        let step = 0;
        for (const [m, l] of MARCH) {
          if (m) {
            this.bell(hz(m + 12), at, 0.5, 0.09);
            this.reed(hz(m), at, l * s16 * 0.9, 0.05);
          }
          // The snare keeps the march on every beat, the bass drum on the one.
          if (step % 4 === 0) this.noise(at, 0.06, 0.06, 'highpass', 2200);
          if (step % 8 === 0) this.drum(at, 70, 0.2);
          at += l * s16;
          step += l;
        }
        this.noise(at, 0.5, 0.08, 'highpass', 5000);
        this.drum(at, 60, 0.3);
        break;
      }
      case 'koplo': {
        // Kendang: low "dung" and sharp "tak" in a fast fill, a bamboo flute lick, then one punchy hit.
        const fill: [number, 'dung' | 'tak'][] = [[0, 'dung'], [0.11, 'tak'], [0.17, 'tak'], [0.28, 'dung'], [0.39, 'tak'], [0.45, 'dung'], [0.5, 'tak']];
        for (const [at, kind] of fill) {
          if (kind === 'dung') this.drum(at, 150, 0.22, 0.18);
          else this.noise(at, 0.04, 0.12, 'bandpass', 1800);
        }
        [76, 79, 81, 79, 76, 84].forEach((m, k) => this.flute(hz(m), 0.62 + k * 0.1, k === 5 ? 0.35 : 0.09, 0.06));
        this.drum(1.3, 110, 0.32, 0.25);
        this.noise(1.3, 0.08, 0.15, 'bandpass', 1400);
        break;
      }
      case 'angklung':
        // Each note is a bamboo tube shaken: four quick strikes of a hollow tone with an octave over it.
        ANGKLUNG.forEach((m, n) => {
          for (let r = 0; r < 4; r++) {
            const at = n * 0.16 + r * 0.035;
            this.tone(hz(m), at, 0.14, 0.05 * (1 - r * 0.15), 'triangle');
            this.tone(hz(m + 12), at, 0.08, 0.02, 'sine');
          }
        });
        break;
      case 'slideUp':
        this.slide(500, 1700, 0, 0.55, 0.09);
        this.noise(0.55, 0.5, 0.06, 'highpass', 6000);
        break;
      case 'slideDown':
        this.slide(1500, 380, 0, 0.6, 0.09);
        this.drum(0.62, 90, 0.25, 0.22);
        this.noise(0.62, 0.12, 0.05, 'lowpass', 600);
        break;
      case 'hop':
        this.drum(0, 95, 0.12, 0.2);
        this.noise(0, 0.05, 0.05, 'lowpass', 900);
        break;
      case 'crunch':
        // Cracker bites: a few dry crackles close together.
        for (let k = 0; k < 6; k++) this.noise(k * 0.035 + (k % 2) * 0.012, 0.03, 0.09, 'bandpass', 3000 + k * 400);
        break;
      case 'cheer':
        // A crowd from across the lapangan: breathy noise that swells and falls, with claps scattered through it.
        this.noise(0, 1.6, 0.07, 'bandpass', 1100, true);
        for (let k = 0; k < 14; k++) this.noise(0.1 + ((k * 37) % 13) * 0.1, 0.02, 0.05, 'highpass', 2500);
        break;
    }
  }

  private noiseBuf: AudioBuffer | null = null;

  /** A burst of filtered noise: snares, crackles, claps and crowds. A swell rises and falls instead of striking. */
  private noise(delay: number, len: number, vol: number, type: BiquadFilterType, freq: number, swell = false): void {
    const ctx = this.ctx!;
    if (!this.noiseBuf) {
      this.noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
      const d = this.noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    const t = ctx.currentTime + delay;
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuf;
    src.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = type;
    filter.frequency.value = freq;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    if (swell) {
      g.gain.linearRampToValueAtTime(vol, t + len * 0.35);
      g.gain.linearRampToValueAtTime(0.0001, t + len);
    } else {
      g.gain.linearRampToValueAtTime(vol, t + 0.004);
      g.gain.exponentialRampToValueAtTime(0.0001, t + len);
    }
    src.connect(filter).connect(g).connect(this.sfxOut);
    src.start(t, Math.random() * 0.5);
    src.stop(t + len + 0.02);
  }

  /** A drum: a sine that drops in pitch fast. Bass drum low, kendang dung higher. */
  private drum(delay: number, freq: number, vol: number, len = 0.3): void {
    const ctx = this.ctx!;
    const t = ctx.currentTime + delay;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(freq * 2, t);
    o.frequency.exponentialRampToValueAtTime(freq, t + 0.06);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + len);
    o.connect(g).connect(this.sfxOut);
    o.start(t);
    o.stop(t + len + 0.02);
  }

  /** A struck metal bar: the note and its out-of-tune overtone, both dying fast, like a glockenspiel. */
  private bell(freq: number, delay: number, len: number, vol: number): void {
    this.tone(freq, delay, len, vol, 'sine');
    this.tone(freq * 2.76, delay, len * 0.4, vol * 0.35, 'sine');
  }

  /** A reed, like a pianika: a square wave softened by a low-pass filter. */
  private reed(freq: number, delay: number, len: number, vol: number): void {
    const ctx = this.ctx!;
    const t = ctx.currentTime + delay;
    const o = ctx.createOscillator();
    const f = ctx.createBiquadFilter();
    const g = ctx.createGain();
    o.type = 'square';
    o.frequency.value = freq;
    f.type = 'lowpass';
    f.frequency.value = freq * 3;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.02);
    g.gain.setValueAtTime(vol, t + len * 0.8);
    g.gain.linearRampToValueAtTime(0.0001, t + len);
    o.connect(f).connect(g).connect(this.sfxOut);
    o.start(t);
    o.stop(t + len + 0.02);
  }

  /** A bamboo flute: a sine with a little vibrato. */
  private flute(freq: number, delay: number, len: number, vol: number): void {
    const ctx = this.ctx!;
    const t = ctx.currentTime + delay;
    const o = ctx.createOscillator();
    const lfo = ctx.createOscillator();
    const depth = ctx.createGain();
    const g = ctx.createGain();
    o.type = 'sine';
    o.frequency.value = freq;
    lfo.frequency.value = 6;
    depth.gain.value = freq * 0.012;
    lfo.connect(depth).connect(o.frequency);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.03);
    g.gain.exponentialRampToValueAtTime(0.001, t + len + 0.05);
    o.connect(g).connect(this.sfxOut);
    o.start(t);
    lfo.start(t);
    o.stop(t + len + 0.07);
    lfo.stop(t + len + 0.07);
  }

  /** A slide whistle: one pure tone gliding from one pitch to another. */
  private slide(from: number, to: number, delay: number, len: number, vol: number): void {
    const ctx = this.ctx!;
    const t = ctx.currentTime + delay;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(from, t);
    o.frequency.exponentialRampToValueAtTime(to, t + len);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.03);
    g.gain.setValueAtTime(vol, t + len * 0.85);
    g.gain.linearRampToValueAtTime(0.0001, t + len);
    o.connect(g).connect(this.sfxOut);
    o.start(t);
    o.stop(t + len + 0.02);
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
