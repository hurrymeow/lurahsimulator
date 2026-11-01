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
export const LIMITS = { wordsInView: 50, longestBlock: 20, wordsAll: 300, primary: 1 } as const;
