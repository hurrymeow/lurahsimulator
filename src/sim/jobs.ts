import { bName, jName, t } from '../i18n';
import {
  ALL_JOBS, BUZZER_EXPOSE_BASE, BUZZER_EXPOSE_PER_FAKE, BUZZER_EXPOSE_SABAR, BUZZER_FAKE_PER_MONTH, EMPLOYED_SABAR,
  BUZZER_FAKE_PER_LEVEL, PENSIUN_MONTHS, PENSIUN_PAYOUT, PNS_PAYOUT_PER_LEVEL, jobDef, levelFor, levelMult, type JobDef,
} from '../data/jobs';
import { allDefs, def } from './content';
import { gain, type Fx } from './gain';
import { gateOpen } from './gate';
import { chance } from './rng';
import { caloMonth, kaderOutput, ojolMult } from './rw';
import { isWorking } from './state';
import type { Building, CheckResult, GameState, JobId, Resident, ResourceId } from './types';

/** Jobs the player can see: the RT's, plus later-stage ones whose gate is open. */
export const liveJobs = (s: GameState): JobDef[] => ALL_JOBS.filter((j) => !j.gate || gateOpen(s, j.gate));

export function slots(s: GameState, job: JobId): number {
  return s.buildings.reduce((n, b) => n + (isWorking(b) ? (def(b.def).jobSlots?.[job] ?? 0) * b.level : 0), 0);
}

export const used = (s: GameState, job: JobId) => s.residents.filter((r) => r.job === job).length;

/** The building a job's number pops should appear on. */
export function jobSite(s: GameState, job: JobId): Building | undefined {
  return s.buildings.find((b) => isWorking(b) && def(b.def).jobSlots?.[job]);
}

export const levelOf = (r: Resident): number => levelFor(r.xp ?? 0);

export function checkAssign(s: GameState, r: Resident, job: JobId): CheckResult {
  if (job === 'none' || r.job === job) return { ok: true };
  const total = slots(s, job);
  if (used(s, job) < total) return { ok: true };
  const where = allDefs().filter((b) => b.jobSlots?.[job]).map((b) => bName(b)).join(t('sim.or'));
  return { ok: false, missing: [total === 0 ? t('sim.noSlots', { job: jName(jobDef(job)!), where }) : t('sim.slotsTaken', { n: total, job: jName(jobDef(job)!), where })] };
}

export function assign(s: GameState, r: Resident, job: JobId, manual = false): CheckResult {
  const check = checkAssign(s, r, job);
  if (!check.ok) return check;
  if (r.job === 'buzzer' && job !== 'buzzer') r.fake = 0;
  if (r.job === 'pns' && job !== 'pns') r.pensiun = 0;
  r.job = job;
  if (manual) r.manual = true;
  return check;
}

/** Jobs with an open slot, each with its appeal as the odds of being picked. */
export function openJobs(s: GameState): { job: Exclude<JobId, 'none'>; appeal: number }[] {
  return liveJobs(s).filter((j) => j.appeal > 0 && used(s, j.id) < slots(s, j.id)).map((j) => ({ job: j.id, appeal: j.appeal }));
}

/**
 * A job picked at random, weighted by appeal. Null when no slot is open.
 * The roll comes from a hash of the month and the resident, not the game's random stream,
 * so choosing jobs never shifts when events or arrivals happen.
 */
export function autoPick(s: GameState, salt = 0): Exclude<JobId, 'none'> | null {
  const open = openJobs(s);
  if (open.length === 0) return null;
  let h = Math.imul(s.month * 7919 + salt + 1, 0x9e3779b1) ^ s.rng;
  h = Math.imul(h ^ (h >>> 15), 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
  let roll = (((h ^ (h >>> 16)) >>> 0) / 4294967296) * open.reduce((n, o) => n + o.appeal, 0);
  for (const o of open) if ((roll -= o.appeal) < 0) return o.job;
  return open[open.length - 1].job;
}

function autoAssign(s: GameState, fx: Fx): void {
  for (const r of s.residents) {
    if (r.job !== 'none' || r.manual) continue;
    const job = autoPick(s, r.id);
    if (!job) return;
    assign(s, r, job);
    const site = jobSite(s, job);
    fx.push({ kind: 'job', x: site?.x ?? 0, y: site?.y ?? 0, name: r.name, job });
  }
}

/** Residents whose building went away lose the job instead of keeping a ghost slot. */
function trimOverflow(s: GameState): void {
  for (const j of ALL_JOBS) {
    const over = used(s, j.id) - slots(s, j.id);
    if (over <= 0) continue;
    for (const r of s.residents.filter((x) => x.job === j.id).slice(-over)) assign(s, r, 'none');
  }
}

export function jobsSystem(s: GameState, fx: Fx): void {
  trimOverflow(s);
  autoAssign(s, fx);
  let employed = 0;
  for (const r of s.residents) {
    const j = jobDef(r.job);
    if (!j) continue;
    employed++;
    const site = jobSite(s, j.id);
    const before = levelOf(r);
    r.xp = (r.xp ?? 0) + 1;
    const level = levelOf(r);
    if (level > before) fx.push({ kind: 'level', x: site?.x ?? 0, y: site?.y ?? 0, name: r.name, level });
    // A Calo's Orang Dalam comes with the deal, so it is paid by caloMonth and not here.
    if (!j.stage?.converts) {
      for (const [res, v] of Object.entries(j.perMonth) as [ResourceId, number][]) {
        const lvl = j.perLevel.resources.includes(res) ? levelMult(j.perLevel.boost, level) : 1;
        const mult = lvl * (r.job === 'ojol' && res === 'rupiah' ? ojolMult(s) : r.job === 'kaderPosyandu' ? kaderOutput(s) : 1);
        gain(s, fx, res, v * mult * s.inflation ** (res === 'rupiah' ? 1 : 0), site);
      }
    }

    if (j.stage?.converts && caloMonth(s, fx, r.name, site, { converts: j.stage.converts, scandal: j.stage.scandal })) {
      r.job = 'none';
      r.manual = true;
    }

    // After enough years an Honorer may be made PNS, if a desk is free.
    if (r.job === 'honorer' && j.stage?.promote && (r.xp ?? 0) >= j.stage.promote.afterYears * 12 && chance(s, j.stage.promote.chancePerYear / 12) && used(s, 'pns') < slots(s, 'pns')) {
      assign(s, r, 'pns');
      fx.push({ kind: 'notice', title: t('sim.honorerTitle', { name: r.name }), body: t('sim.honorerBody'), tone: 'good', x: site?.x, y: site?.y });
    }

    if (r.job === 'pns') {
      r.pensiun = Math.min(100, r.pensiun + 100 / PENSIUN_MONTHS);
      if (r.pensiun >= 100) {
        const payout = Math.round(PENSIUN_PAYOUT * levelMult(PNS_PAYOUT_PER_LEVEL, level) * s.inflation);
        gain(s, fx, 'rupiah', -payout, site);
        fx.push({ kind: 'notice', title: t('sim.pensiunTitle', { name: r.name }), body: t('sim.pensiunBody', { amt: payout }), tone: 'info', x: site?.x, y: site?.y });
        r.job = 'none';
        r.manual = true;
        r.pensiun = 0;
      }
    }

    if (r.job === 'buzzer') {
      r.fake += BUZZER_FAKE_PER_MONTH * levelMult(BUZZER_FAKE_PER_LEVEL, level);
      if (chance(s, BUZZER_EXPOSE_BASE + r.fake * BUZZER_EXPOSE_PER_FAKE)) {
        gain(s, fx, 'viral', -r.fake, site);
        gain(s, fx, 'sabar', -BUZZER_EXPOSE_SABAR, site);
        fx.push({ kind: 'notice', title: t('sim.exposedTitle', { name: r.name }), body: t('sim.exposedBody', { viral: Math.round(r.fake), sabar: BUZZER_EXPOSE_SABAR }), tone: 'bad', x: site?.x, y: site?.y });
        r.job = 'none';
        r.manual = true;
        r.fake = 0;
      }
    }
  }
  gain(s, fx, 'sabar', employed * EMPLOYED_SABAR);
}
