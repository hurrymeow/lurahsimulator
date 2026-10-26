import type { JobId, ResourceId } from '../sim/types';

export interface JobDef {
  id: Exclude<JobId, 'none'>;
  name: string;
  blurb: string;
  /** How attractive residents find it when choosing for themselves. Weighted odds. 0 means only the player assigns it. */
  appeal: number;
  /** Resource change per month for each person with this job. */
  perMonth: Partial<Record<ResourceId, number>>;
}

// Slots come from buildings (see jobSlots in data/buildings.ts).
export const JOBS: JobDef[] = [
  { id: 'pns', appeal: 20, name: 'PNS', blurb: 'Produces nothing. Only stat: Pensiun, which fills for 10 years then costs the kas a payout.', perMonth: {} },
  { id: 'ojol', appeal: 90, name: 'Ojol', blurb: 'Komisi to the kas, paid for in Sabar by hujan and macet.', perMonth: { rupiah: 90_000, sabar: -0.3 } },
  { id: 'influencer', appeal: 50, name: 'Influencer', blurb: 'Makes real Viral. It decays 10% a month, so keep posting.', perMonth: { viral: 3 } },
  { id: 'buzzer', appeal: 0, name: 'Buzzer', blurb: 'Pays well and makes fake Viral fast. Gets exposed sooner or later.', perMonth: { rupiah: 60_000, viral: 6 } },
];

export const jobDef = (id: JobId): JobDef | undefined => JOBS.find((j) => j.id === id);

export const PENSIUN_MONTHS = 120;
export const PENSIUN_PAYOUT = 1_500_000;
export const EMPLOYED_SABAR = 0.2;
export const BUZZER_FAKE_PER_MONTH = 6;
export const BUZZER_EXPOSE_BASE = 0.05;
export const BUZZER_EXPOSE_PER_FAKE = 0.004;
export const BUZZER_EXPOSE_SABAR = 8;
