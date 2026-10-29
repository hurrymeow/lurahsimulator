// Warnings that explain a fall: a big drop in the 2045 meter, and the first monthly drop in Popularitas.
import { bName, t } from '../i18n';
import { def } from './content';
import type { Fx } from './gain';
import { meters, sejahtera } from './needs';
import { isWorking } from './state';
import type { GameState, Meters } from './types';

/** Where a month's Popularitas went, for the first-drop warning. */
export type SabarCause = 'queue' | 'expect' | 'broke' | 'needs' | 'buildings';

/** The 2045 meter must fall at least this far in a month for a toast. */
export const EMAS_DROP = 10;
/** The first Popularitas warning waits for a real fall, and for the opening tutorial to be over. */
export const SABAR_DROP = 1;
export const SABAR_WARN_FROM = 6;

/** A food shop that stopped working, and why, for the Perut toast. */
function shutFood(s: GameState) {
  const b = s.buildings.find((o) => (o.def === 'warung' || o.def === 'tokoKelontong') && !isWorking(o));
  if (!b) return null;
  const why = b.noRoad ? 'noRoad' : b.status === 'damaged' ? 'damaged' : 'closed';
  return { b, why } as const;
}

/**
 * Runs at the end of each month. `before` is Popularitas when the month began; `losses` is what each cause took.
 * A 2045 drop of 10 or more names the meter that fell most. The first fall in Popularitas warns once per game.
 */
export function monthWarnings(s: GameState, fx: Fx, before: number, losses: Partial<Record<SabarCause, number>>): void {
  const now = meters(s);
  const last = s.lastMeters;
  s.lastMeters = now;
  if (last) {
    const drop = sejahtera(last) - sejahtera(now);
    if (drop >= EMAS_DROP) {
      const keys = ['perut', 'kerja', 'aman'] as (keyof Meters)[];
      const worst = keys.sort((a, b) => last[b] - now[b] - (last[a] - now[a]))[0];
      const shut = worst === 'perut' ? shutFood(s) : null;
      fx.push({
        kind: 'notice',
        title: t('warn.emasTitle', { n: Math.round(drop) }),
        body: shut ? t(`warn.perut.${shut.why}`, { name: bName(def(shut.b.def)) }) : t(`warn.${worst}`),
        tone: 'bad',
        x: shut?.b.x,
        y: shut?.b.y,
      });
    }
  }
  if (s.month >= SABAR_WARN_FROM && s.res.sabar <= before - SABAR_DROP && !s.warned?.includes('sabar')) {
    const worst = (Object.entries(losses) as [SabarCause, number][]).filter(([, v]) => v < 0).sort((a, b) => a[1] - b[1])[0];
    if (worst) {
      (s.warned ??= []).push('sabar');
      fx.push({ kind: 'notice', title: t('warn.sabarTitle'), body: t(`warn.sabar.${worst[0]}`), tone: 'bad' });
    }
  }
}
