import type { Page } from '@playwright/test';

/** Labels that must sit in the vertical middle of their box: buttons, tabs, chips, pills and the goal bar. */
export const CENTRED = '.btn, .tab, .goal-now, .ls-chip, .toggle, .how-row, .stats-how summary, .cs-chip, .chip';
/** Boxes that hold a layout rather than a label: their text starts at the top by design. */
const LAYOUT = '.card-btn, .ls-tile, .staff-open, [data-nb-row]';

export interface OffCentre {
  text: string;
  above: number;
  below: number;
}

/**
 * UI.md rule 18: the text inside a button, pill or bar sits in its vertical middle, the space above and below the
 * text differing by at most `tolerance` px. The text box is a Range over the label's text nodes, measured against
 * the box inside its border.
 */
export async function scanCentring(page: Page, tolerance = 2): Promise<OffCentre[]> {
  return page.evaluate(([sel, layout, tol]) => {
    const out: { text: string; above: number; below: number }[] = [];
    for (const el of document.querySelectorAll<HTMLElement>(sel)) {
      if (el.matches(layout) || el.closest('[hidden]')) continue;
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0 || r.bottom < 0 || r.top > innerHeight) continue;
      const cs = getComputedStyle(el);
      if (cs.visibility === 'hidden' || cs.display === 'none') continue;
      // The label's content: its text and icons. A badge pinned to a corner (absolute) is not part of it.
      const pinned = (x: Element) => {
        for (let q: Element | null = x; q && q !== el; q = q.parentElement) {
          const qs = getComputedStyle(q);
          if (qs.position === 'absolute' || qs.position === 'fixed' || qs.display === 'none' || q.hasAttribute('hidden')) return true;
        }
        return false;
      };
      let top = Infinity;
      let bottom = -Infinity;
      // Icons: images, and drawn icons that are aria-hidden boxes with no text.
      for (const img of el.querySelectorAll('img, svg, canvas, [aria-hidden="true"]')) {
        if (img.matches('[aria-hidden="true"]') && img.textContent?.trim()) continue;
        if (pinned(img)) continue;
        const q = img.getBoundingClientRect();
        if (q.height === 0) continue;
        top = Math.min(top, q.top);
        bottom = Math.max(bottom, q.bottom);
      }
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) {
        const n = walker.currentNode as Text;
        if (!n.textContent?.trim()) continue;
        if (pinned(n.parentElement!)) continue;
        const range = document.createRange();
        range.selectNodeContents(n);
        for (const q of range.getClientRects()) {
          if (q.height === 0) continue;
          top = Math.min(top, q.top);
          bottom = Math.max(bottom, q.bottom);
        }
      }
      if (!Number.isFinite(top)) continue;
      const above = top - (r.top + parseFloat(cs.borderTopWidth));
      const below = r.bottom - parseFloat(cs.borderBottomWidth) - bottom;
      if (Math.abs(above - below) > tol) out.push({ text: (el.textContent ?? '').trim().slice(0, 40), above: Math.round(above), below: Math.round(below) });
    }
    return out;
  }, [CENTRED, LAYOUT, tolerance] as const);
}
