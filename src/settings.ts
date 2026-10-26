import { DEFAULT_LANG, isLang, type Lang } from './i18n';
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
  lang: Lang;
}

const KEY = 'pakrt.settings';

export function loadSettings(): Settings {
  const reduce = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const base: Settings = { effects: !reduce, haptics: true, largeText: false, reduceMotion: reduce, highContrast: false, sfxVol: 100, musicVol: 50, lang: DEFAULT_LANG };
  try {
    const merged = { ...base, ...(JSON.parse(storage.get(KEY) ?? '{}') as Partial<Settings>) };
    if (!isLang(merged.lang)) merged.lang = DEFAULT_LANG;
    return merged;
  } catch {
    return base;
  }
}

export function saveSettings(s: Settings): void {
  storage.set(KEY, JSON.stringify(s));
}
