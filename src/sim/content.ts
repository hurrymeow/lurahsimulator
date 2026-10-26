import { BUILDINGS } from '../data/buildings';
import type { BuildingDef } from './types';

const byId = new Map(BUILDINGS.map((b) => [b.id, b]));

export function def(id: string): BuildingDef {
  const d = byId.get(id);
  if (!d) throw new Error(`Unknown building ${id}`);
  return d;
}

export function hasDef(id: string): boolean {
  return byId.has(id);
}

export const placeableDefs = (): BuildingDef[] => BUILDINGS.filter((b) => b.placeable);
