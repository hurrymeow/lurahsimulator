import { DEFAULT_LANG, isLang, type Lang } from './i18n';
import { storage } from './storage';

export type Theme = 'light' | 'dark';
export const THEMES: Theme[] = ['light', 'dark'];

export interface Settings {
  effects: boolean;
  haptics: boolean;
  largeText: boolean;
  reduceMotion: boolean;
  highContrast: boolean;
  /** Colour of the console frame round the map: cream (light) or Mono Dark. */
  theme: Theme;
  /** 0..100, 0 = off. */
  sfxVol: number;
  musicVol: number;
  lang: Lang;
}

const KEY = 'pakrt.settings';

export function loadSettings(): Settings {
  const reduce = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const base: Settings = { effects: !reduce, haptics: true, largeText: false, reduceMotion: reduce, highContrast: false, theme: 'light', sfxVol: 100, musicVol: 50, lang: DEFAULT_LANG };
  try {
    const merged = { ...base, ...(JSON.parse(storage.get(KEY) ?? '{}') as Partial<Settings>) };
    if (!isLang(merged.lang)) merged.lang = DEFAULT_LANG;
    if (merged.theme !== 'light' && merged.theme !== 'dark') merged.theme = 'light';
    return merged;
  } catch {
    return base;
  }
}

export function saveSettings(s: Settings): void {
  storage.set(KEY, JSON.stringify(s));
}
