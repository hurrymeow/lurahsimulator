// Tunable numbers that are not tied to one building.
export const START = { rupiah: 5_000_000, sabar: 60, orangDalam: 1, viral: 0 };
export const START_RESIDENTS = 4;
export const IURAN = 25_000;
export const INFLATION_PER_YEAR = 0.03;
export const LEVEL_BONUS = 0.6;
export const REFUND = 0.5;
export const BASE_ATTRACT = 4;
export const ARRIVE_MIN_SABAR = 25;
export const LEAVE_BELOW_SABAR = 15;
export const MIN_RESIDENTS = 2;
export const QUEUE_SABAR_DRAIN = 1;
export const BROKE_SABAR_DRAIN = 1;
export const VIRAL_DECAY = 0.1;
export const SABAR_MAX = 100;
export const VIRAL_MAX = 100;
/** Months without anything new before the pacing director steps in. */
export const NOVELTY_GAP = 8;
/** Each Viral point adds this fraction to shop income. */
export const VIRAL_INCOME = 0.005;
/** Below this, the kampung slowly calms down on its own, so Sabar never gets stuck at zero. */
export const SABAR_REGEN_BELOW = 30;
export const SABAR_REGEN = 4;
/** A report card lands every this many months. */
export const QUARTER_MONTHS = 3;
/** Grade rewards. A bad grade costs nothing, it only misses the bonus. */
export const GRADE_BONUS = {
  S: { sabar: 5, orangDalam: 1 },
  A: { sabar: 3 },
  B: { sabar: 1 },
  C: {},
  D: {},
} as const;


/** AI-run RTs. */
export const NEIGHBOUR = {
  /** Rp one Dana pays an RT, before inflation. Each Dana is one build. Matches RW.danaPerBuild. */
  fundCost: 1_000_000,
  /** Builds one RT can have banked at once. */
  fundMax: 3,
  /** Months between builds. Rajin builds faster. */
  buildEvery: 3,
  buildEveryRajin: 2,
  /** Rajin earns this much more from each building. Kept for the iuran their residents pay. */
  rajinIuran: 1.2,
  /** Sabar an AI RT holds, from a base plus its social buildings. */
  sabarBase: 45,
  sabarPerSocial: 5,
  sabarMax: 80,
  startPop: 2,
};

/** Stempel, the RW's permit stamps. */
export const STEMPEL = {
  /** Stamps a month with no Balai RW, and what each Balai RW adds. */
  base: 3,
  perBalai: 1,
  /** Stamps in hand never pile up past this. */
  stockMax: 6,
  /** Backlog limit the RW's first star counts against. */
  clearUnder: 5,
  /** Sabar lost a month for each letter still waiting. */
  sabarPerLetter: 0.5,
  /** Letters a build sends. Jarang Muncul sends double. */
  perBuild: 1,
};
