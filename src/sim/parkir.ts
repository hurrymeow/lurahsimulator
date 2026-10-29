// The tukang parkir liar: turns up beside some new shops, and can be cleared (for a while).
import { bName, t } from '../i18n';
import { PARKIR } from './balance';
import { def } from './content';
import type { Fx } from './gain';
import { chance, randInt } from './rng';
import { addBuilding, count, emptyTiles } from './state';
import type { Building, CheckResult, GameState } from './types';

/** A Hansip on staff and on duty, who can clear a tukang parkir for free. */
const hansipOnDuty = (s: GameState) => (s.staff ?? []).some((x) => x.role === 'hansip' && !x.away);

const nearKantor = (s: GameState, x: number, y: number) =>
  s.buildings.some((k) => k.def.startsWith('kantor') && Math.abs(k.x - x) <= 1 && Math.abs(k.y - y) <= 1);

/**
 * A tukang parkir takes the free tile nearest a shop. Not every shop gets one, never more than the cap,
 * and never beside the Kantor. `sure` skips the chance roll (one coming back, or a stage building that always spawns).
 */
export function spawnParkir(s: GameState, fx: Fx, shop: Building, sure = false, back = false): Building | null {
  if (count(s, 'parkir') >= PARKIR.cap) return null;
  // The first one always comes: it is the joke's first showing, and his retribusi helps the early kas.
  const first = !s.parkirSeen;
  if (!sure && !first && !chance(s, PARKIR.chance)) return null;
  const empty = emptyTiles(s).filter((p) => !nearKantor(s, p.x, p.y));
  if (!empty.length) return null;
  const next = empty.filter((p) => Math.abs(p.x - shop.x) <= 1 && Math.abs(p.y - shop.y) <= 1);
  const spot = (next.length ? next : empty).sort((a, b) => Math.abs(a.x - shop.x) + Math.abs(a.y - shop.y) - (Math.abs(b.x - shop.x) + Math.abs(b.y - shop.y)))[0];
  const p = addBuilding(s, 'parkir', spot.x, spot.y, 'active');
  s.parkirSeen = true;
  p.owner = shop.uid;
  fx.push({ kind: 'built', uid: p.uid });
  fx.push({
    kind: 'notice',
    title: t(back ? 'sim.parkirBackTitle' : 'sim.parkirTitle'),
    body: t(back ? 'sim.parkirBackBody' : 'sim.parkirBody', { name: bName(def(shop.def)) }),
    tone: 'bad',
    x: p.x,
    y: p.y,
  });
  return p;
}

/** Clearing one takes a Hansip on duty, or else a word in the right ear: Orang Dalam. */
export function checkTertibkan(s: GameState, b: Building): CheckResult {
  if (b.def !== 'parkir') return { ok: false, missing: [] };
  if (hansipOnDuty(s) || s.res.orangDalam >= PARKIR.orangDalam) return { ok: true };
  return { ok: false, missing: [t('parkir.needs', { n: PARKIR.orangDalam })] };
}

/** True when the Hansip does it for free; false when it costs Orang Dalam. */
export const tertibkanFree = hansipOnDuty;

/** Clears a tukang parkir. Sometimes he comes back to the same shop a few months later. */
export function tertibkan(s: GameState, b: Building): boolean {
  if (!checkTertibkan(s, b).ok) return false;
  if (!hansipOnDuty(s)) s.res.orangDalam -= PARKIR.orangDalam;
  s.buildings = s.buildings.filter((o) => o.uid !== b.uid);
  if (b.owner !== undefined && chance(s, PARKIR.comeback)) (s.parkirBack ??= []).push({ shop: b.owner, at: s.month + randInt(s, PARKIR.backMin, PARKIR.backMax) });
  return true;
}

/** Month by month: a cleared tukang parkir whose time has come returns to his shop, if it still stands. */
export function parkirSystem(s: GameState, fx: Fx): void {
  if (!s.parkirBack?.length) return;
  const due = s.parkirBack.filter((p) => p.at <= s.month);
  s.parkirBack = s.parkirBack.filter((p) => p.at > s.month);
  for (const p of due) {
    const shop = s.buildings.find((b) => b.uid === p.shop && b.status === 'active');
    if (shop) spawnParkir(s, fx, shop, true, true);
  }
}
