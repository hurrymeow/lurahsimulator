import type { App } from '../app';
import { iconURL } from '../render/sprites';
import { storage } from '../storage';
import { spriteImg } from './build';
import { h } from './dom';
import type { GameState } from '../sim/types';
import { def } from '../sim/content';

const SEEN = 'pakrt.howto';

type Pic = { sprite: string } | { icon: string } | { text: string };

export interface Step {
  id: string;
  /** Shown on first launch. Everything else waits for its tip. */
  basic?: boolean;
  /** When the mechanic first matters. Drives the tap-to-advance tip. */
  when?: (s: GameState) => boolean;
  pics: Pic[];
  head: string;
  body: string;
}

// One card per idea: a picture row, one bold sentence, one short sentence.
export const STEPS: Step[] = [
  { id: 'build', basic: true, pics: [{ sprite: 'warung' }, { text: '›' }, { sprite: 'selokan' }], head: 'Build.', body: 'Open Menu, tap Build, pick a building, tap a tile, then Place. Every build waits in a permit queue and the queue drains Sabar.' },
  { id: 'time', basic: true, pics: [{ text: '❚❚' }, { text: '1x' }, { text: '2x' }, { text: '4x' }], head: 'Time runs by itself.', body: 'One month is about 8 seconds. Pause, or tap 1x to speed up, at the bottom. The game waits while you read.' },
  { id: 'orang', when: (s) => s.res.orangDalam >= 1 && s.buildings.some((b) => b.status === 'permit'), pics: [{ icon: 'orangDalam' }, { text: '›' }, { sprite: 'permit' }, { text: '›' }, { sprite: 'warung' }], head: 'Orang Dalam skips the queue.', body: 'Tap a waiting building and spend 1 Orang Dalam. You earn it slowly from the Kantor RT.' },
  { id: 'sabar', when: (s) => s.stats.arrived >= 1 || s.res.sabar < 40, pics: [{ sprite: 'rumah' }, { icon: 'people' }, { icon: 'sabar' }], head: 'Keep Sabar up.', body: 'People move in while Sabar is above 25. Below 15 they leave. Houses appear on the map as the kampung grows.' },
  { id: 'combo', when: (s) => s.discovered.length >= 1 || (s.month >= 3 && s.buildings.filter((b) => b.status === 'active' && b.def !== 'rumah').length >= 2), pics: [{ sprite: 'warung' }, { sprite: 'posRonda' }, { sprite: 'wifi' }], head: 'Put buildings side by side.', body: 'Hidden combos reveal themselves the first time they work, and log themselves in Menu, Buku Combo.' },
  { id: 'jobs', when: (s) => s.month >= 3 && s.residents.length >= 3 && s.buildings.some((b) => b.status === 'active' && def(b.def).jobSlots), pics: [{ icon: 'people' }, { text: '›' }, { sprite: 'wifi' }, { icon: 'viral' }], head: 'Give residents jobs.', body: 'Open Menu, then Warga. Ojol earn Rupiah. Influencers make Viral. Buzzers make fake Viral that collapses later.' },
  { id: 'wacana', when: (s) => s.month >= 3 && s.buildings.some((b) => b.def === 'kantorRT' && b.status === 'active'), pics: [{ sprite: 'kantorRT' }, { icon: 'sabar' }], head: 'Wacana buys Sabar, nothing else.', body: 'Announce a policy and Sabar rises for a few months, then fades. It builds nothing. Announce it again.' },
  { id: 'trouble', when: (s) => s.buildings.some((b) => b.def === 'parkir' || b.status === 'mangkrak'), pics: [{ sprite: 'indomaret' }, { text: '80%' }, { sprite: 'parkir' }], head: 'Expect trouble.', body: 'Big projects can freeze at 80%. Every new shop gets a tukang parkir you cannot remove. Viral makes repairs cheaper.' },
  { id: 'banjir', when: (s) => s.lastEvent?.banjir !== undefined, pics: [{ sprite: 'selokan' }, { icon: 'sabar' }], head: 'Banjir tests your selokan.', body: 'Each selokan level cuts flood damage by 20%. Build them before the rainy months, not after.' },
  { id: 'ranking', when: (s) => s.month >= 9, pics: [{ icon: 'people' }, { text: 'vs' }, { icon: 'sabar' }], head: 'Every year you are ranked.', body: 'Your kampung is scored against Kampung Sebelah. Win to gain Sabar, Orang Dalam and Indonesia Emas progress.' },
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
      h('h1', { id: 'howtoTitle' }, 'How to play'),
      h('p', { class: 'meta' }, 'You are Pak RT. Grow the kampung, keep Sabar up, beat Kampung Sebelah.'),
      h('ol', { class: 'steps' },
        ...(basicsOnly ? STEPS.filter((s) => s.basic) : STEPS).map((s) =>
          h('li', {}, picRow(s), h('p', {}, h('b', {}, `${s.head} `), s.body)),
        ),
      ),
      basicsOnly ? h('p', { class: 'meta' }, 'Everything else shows up as a short tip the first time it matters. The full guide stays in Menu, How to play.') : null,
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
