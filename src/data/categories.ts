import type { BuildCategory, BuildingDef } from '../sim/types';

/** Order of the tabs on the Build screen. */
export const CATEGORIES: BuildCategory[] = ['housing', 'shops', 'facilities', 'farm', 'decoration', 'paths'];

/** Tabs for buildings that do not set `category` themselves. New content sets the field on the def instead. */
const BY_ID: Record<string, BuildCategory> = {
  rumah: 'housing',
  kosan: 'housing',
  warung: 'shops',
  indomaret: 'shops',
  alfamart: 'shops',
  pasar: 'shops',
  taman: 'decoration',
  sawahIrigasi: 'farm',
  embung: 'farm',
  jalan: 'paths',
  selokan: 'paths',
  aspalUlang: 'paths',
};

export const categoryOf = (d: BuildingDef): BuildCategory => d.category ?? BY_ID[d.id] ?? 'facilities';
