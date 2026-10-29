import { HEALTH_POSTS, INSPECTION as I, INSPECTIONS, eventDef, type Criterion, type InspectionId } from '../data/events';
import { eName, t } from '../i18n';
import { gain, type Fx } from './gain';
import { pick } from './rng';
import { count } from './state';
import type { GameState } from './types';

export interface InspectionScore {
  /** Points per criterion this visit scores, in the order the team reads them. */
  parts: { id: Criterion; points: number }[];
  /** Fresh paint and nasi kotak. Counts for this visit only. */
  prep: number;
  real: number;
  total: number;
}

const active = (s: GameState, ids: string[]) => s.buildings.filter((b) => ids.includes(b.def) && b.status === 'active').length;
const scale = (v: number, full: number) => Math.max(0, Math.min(I.perCriterion, Math.round((v / full) * I.perCriterion)));

/** One criterion, 0 to `perCriterion`. */
export function criterion(s: GameState, id: Criterion): number {
  switch (id) {
    case 'selokan':
      return Math.min(I.perCriterion, s.buildings.filter((b) => b.def === 'biopori' && b.status === 'active').reduce((n, b) => n + b.level, 0) * I.selokanPerLevel);
    case 'sabar':
      return scale(s.res.sabar, 100);
    case 'tertib':
      return Math.max(0, I.perCriterion - s.buildings.filter((b) => b.status === 'mangkrak' || b.status === 'damaged').length * I.damagedPenalty);
    case 'parkir':
      return Math.max(0, I.perCriterion - count(s, 'parkir') * I.parkirPenalty);
    case 'aman':
      return scale(s.meters?.aman ?? 50, 100);
    case 'perut':
      return scale(s.meters?.perut ?? 50, 100);
    case 'sehat':
      return Math.min(I.perCriterion, active(s, HEALTH_POSTS) * I.healthPoints);
    case 'wifi':
      return Math.min(I.perCriterion, active(s, ['wifi']) * I.wifiPoints);
    case 'viral':
      return scale(s.res.viral, I.viralFull);
  }
}

/** Which inspection is due: the one warned of, or Kampung Bersih before any warning. */
export const inspectionId = (s: GameState): InspectionId => (s.inspection?.theme as InspectionId | undefined) ?? 'kecamatan';

/** What the inspector sees. Prep inflates the total, never the real score. */
export function inspectionScore(s: GameState): InspectionScore {
  const parts = INSPECTIONS[inspectionId(s)].map((id) => ({ id, points: criterion(s, id) }));
  const real = parts.reduce((n, p) => n + p.points, 0);
  const prep = s.inspection?.prep ?? 0;
  return { parts, prep, real, total: Math.min(100, real + prep) };
}

/** The next team: Kampung Bersih first, then any other than the last one. */
function nextTheme(s: GameState): InspectionId {
  const last = s.inspection?.last;
  if (!last) return 'kecamatan';
  return pick(s, (Object.keys(INSPECTIONS) as InspectionId[]).filter((id) => id !== last));
}

/** Warns two months ahead through the event system, then the inspector scores the kampung. */
export function inspectionSystem(s: GameState, fx: Fx): void {
  const st = (s.inspection ??= { warnAt: I.firstWarn, prep: 0 });
  if (st.visitAt === undefined) {
    if (s.month < st.warnAt || s.pendingEvent) return;
    const theme = nextTheme(s);
    s.pendingEvent = theme;
    (s.lastEvent ??= {})[theme] = s.month;
    s.lastNovelty = s.month;
    st.visitAt = s.month + I.lead;
    st.prep = 0;
    st.theme = theme;
    fx.push({ kind: 'event', eventId: theme });
    return;
  }
  if (s.month < st.visitAt) return;
  const theme = inspectionId(s);
  const sc = inspectionScore(s);
  const r = sc.total >= I.good ? I.goodReward : sc.total >= I.ok ? I.okReward : I.badReward;
  const verdict = sc.total >= I.good ? 'good' : sc.total >= I.ok ? 'ok' : 'bad';
  const office = s.buildings.find((b) => b.def === 'kantorRT');
  if (r.orangDalam) gain(s, fx, 'orangDalam', r.orangDalam, office);
  if (r.sabar) gain(s, fx, 'sabar', r.sabar, office);
  // The satire is the number: paint carried the score past a bar the kampung had not earned.
  const painted = sc.prep > 0 && sc.real < (verdict === 'good' ? I.good : I.ok) && sc.total >= (verdict === 'good' ? I.good : I.ok);
  const parts = sc.parts.map((p) => t('inspect.part', { name: t(`inspect.crit.${p.id}`), n: p.points, max: I.perCriterion })).join(', ');
  fx.push({
    kind: 'notice',
    title: t(`inspect.${verdict}.title`, { name: eName(eventDef(theme)!) }),
    body: t('inspect.report', { total: sc.total, parts, prep: sc.prep }) + ' ' + t(painted ? `inspect.painted.${theme}` : `inspect.${verdict}.body`),
    tone: verdict === 'bad' ? 'bad' : 'good',
    fanfare: verdict === 'good',
  });
  s.lastNovelty = s.month;
  s.inspection = { warnAt: s.month + I.gap, prep: 0, last: theme };
}
