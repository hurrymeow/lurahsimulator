import { bBlurb, bName, t } from '../i18n';
import type { App } from '../app';
import { rupiah } from '../format';
import { isoURL } from '../render/iso';
import { gateOf, placeableDefs } from '../sim/content';
import { gateOpen } from '../sim/rules';
import { requirementGaps } from '../sim/rules';
import { attractTarget, buildCost, housing, population } from '../sim/state';
import { nextStarChecklist } from '../sim/stages';
import { h, missingList } from './dom';
import { openSheet } from './sheet';

function spriteImg(name: string, size = 40, rot = 0, variant?: string): HTMLImageElement {
  return h('img', { src: isoURL(name, 3, rot, variant), alt: '', width: size, height: size, class: 'pixel' });
}

/** "Houses 3 · Attracts 1", so the population effect is visible before buying. */
function populationBits(d: { housing?: number; attract?: number }): string[] {
  const bits: string[] = [];
  if (d.housing) bits.push(t('build.houses', { n: d.housing }));
  if (d.attract) bits.push(t('build.attracts', { n: d.attract }));
  return bits;
}

export function openBuild(app: App): void {
  const s = app.s;
  // A later stage's buildings stay out of sight until the player is in that stage.
  const cards = placeableDefs().filter((d) => { const g = gateOf(d); return !g || s.stage.current === g.stage || gateOpen(s, g); }).map((d) => {
    const cost = buildCost(s, d);
    const missing = requirementGaps(s, d);
    if (s.res.rupiah < cost) missing.push(t('build.needMore', { amt: rupiah(cost - s.res.rupiah) }));
    const ok = missing.length === 0;
    const instant = d.permitMonths <= 0 && d.buildMonths <= 0;
    const meta = [instant ? t('build.noPermit') : t('build.permit', { permit: d.permitMonths, build: d.buildMonths }), ...populationBits(d)];
    return h('button', { class: `card-btn ${ok ? '' : 'locked'}`, 'aria-disabled': String(!ok), onclick: () => (ok ? app.startPlacing(d.id) : undefined) },
      spriteImg(d.sprite),
      h('div', { class: 'card-text' },
        h('div', { class: 'card-title' }, h('strong', {}, bName(d)), h('span', { class: 'cost' }, rupiah(cost))),
        h('p', {}, bBlurb(d)),
        ok ? h('p', { class: 'meta' }, meta.join(' · ')) : missingList(missing),
      ),
    );
  });
  // The two population levers, and what the next star wants, right where the player acts.
  const goal = nextStarChecklist(s)?.find((l) => !l.done);
  const head: Node[] = [
    h('p', { class: 'meta' }, t('pop.line', { pop: population(s), housing: housing(s), attract: attractTarget(s) })),
  ];
  if (goal) head.push(h('p', { class: 'meta' }, t('stage.next', { goal: goal.text })));
  openSheet(t('build.title'), [...head, ...cards]);
}

export { spriteImg };
