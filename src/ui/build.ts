import { bBlurb, bName, t } from '../i18n';
import type { App } from '../app';
import { rupiah } from '../format';
import { isoURL } from '../render/iso';
import { placeableDefs } from '../sim/content';
import { requirementGaps } from '../sim/rules';
import { buildCost } from '../sim/state';
import { h, missingList } from './dom';
import { openSheet } from './sheet';

function spriteImg(name: string, size = 40): HTMLImageElement {
  return h('img', { src: isoURL(name), alt: '', width: size, height: size, class: 'pixel' });
}

export function openBuild(app: App): void {
  const s = app.s;
  const cards = placeableDefs().map((d) => {
    const cost = buildCost(s, d);
    const missing = requirementGaps(s, d);
    if (s.res.rupiah < cost) missing.push(t('build.needMore', { amt: rupiah(cost - s.res.rupiah) }));
    const ok = missing.length === 0;
    return h('button', { class: `card-btn ${ok ? '' : 'locked'}`, 'aria-disabled': String(!ok), onclick: () => (ok ? app.startPlacing(d.id) : undefined) },
      spriteImg(d.sprite),
      h('div', { class: 'card-text' },
        h('div', { class: 'card-title' }, h('strong', {}, bName(d)), h('span', { class: 'cost' }, rupiah(cost))),
        h('p', {}, bBlurb(d)),
        ok ? h('p', { class: 'meta' }, t('build.permit', { permit: d.permitMonths, build: d.buildMonths })) : missingList(missing),
      ),
    );
  });
  openSheet(t('build.title'), cards);
}

export { spriteImg };
