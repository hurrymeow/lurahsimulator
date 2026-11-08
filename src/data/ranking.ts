// Quarterly ranking (every 12 weeks). The rival moves up a level with the player: Kampung Sebelah is the RT next door,
// RW Sebelah the rival area, then Kelurahan Sebelah. Faceless, as GAME-DESIGN.md asks.
import { YEAR_SCALE } from '../sim/calendar';
export const RIVAL_NAMES = { rt: 'Kampung Sebelah', rw: 'RW Sebelah', kelurahan: 'Kelurahan Sebelah', kecamatan: 'Kecamatan Sebelah' } as const;
/** Scales the rival's score to the size of the area being ranked: 1, 2 or 4 RTs, of which the AI ones score lower than the player. */
export const RIVAL_SCALE = { rt: 1, rw: 3.6, kelurahan: 6, kecamatan: 4.75 } as const;
export const RIVAL_BASE = 55;
export const RIVAL_PER_YEAR = 26;
export const RIVAL_JITTER = 8;
/**
 * From the RW on, the rival grows with the quarters the player has spent in the stage, from the quarter a typical
 * player arrives in. A player who arrives late meets the rival a typical player met, not one that grew while they
 * were away, so a slow start never locks the ranking goals (decisions/stage-lengths-quarterly-wins.md).
 */
export const RIVAL_START = { rw: 8, kelurahan: 17, kecamatan: 15 } as const;
/** From the RW on, the rival stops growing after this many quarters in the stage: a kampung that has passed it stays ahead, and a stalled one is not run down by losses. */
export const RIVAL_GROWTH_QUARTERS = 16;

export const SCORE = { perResident: 8, perBuilding: 5, perCombo: 10, perSabar: 0.5, perEmas: 20 };

export const WIN = { sabar: 10, orangDalam: 1, emas: 0.03 };
export const LOSE = { sabar: -5 };
/** Indonesia Emas 2045 barely moves. These are percentage points. */
export const EMAS = { start: 0.01, perYear: 0.02 * YEAR_SCALE, perWacana: 0.004, perRestart: 0.005, perMangkrak: -0.004 };
