import type { Page } from '@playwright/test';

/** One screen's counts. See UI.md rules 13 and 14. Words are runs with a letter; numbers and icons do not count. */
export interface ScreenCount {
  screen: string;
  /** Words in the part of the screen inside the first viewport. */
  wordsInView: number;
  /** Words in the biggest single paragraph, row or button. */
  longestBlock: number;
  /** Words in the whole screen, scrolled. */
  wordsAll: number;
  /** Visible filled `.btn-primary` buttons in the first viewport. */
  primary: number;
}

/** Counts what a player sees inside the element matching `sel`. Null when it is not on screen. */
export async function countScreen(page: Page, screen: string, sel: string): Promise<ScreenCount | null> {
  return page.evaluate(
    ([name, selector]) => {
      const root = document.querySelector(selector) as HTMLElement | null;
      if (!root) return null;
      const vh = innerHeight;
      const isWord = (w: string) => /\p{L}/u.test(w);
      let all = 0;
      let view = 0;
      const perBlock = new Map<Element, number>();
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) {
        const n = walker.currentNode as Text;
        const el = n.parentElement;
        if (!el) continue;
        const cs = getComputedStyle(el);
        if (cs.display === 'none' || cs.visibility === 'hidden' || el.closest('[hidden]')) continue;
        const words = (n.textContent ?? '').split(/\s+/).filter(isWord).length;
        if (!words) continue;
        all += words;
        const r = el.getBoundingClientRect();
        if (r.bottom > 0 && r.top < vh && r.width > 0) view += words;
        const block = el.closest('p,li,h1,h2,h3,button,.action,div') ?? el;
        perBlock.set(block, (perBlock.get(block) ?? 0) + words);
      }
      const primary = [...root.querySelectorAll('.btn-primary')].filter((b) => {
        const r = (b as HTMLElement).getBoundingClientRect();
        return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < vh && !(b as HTMLElement).closest('[hidden]');
      }).length;
      return { screen: name, wordsInView: view, longestBlock: Math.max(0, ...perBlock.values()), wordsAll: all, primary };
    },
    [screen, sel] as const,
  );
}

/** The limits of UI.md rules 13 and 14. */
/** Screens still over a limit, capped at today's count so they can only get better (UI.md rule 13). Delete an entry when it is fixed. */
export const DENSITY_ALLOW: Record<string, Partial<Record<keyof typeof LIMITS, number>>> = {
  'event': { primary: 2 }, // Event card: two filled choices
  'settings': { primary: 2, wordsInView: 35 }, // Settings
  'warga': { wordsInView: 62, wordsAll: 494 }, // Warga: Kampung Sebelah's residents join at the Kelurahan, so the list is long
};

export const LIMITS = { wordsInView: 50, longestBlock: 20, wordsAll: 300, primary: 1 } as const;

/** Labels UI.md rule 16 caps at 6 words: buttons, tabs, chips and pills. Rows that open a whole entry are lists, not labels. */
const LABELS = '.btn, .tab, .ls-chip, .chip, .toggle, .goal-now, .stats-how summary';
const ROWS = '.card-btn, .ls-tile, .staff-open, [data-nb-row], .how-row, button.goal-row';

/** Every visible label over 6 words (UI.md rule 16). Words as in rule 13: runs with a letter; numbers and icons are free. */
export async function scanLabelWords(page: Page, max = 6): Promise<{ text: string; words: number }[]> {
  return page.evaluate(([sel, rows, cap]) => {
    const out: { text: string; words: number }[] = [];
    for (const el of document.querySelectorAll<HTMLElement>(sel)) {
      if (el.matches(rows) || el.closest('[hidden]')) continue;
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      const text = (el.innerText ?? '').replace(/\s+/g, ' ').trim();
      const words = text.split(' ').filter((w) => /\p{L}/u.test(w)).length;
      if (words > cap) out.push({ text: text.slice(0, 60), words });
    }
    return out;
  }, [LABELS, ROWS, max] as const);
}
