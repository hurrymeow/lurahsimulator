import { INSPECTION as I } from '../data/events';
import { t } from '../i18n';
import { gain, type Fx } from './gain';
import { count } from './state';
import type { GameState } from './types';

export interface InspectionScore {
  selokan: number;
  sabar: number;
  tertib: number;
  parkir: number;
  /** Fresh paint and nasi kotak. Counts for this visit only. */
  prep: number;
  real: number;
  total: number;
}

/** What the inspector sees. Prep inflates the total, never the real score. */
export function inspectionScore(s: GameState): InspectionScore {
  const levels = s.buildings.filter((b) => b.def === 'biopori' && b.status === 'active').reduce((n, b) => n + b.level, 0);
  const broken = s.buildings.filter((b) => b.status === 'mangkrak' || b.status === 'damaged').length;
  const selokan = Math.min(I.perCriterion, levels * I.selokanPerLevel);
  const sabar = Math.round((s.res.sabar / 100) * I.perCriterion);
  const tertib = Math.max(0, I.perCriterion - broken * I.damagedPenalty);
  const parkir = Math.max(0, I.perCriterion - count(s, 'parkir') * I.parkirPenalty);
  const real = selokan + sabar + tertib + parkir;
  const prep = s.inspection?.prep ?? 0;
  return { selokan, sabar, tertib, parkir, prep, real, total: Math.min(100, real + prep) };
}

/** Warns two months ahead through the event system, then the inspector scores the kampung. */
export function inspectionSystem(s: GameState, fx: Fx): void {
  const st = (s.inspection ??= { warnAt: I.firstWarn, prep: 0 });
  if (st.visitAt === undefined) {
    if (s.month < st.warnAt || s.pendingEvent) return;
    s.pendingEvent = 'kecamatan';
    (s.lastEvent ??= {}).kecamatan = s.month;
    s.lastNovelty = s.month;
    st.visitAt = s.month + I.lead;
    st.prep = 0;
    fx.push({ kind: 'event', eventId: 'kecamatan' });
    return;
  }
  if (s.month < st.visitAt) return;
  const sc = inspectionScore(s);
  const r = sc.total >= I.good ? I.goodReward : sc.total >= I.ok ? I.okReward : I.badReward;
  const verdict = sc.total >= I.good ? 'good' : sc.total >= I.ok ? 'ok' : 'bad';
  const office = s.buildings.find((b) => b.def === 'kantorRT');
  if (r.orangDalam) gain(s, fx, 'orangDalam', r.orangDalam, office);
  if (r.sabar) gain(s, fx, 'sabar', r.sabar, office);
  // The satire is the number: paint carried the score past a bar the kampung had not earned.
  const painted = sc.prep > 0 && sc.real < (verdict === 'good' ? I.good : I.ok) && sc.total >= (verdict === 'good' ? I.good : I.ok);
  fx.push({
    kind: 'notice',
    title: t(`inspect.${verdict}.title`),
    body: t('inspect.report', { total: sc.total, selokan: sc.selokan, sabar: sc.sabar, tertib: sc.tertib, parkir: sc.parkir, prep: sc.prep, max: I.perCriterion }) + ' ' + t(painted ? 'inspect.painted' : `inspect.${verdict}.body`),
    tone: verdict === 'bad' ? 'bad' : 'good',
    fanfare: verdict === 'good',
  });
  s.lastNovelty = s.month;
  s.inspection = { warnAt: s.month + I.gap, prep: 0 };
}
