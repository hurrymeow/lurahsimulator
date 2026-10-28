// Stat words become HUD icons in running text, so the player reads the icon
// they already know from the money row, not a word they have to learn.
// Sim ids and saves stay unchanged. Only player-facing rendering changes.
//
// How it stays loop-free: an icon span carries the word only in aria-label
// and title, never in a text node, so the observer that decorates text
// nodes never sees the word again. Text the observer creates is stat-free,
// except a {plain:...} escape, which becomes a data-plain span it skips.
import { getLang, t } from '../i18n';
import { iconURL } from '../render/sprites';

export type StatId = 'rupiah' | 'sabar' | 'orangDalam' | 'viral';

/** The display name for a stat, in the current language, from the res.* strings. */
export const statLabel = (stat: StatId): string => t(`res.${stat}` as 'res.rupiah');

/**
 * Stat words, longest first, so "Orang Dalam" wins over a part of it and
 * "Virality" wins over "Viral" in English. Case-sensitive: lowercase
 * "viral" in flavour text (a video goes viral) is slang and stays a word.
 * "Rp 40rb" is a different token and is never in this list.
 */
const WORDS: Record<'id' | 'en', [string, StatId][]> = {
  id: [
    ['Orang Dalam', 'orangDalam'],
    ['Popularitas', 'sabar'],
    ['Viral', 'viral'],
    ['Rupiah', 'rupiah'],
    ['rupiah', 'rupiah'],
  ],
  en: [
    ['Orang Inside', 'orangDalam'],
    ['Popularitas', 'sabar'],
    ['Virality', 'viral'],
    ['Rupiah', 'rupiah'],
    ['rupiah', 'rupiah'],
  ],
};

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const wordRe = (lang: 'id' | 'en') => new RegExp(`\\b(${WORDS[lang].map(([w]) => esc(w)).join('|')})\\b`, 'g');
const wordFor = (lang: 'id' | 'en', word: string): StatId => WORDS[lang].find(([w]) => w === word)![1];

export type StatSegment =
  | { kind: 'text'; text: string }
  | { kind: 'stat'; stat: StatId }
  | { kind: 'plain'; text: string };

/**
 * Pure split of a string into text, stat and plain segments. No DOM, so
 * unit tests can run without a browser. A {plain:...} escape keeps its
 * word as text, for the rare slang use that must stay a word.
 */
export function splitStatText(str: string, lang: 'id' | 'en' = getLang()): StatSegment[] {
  const out: StatSegment[] = [];
  const pushText = (text: string) => {
    if (!text) return;
    const re = wordRe(lang);
    let last = 0;
    for (const m of text.matchAll(re)) {
      if (m.index > last) out.push({ kind: 'text', text: text.slice(last, m.index) });
      out.push({ kind: 'stat', stat: wordFor(lang, m[1]) });
      last = m.index + m[1].length;
    }
    if (last < text.length) out.push({ kind: 'text', text: text.slice(last) });
  };
  let last = 0;
  for (const m of str.matchAll(/\{plain:([^}]+)\}/g)) {
    pushText(str.slice(last, m.index));
    out.push({ kind: 'plain', text: m[1] });
    last = m.index + m[0].length;
  }
  pushText(str.slice(last));
  return out;
}

/** True when a string contains a stat word or a plain escape. The fast path for the observer. */
export const hasStatWord = (str: string, lang: 'id' | 'en' = getLang()): boolean =>
  // No /g here: RegExp.test with a global flag is stateful and would skip every other call.
  /\{plain:[^}]+\}/.test(str) || wordRe(lang).test(str);

/** A number token at the end of a text chunk, or at the start, with its sign and separator. */
const TRAILING_NUM = /([+-]?(?:x)?\d[\d.,]*)\s*$/;
const LEADING_NUM = /^\s*([+-]?(?:x)?\d[\d.,]*)/;

export type GroupedSegment =
  | { kind: 'text'; text: string }
  | { kind: 'plain'; text: string }
  | { kind: 'pair'; before: string; stat: StatId; after: string };

/**
 * Pure grouping: a number next to a stat icon joins it in one nowrap pair,
 * so icon and number never split across lines. "x1,5" is a number token
 * too, for income multipliers written in running text.
 */
export function groupStatSegments(segs: StatSegment[]): GroupedSegment[] {
  const out: GroupedSegment[] = [];
  for (let i = 0; i < segs.length; i++) {
    const seg = segs[i];
    if (seg.kind !== 'stat') {
      out.push(seg);
      continue;
    }
    let before = '';
    let after = '';
    const prev = out[out.length - 1];
    if (prev?.kind === 'text') {
      const m = prev.text.match(TRAILING_NUM);
      if (m) {
        before = m[1];
        prev.text = prev.text.slice(0, prev.text.length - m[0].length);
        if (!prev.text) out.pop();
      }
    }
    const next = segs[i + 1];
    if (next?.kind === 'text') {
      const m = next.text.match(LEADING_NUM);
      if (m && !before) {
        after = m[1];
        next.text = next.text.slice(m[0].length);
      }
    }
    out.push({ kind: 'pair', before, stat: seg.stat, after });
  }
  return out.filter((s) => s.kind !== 'text' || s.text);
}

/** One 16px inline icon span for a stat, with its name in aria-label and title only. */
export function statIcon(stat: StatId): HTMLElement {
  const label = statLabel(stat);
  const span = document.createElement('span');
  span.className = 'stat-icon';
  span.setAttribute('role', 'img');
  span.setAttribute('aria-label', label);
  span.setAttribute('title', label);
  span.dataset.stat = stat;
  const img = document.createElement('img');
  img.src = iconURL(stat, 2);
  img.alt = '';
  img.width = 16;
  img.height = 16;
  img.className = 'pixel';
  span.append(img);
  span.addEventListener('click', (e) => {
    e.stopPropagation();
    showStatToast(stat, label);
  });
  return span;
}

/** One-line toast "[icon] = Popularitas", on the existing .toast style. data-plain keeps the observer out. */
function showStatToast(stat: StatId, label: string): void {
  document.querySelectorAll('.stat-toast').forEach((el) => el.remove());
  const toast = document.createElement('div');
  toast.className = 'toast stat-toast';
  toast.dataset.plain = '';
  toast.append(statIcon(stat), document.createTextNode(` = ${label}`));
  document.body.append(toast);
  window.setTimeout(() => toast.remove(), 2500);
  toast.addEventListener('click', () => toast.remove());
}

/** Rich text nodes for a string: text, plain spans, and nowrap icon pairs. */
export function richText(str: string): Node[] {
  const nodes: Node[] = [];
  for (const seg of groupStatSegments(splitStatText(str))) {
    if (seg.kind === 'text') nodes.push(document.createTextNode(seg.text));
    else if (seg.kind === 'plain') {
      const span = document.createElement('span');
      span.dataset.plain = '';
      span.textContent = seg.text;
      nodes.push(span);
    } else {
      const pair = document.createElement('span');
      pair.className = 'stat-pair';
      if (seg.before) pair.append(document.createTextNode(`${seg.before} `));
      pair.append(statIcon(seg.stat));
      if (seg.after) pair.append(document.createTextNode(` ${seg.after}`));
      nodes.push(pair);
    }
  }
  return nodes;
}

const SKIP_TAGS = new Set(['INPUT', 'TEXTAREA', 'SCRIPT', 'STYLE', 'SELECT', 'OPTION']);

/** Decorates one node and its subtree, or one text node. Skips plain subtrees and icon spans. */
export function decorate(root: Node): void {
  if (root.nodeType === Node.TEXT_NODE) {
    const text = root.textContent ?? '';
    if (!hasStatWord(text)) return;
    const parent = root.parentElement;
    if (!parent || parent.closest('[data-plain], .stat-icon, .stat-pair')) return;
    (root as ChildNode).replaceWith(...richText(text));
    return;
  }
  if (root.nodeType !== Node.ELEMENT_NODE) return;
  const el = root as Element;
  if (SKIP_TAGS.has(el.tagName) || el.hasAttribute('data-plain') || el.classList.contains('stat-icon') || el.classList.contains('stat-pair')) return;
  for (const child of [...el.childNodes]) decorate(child);
}

let observing = false;

/** Decorates the whole body now, then every added text node and text change. */
export function observeStatIcons(): void {
  if (typeof document === 'undefined' || observing) return;
  observing = true;
  decorate(document.body);
  const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (m.type === 'characterData') decorate(m.target);
      else for (const node of m.addedNodes) decorate(node);
    }
  });
  observer.observe(document.body, { childList: true, subtree: true, characterData: true });
}
