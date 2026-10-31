import { bName, t, type Key } from '../i18n';
import type { App } from '../app';
import { iconURL } from '../render/sprites';
import { storage } from '../storage';
import { spriteImg } from './build';
import { h } from './dom';
import type { GameState } from '../sim/types';
import { def } from '../sim/content';
import { easiestCombo } from '../sim/nextstep';
import { count } from '../sim/state';

const SEEN = 'pakrt.howto';

type Pic = { sprite: string } | { icon: string } | { text: string } | { word: Key };

export interface Step {
  id: string;
  /** Index into the how.N.head / how.N.body strings. */
  n: number;
  /** Shown on first launch. Everything else waits for its tip. */
  basic?: boolean;
  /** When the mechanic first matters: a player action or a state the tip explains, never the month alone. */
  when?: (s: GameState) => boolean;
  /** The tip card's own body and pictures, when they depend on the kampung. The guide keeps the plain card. */
  tip?: (s: GameState) => { body: string; pics: Pic[] } | null;
  /** A tip only, left out of the How to play guide. */
  tipOnly?: boolean;
  pics: Pic[];
}

/** Buildings the player did not choose: the start, paths and the tukang parkir. */
const GIVEN = new Set(['rumah', 'kantorRT', 'jalan', 'parkir']);
/** The player's first shop or facility is open: the moment a neighbour for it matters. */
const firstShop = (s: GameState) => s.buildings.some((b) => b.status === 'active' && !GIVEN.has(b.def));
/** A resident took a job at a building the player built. The Kantor RT's PNS seats fill on day one, so they do not count. */
const someoneWorks = (s: GameState) => s.residents.some((r) => r.job !== 'none' && r.job !== 'pns' && r.staffId === undefined);

export const stepHead = (s: Step) => t(`how.${s.n}.head` as Key);
export const stepBody = (s: Step) => t(`how.${s.n}.body` as Key);

// One card per idea: a picture row, one bold sentence, one short sentence.
export const STEPS: Step[] = [
  { id: 'build', n: 1, basic: true, pics: [{ word: 'menu.build' }, { text: '›' }, { sprite: 'warung' }] },
  { id: 'time', n: 8, basic: true, pics: [{ text: '❚❚' }, { text: '1x' }, { text: '2x' }, { text: '4x' }] },
  // A one-month permit is over before a tip helps, so Orang Inside waits for a longer queue.
  { id: 'orang', n: 2, when: (s) => s.res.orangDalam >= 1 && s.buildings.some((b) => b.status === 'permit' && b.timer >= 2), pics: [{ word: 'how.pic.permit' }, { text: '›' }, { icon: 'orangDalam' }, { text: '›' }, { sprite: 'warung' }] },
  // Growth stalls: the first arrival shows beds at work, or Popularitas is low enough that residents may leave.
  { id: 'house', n: 11, when: (s) => s.stats.arrived >= 1 || s.res.sabar < 40, pics: [{ sprite: 'rumah' }, { word: 'how.pic.beds' }, { text: '+' }, { sprite: 'warung' }] },
  // The first shop opens: name a combo it can join, with the pieces to place beside it.
  {
    id: 'combo', n: 4, when: (s) => s.discovered.length === 0 && firstShop(s),
    tip: (s) => {
      const c = easiestCombo(s);
      if (!c) return null;
      // Pieces the player already has are named as the ones to build beside.
      const [have, missing] = [true, false].map((owned) => c.ids.filter((id) => count(s, id) > 0 === owned).map((id) => bName(def(id))).join(', '));
      const body = have && missing ? t('how.4.tipNext', { name: c.name, have, missing }) : t('how.4.tip', { name: c.name, pieces: c.pieces });
      return { body, pics: c.ids.flatMap((id, i): Pic[] => (i ? [{ text: '+' }, { sprite: id }] : [{ sprite: id }])) };
    },
    pics: [{ sprite: 'warung' }, { text: '+' }, { sprite: 'posRonda' }],
  },
  // The first combo is found: say where it is kept and what it does.
  { id: 'comboFound', n: 13, tipOnly: true, when: (s) => s.discovered.length >= 1, pics: [{ word: 'menu.build' }, { text: '›' }, { word: 'menu.combo' }, { text: '★' }] },
  { id: 'jobs', n: 5, when: someoneWorks, pics: [{ word: 'how.pic.resident' }, { text: '›' }, { word: 'how.pic.job' }] },
  // Popularitas has fallen (its one-time warning) or sits low: a Wacana is the quick fix.
  { id: 'wacana', n: 6, when: (s) => s.buildings.some((b) => b.def === 'kantorRT' && b.status === 'active') && (!!s.warned?.includes('sabar') || s.res.sabar < 45), pics: [{ sprite: 'kantorRT' }, { icon: 'sabar' }] },
  { id: 'trouble', n: 7, when: (s) => s.buildings.some((b) => b.def === 'parkir' || b.status === 'mangkrak'), pics: [{ sprite: 'indomaret' }, { text: '80%' }, { sprite: 'parkir' }] },
  { id: 'banjir', n: 9, when: (s) => s.lastEvent?.banjir !== undefined, pics: [{ word: 'how.pic.biopori' }, { text: '-20%' }] },
  { id: 'road', n: 12, when: (s) => s.buildings.some((b) => b.noRoad && b.status === 'active'), pics: [{ word: 'how.pic.road' }, { text: '›' }, { sprite: 'warung' }] },
  // The first yearly ranking is in: explain what it scored and what a win pays.
  { id: 'ranking', n: 10, when: (s) => s.ranking.length >= 1, pics: [{ word: 'how.pic.us' }, { text: 'vs' }, { word: 'how.pic.them' }] },
];

function pic(p: Pic): Node {
  if ('sprite' in p) return spriteImg(p.sprite, 48);
  if ('icon' in p) return h('img', { src: iconURL(p.icon, 6), alt: '', width: 36, height: 36, class: 'pixel' });
  if ('word' in p) return h('span', { class: 'pic-text' }, t(p.word));
  return h('span', { class: 'pic-text' }, p.text);
}

export function picRow(s: Step): Node {
  return h('div', { class: 'pics', 'aria-hidden': 'true' }, ...s.pics.map(pic));
}

let resume: (() => void) | null = null;

export function resetHowto(): void {
  storage.remove(SEEN);
}

/** A new game that starts with the guide skips the first-launch card. */
export function skipHowto(): void {
  storage.set(SEEN, '1');
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
        ...(basicsOnly ? STEPS.filter((s) => s.basic) : STEPS.filter((s) => !s.tipOnly)).map((s) =>
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
