// Lomba Agustusan: the big yearly event. Three months of prep, then a day of short mini-games.
// Names and blurbs live in i18n (lomba.c.<id>, lomba.stage.<id>). Costs are base prices; the engine applies inflation.

export type LombaGame = 'climb' | 'mash' | 'roll';

export interface ContestDef {
  id: string;
  /** climb: tap in the green band to climb the pole; mash: tap fast for a few seconds; roll: decided by the odds. */
  game: LombaGame;
  cost: number;
  /** A working building the contest needs, such as a Lapangan for the pole. */
  needs?: string;
  /** What a win brings, before turnout and the 17 Agustus combos. */
  prize: { viral: number; sabar: number; rupiah: number };
}

export const CONTESTS: ContestDef[] = [
  {
    id: 'panjatPinang',
    game: 'climb',
    cost: 1_200_000,
    needs: 'lapangan',
    prize: { viral: 6, sabar: 4, rupiah: 600_000 },
  },
  {
    id: 'balapKarung',
    game: 'mash',
    cost: 600_000,
    prize: { viral: 4, sabar: 3, rupiah: 300_000 },
  },
  {
    id: 'makanKerupuk',
    game: 'roll',
    cost: 300_000,
    prize: { viral: 2, sabar: 3, rupiah: 150_000 },
  },
  {
    id: 'tarikTambang',
    game: 'roll',
    cost: 500_000,
    prize: { viral: 3, sabar: 4, rupiah: 250_000 },
  },
];

export interface StageDef {
  id: string;
  cost: number;
  /** Turnout multiplier on every prize. */
  turnout: number;
  /** Inem headlines the stage (her gig). */
  inem?: boolean;
}

/** The stage, from a tarp to a dangdut show. Index 0 is none. */
export const STAGES_17: StageDef[] = [
  { id: 'none', cost: 0, turnout: 1 },
  { id: 'tenda', cost: 800_000, turnout: 1.2 },
  { id: 'panggung', cost: 2_000_000, turnout: 1.45 },
  { id: 'dangdut', cost: 3_500_000, turnout: 1.75, inem: true },
];

export const LOMBA = {
  /** Month of the year (0 = Jan) the panitia forms, and the day itself (7 = Agustus). */
  announce: 4,
  day: 7,
  /** No lomba before this game month: the first year is for learning. */
  fromMonth: 12,
  /** Contests a kampung can run in one year. */
  maxContests: 3,
  /** Climb: grips needed to reach the top, misses allowed, and the green band's height (share of the bar). */
  climbGrips: 3,
  climbMisses: 3,
  climbBand: 0.2,
  /** Each point of the ketua's Rajin widens the band by this share. */
  climbPerRajin: 0.0015,
  /** Mash: seconds, and taps needed; each point of the ketua's Gaul cuts the taps. */
  mashSeconds: 5,
  mashTaps: 30,
  mashPerGaul: 0.1,
  /** Roll: base chance, plus the ketua's Gaul and the kampung's Aman. */
  rollBase: 0.35,
  rollPerGaul: 0.004,
  rollPerAman: 0.002,
  /** Turnout from Popularitas: 0.5 at 0, 1.5 at 100. */
  turnoutBase: 0.5,
  turnoutPerSabar: 0.01,
  /** Below this Aman the day turns ricuh: Popularitas is lost. */
  ricuhBelowAman: 40,
  ricuhSabar: 5,
  /** After any win the crowd lingers: income multiplier and months. */
  crowdMult: 1.2,
  crowdMonths: 2,
  /** Skipping the lomba entirely. */
  skipSabar: 8,
  /** The trophy stands by the Kantor for this many months after a clean sweep of two or more contests. */
  trophyMonths: 12,
};
