import type { JobId, ResourceId } from '../sim/types';

export interface JobDef {
  id: Exclude<JobId, 'none'>;
  name: string;
  blurb: string;
  /** How attractive residents find it when choosing for themselves. Weighted odds. 0 means only the player assigns it. */
  appeal: number;
  /** Resource change per month for each person with this job. */
  perMonth: Partial<Record<ResourceId, number>>;
  /** Which per-month amounts grow with level, and by what fraction per level above 1. Tune here. */
  perLevel: { resources: ResourceId[]; boost: number };
}

// Slots come from buildings (see jobSlots in data/buildings.ts).
export const JOBS: JobDef[] = [
  { id: 'pns', appeal: 20, name: 'PNS', blurb: 'Produces nothing. Only stat: Pensiun, which fills for 10 years then costs the kas a payout.', perMonth: {}, perLevel: { resources: [], boost: 0 } },
  { id: 'ojol', appeal: 90, name: 'Ojol', blurb: 'Komisi to the kas, paid for in Sabar by hujan and macet.', perMonth: { rupiah: 90_000, sabar: -0.3 }, perLevel: { resources: ['rupiah'], boost: 0.2 } },
  { id: 'influencer', appeal: 50, name: 'Influencer', blurb: 'Makes real Viral. It decays 10% a month, so keep posting.', perMonth: { viral: 3 }, perLevel: { resources: ['viral'], boost: 0.25 } },
  { id: 'buzzer', appeal: 0, name: 'Buzzer', blurb: 'Pays well and makes fake Viral fast. Gets exposed sooner or later.', perMonth: { rupiah: 60_000, viral: 6 }, perLevel: { resources: ['viral'], boost: 0.25 } },
];

export const jobDef = (id: JobId): JobDef | undefined => JOBS.find((j) => j.id === id);

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
