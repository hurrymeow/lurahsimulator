import type { BuildingDef, Resources, StageId, Stars } from '../../sim/types';
import type { ComboDef } from '../combos';
import type { EventChoice, EventDef } from '../events';

// Content for the RW and Kelurahan/Desa stages (see GAME-DESIGN.md). Nothing here is read by the
// engine yet. Every item carries a `gate`, so it stays invisible until the stage engine lands.

/** Which way the player went at the Kelurahan promotion. */
export type Path = 'kelurahan' | 'desa';

/** Content shows once the player holds at least `stars` in `stage`, and (if set) took that `path`. */
export interface Gate {
  stage: Exclude<StageId, 'rt'>;
  stars: Stars;
  path?: Path;
}

/** New resources and meters. The engine owns their rules. The numbers live in rules.ts. */
export interface MeterDef {
  id: 'stempel' | 'dana' | 'anggaran';
  name: string;
  blurb: string;
  gate: Gate;
}

/** Number-moving effects that BuildingDef cannot say. The engine reads only the fields it knows. */
export interface StageEffects {
  /** Idle warga retrained each week while it stands (Balai Latihan Kerja). */
  retrain?: number;
  /** Aman added while it stands (Pos Satpol PP). */
  aman?: number;
  /** Stempel gained a month. */
  stempel?: number;
  /** Resource change a month for every neighbouring RT. */
  neighbourRt?: Partial<Resources>;
  /** Multiplier on ojol income while it stands. */
  ojolIncomeMult?: number;
  /** Income x`mult` one month in every `every`. */
  burst?: { every: number; mult: number };
  /** Spawn free-standing buildings (tukang parkir) when it opens. */
  spawns?: { def: string; count: number };
  /** Resource gain in a calendar month only, and Rupiah owed in that month. 0 = January. */
  seasonal?: { month: number; res: Partial<Resources>; cost: number };
  /** Cut to banjir damage, on top of biopori. The 80% cap stays. */
  banjirCut?: number;
  /** Counts as budget spent with no effect on the map. */
  countsAsSpent?: boolean;
  /** PNS desk slots added, per level. */
  pnsSlots?: number;
  /** Pays out a one-off. Used by Studi Banding. */
  randomWacana?: boolean;
}

export type StageBuildingDef = BuildingDef & { gate: Gate; fx?: StageEffects };

export type StageComboDef = ComboDef & {
  gate: Gate;
  /** Job that must be employed somewhere in the area, besides the buildings. */
  needsJob?: string;
  /** Rule the engine checks instead of building positions. */
  rule?: 'sameTraitNeighbours';
  /** Rupiah change a month, for upkeep that combos add. */
  upkeepMult?: Record<string, number>;
};

export interface StageJobDef {
  id: string;
  name: string;
  blurb: string;
  gate: Gate;
  /** Job slots come from these buildings. */
  perMonth: Partial<Resources>;
  /** Money in, Stempel or Orang Dalam out. */
  converts?: { rupiah: number; stempel?: number; orangDalam?: number };
  /** Chance a month that a scandal hits, and its Sabar cost. */
  scandal?: { chance: number; sabar: number };
  /** Output falls this fraction a year unless the Apresiasi is paid. */
  decay?: { perYear: number; apresiasi: number };
  /** Honorer: pay as a share of PNS, and the weekly chance of promotion after `afterWeeks`. */
  pay?: number;
  promote?: { afterWeeks: number; chancePerWeek: number };
}

export type StageEventChoice = EventChoice & {
  /** Engine hooks for effects that move something other than the four resources. */
  fx?: Record<string, number>;
};

export type StageEventDef = Omit<EventDef, 'choices'> & { gate: Gate; choices: StageEventChoice[] };
