import type { JobId, ResourceId } from '../sim/types';
import { STAGE_JOBS, type Gate, type StageJobDef } from './higher';

export interface JobDef {
  id: Exclude<JobId, 'none'>;
  name: string;
  blurb: string;
  /** How attractive residents find it when choosing for themselves. Weighted odds. 0 means only the player assigns it. */
  appeal: number;
  /** Resource change per month for each person with this job. */
  perMonth: Partial<Record<ResourceId, number>>;
  /** Later-stage jobs only: when it opens, and the rules the engine reads (see StageJobDef). */
  gate?: Gate;
  stage?: StageJobDef;
  /** Which per-month amounts grow with level, and by what fraction per level above 1. Tune here. */
  perLevel: { resources: ResourceId[]; boost: number };
}

// Slots come from buildings (see jobSlots in data/buildings.ts).
export const JOBS: JobDef[] = [
  { id: 'pns', appeal: 20, name: 'PNS', blurb: 'Produces nothing. Only stat: Pensiun, which fills for 10 years then costs the kas a payout.', perMonth: {}, perLevel: { resources: [], boost: 0 } },
  { id: 'ojol', appeal: 90, name: 'Ojol', blurb: 'Komisi to the kas, paid for in Patience by hujan and macet.', perMonth: { rupiah: 90_000, sabar: -0.3 }, perLevel: { resources: ['rupiah'], boost: 0.2 } },
  { id: 'influencer', appeal: 50, name: 'Influencer', blurb: 'Makes real Virality. It decays 10% a month, so keep posting.', perMonth: { viral: 3 }, perLevel: { resources: ['viral'], boost: 0.25 } },
  { id: 'buzzer', appeal: 0, name: 'Buzzer', blurb: 'Pays well and makes fake Virality fast. Gets exposed sooner or later.', perMonth: { rupiah: 60_000, viral: 6 }, perLevel: { resources: ['viral'], boost: 0.25 } },
];

/** Auto-pick odds for later-stage jobs. Calo is only ever assigned by the player. */
const STAGE_APPEAL: Record<string, number> = { kaderPosyandu: 25, calo: 0, honorer: 15, pendampingDesa: 15 };

const stageJobs: JobDef[] = STAGE_JOBS.map((j) => ({ id: j.id as JobDef['id'], appeal: STAGE_APPEAL[j.id] ?? 0, name: j.name, blurb: j.blurb, perMonth: j.perMonth, perLevel: { resources: [], boost: 0 }, gate: j.gate, stage: j }));

/** Every job, RT and later stages. Ask gateOpen before offering a later-stage one. */
export const ALL_JOBS: JobDef[] = [...JOBS, ...stageJobs];

export const jobDef = (id: JobId): JobDef | undefined => ALL_JOBS.find((j) => j.id === id);

/** Months worked needed to reach each level. Index 0 is level 1. */
export const LEVEL_MONTHS = [0, 6, 18, 36, 60];
export const MAX_LEVEL = LEVEL_MONTHS.length;
/** PNS levels are golongan. They earn nothing but raise the pension payout by this fraction per level above 1. */
export const PNS_PAYOUT_PER_LEVEL = 0.3;
/** Buzzers at higher levels pump fake Viral faster, so the exposure odds climb too. */
export const BUZZER_FAKE_PER_LEVEL = 0.25;

export const levelFor = (months: number): number => LEVEL_MONTHS.reduce((lv, m, i) => (months >= m ? i + 1 : lv), 1);
/** Multiplier on a job's scaling output at a level. */
export const levelMult = (boost: number, level: number): number => 1 + boost * (level - 1);

export const PENSIUN_MONTHS = 120;
export const PENSIUN_PAYOUT = 1_500_000;
export const EMPLOYED_SABAR = 0.2;
export const BUZZER_FAKE_PER_MONTH = 6;
export const BUZZER_EXPOSE_BASE = 0.05;
export const BUZZER_EXPOSE_PER_FAKE = 0.004;
export const BUZZER_EXPOSE_SABAR = 8;
