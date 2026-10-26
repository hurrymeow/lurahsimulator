// Core simulation types. Nothing in src/sim may touch the DOM.

export type ResourceId = 'rupiah' | 'sabar' | 'orangDalam' | 'viral';
export type Resources = Record<ResourceId, number>;

export type StageId = 'rt' | 'rw' | 'kelurahan';
export type Stars = 0 | 1 | 2 | 3;

/**
 * One line of a star checklist. To add a kind: add it here, add a check in
 * GOAL_CHECKS (sim/stages.ts) and a line in the i18n files. The compiler lists the gaps.
 */
export type Goal =
  | { kind: 'residents'; n: number }
  | { kind: 'combos'; n: number }
  /** Total yearly ranking wins. */
  | { kind: 'rankWins'; n: number }
  /** Ranking wins in a row, counting back from the latest year. */
  | { kind: 'winStreak'; n: number }
  | { kind: 'sabar'; n: number }
  // RW and Kelurahan kinds. Their checks wait for the stage engine (see GOAL_CHECKS).
  /** Neighbouring RTs funded at least once. */
  | { kind: 'fundedRts'; n: number }
  /** Months in a row with the Stempel backlog under `under`. */
  | { kind: 'stempelClear'; n: number; under: number }
  /** RTs holding at least `stars`. AI RTs count. */
  | { kind: 'rtsAtStars'; n: number; stars: Stars }
  /** RWs holding at least `stars`. AI RWs count. */
  | { kind: 'rwsAtStars'; n: number; stars: Stars }
  /** Combos found that belong to the RW stage. */
  | { kind: 'rwCombos'; n: number }
  /** Ranking wins against the rival of this tier: RW Sebelah, or the Piala Kelurahan. */
  | { kind: 'tierWins'; n: number; tier: 'rw' | 'kelurahan' }
  /** Months in a row with no RT in debt. */
  | { kind: 'noDebtMonths'; n: number }
  /** Months in a row with serapan at or above `pct` percent. */
  | { kind: 'serapanMonths'; n: number; pct: number }
  | { kind: 'cleanAudits'; n: number };

/** What it takes to earn star number `index + 1`, and what that star gives. */
export interface StarDef {
  goals: Goal[];
  /** Building def ids that open when this star is earned. */
  unlocks: string[];
  reward?: Partial<Resources>;
}

export interface StageDef {
  id: StageId;
  /** Title shown in the Menu header, one per star count (0 to 3 stars). */
  titles: [string, string, string, string];
  /** The stage the SK at 3 stars promotes to. */
  next?: StageId;
  stars: [StarDef, StarDef, StarDef];
}

export interface StageState {
  current: StageId;
  /** Stars per stage. They only ever go up. */
  stars: Record<StageId, Stars>;
  /** The SK at 3 stars. Absent until it arrives. Declining keeps the player in the stage. */
  sk?: 'offered' | 'declined';
}

export type JobId = 'none' | 'pns' | 'ojol' | 'influencer' | 'buzzer';

export interface Requirement {
  population?: number;
  /** Needs at least this many stars in a stage. */
  stars?: { stage: StageId; n: number };
  buildings?: string[];
  year?: number;
}

export interface BuildingDef {
  id: string;
  name: string;
  /** What it does, in mechanic terms. */
  blurb: string;
  cost: number;
  upkeep: number;
  income: number;
  attract: number;
  housing?: number;
  perMonth?: Partial<Resources>;
  permitMonths: number;
  buildMonths: number;
  maxLevel: number;
  maxCount?: number;
  /** False for things that spawn on their own (rumah, tukang parkir). */
  placeable: boolean;
  removable: boolean;
  /** Why it cannot be removed, shown to the player. */
  removeBlockedReason?: string;
  requires?: Requirement;
  /** Stars needed in the current stage to reach a level. Keys are target levels. */
  upgradeStars?: Partial<Record<number, number>>;
  /** Shops attract a tukang parkir liar when they open. */
  shop?: boolean;
  /** Chance the project freezes at 80% when construction finishes. */
  mangkrakChance?: number;
  /** Job slots per level. */
  jobSlots?: Partial<Record<JobId, number>>;
  sprite: string;
}

export type BuildingStatus = 'permit' | 'building' | 'active' | 'mangkrak' | 'damaged';

export interface Building {
  uid: number;
  def: string;
  x: number;
  y: number;
  level: number;
  status: BuildingStatus;
  /** Months left in the current status (permit or building). */
  timer: number;
  /** Rupiah paid into it so far, for refunds and mangkrak restarts. */
  invested: number;
  /** Month it was placed. */
  placedAt: number;
  /** Uid of the shop a tukang parkir belongs to. */
  owner?: number;
  /** A restarted project never freezes again. */
  restarted?: boolean;
}

export interface Resident {
  id: number;
  name: string;
  job: JobId;
  /** PNS only. 0-100. */
  pensiun: number;
  /** Buzzer only: fake Viral this resident has pumped and not yet paid back. */
  fake: number;
  arrived: number;
  /** Player picked this job (or none) by hand, so residents stop choosing for themselves. */
  manual?: boolean;
}

export interface WacanaState {
  id: string;
  /** Current approval boost, decays monthly. */
  power: number;
  times: number;
  lastAnnounced: number;
}

export interface Modifier {
  id: string;
  label: string;
  /** Building def id it applies to, or '*' for all income. */
  target: string;
  incomeMult: number;
  monthsLeft: number;
}

export interface RankingResult {
  year: number;
  us: number;
  them: number;
  won: boolean;
}

export type Grade = 'S' | 'A' | 'B' | 'C' | 'D';

/** What the player sees every quarter. All numbers are changes over the 3 months. */
export interface QuarterReport {
  /** 1 for the first report, 2 for the next, and so on. */
  n: number;
  month: number;
  income: number;
  /** Null on the first report. */
  prevIncome: number | null;
  residents: number;
  residentsDelta: number;
  sabarDelta: number;
  orangDalamDelta: number;
  viralDelta: number;
  /** Building def with the highest net income this quarter, if any earned. */
  bestDef: string | null;
  grade: Grade;
  /** Reward for the grade, already added to the resources. */
  bonus: Partial<Resources>;
}

/** Running totals for the quarter in progress. */
export interface QuarterTrack {
  count: number;
  earned: number;
  residents: number;
  res: Resources;
  prevIncome: number | null;
  /** Net rupiah by building uid since the quarter began. */
  net: Record<number, number>;
}

export interface GameState {
  version: number;
  seed: number;
  rng: number;
  /** Months since start. Month 0 is January of year 1. */
  month: number;
  res: Resources;
  buildings: Building[];
  nextUid: number;
  residents: Resident[];
  nextResidentId: number;
  /** Cost multiplier. Grows a little every year. */
  inflation: number;
  discovered: string[];
  unlocked: string[];
  wacana: WacanaState[];
  modifiers: Modifier[];
  ranking: RankingResult[];
  /** Indonesia Emas 2045 progress, in percent. */
  emas: number;
  /** Event waiting for a player choice. */
  pendingEvent: string | null;
  /** Month each event last fired, for cooldowns. Absent in older saves. */
  lastEvent?: Record<string, number>;
  stage: StageState;
  /** Month of the last thing the player saw as new. Drives the pacing director. */
  lastNovelty: number;
  /** Quarterly report bookkeeping. Absent in older saves and on a fresh game. */
  quarter?: QuarterTrack;
  stats: { earned: number; spent: number; arrived: number; left: number };
}

export type SimEffect =
  | { kind: 'pop'; x: number; y: number; res: ResourceId; amount: number }
  | { kind: 'notice'; title: string; body: string; tone: 'good' | 'bad' | 'info'; fanfare?: boolean; x?: number; y?: number }
  | { kind: 'job'; x: number; y: number; name: string; job: Exclude<JobId, 'none'> }
  | { kind: 'event'; eventId: string }
  | { kind: 'built'; uid: number }
  | { kind: 'report'; report: QuarterReport };

export type CheckResult = { ok: true } | { ok: false; missing: string[] };

export const GRID_W = 9;
export const GRID_H = 13;
