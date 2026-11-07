import { BPM, SCORE, TICKS_PER_BEAT } from './music-score';

/**
 * Plays "Mars Pak Pejabat", the background loop, from oscillators and filtered noise.
 * The score is an original medley in the style of Indonesian official and campaign jingles
 * (march, TVRI news theme, dangdut koplo, TV-ad pop, keroncong); no song is quoted.
 * Channels follow General MIDI so the same score exports to `docs/music/mars-pak-pejabat.mid`.
 */
export const BEAT = 60 / BPM;
export const BAR = 4 * BEAT;
export const BARS = SCORE.length;

const TICK = BEAT / TICKS_PER_BEAT;
/** Lifts the whole mix to the level of the old 8-bar tune, so players' volume settings still fit. */
const LEVEL = 1.7;
const hz = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

type Ctx = BaseAudioContext;

/** Loudness per channel, tuned so no section jumps out over the others. */
const VOL: Record<number, number> = {
  0: 0.075, // trumpet, lead
  1: 0.022, // trombone chords
  2: 0.11, // tuba
  3: 0.05, // glockenspiel
  4: 0.016, // strings pad
  5: 0.08, // suling / flute
  6: 0.05, // synth brass
  7: 0.035, // electric piano
  8: 0.13, // bass
  10: 0.03, // cak-cuk guitar
  11: 0.07, // pizzicato cello
  12: 0.08, // french horn
  13: 0.16, // timpani
  14: 0.03, // pianika
};

export class MusicPlayer {
  constructor(
    private ctx: Ctx,
    public out: AudioNode,
    private noiseBuf: () => AudioBuffer,
  ) {}

  /** Schedules every note of bar `b` starting at context time `t0`. */
  playBar(t0: number, b: number): void {
    const bar = SCORE[b % BARS];
    for (let i = 0; i < bar.length; i += 5) {
      const ch = bar[i];
      const t = t0 + bar[i + 1] * TICK;
      const len = bar[i + 2] * TICK;
      const m = bar[i + 3];
      const vel = LEVEL * (bar[i + 4] / 127) ** 1.5;
      if (ch === 9) this.drum(m, t, vel);
      else this.voice(ch, m, t, len, vel * (VOL[ch] ?? 0.03));
    }
  }

  private gain(t: number, a: number, peak: number, hold: number, sustain: number, rel: number): GainNode {
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(peak, t + a);
    g.gain.setTargetAtTime(peak * sustain, t + a, 0.12);
    g.gain.setTargetAtTime(0.0001, t + Math.max(hold, a), rel / 3);
    g.connect(this.out);
    return g;
  }

  private osc(type: OscillatorType, f: number, t: number, stop: number, dest: AudioNode, detune = 0): OscillatorNode {
    const o = this.ctx.createOscillator();
    o.type = type;
    o.frequency.value = f;
    o.detune.value = detune;
    o.connect(dest);
    o.start(t);
    o.stop(stop);
    return o;
  }

  private lowpass(f: number, dest: AudioNode, q = 0.7): BiquadFilterNode {
    const lp = this.ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = Math.min(f, 12000);
    lp.Q.value = q;
    lp.connect(dest);
    return lp;
  }

  private vibrato(o: OscillatorNode, f: number, t: number, stop: number, depth: number, rate = 5.5): void {
    const lfo = this.ctx.createOscillator();
    const d = this.ctx.createGain();
    lfo.frequency.value = rate;
    d.gain.setValueAtTime(0, t);
    d.gain.linearRampToValueAtTime(f * depth, t + 0.3);
    lfo.connect(d).connect(o.frequency);
    lfo.start(t);
    lfo.stop(stop);
  }

  private voice(ch: number, m: number, t: number, len: number, vol: number): void {
    const f = hz(m);
    switch (ch) {
      case 0: case 1: case 2: case 12: case 6: {
        // Brass: a sawtooth whose low-pass opens on the attack, like a lip buzz.
        const end = t + len + 0.12;
        const g = this.gain(t, ch === 12 ? 0.05 : 0.02, vol, t + len, 0.75, 0.08);
        const open = Math.min(f * (ch === 12 ? 2.5 : ch === 2 ? 3 : 5), 12000);
        const lp = this.lowpass(open, g, 1);
        lp.frequency.setValueAtTime(f * 1.5, t);
        lp.frequency.linearRampToValueAtTime(open, t + 0.04);
        const o = this.osc('sawtooth', f, t, end, lp);
        if (ch === 0 || ch === 12) this.vibrato(o, f, t, end, 0.004);
        if (ch === 6) this.osc('sawtooth', f, t, end, lp, 9);
        return;
      }
      case 3: // Glockenspiel: the note and its out-of-tune overtone, dying fast.
        this.osc('sine', f, t, t + 1, this.gain(t, 0.003, vol, t + 0.01, 0.6, 0.9));
        this.osc('sine', f * 2.76, t, t + 0.3, this.gain(t, 0.003, vol * 0.3, t + 0.01, 0.3, 0.15));
        return;
      case 4: { // Strings: two detuned saws, slow bow.
        const end = t + len + 0.4;
        const lp = this.lowpass(f * 4, this.gain(t, 0.25, vol, t + len, 1, 0.3));
        this.osc('sawtooth', f, t, end, lp, -6);
        this.osc('sawtooth', f, t, end, lp, 6);
        return;
      }
      case 5: { // Suling: a sine with vibrato and a breathy edge.
        const end = t + len + 0.1;
        const g = this.gain(t, 0.04, vol, t + len, 0.85, 0.06);
        this.vibrato(this.osc('sine', f, t, end, g), f, t, end, 0.012, 6);
        this.osc('triangle', f * 2, t, end, this.gain(t, 0.04, vol * 0.12, t + len, 0.8, 0.06));
        return;
      }
      case 14: { // Pianika: a square softened by a low-pass.
        const end = t + len + 0.06;
        this.osc('square', f, t, end, this.lowpass(f * 3, this.gain(t, 0.02, vol, t + len, 0.85, 0.04)));
        return;
      }
      case 7: // Electric piano: a sine bell with a soft decay.
        this.osc('sine', f, t, t + len + 0.6, this.gain(t, 0.005, vol, t + len, 0.35, 0.3));
        this.osc('sine', f * 2, t, t + 0.3, this.gain(t, 0.005, vol * 0.3, t + 0.05, 0.2, 0.1));
        return;
      case 8: { // Bass: a triangle with a little bite on top.
        const end = t + len + 0.1;
        const g = this.gain(t, 0.005, vol, t + len, 0.6, 0.05);
        this.osc('triangle', f, t, end, g);
        this.osc('sawtooth', f, t, end, this.lowpass(f * 3, this.gain(t, 0.005, vol * 0.25, t + len, 0.4, 0.05)));
        return;
      }
      case 10: case 11: { // Plucked strings: a bright saw that closes fast.
        const dec = ch === 10 ? 0.18 : 0.35;
        const g = this.gain(t, 0.003, vol, t + 0.01, 0.4, dec);
        const lp = this.lowpass(f * 6, g);
        lp.frequency.setTargetAtTime(f * 1.5, t, 0.05);
        this.osc(ch === 10 ? 'sawtooth' : 'triangle', f, t, t + dec + 0.3, lp);
        return;
      }
      case 13: { // Timpani: a sine that settles onto its pitch.
        const o = this.osc('sine', f * 1.3, t, t + 1.2, this.gain(t, 0.005, vol, t + 0.02, 0.5, 0.8));
        o.frequency.setValueAtTime(f * 1.3, t);
        o.frequency.exponentialRampToValueAtTime(f, t + 0.08);
        return;
      }
    }
  }

  private noise(t: number, len: number, vol: number, type: BiquadFilterType, freq: number): void {
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuf();
    src.loop = true;
    const f = this.ctx.createBiquadFilter();
    f.type = type;
    f.frequency.value = freq;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.003);
    g.gain.exponentialRampToValueAtTime(0.0001, t + len);
    src.connect(f).connect(g).connect(this.out);
    src.start(t, (t * 7.3) % 0.9);
    src.stop(t + len + 0.02);
  }

  private thump(t: number, from: number, to: number, len: number, vol: number): void {
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.frequency.setValueAtTime(from, t);
    o.frequency.exponentialRampToValueAtTime(to, t + 0.05);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + len);
    o.connect(g).connect(this.out);
    o.start(t);
    o.stop(t + len + 0.02);
  }

  /** General MIDI drum notes, plus the kendang on the conga and bongo keys. */
  private drum(n: number, t: number, v: number): void {
    switch (n) {
      case 36: this.thump(t, 140, 50, 0.35, 0.4 * v); break; // bass drum
      case 38: this.noise(t, 0.16, 0.12 * v, 'highpass', 1800); this.thump(t, 300, 190, 0.1, 0.08 * v); break; // snare
      case 39: this.noise(t, 0.12, 0.1 * v, 'bandpass', 1500); break; // clap
      case 42: case 54: this.noise(t, n === 42 ? 0.05 : 0.08, 0.05 * v, 'highpass', 7000); break; // hat, tambourine
      case 46: this.noise(t, 0.3, 0.05 * v, 'highpass', 7000); break; // open hat
      case 49: this.noise(t, 1.6, 0.06 * v, 'highpass', 5000); break; // crash
      case 51: this.noise(t, 0.4, 0.025 * v, 'highpass', 8000); break; // ride
      case 64: this.thump(t, 190, 95, 0.3, 0.3 * v); break; // kendang "dhut"
      case 63: this.thump(t, 460, 330, 0.1, 0.16 * v); this.noise(t, 0.04, 0.06 * v, 'bandpass', 2200); break; // kendang "tak"
      case 62: this.thump(t, 360, 280, 0.08, 0.14 * v); break;
      case 60: this.thump(t, 560, 440, 0.1, 0.12 * v); break; // ketipung
      case 61: this.thump(t, 420, 300, 0.12, 0.14 * v); break;
    }
  }
}
