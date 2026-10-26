// Core simulation types. Nothing in src/sim may touch the DOM.

export type ResourceId = 'rupiah' | 'sabar' | 'orangDalam' | 'viral';
export type Resources = Record<ResourceId, number>;

export type JobId = 'none' | 'pns' | 'ojol' | 'influencer' | 'buzzer';

export interface Requirement {
  population?: number;
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
  /** Month of the last thing the player saw as new. Drives the pacing director. */
  lastNovelty: number;
  stats: { earned: number; spent: number; arrived: number; left: number };
}

export type SimEffect =
  | { kind: 'pop'; x: number; y: number; res: ResourceId; amount: number }
  | { kind: 'notice'; title: string; body: string; tone: 'good' | 'bad' | 'info'; fanfare?: boolean; x?: number; y?: number }
  | { kind: 'event'; eventId: string }
  | { kind: 'built'; uid: number };

export type CheckResult = { ok: true } | { ok: false; missing: string[] };

export const GRID_W = 9;
export const GRID_H = 13;
