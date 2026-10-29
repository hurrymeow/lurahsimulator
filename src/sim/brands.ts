// Brands and names on buildings. A chain carries a brand that drives a price war (wifi) or a franchise
// bonus (rumah makan, apotek, bengkel, barbershop). Two of the same minimarket close together eat each
// other's customers. Any building can be renamed; a name never changes the brand.
import { BRANDS, FRANCHISE, KANIBAL, LOCAL_NAMES, MINIMARKETS, NAME_MAX } from '../data/brands';
import { NAMES } from '../data/names';
import { bName } from '../i18n';
import { def } from './content';
import { isWorking, withinEdges } from './state';
import type { Building, GameState } from './types';

/** A stable 0..n-1 pick from a building's uid, so old saves get a brand without touching the shared RNG. */
const pickBy = (uid: number, salt: number, n: number): number => {
  let h = Math.imul(uid ^ (salt * 0x9e3779b1), 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return (h >>> 0) % n;
};

export const hasBrand = (id: string): boolean => !!BRANDS[id];
export const brandKind = (id: string) => BRANDS[id]?.kind;
export const brandNames = (id: string): string[] => BRANDS[id]?.names ?? [];

/** The brand a chain building carries, or null for anything else. */
export function brandOf(b: Building): string | null {
  const set = BRANDS[b.def];
  if (!set) return null;
  return b.brand && set.names.includes(b.brand) ? b.brand : set.names[pickBy(b.uid, 1, set.names.length)];
}

/** The name shown in the inspector: the player's, the brand, a local name, or the building's own. */
export function displayName(b: Building): string {
  if (b.name) return b.name;
  const brand = brandOf(b);
  if (brand) return brand;
  const local = LOCAL_NAMES[b.def];
  if (local) return local[pickBy(b.uid, 2, local.length)].replace('{name}', NAMES[pickBy(b.uid, 3, NAMES.length)]);
  return bName(def(b.def));
}

/** True when the building has a name of its own worth showing beside its type. */
export const hasOwnName = (b: Building): boolean => !!(b.name || BRANDS[b.def] || LOCAL_NAMES[b.def]);

/** Gives a building a new name. Blank goes back to the default. Returns the name kept. */
export function rename(b: Building, name: string): string {
  const clean = name.replace(/\s+/g, ' ').trim().slice(0, NAME_MAX);
  if (clean) b.name = clean;
  else delete b.name;
  return displayName(b);
}

/** Switches a chain building to the next brand in its list. */
export function nextBrand(b: Building): string | null {
  const set = BRANDS[b.def];
  if (!set) return null;
  const now = brandOf(b)!;
  b.brand = set.names[(set.names.indexOf(now) + 1) % set.names.length];
  return b.brand;
}

/** Other working outlets of the same franchise brand anywhere in the area. */
export function sisterOutlets(s: GameState, b: Building): number {
  if (brandKind(b.def) !== 'franchise') return 0;
  const brand = brandOf(b);
  return s.buildings.filter((o) => o !== b && o.def === b.def && isWorking(o) && brandOf(o) === brand).length;
}

/** True when another of the same minimarket stands within reach and eats this one's customers. */
export function kanibal(s: GameState, b: Building): boolean {
  if (!MINIMARKETS.includes(b.def)) return false;
  return s.buildings.some((o) => o !== b && o.def === b.def && isWorking(o) && withinEdges(o, b, KANIBAL.radius));
}

/** Income multiplier from brands: a franchise's sister outlets, or a minimarket eating its twin. */
export function brandMult(s: GameState, b: Building): number {
  let m = 1;
  const k = sisterOutlets(s, b);
  if (k) m *= 1 + Math.min(FRANCHISE.max, FRANCHISE.perOutlet * k);
  if (kanibal(s, b)) m *= KANIBAL.mult;
  return m;
}

/** The share of a franchise outlet's income that goes up the chain. Only outlets with a sister pay it. */
export const royaltyRate = (s: GameState, b: Building): number => (sisterOutlets(s, b) ? FRANCHISE.royalty : 0);
