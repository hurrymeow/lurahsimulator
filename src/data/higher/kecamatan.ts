// Kecamatan numbers (docs/plans/kecamatan-slice.md, "Mechanics"). A first pass: the balance bots tune them.
// A week is one tick. Content (buildings, combos, events) joins this file in the content task.

/** Pinjol: households borrow when idle or unfed, and the debt collector follows. */
export const PINJOL = {
  /** Residents to a household, as in NEEDS.household. */
  household: 3,
  /** A household with someone idle this many weeks can borrow. */
  idleWeeks: 24,
  /** Chance a week that an eligible household borrows. */
  borrow: 0.03,
  /** A household in debt counts this much of a fed household as unfed. */
  unfedShare: 0.5,
  /** Weeks in debt before the debt collector comes. */
  collectAfter: 24,
  /** Aman the debt collector costs, and for how many weeks. */
  collectorAman: 5,
  collectorWeeks: 12,
  /** Chance a week that a household in debt who is neither idle nor unfed pays it off. Not in the plan: needed so the meter can fall. */
  repay: 0.02,
} as const;

/** Judol: spreads with Viral. */
export const JUDOL = {
  /** Viral above this starts to feed it. */
  viralFloor: 20,
  /** Each step of Viral above the floor adds `perStep` to the weekly chance a household starts. */
  viralStep: 10,
  perStep: 0.01,
  /** Share of a judol household's income that goes. Applied as a cut on shop income, scaled by the judol share of households. */
  incomeCut: 0.3,
  /** Judol households borrow this many times as often. */
  borrowMult: 2,
  /** Chance a week that a judol household quits. Not in the plan: needed so the meter can fall. */
  quit: 0.02,
} as const;
