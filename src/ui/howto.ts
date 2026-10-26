import type { App } from '../app';
import { iconURL } from '../render/sprites';
import { storage } from '../storage';
import { spriteImg } from './build';
import { h } from './dom';

const SEEN = 'pakrt.howto';

type Pic = { sprite: string } | { icon: string } | { text: string };

interface Step {
  pics: Pic[];
  head: string;
  body: string;
}

// One card per idea: a picture row, one bold sentence, one short sentence.
const STEPS: Step[] = [
  { pics: [{ sprite: 'warung' }, { text: '›' }, { sprite: 'selokan' }], head: 'Build.', body: 'Open Menu, tap Build, pick a building, tap a tile, then Place. Every build waits in a permit queue and the queue drains Sabar.' },
  { pics: [{ icon: 'orangDalam' }, { text: '›' }, { sprite: 'permit' }, { text: '›' }, { sprite: 'warung' }], head: 'Orang Dalam skips the queue.', body: 'Tap a waiting building and spend 1 Orang Dalam. You earn it slowly from the Kantor RT.' },
  { pics: [{ sprite: 'rumah' }, { icon: 'people' }, { icon: 'sabar' }], head: 'Keep Sabar up.', body: 'People move in while Sabar is above 25. Below 15 they leave. Houses appear on the map as the kampung grows.' },
  { pics: [{ sprite: 'warung' }, { sprite: 'posRonda' }, { sprite: 'wifi' }], head: 'Put buildings side by side.', body: 'Hidden combos reveal themselves the first time they work, and log themselves in Menu, Buku Combo.' },
  { pics: [{ icon: 'people' }, { text: '›' }, { sprite: 'wifi' }, { icon: 'viral' }], head: 'Give residents jobs.', body: 'Open Menu, then Warga. Ojol earn Rupiah. Influencers make Viral. Buzzers make fake Viral that collapses later.' },
  { pics: [{ sprite: 'kantorRT' }, { icon: 'sabar' }], head: 'Wacana buys Sabar, nothing else.', body: 'Announce a policy and Sabar rises for a few months, then fades. It builds nothing. Announce it again.' },
  { pics: [{ sprite: 'indomaret' }, { text: '80%' }, { sprite: 'parkir' }], head: 'Expect trouble.', body: 'Big projects can freeze at 80%. Every new shop gets a tukang parkir you cannot remove. Viral makes repairs cheaper.' },
  { pics: [{ text: '❚❚' }, { text: '1x' }, { text: '2x' }, { text: '4x' }], head: 'Time runs by itself.', body: 'One month is about 8 seconds. Pause, or tap 1x to speed up, at the bottom. The game waits while you read.' },
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
      h('h1', { id: 'howtoTitle' }, 'How to play'),
      h('p', { class: 'meta' }, 'You are Pak RT. Grow the kampung, keep Sabar up, beat Kampung Sebelah.'),
      h('ol', { class: 'steps' },
        ...STEPS.map((s) =>
          h('li', {}, h('div', { class: 'pics', 'aria-hidden': 'true' }, ...s.pics.map(pic)), h('p', {}, h('b', {}, `${s.head} `), s.body)),
        ),
      ),
      h('button', { class: 'btn btn-primary', id: 'howtoGo', onclick: () => hideHowto() }, 'Got it'),
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
