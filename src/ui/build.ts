import type { App } from '../app';
import { rupiah } from '../format';
import { sprite } from '../render/sprites';
import { placeableDefs } from '../sim/content';
import { requirementGaps } from '../sim/rules';
import { buildCost } from '../sim/state';
import { h, missingList } from './dom';
import { openSheet } from './sheet';

function spriteImg(name: string): HTMLImageElement {
  const src = sprite(name);
  const c = document.createElement('canvas');
  c.width = src.width * 4;
  c.height = src.height * 4;
  const ctx = c.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(src, 0, 0, c.width, c.height);
  return h('img', { src: c.toDataURL(), alt: '', width: 40, height: 40, class: 'pixel' });
}

export function openBuild(app: App): void {
  const s = app.s;
  const cards = placeableDefs().map((d) => {
    const cost = buildCost(s, d);
    const missing = requirementGaps(s, d);
    if (s.res.rupiah < cost) missing.push(`Need ${rupiah(cost - s.res.rupiah)} more`);
    const ok = missing.length === 0;
    return h('button', { class: `card-btn ${ok ? '' : 'locked'}`, 'aria-disabled': String(!ok), onclick: () => (ok ? app.startPlacing(d.id) : undefined) },
      spriteImg(d.sprite),
      h('div', { class: 'card-text' },
        h('div', { class: 'card-title' }, h('strong', {}, d.name), h('span', { class: 'cost' }, rupiah(cost))),
        h('p', {}, d.blurb),
        ok ? h('p', { class: 'meta' }, `Permit ${d.permitMonths} mo · build ${d.buildMonths} mo`) : missingList(missing),
      ),
    );
  });
  openSheet('Build', cards);
}

export { spriteImg };
