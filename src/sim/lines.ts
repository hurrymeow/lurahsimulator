import { lLine, lName } from '../i18n';
import { LINES, LINE_CHANCE, LINE_MEMORY, type LineDef } from '../data/lines';
import { incomeShare } from './events';
import { gain, type Fx } from './gain';
import { chance, rand } from './rng';
import type { GameState } from './types';

/** Monthly system: a minor happening in the ticker and the log. Never a popup, never pauses the game. */
export function lineSystem(s: GameState, fx: Fx): void {
  if (!chance(s, LINE_CHANCE)) return;
  const recent = s.recentLines ?? [];
  const pool = LINES.filter((l) => !recent.includes(l.id) && (l.minMonth ?? 0) <= s.month && (!l.needs || s.buildings.some((b) => b.def === l.needs && b.status === 'active')));
  if (!pool.length) return;
  let roll = rand(s) * pool.reduce((n, l) => n + (l.weight ?? 1), 0);
  let pick: LineDef = pool[pool.length - 1];
  for (const l of pool) {
    roll -= l.weight ?? 1;
    if (roll <= 0) {
      pick = l;
      break;
    }
  }
  s.recentLines = [...recent, pick.id].slice(-LINE_MEMORY);
  for (const [res, v] of Object.entries(pick.res ?? {})) gain(s, fx, res as 'sabar', v as number);
  if (pick.pct) gain(s, fx, 'rupiah', incomeShare(s, pick.pct));
  const net = (pick.pct ?? 0) + Object.values(pick.res ?? {}).reduce((n, v) => n + (v ?? 0), 0);
  fx.push({ kind: 'notice', title: lName(pick), body: lLine(pick), tone: net < 0 ? 'bad' : net > 0 ? 'good' : 'info' });
}
