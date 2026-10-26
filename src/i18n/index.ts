import { EN, type Key } from './en';
import { ID } from './id';
import { ID_DATA } from './id-data';

export type Lang = 'id' | 'en';
export const LANGS: { id: Lang; label: string }[] = [
  { id: 'id', label: 'Bahasa Indonesia' },
  { id: 'en', label: 'English' },
];
export const DEFAULT_LANG: Lang = 'id';

let lang: Lang = DEFAULT_LANG;

export const isLang = (v: unknown): v is Lang => v === 'id' || v === 'en';
export const getLang = (): Lang => lang;

/** `?lang=en` overrides the saved choice for one visit, so tests and links can pick a language. */
export function initialLang(saved: Lang): Lang {
  const q = typeof location === 'undefined' ? null : new URLSearchParams(location.search).get('lang');
  return isLang(q) ? q : saved;
}

export function setLang(l: Lang): void {
  lang = l;
  if (typeof document !== 'undefined') document.documentElement.lang = l;
}

/** UI and message strings. `{name}` placeholders are filled from `vars`. */
export function t(key: Key, vars?: Record<string, string | number>): string {
  const raw = (lang === 'id' ? ID : EN)[key];
  return vars ? raw.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? `{${k}}`)) : raw;
}

/** Data-file strings: English inline in the data, Indonesian looked up by key. */
export function tr(key: string, english: string): string {
  return lang === 'id' ? (ID_DATA[key] ?? english) : english;
}

// Data accessors. Pass the def so callers never build keys by hand.
export const bName = (d: { id: string; name: string }) => tr(`building.${d.id}.name`, d.name);
export const bBlurb = (d: { id: string; blurb: string }) => tr(`building.${d.id}.blurb`, d.blurb);
export const bBlock = (d: { id: string; removeBlockedReason?: string }) =>
  d.removeBlockedReason ? tr(`building.${d.id}.block`, d.removeBlockedReason) : undefined;
export const cName = (c: { id: string; name: string }) => tr(`combo.${c.id}.name`, c.name);
export const cHint = (c: { id: string; hint: string }) => tr(`combo.${c.id}.hint`, c.hint);
export const cStory = (c: { id: string; story: string }) => tr(`combo.${c.id}.story`, c.story);
export const cEffect = (c: { id: string; effect: string }) => tr(`combo.${c.id}.effect`, c.effect);
export const jName = (j: { id: string; name: string }) => tr(`job.${j.id}.name`, j.name);
export const jBlurb = (j: { id: string; blurb: string }) => tr(`job.${j.id}.blurb`, j.blurb);
export const wName = (w: { id: string; name: string }) => tr(`wacana.${w.id}.name`, w.name);
export const wLine = (w: { id: string; line: string }) => tr(`wacana.${w.id}.line`, w.line);
export const eName = (e: { id: string; name: string }) => tr(`event.${e.id}.name`, e.name);
export const eBody = (e: { id: string; body: string }) => tr(`event.${e.id}.body`, e.body);
export const eLabel = (e: { id: string }, i: number, c: { label: string }) => tr(`event.${e.id}.c${i}.label`, c.label);
export const eResult = (e: { id: string }, i: number, c: { result: string }) => tr(`event.${e.id}.c${i}.result`, c.result);
export const eModLabel = (e: { id: string }, i: number, label: string) => tr(`event.${e.id}.c${i}.mod`, label);

export type { Key };
