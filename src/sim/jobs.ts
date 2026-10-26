import { bName, jName, t } from '../i18n';
import {
  BUZZER_EXPOSE_BASE, BUZZER_EXPOSE_PER_FAKE, BUZZER_EXPOSE_SABAR, BUZZER_FAKE_PER_MONTH, EMPLOYED_SABAR,
  JOBS, PENSIUN_MONTHS, PENSIUN_PAYOUT, jobDef,
} from '../data/jobs';
import { BUILDINGS } from '../data/buildings';
import { def } from './content';
import { gain, type Fx } from './gain';
import { chance } from './rng';
import { isWorking } from './state';
import type { Building, CheckResult, GameState, JobId, Resident, ResourceId } from './types';

export function slots(s: GameState, job: JobId): number {
  return s.buildings.reduce((n, b) => n + (isWorking(b) ? (def(b.def).jobSlots?.[job] ?? 0) * b.level : 0), 0);
}

export const used = (s: GameState, job: JobId) => s.residents.filter((r) => r.job === job).length;

/** The building a job's number pops should appear on. */
export function jobSite(s: GameState, job: JobId): Building | undefined {
  return s.buildings.find((b) => isWorking(b) && def(b.def).jobSlots?.[job]);
}

export function checkAssign(s: GameState, r: Resident, job: JobId): CheckResult {
  if (job === 'none' || r.job === job) return { ok: true };
  const total = slots(s, job);
  if (used(s, job) < total) return { ok: true };
  const where = BUILDINGS.filter((b) => b.jobSlots?.[job]).map((b) => bName(b)).join(t('sim.or'));
  return { ok: false, missing: [total === 0 ? t('sim.noSlots', { job: jName(jobDef(job)!), where }) : t('sim.slotsTaken', { n: total, job: jName(jobDef(job)!), where })] };
}

export function assign(s: GameState, r: Resident, job: JobId): CheckResult {
  const check = checkAssign(s, r, job);
  if (!check.ok) return check;
  if (r.job === 'buzzer' && job !== 'buzzer') r.fake = 0;
  if (r.job === 'pns' && job !== 'pns') r.pensiun = 0;
  r.job = job;
  return check;
}

/** Residents whose building went away lose the job instead of keeping a ghost slot. */
function trimOverflow(s: GameState): void {
  for (const j of JOBS) {
    const over = used(s, j.id) - slots(s, j.id);
    if (over <= 0) continue;
    for (const r of s.residents.filter((x) => x.job === j.id).slice(-over)) assign(s, r, 'none');
  }
}

export function jobsSystem(s: GameState, fx: Fx): void {
  trimOverflow(s);
  let employed = 0;
  for (const r of s.residents) {
    const j = jobDef(r.job);
    if (!j) continue;
    employed++;
    const site = jobSite(s, j.id);
    for (const [res, v] of Object.entries(j.perMonth) as [ResourceId, number][]) gain(s, fx, res, v * s.inflation ** (res === 'rupiah' ? 1 : 0), site);

    if (r.job === 'pns') {
      r.pensiun = Math.min(100, r.pensiun + 100 / PENSIUN_MONTHS);
      if (r.pensiun >= 100) {
        const payout = Math.round(PENSIUN_PAYOUT * s.inflation);
        gain(s, fx, 'rupiah', -payout, site);
        fx.push({ kind: 'notice', title: t('sim.pensiunTitle', { name: r.name }), body: t('sim.pensiunBody', { amt: payout }), tone: 'info', x: site?.x, y: site?.y });
        r.job = 'none';
        r.pensiun = 0;
      }
    }

    if (r.job === 'buzzer') {
      r.fake += BUZZER_FAKE_PER_MONTH;
      if (chance(s, BUZZER_EXPOSE_BASE + r.fake * BUZZER_EXPOSE_PER_FAKE)) {
        gain(s, fx, 'viral', -r.fake, site);
        gain(s, fx, 'sabar', -BUZZER_EXPOSE_SABAR, site);
        fx.push({ kind: 'notice', title: t('sim.exposedTitle', { name: r.name }), body: t('sim.exposedBody', { viral: Math.round(r.fake), sabar: BUZZER_EXPOSE_SABAR }), tone: 'bad', x: site?.x, y: site?.y });
        r.job = 'none';
        r.fake = 0;
      }
    }
  }
  gain(s, fx, 'sabar', employed * EMPLOYED_SABAR);
}
