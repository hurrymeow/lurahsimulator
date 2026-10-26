import { bName, t, type Key } from '../i18n';
import { rupiah } from '../format';
import { RES_COLOUR } from '../render/map';
import { iconURL } from '../render/sprites';
import { def } from '../sim/content';
import { nextStarChecklist, stageTitle, starsOf } from '../sim/stages';
import type { GameState, QuarterReport, ResourceId } from '../sim/types';
import { h } from './dom';
import { starRow } from './stage';

const RES: ResourceId[] = ['sabar', 'orangDalam', 'viral'];
const num = (v: number) => String(Math.round(Math.abs(v) * 10) / 10);

function chip(colour: string, icon: string | null, name: string, value: string, v: number): Node {
  return h('div', { class: `outcome-chip ${v < 0 ? 'negative' : 'positive'}`, style: `--c:${colour}` },
    icon ? h('img', { src: iconURL(icon), alt: '', width: 24, height: 24 }) : null,
    h('span', { class: 'outcome-name' }, name),
    h('span', { class: 'outcome-value' }, `${v < 0 ? '▼ -' : v > 0 ? '▲ +' : ''}${value}`),
  );
}

/** Content for the report modal: grade, joke line, one row per stat, best building, bonus. */
export function reportExtra(s: GameState, r: QuarterReport): { title: string; body: string; extra: Node } {
  const rows: Node[] = [
    h('div', { class: 'report-grade' }, t('report.grade', { g: r.grade })),
    chip(RES_COLOUR.rupiah, 'rupiah', t('report.income'), rupiah(r.income), r.prevIncome === null ? 0 : r.income - r.prevIncome),
    h('p', { class: 'meta' }, r.prevIncome === null ? t('report.first') : t('report.vsLast', { amt: rupiah(r.prevIncome) })),
    chip('#a1a1aa', null, t('report.residents', { n: r.residents }), String(Math.abs(r.residentsDelta)), r.residentsDelta),
    ...RES.map((id) => chip(RES_COLOUR[id], id, t(`res.${id}` as Key), num(r[`${id}Delta` as 'sabarDelta']), r[`${id}Delta` as 'sabarDelta'])),
    h('div', { class: 'outcome-mod' }, r.bestDef ? t('report.best', { name: bName(def(r.bestDef)) }) : t('report.bestNone')),
  ];
  const stars = starsOf(s);
  const open = nextStarChecklist(s)?.find((l) => !l.done);
  rows.push(h('div', { class: 'outcome-mod' },
    h('span', { 'aria-label': t('stage.aria', { title: stageTitle(s.stage.current, stars, s.stage.path), n: stars }) }, `${stageTitle(s.stage.current, stars, s.stage.path)} ${starRow(stars)}`),
    open ? h('div', {}, t('stage.next', { goal: open.text })) : null,
  ));
  const bonus = Object.entries(r.bonus) as [ResourceId, number][];
  if (bonus.length) rows.push(h('div', { class: 'outcome-mod' }, `${t('report.bonus')}: ${bonus.map(([id, v]) => `${t(`res.${id}` as Key)} +${v}`).join(', ')}`));
  return { title: t('report.title', { n: r.n }), body: t(`report.line.${r.grade}` as Key), extra: h('div', { class: 'outcome-list' }, ...rows) };
}
