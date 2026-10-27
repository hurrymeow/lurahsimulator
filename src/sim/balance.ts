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
/** Each building past the first SPRAWL_FREE makes the next one dearer: land, permits and "uang rapat" grow with the kampung. */
export const SPRAWL_FREE = 10;
export const SPRAWL_STEP = 0.03;
/** Share of building income that goes up the chain as "setoran". Paying is the choice, so the kas never snowballs. */
export const SETORAN_RATE = 0.1;
/** Popularitas lost each month per resident: bigger kampung, bigger expectations. */
export const EXPECT_PER_RESIDENT = 0.1;
/** Months without anything new before the pacing director steps in. */
export const NOVELTY_GAP = 8;
/** Each Viral point adds this fraction to shop income. */
export const VIRAL_INCOME = 0.005;
/** Below this, the kampung slowly calms down on its own, so Sabar never gets stuck at zero. */
export const SABAR_REGEN_BELOW = 30;
export const SABAR_REGEN = 4;
/** A report card lands every this many months (yearly). */
export const QUARTER_MONTHS = 12;
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
  /** Sabar every Posyandu level adds to an AI RT's modelled Sabar. */
  sabarPerPosyandu: 3,
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

/** Jalan Setapak wears out. Cracked paths are not road, so buildings past them lose access until fixed. */
export const PATH_DECAY = {
  /** No cracks in year 1. */
  safeMonths: 12,
  /** Chance a working path cracks in a month. About one crack every 8 months on a 30-tile network. */
  crackChance: 0.004,
  /** A damaged stretch left alone this many months grows once. */
  spreadEvery: 6,
  /** Each growth adds this share of the stretch's size, and always at least one tile. */
  spreadRate: 0.1,
  /** Months unrepaired before a crack turns into potholes. Looks only. */
  potholeAfter: 6,
  /** Rupiah to fix one tile, before inflation. */
  repairPerTile: 150_000,
  /** Orang Dalam to have a whole stretch fixed through a connection. */
  favour: 1,
};

/** Most extra income decorations can add to one building, however many stand nearby. */
export const DECOR_CAP = 0.6;

/** Most tukang that speed up construction. Each one adds a quarter more progress a month. */
export const TUKANG_MAX = 3;
