import { t, type Key } from '../i18n';
import type { App } from '../app';
import { iconURL } from '../render/sprites';
import { storage } from '../storage';
import { spriteImg } from './build';
import { h } from './dom';

const SEEN = 'pakrt.howto';

type Pic = { sprite: string } | { icon: string } | { text: string };

interface Step {
  pics: Pic[];
}

// One card per idea: a picture row, one bold sentence, one short sentence.
const STEPS: Step[] = [
  { pics: [{ sprite: 'warung' }, { text: '›' }, { sprite: 'selokan' }] },
  { pics: [{ icon: 'orangDalam' }, { text: '›' }, { sprite: 'permit' }, { text: '›' }, { sprite: 'warung' }] },
  { pics: [{ sprite: 'rumah' }, { icon: 'people' }, { icon: 'sabar' }] },
  { pics: [{ sprite: 'warung' }, { sprite: 'posRonda' }, { sprite: 'wifi' }] },
  { pics: [{ icon: 'people' }, { text: '›' }, { sprite: 'wifi' }, { icon: 'viral' }] },
  { pics: [{ sprite: 'kantorRT' }, { icon: 'sabar' }] },
  { pics: [{ sprite: 'indomaret' }, { text: '80%' }, { sprite: 'parkir' }] },
  { pics: [{ text: '❚❚' }, { text: '1x' }, { text: '2x' }, { text: '4x' }] },
];

function pic(p: Pic): Node {
  if ('sprite' in p) return spriteImg(p.sprite, 48);
  if ('icon' in p) return h('img', { src: iconURL(p.icon, 6), alt: '', width: 36, height: 36, class: 'pixel' });
  return h('span', { class: 'pic-text' }, p.text);
}

let resume: (() => void) | null = null;

export function hasSeenHowto(): boolean {
  return storage.get(SEEN) === '1';
}

export function showHowto(app: App): void {
  const el = document.getElementById('howto')!;
  const wasRunning = app.speed;
  app.setSpeed(0);
  resume = () => app.setSpeed(wasRunning);
  el.replaceChildren(
    h('div', { class: 'howto' },
      h('h1', { id: 'howtoTitle' }, t('how.title')),
      h('p', { class: 'meta' }, t('how.intro')),
      h('ol', { class: 'steps' },
        ...STEPS.map((s, i) =>
          h('li', {}, h('div', { class: 'pics', 'aria-hidden': 'true' }, ...s.pics.map(pic)), h('p', {}, h('b', {}, `${t(`how.${i + 1}.head` as Key)} `), t(`how.${i + 1}.body` as Key))),
        ),
      ),
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
