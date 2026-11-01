import type { BuildCategory, BuildingDef } from '../sim/types';

/** Order of the tabs on the Build screen. */
export const CATEGORIES: BuildCategory[] = ['housing', 'shops', 'facilities', 'decoration'];

/** Tabs for buildings that do not set `category` themselves. New content sets the field on the def instead. */
const BY_ID: Record<string, BuildCategory> = {
  rumah: 'housing',
  kosan: 'housing',
  warung: 'shops',
  indomaret: 'shops',
  alfamart: 'shops',
  pasar: 'shops',
  taman: 'decoration',
  jalan: 'paths',
  selokan: 'paths',
  aspalUlang: 'paths',
};

const FOLD: Partial<Record<BuildCategory, BuildCategory>> = { farm: 'facilities', paths: 'decoration' };

/** The tab a building shows under. Farm folds into facilities and paths into decor, so the menu stays at four tabs. */
export const categoryOf = (d: BuildingDef): BuildCategory => {
  const c = d.category ?? BY_ID[d.id] ?? 'facilities';
  return FOLD[c] ?? c;
};
