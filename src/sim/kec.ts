// The Kecamatan stage (GAME-DESIGN.md, docs/plans/kecamatan-slice.md). The player's Kelurahan is the live tile map.
// The other three Kelurahan are modelled, not simulated: each has stars, a pinjol share and an Aman value.
// Pinjol and judol rules (src/sim/pinjol.ts) and the responses land in later tasks; this file holds the state and the goal checks.
import { RAZIA } from '../data/higher/kecamatan';
import { t } from '../i18n';
import { gain, type Fx } from './gain';
import { householdGroups, households, meters } from './needs';
import { pinjolShare } from './pinjol';
import { isWorking } from './state';
import type { CheckResult, District, GameState, KecState, Resident, RtTrait, Stars } from './types';

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

// ---------------------------------------------------------------- razia

/** Households in a list, longest debt first, for the razia to move. */
const heaviest = (groups: Resident[][], has: (r: Resident) => boolean, weight: (g: Resident[]) => number): Resident[][] =>
  groups.filter((g) => g.some(has)).sort((a, b) => weight(b) - weight(a));

export function checkRazia(s: GameState): CheckResult {
  if (s.stage.current !== 'kecamatan' || !s.kec) return { ok: false, missing: [t('razia.needStage')] };
  const missing: string[] = [];
  if (!s.buildings.some((b) => b.def === 'posSatpol' && isWorking(b))) missing.push(t('razia.needPos'));
  if (s.kec.razia && s.kec.razia.until > s.month) missing.push(t('razia.running'));
  if (s.res.orangDalam < RAZIA.orangDalam) missing.push(t('razia.needOd', { n: RAZIA.orangDalam }));
  return missing.length ? { ok: false, missing } : { ok: true };
}

/**
 * Razia Satpol PP: Aman up for a few weeks, Popularitas down, and half the households in debt or on judol move to the
 * next Kelurahan. The problem is not solved. It is somewhere else, which is the joke.
 */
export function startRazia(s: GameState, fx: Fx): CheckResult {
  const check = checkRazia(s);
  if (!check.ok) return check;
  const kec = s.kec!;
  const groups = householdGroups(s);
  let moved = 0;
  for (const [has, clear, weight] of [
    [(r: Resident) => r.debt !== undefined, (r: Resident) => delete r.debt, (g: Resident[]) => Math.max(...g.map((r) => r.debt ?? 0))],
    [(r: Resident) => !!r.judol, (r: Resident) => delete r.judol, () => 0],
  ] as const) {
    const list = heaviest(groups, has, weight);
    const n = Math.floor(list.length * RAZIA.moveShare);
    for (const g of list.slice(0, n)) for (const r of g) clear(r);
    moved += n;
  }
  // The cases land in the three modelled Kelurahan, in turn.
  const hh = Math.max(1, households(s));
  kec.districts.forEach((d, i) => {
    const share = Math.floor(moved / 3) + (i < moved % 3 ? 1 : 0);
    d.pinjol = Math.min(100, d.pinjol + (share * 100) / hh);
  });
  s.res.orangDalam -= RAZIA.orangDalam;
  gain(s, fx, 'sabar', RAZIA.sabar);
  kec.razia = { until: s.month + RAZIA.weeks };
  kec.lastRazia = s.month;
  kec.pinjol = pinjolShare(s);
  fx.push({ kind: 'notice', title: t('razia.title'), body: t('razia.body', { n: moved, aman: RAZIA.aman, weeks: RAZIA.weeks }), tone: 'info' });
  return check;
}
