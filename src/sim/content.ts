import { BUILDINGS } from '../data/buildings';
import { STAGE_BUILDINGS } from '../data/higher';
import type { StageBuildingDef } from '../data/higher';
import type { BuildingDef } from './types';

/** RW buildings go on RW seam lots and Kelurahan ones on Kelurahan lots, two tiles to a side. */
const staged = (d: StageBuildingDef): StageBuildingDef => ({ ...d, scope: d.scope ?? (d.gate.stage === 'rw' ? 'rw' : 'kel'), footprint: d.footprint ?? (d.gate.stage === 'rw' ? 1 : 2) });

const ALL: BuildingDef[] = [...BUILDINGS, ...STAGE_BUILDINGS.map(staged)];
const byId = new Map(ALL.map((b) => [b.id, b]));

/** The gate of a building that belongs to a later stage, if it has one. */
export const gateOf = (d: BuildingDef) => (d as Partial<StageBuildingDef>).gate;

/** The RW and Kelurahan effects a building carries, if any. */
export const stageFx = (d: BuildingDef) => (d as Partial<StageBuildingDef>).fx;

/** Every building def, for lookups that cross stages. */
export const allDefs = (): BuildingDef[] => ALL;

export function def(id: string): BuildingDef {
  const d = byId.get(id);
  if (!d) throw new Error(`Unknown building ${id}`);
  return d;
}

/** Tiles on each side of a building's footprint. Unknown ids count as 1. */
export const footprintFor = (id: string): number => byId.get(id)?.footprint ?? 1;

export function hasDef(id: string): boolean {
  return byId.has(id);
}

export const placeableDefs = (): BuildingDef[] => ALL.filter((b) => b.placeable);

/** Tiles that are ground cover, not places: paths, biopori and decorations. They never flood and never count as a building for the ranking. */
export const isCover = (d: BuildingDef): boolean => !!(d.pathIncome || d.boost);
