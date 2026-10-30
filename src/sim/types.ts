import type { ChannelId, RoleId, TraitId } from '../data/staff';
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
  /** Set true once the map and engine can run this stage. The SK cannot be accepted into a stage that is not playable. */
  playable?: boolean;
  /** The stage the SK at 3 stars promotes to. */
  next?: StageId;
  stars: [StarDef, StarDef, StarDef];
}

export interface StageState {
  current: StageId;
  /** Chosen at the Kelurahan promotion. */
  path?: 'kelurahan' | 'desa';
  /** Stars per stage. They only ever go up. */
  stars: Record<StageId, Stars>;
  /** The SK at 3 stars. Absent until it arrives. Declining keeps the player in the stage. */
  sk?: 'offered' | 'declined';
}

export interface Stempel {
  /** Stamps in hand. */
  stock: number;
  /** Surat Pengantar waiting for a stamp. */
  backlog: number;
  /** Months in a row with the backlog under the star goal's limit. */
  clear: number;
}

/** State only the RW stage uses. Timed effects carry the month they end. */
export interface RwState {
  /** Share of a Kader's output lost since the last Apresiasi, 0 to 0.8. */
  kaderDecay: number;
  /** Surat Pengantar multiplier from Musim Pindahan. */
  letterMult?: { mult: number; until: number };
  /** Population the player reported to Pusat, as a percent over the true count. */
  popReport?: { pct: number; until: number };
}

/** State only the Kelurahan or Desa stage uses. */
export interface KelState {
  /** The year's Anggaran. 0 until the first one arrives. */
  budget: number;
  /** stats.spent when this year's budget arrived. */
  spentBase: number;
  /** Months in a row with serapan at or above the target. */
  serapanRun: number;
  /** Tim Audit visits that found every receipt. */
  cleanAudits: number;
  /** Lomba Kelurahan: paint spending lifts the area score until this month. */
  lomba?: { mult: number; until: number };
}

export type RtTrait = 'rajin' | 'hobi' | 'jarang';

/** An AI-run RT. Its buildings sit apart from the player's so the player's income, combos and ranking never see them. */
export interface Neighbour {
  /** Which RT cell of the map it holds, counted in RTs from the player's at (0,0). Stable as the map grows. */
  cx: number;
  cy: number;
  trait: RtTrait;
  buildings: Building[];
  pop: number;
  stars: Stars;
  /** Builds paid for and not yet done. It builds only while this is above 0. */
  funded: number;
  /** Funded at least once, for the RW's first star. */
  everFunded: boolean;
  lastBuild: number;
  /** Builds attempted, for Hobi Wacana's skipped turns. */
  turns: number;
  /** Progress toward the next build, 0 to 1. Grows faster with more Dana banked. Missing in old saves. */
  progress?: number;
  /** Auto-dana: tops the bank back up to this many builds each month. 0 or missing is off. */
  autoKeep?: number;
  /** Auto-dana level while the player runs the RT, restored on hand-back. */
  autoBefore?: number;
  /** Its buildings have been linked by Jalan Setapak. Missing in saves from before AI paths. */
  pathsLaid?: boolean;
  /** 'player' when the player took this RT over: its buildings sit in the player's own list. Missing is AI-run. */
  run?: 'player';
  discovered: string[];
  ranking: RankingResult[];
}

export type JobId = 'none' | 'pns' | 'ojol' | 'influencer' | 'buzzer' | 'petani' | 'peternak' | 'pengepul' | 'guru' | 'satpam' | 'tukang' | 'panitia' | 'kaderPosyandu' | 'calo' | 'honorer' | 'pendampingDesa';

/** Trouble that has shown up at least once. Some buildings open only when their problem appears. */
export type ProblemId = 'banjir' | 'jobless' | 'permitQueue' | 'preman';

export interface PlayerInfo {
  title: 'Pak' | 'Bu';
  name: string;
  kampung: string;
}

/** What is true for the warga: fed, in work, safe. Sejahtera is their average. */
/** The Lomba Agustusan being prepared or just held. */
export interface LombaState {
  /** Game year (month / 12) it belongs to. */
  year: number;
  /** Contest ids picked, paid for already. */
  contests: string[];
  /** Index into the stage list; 0 is none. */
  stage: number;
  /** The staff member running it. */
  ketua?: number;
  /** 17 Agustus has come: time stops until the player plays the day. */
  due?: boolean;
  held?: boolean;
  result?: { wins: string[]; viral: number; sabar: number; rupiah: number; ricuh: boolean; trophy: boolean; inem: boolean };
}

export interface Meters {
  perut: number;
  kerja: number;
  aman: number;
}

export interface StaffStats {
  rajin: number;
  lobi: number;
  jujur: number;
  gaul: number;
}

export interface Applicant {
  id: number;
  name: string;
  stars: number;
  stats: StaffStats;
  trait?: TraitId;
  special?: string;
  salary: number;
  /** A warga who applied through the Grup WA. */
  fromResident?: number;
}

export interface Staff extends Applicant {
  role: RoleId;
  /** Inem: staff number 1, never leaves. */
  inem?: boolean;
  /** Months worked, after trait speed. */
  xp: number;
  level: number;
  hiredAt: number;
  /** Months away (Bimtek, healing). Away staff do nothing. */
  away?: number;
  /** Asked for a raise at the last level up and not answered yet. */
  raiseAsked?: boolean;
  /** A raise was refused: Kampung Sebelah may poach them. */
  refused?: boolean;
  /** Month of the last raise, for Rajin Lembur. */
  lastRaise?: number;
}

export interface Lowongan {
  role: RoleId;
  channel: ChannelId;
  /** Which requirement line the posting shows. */
  req: number;
  postedAt: number;
  arriveAt: number;
  applicants: Applicant[];
}

export interface RealisasiState {
  id: string;
  /** Month the program starts to work. */
  landsAt: number;
  /** Month it stops working. Infinity for a lasting one. */
  endsAt: number;
}

export interface Requirement {
  /** Opens once this problem has shown up in the kampung, so the fix arrives with the trouble. */
  problem?: ProblemId;
  /** Opens once the player has reached this stage. */
  stage?: StageId;
  population?: number;
  /** Needs at least this many stars in a stage. */
  stars?: { stage: StageId; n: number };
  buildings?: string[];
  year?: number;
}

export type BuildCategory = 'housing' | 'shops' | 'facilities' | 'farm' | 'decoration' | 'paths';

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
  /** Beds at each level, from level 1, when a level adds beds. Defaults to `housing` at every level. */
  housingLevels?: number[];
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
  /** Which lots it may stand on. RT buildings go inside an RT, RW buildings on RW seams. Defaults to 'rt'. */
  scope?: 'rt' | 'rw' | 'kel';
  /**
   * Tiles it covers from its top corner. A number is a square (2 is 2x2); [w, h] is w tiles along the map's
   * x axis and h along its y axis, before any turn. Turning swaps them. Defaults to 1.
   */
  footprint?: number | [number, number];
  /** Which Build tab it sits under. Defaults to 'facilities'. */
  category?: BuildCategory;
  /** Free tile that never works on its own. Buildings beside it earn this fraction more income. Tune it here. */
  pathIncome?: number;
  /** Decoration aura: each working one within `radius` tiles adds `bonus` (a fraction) to every income building's income. The total is capped by DECOR_CAP. */
  boost?: { radius: number; bonus: number };
  /** Orang Dalam spent when it is placed, on top of the rupiah. A shortcut through the paperwork. */
  orangDalamCost?: number;
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
  /** 1 is turned: drawn mirrored, and a non-square footprint swaps its sides. Free to turn. */
  rot?: 0 | 1;
  /** Square size kept from a save made before this building grew, when the bigger footprint did not fit. Moving it drops this. */
  small?: number;
  /** A restarted project never freezes again. */
  restarted?: boolean;
  /** Chain brand (wifi, rumah makan, apotek, bengkel, barbershop). Absent in old saves: picked from the uid. */
  brand?: string;
  /** Name the player gave it. Absent means the brand, a local name, or the building's own name. */
  name?: string;
  /** No path links it to the Kantor RT, so it earns and attracts nothing. Set by refreshAccess. */
  noRoad?: boolean;
  /** Jalan Setapak only: the month it cracked. Neglect counts from here. */
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
  /** Months spent employed. Level comes from this (see levelFor in data/jobs.ts). Absent in older saves. */
  xp?: number;
  /** Months in a row with no job. Long idleness is the jobless problem, and can make a preman. */
  idle?: number;
  /** Idle too long while the kampung felt unsafe. Takes uang keamanan from a shop until given a job. */
  preman?: boolean;
  /** Hired onto the staff: counts as in work, never picks a job of their own. */
  staffId?: number;
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
  /** Which rival it beat or lost to. Absent in old saves, which means the RT's. */
  tier?: StageId;
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
  /** True once old saves have had their paths laid. */
  roadsLaid?: boolean;
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
  /** Only on an AI RT's view: the most combos any RT has found, which the combos star goal counts for every RT. */
  comboShare?: number;
  unlocked: string[];
  /** Problems that have shown up at least once, for the buildings they open. */
  problems?: ProblemId[];
  /** Who the player is and what their first kampung is called. Absent in old saves: the defaults. */
  player?: PlayerInfo;
  /** Perut, Kerja and Aman, 0 to 100, as of the last month. Absent until the first month passes. */
  meters?: Meters;
  /** Programs actually carried out (Realisasi), each with the month it lands and the month it ends. */
  realisasi?: RealisasiState[];
  /** The staff the player manages, Inem first. Absent in old saves until loaded. */
  staff?: Staff[];
  nextStaffId?: number;
  /** The open job posting, if any. */
  lowongan?: Lowongan | null;
  /** Inem's gigs done, by id. */
  gigs?: string[];
  wacana: WacanaState[];
  modifiers: Modifier[];
  ranking: RankingResult[];
  /** Indonesia Emas 2045 progress, in percent. */
  emas: number;
  /** Event waiting for a player choice. */
  pendingEvent: string | null;
  /** Month each event last fired, for cooldowns. Absent in older saves. */
  lastEvent?: Record<string, number>;
  /** Ids of the last minor log lines shown, so the ticker does not repeat itself. Absent in older saves. */
  recentLines?: string[];
  stage: StageState;
  /** AI-run RTs next to the player's. Empty at the RT stage. */
  neighbours: Neighbour[];
  /** Stempel for the RW's Surat Pengantar. Unused before the RW stage. */
  stempel: Stempel;
  /** Months in a row with the kas at or above zero. */
  debtFree: number;
  /** RW stage state. Absent in older saves. */
  rw: RwState;
  /** Kelurahan stage state. Absent in older saves. */
  kel: KelState;
  /** Month of the last thing the player saw as new. Drives the pacing director. */
  lastNovelty: number;
  /** This year's Lomba Agustusan, from the panitia's card in May to the day. Missing until the first one. */
  lomba?: LombaState;
  /** The month the 17 Agustus trophy leaves the Kantor RT. */
  pialaUntil?: number;
  /** The three needs meters at the end of last month, for the 2045-drop toast. Missing in older saves. */
  lastMeters?: Meters;
  /** One-time warnings already shown in this game, such as 'sabar'. */
  warned?: string[];
  /** Cleared tukang parkir due back at their shop: shop uid and month. Missing in older saves. */
  parkirBack?: { shop: number; at: number }[];
  /** Saved after the Oct 30 building sizes: grown buildings were fitted or kept small on load. */
  sized?: boolean;
  /** Saved after the ladder pass: buildings that grew then (the Kontrakan) were fitted or kept small on load. */
  laddered?: boolean;
  /** Saved with RT cells SEAM tiles apart. Older RW and Kelurahan saves had the seams on each RT's edge rows. */
  gapped?: boolean;
  /** A tukang parkir has turned up at least once. The first shop always draws one. */
  parkirSeen?: boolean;
  /** Month a resident last moved in. Drives the perantau safety valve. */
  lastArrival?: number;
  /** Kecamatan inspections. Absent in older saves. */
  /** theme: the inspection warned of. last: the one that visited last, so the next team differs. */
  inspection?: { warnAt: number; visitAt?: number; prep: number; theme?: string; last?: string };
  /** Quarterly report bookkeeping. Absent in older saves and on a fresh game. */
  quarter?: QuarterTrack;
  stats: { earned: number; spent: number; arrived: number; left: number };
  /** Milestones already celebrated. Absent in older saves. */
  firsts?: FirstKind[];
}

export type FirstKind = 'house' | 'resident' | 'star';

export type SimEffect =
  | { kind: 'pop'; x: number; y: number; res: ResourceId; amount: number }
  | { kind: 'notice'; title: string; body: string; tone: 'good' | 'bad' | 'info'; fanfare?: boolean; x?: number; y?: number; inem?: boolean; card?: boolean; open?: string; pics?: { def: string; level: number }[] }
  | { kind: 'job'; x: number; y: number; name: string; job: Exclude<JobId, 'none'> }
  | { kind: 'level'; x: number; y: number; name: string; level: number }
  | { kind: 'event'; eventId: string }
  | { kind: 'built'; uid: number }
  | { kind: 'first'; what: FirstKind; x?: number; y?: number }
  | { kind: 'report'; report: QuarterReport };

export type CheckResult = { ok: true } | { ok: false; missing: string[] };

/** One RT. A RW is 2x2 RTs and a Kelurahan is 2x2 RWs, so the map only ever grows outwards from tile (0,0). */
export const RT_W = 13;
export const RT_H = 17;
/** Current map size in tiles. Live bindings: setGrid changes them for every importer. */
export let GRID_W = RT_W;
export let GRID_H = RT_H;

/** RTs along each side of the map at a stage. */
export const STAGE_SPAN: Record<StageId, number> = { rt: 1, rw: 2, kelurahan: 4 };

/** Tiles of dirt road between two RT cells. The bands sit between cells, so every RT keeps its full size. */
export const SEAM = 2;
/** Distance from one RT cell's first tile to the next one's: the RT plus the seam after it. */
export const CELL_W = RT_W + SEAM;
export const CELL_H = RT_H + SEAM;

export function setGrid(stage: StageId): void {
  GRID_W = RT_W * STAGE_SPAN[stage] + SEAM * (STAGE_SPAN[stage] - 1);
  GRID_H = RT_H * STAGE_SPAN[stage] + SEAM * (STAGE_SPAN[stage] - 1);
}

/** RT cells along each side of the current map. */
export const mapSpan = (): number => (GRID_W + SEAM) / CELL_W;
/** Grid size before the map was expanded (save v1). Old saves are centred in the new grid. */
export const OLD_GRID_W = 9;
export const OLD_GRID_H = 13;
