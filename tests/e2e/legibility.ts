import type { Page } from '@playwright/test';

export interface Problem {
  rule: string;
  text: string;
  detail: string;
}

/**
 * Scans every visible DOM text element and reports anything that is clipped,
 * too small, low contrast, off screen, or a touch target under 48px.
 * Canvas text is not covered here.
 */
export async function scanLegibility(page: Page): Promise<Problem[]> {
  return page.evaluate(() => {
    const problems: { rule: string; text: string; detail: string }[] = [];
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    type RGBA = [number, number, number, number];
    const parse = (c: string): RGBA => {
      const m = c.match(/rgba?\(([^)]+)\)/);
      if (!m) return [0, 0, 0, 0];
      const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number);
      return [p[0], p[1], p[2], p[3] ?? 1];
    };
    const over = (top: RGBA, bottom: RGBA): RGBA => {
      const a = top[3] + bottom[3] * (1 - top[3]);
      if (a === 0) return [0, 0, 0, 0];
      const f = (i: number) => (top[i] * top[3] + bottom[i] * bottom[3] * (1 - top[3])) / a;
      return [f(0), f(1), f(2), a];
    };
    const lum = ([r, g, b]: RGBA) => {
      const f = (v: number) => {
        const s = v / 255;
        return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
      };
      return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
    };
    const backdrop = (el: Element): RGBA => {
      const chain: RGBA[] = [];
      for (let e: Element | null = el; e; e = e.parentElement) chain.push(parse(getComputedStyle(e).backgroundColor));
      let out: RGBA = [11, 11, 12, 1];
      for (const c of chain.reverse()) out = over(c, out);
      return out;
    };
    const visible = (el: Element): boolean => {
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) === 0) return false;
      const r = el.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) return false;
      for (let e: Element | null = el; e; e = e.parentElement) if ((e as HTMLElement).hidden) return false;
      return true;
    };
    const label = (el: Element) => (el.textContent ?? '').trim().replace(/\s+/g, ' ').slice(0, 60);

    for (const el of Array.from(document.body.querySelectorAll('*'))) {
      if (!visible(el)) continue;
      const own = Array.from(el.childNodes).filter((n) => n.nodeType === 3 && (n.textContent ?? '').trim());
      const isButton = el.matches('button, [role="button"]');
      const r = el.getBoundingClientRect();

      // UI.md rule 1: 48px everywhere, except the two slim top rows and the goal pill, which allow 28px.
      const min = el.closest('#cs-row1, #cs-row2, .cs-goal-float') ? 27.5 : 47.5;
      if (isButton && (r.height < min || r.width < min)) {
        problems.push({ rule: 'touch-target', text: label(el), detail: `${Math.round(r.width)}x${Math.round(r.height)}px` });
      }
      if (!own.length) continue;
      const cs = getComputedStyle(el);

      const size = parseFloat(cs.fontSize);
      if (size < 15.99) problems.push({ rule: 'font-size', text: label(el), detail: `${size}px` });

      // UI.md rule 5 exception: a clamped line inside a button that opens the whole text.
      const clamped = !!el.closest('[data-clamp]') && !!el.closest('button, [role="button"]');
      if (cs.textOverflow === 'ellipsis' && !clamped) problems.push({ rule: 'ellipsis', text: label(el), detail: 'text-overflow: ellipsis' });

      const clipsX = cs.overflowX !== 'visible';
      const clipsY = cs.overflowY !== 'visible';
      if (!clamped && ((clipsX && el.scrollWidth > el.clientWidth + 1) || (clipsY && el.scrollHeight > el.clientHeight + 1))) {
        problems.push({ rule: 'clipped', text: label(el), detail: `scroll ${el.scrollWidth}x${el.scrollHeight} > client ${el.clientWidth}x${el.clientHeight}` });
      }
      // Text spilling out of its own box (no overflow clipping, but wider than the box).
      if (!clipsX && el.scrollWidth > el.clientWidth + 1 && cs.display !== 'inline') {
        problems.push({ rule: 'spill', text: label(el), detail: `scrollWidth ${el.scrollWidth} > ${el.clientWidth}` });
      }
      if (r.left < -0.5 || r.right > vw + 0.5) problems.push({ rule: 'off-screen', text: label(el), detail: `x ${Math.round(r.left)}..${Math.round(r.right)} of ${vw}` });

      // Contrast, text over its resolved backdrop.
      const bg = backdrop(el);
      const fg = over(parse(cs.color), bg);
      const l1 = lum(fg);
      const l2 = lum(bg);
      const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
      const large = size >= 24 || (size >= 18.66 && Number(cs.fontWeight) >= 700);
      if (ratio < (large ? 3 : 4.5)) problems.push({ rule: 'contrast', text: label(el), detail: `${ratio.toFixed(2)}:1` });
    }

    if (document.documentElement.scrollWidth > vw + 1) problems.push({ rule: 'page-scroll-x', text: 'document', detail: `${document.documentElement.scrollWidth} > ${vw}` });
    const sheet = document.getElementById('sheet');
    if (sheet && !sheet.hidden) {
      const r = sheet.getBoundingClientRect();
      if (r.bottom > vh + 1 || r.top < 0) problems.push({ rule: 'sheet-bounds', text: 'sheet', detail: `${Math.round(r.top)}..${Math.round(r.bottom)} of ${vh}` });
    }
    return problems;
  });
}
