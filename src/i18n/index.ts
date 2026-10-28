import { EN, type Key } from './en';
import { ID } from './id';
import { ID_HIGHER_DATA } from './higher-id';
import { ID_DATA } from './id-data';

export type Lang = 'id' | 'en';
export const LANGS: { id: Lang; label: string }[] = [
  { id: 'id', label: 'Bahasa Indonesia' },
  { id: 'en', label: 'English' },
];
export const DEFAULT_LANG: Lang = 'en';

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

/** The player, for {pt} (Pak or Bu), {pn} (their name) and {pk} (their kampung) in any string. */
let player = { title: 'Pak', name: 'RT', kampung: 'Kampung Kenanga' };
export function setPlayer(p: { title: string; name: string; kampung: string } | undefined): void {
  player = p ? { ...p } : { title: 'Pak', name: 'RT', kampung: 'Kampung Kenanga' };
}
export const playerTitle = (): string => player.title;

/**
 * UI and message strings. `{name}` placeholders are filled from `vars`; {pt}, {pn} and {pk} from the player.
 * A key with a `.bu` twin uses the twin when the player is Bu, so Inem's lines can change their tone.
 */
export function t(key: Key, vars?: Record<string, string | number>): string {
  const table = (lang === 'id' ? ID : EN) as Record<string, string>;
  const raw = (player.title === 'Bu' && table[`${key}.bu`]) || table[key];
  const all: Record<string, string | number> = { pt: player.title, pn: player.name, pk: player.kampung, ...vars };
  return raw.replace(/\{(\w+)\}/g, (_, k: string) => String(all[k] ?? `{${k}}`));
}

/** Data-file strings: English inline in the data, Indonesian looked up by key. */
export function tr(key: string, english: string): string {
  return lang === 'id' ? (ID_DATA[key] ?? ID_HIGHER_DATA[key] ?? english) : english;
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
export const wTrade = (w: { id: string; trade: string }) => tr(`wacana.${w.id}.trade`, w.trade);
export const wLine = (w: { id: string; line: string }) => tr(`wacana.${w.id}.line`, w.line);
export const lName = (l: { id: string; name: string }) => tr(`line.${l.id}.name`, l.name);
export const lLine = (l: { id: string; line: string }) => tr(`line.${l.id}.line`, l.line);
export const rName = (r: { id: string; name: string }) => tr(`real.${r.id}.name`, r.name);
export const rLine = (r: { id: string; line: string }) => tr(`real.${r.id}.line`, r.line);
export const rEffect = (r: { id: string; effect: string }) => tr(`real.${r.id}.effect`, r.effect);
export const eName = (e: { id: string; name: string }) => tr(`event.${e.id}.name`, e.name);
export const eBody = (e: { id: string; body: string }) => tr(`event.${e.id}.body`, e.body);
export const eLabel = (e: { id: string }, i: number, c: { label: string }) => tr(`event.${e.id}.c${i}.label`, c.label);
export const eResult = (e: { id: string }, i: number, c: { result: string }) => tr(`event.${e.id}.c${i}.result`, c.result);
export const eOutcome = (e: { id: string }, i: number, j: number, o: { result: string }) => tr(`event.${e.id}.c${i}.o${j}.result`, o.result);
export const eModLabel = (e: { id: string }, i: number, label: string) => tr(`event.${e.id}.c${i}.mod`, label);

export type { Key };
