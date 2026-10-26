import { t, type Key } from '../i18n';
import type { App } from '../app';
import { iconURL } from '../render/sprites';
import { storage } from '../storage';
import { spriteImg } from './build';
import { h } from './dom';
import type { GameState } from '../sim/types';
import { def } from '../sim/content';
import { attractTarget, housing, population } from '../sim/state';

const SEEN = 'pakrt.howto';

type Pic = { sprite: string } | { icon: string } | { text: string };

export interface Step {
  id: string;
  /** Index into the how.N.head / how.N.body strings. */
  n: number;
  /** Shown on first launch. Everything else waits for its tip. */
  basic?: boolean;
  /** When the mechanic first matters. Drives the tap-to-advance tip. */
  when?: (s: GameState) => boolean;
  pics: Pic[];
}

export const stepHead = (s: Step) => t(`how.${s.n}.head` as Key);
export const stepBody = (s: Step) => t(`how.${s.n}.body` as Key);

// One card per idea: a picture row, one bold sentence, one short sentence.
export const STEPS: Step[] = [
  { id: 'build', n: 1, basic: true, pics: [{ sprite: 'warung' }, { text: '›' }, { sprite: 'biopori' }] },
  { id: 'time', n: 8, basic: true, pics: [{ text: '❚❚' }, { text: '1x' }, { text: '2x' }, { text: '4x' }] },
  { id: 'orang', n: 2, when: (s) => s.res.orangDalam >= 1 && s.buildings.some((b) => b.status === 'permit'), pics: [{ icon: 'orangDalam' }, { text: '›' }, { sprite: 'permit' }, { text: '›' }, { sprite: 'warung' }] },
  { id: 'sabar', n: 3, when: (s) => s.stats.arrived >= 1 || s.res.sabar < 40, pics: [{ sprite: 'rumah' }, { icon: 'people' }, { icon: 'sabar' }] },
  { id: 'house', n: 11, when: (s) => s.month >= 2 && (population(s) >= housing(s) || attractTarget(s) <= population(s)), pics: [{ sprite: 'rumah' }, { text: '3' }, { icon: 'people' }, { sprite: 'warung' }] },
  { id: 'combo', n: 4, when: (s) => s.discovered.length >= 1 || (s.month >= 3 && s.buildings.filter((b) => b.status === 'active' && b.def !== 'rumah').length >= 2), pics: [{ sprite: 'warung' }, { sprite: 'posRonda' }, { sprite: 'wifi' }] },
  { id: 'jobs', n: 5, when: (s) => s.month >= 3 && s.residents.length >= 3 && s.buildings.some((b) => b.status === 'active' && def(b.def).jobSlots), pics: [{ icon: 'people' }, { text: '›' }, { sprite: 'wifi' }, { icon: 'viral' }] },
  { id: 'wacana', n: 6, when: (s) => s.month >= 3 && s.buildings.some((b) => b.def === 'kantorRT' && b.status === 'active'), pics: [{ sprite: 'kantorRT' }, { icon: 'sabar' }] },
  { id: 'trouble', n: 7, when: (s) => s.buildings.some((b) => b.def === 'parkir' || b.status === 'mangkrak'), pics: [{ sprite: 'indomaret' }, { text: '80%' }, { sprite: 'parkir' }] },
  { id: 'banjir', n: 9, when: (s) => s.lastEvent?.banjir !== undefined, pics: [{ sprite: 'biopori' }, { icon: 'sabar' }] },
  { id: 'road', n: 12, when: (s) => s.buildings.some((b) => b.noRoad && b.status === 'active'), pics: [{ sprite: 'jalan' }, { text: '›' }, { sprite: 'warung' }] },
  { id: 'ranking', n: 10, when: (s) => s.month >= 9, pics: [{ icon: 'people' }, { text: 'vs' }, { icon: 'sabar' }] },
];

function pic(p: Pic): Node {
  if ('sprite' in p) return spriteImg(p.sprite, 48);
  if ('icon' in p) return h('img', { src: iconURL(p.icon, 6), alt: '', width: 36, height: 36, class: 'pixel' });
  return h('span', { class: 'pic-text' }, p.text);
}

export function picRow(s: Step): Node {
  return h('div', { class: 'pics', 'aria-hidden': 'true' }, ...s.pics.map(pic));
}

let resume: (() => void) | null = null;

export function resetHowto(): void {
  storage.remove(SEEN);
}

export function hasSeenHowto(): boolean {
  return storage.get(SEEN) === '1';
}

/** First launch shows only the basics. The Menu entry shows the full reference. */
export function showHowto(app: App, basicsOnly = false): void {
  const el = document.getElementById('howto')!;
  const wasRunning = app.speed;
  app.setSpeed(0);
  resume = () => app.setSpeed(wasRunning);
  el.replaceChildren(
    h('div', { class: 'howto' },
      h('h1', { id: 'howtoTitle' }, t('how.title')),
      h('p', { class: 'meta' }, t('how.intro')),
      h('ol', { class: 'steps' },
        ...(basicsOnly ? STEPS.filter((s) => s.basic) : STEPS).map((s) =>
          h('li', {}, picRow(s), h('p', {}, h('b', {}, `${stepHead(s)} `), stepBody(s))),
        ),
      ),
      basicsOnly ? h('p', { class: 'meta' }, t('how.later')) : null,
      h('button', { class: 'btn btn-primary', id: 'howtoGo', onclick: () => hideHowto() }, t('how.go')),
    ),
  );
  el.hidden = false;
  el.scrollTop = 0;
  storage.set(SEEN, '1');
  document.getElementById('howtoGo')!.focus({ preventScroll: true });
}

export function hideHowto(): void {
  document.getElementById('howto')!.hidden = true;
  resume?.();
  resume = null;
}
