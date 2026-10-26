import { storage } from './storage';

export interface Settings {
  effects: boolean;
  haptics: boolean;
  largeText: boolean;
  reduceMotion: boolean;
  highContrast: boolean;
  /** 0..100, 0 = off. */
  sfxVol: number;
  musicVol: number;
}

const KEY = 'pakrt.settings';

export function loadSettings(): Settings {
  const reduce = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const base: Settings = { effects: !reduce, haptics: true, largeText: false, reduceMotion: reduce, highContrast: false, sfxVol: 100, musicVol: 50 };
  try {
    return { ...base, ...(JSON.parse(storage.get(KEY) ?? '{}') as Partial<Settings>) };
  } catch {
    return base;
  }
}

export function saveSettings(s: Settings): void {
  storage.set(KEY, JSON.stringify(s));
}
