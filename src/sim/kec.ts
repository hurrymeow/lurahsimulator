// The Kecamatan stage (GAME-DESIGN.md, docs/plans/kecamatan-slice.md). The player's Kelurahan is the live tile map.
// The other three Kelurahan are modelled, not simulated: each has stars, a pinjol share and an Aman value.
// Pinjol and judol rules (src/sim/pinjol.ts) and the responses land in later tasks; this file holds the state and the goal checks.
import { meters } from './needs';
import type { District, GameState, KecState, RtTrait, Stars } from './types';

export const DISTRICT_IDS: District['id'][] = ['mawar', 'melati', 'kenanga'];

/** Weeks of progress a district needs for its 1st, 2nd and 3rd star. First pass: the balance bots tune it. */
export const DISTRICT_STAR_WEEKS: readonly number[] = [90, 200, 340];
/** Progress a week by trait. Rajin is quick, Jarang slow. */
export const DISTRICT_PACE: Record<RtTrait, number> = { rajin: 1.2, hobi: 1, jarang: 0.8 };
/** Where a district starts, by trait: share of households in debt. */
const START_PINJOL: Record<RtTrait, number> = { rajin: 15, hobi: 20, jarang: 30 };
/** Modelled Aman of a district: a base plus a step for each star. */
export const DISTRICT_AMAN = { base: 55, perStar: 5 } as const;
/** Aman across the Kecamatan the 2-star line counts weeks at. */
export const AMAN_RUN_MIN = 60;

const TRAITS: RtTrait[] = ['rajin', 'hobi', 'jarang'];

/** The three modelled Kelurahan on promotion. Traits rotate with the seed, so the sim reads no random numbers here. */
export function newKec(s: GameState): KecState {
  const turn = s.seed % TRAITS.length;
  return {
    districts: DISTRICT_IDS.map((id, i) => {
      const trait = TRAITS[(i + turn) % TRAITS.length];
      return { id, trait, progress: 0, stars: 0, pinjol: START_PINJOL[trait], aman: DISTRICT_AMAN.base };
    }),
    pinjol: 0,
    amanRun: 0,
    since: s.month,
  };
}

/** Stars of every Kelurahan in the Kecamatan: the player's own first. */
export const kelStars = (s: GameState): number[] => [s.stage.stars.kelurahan, ...(s.kec?.districts ?? []).map((d) => d.stars)];

/** Aman across the Kecamatan: the mean of the player's Kelurahan and the three modelled ones. */
export function amanAcross(s: GameState): number {
  const all = [meters(s).aman, ...(s.kec?.districts ?? []).map((d) => d.aman)];
  return Math.round(all.reduce((a, b) => a + b, 0) / all.length);
}

/** Weeks since the last razia, or since promotion if there has been none. */
export const weeksSinceRazia = (s: GameState): number => (s.kec ? s.month - (s.kec.lastRazia ?? s.kec.since) : 0);

/** Weekly: each district makes progress and earns stars (they never drop), and the Aman run counts. */
export function kecSystem(s: GameState): void {
  const kec = s.kec;
  if (!kec || s.stage.current !== 'kecamatan') return;
  for (const d of kec.districts) {
    d.progress += DISTRICT_PACE[d.trait];
    for (let next = d.stars; next < 3 && d.progress >= DISTRICT_STAR_WEEKS[next]; next++) d.stars = (next + 1) as Stars;
    d.aman = DISTRICT_AMAN.base + DISTRICT_AMAN.perStar * d.stars;
  }
  kec.amanRun = amanAcross(s) >= AMAN_RUN_MIN ? kec.amanRun + 1 : 0;
}
