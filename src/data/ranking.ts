// Quarterly ranking (every 12 weeks). The rival moves up a level with the player: Kampung Sebelah is the RT next door,
// RW Sebelah the rival area, then Kelurahan Sebelah. Faceless, as GAME-DESIGN.md asks.
import { YEAR_SCALE } from '../sim/calendar';
export const RIVAL_NAMES = { rt: 'Kampung Sebelah', rw: 'RW Sebelah', kelurahan: 'Kelurahan Sebelah' } as const;
/** Scales the rival's score to the size of the area being ranked: 1, 4 or 16 RTs, of which the AI ones score lower than the player. */
export const RIVAL_SCALE = { rt: 1, rw: 2.6, kelurahan: 8 } as const;
export const RIVAL_BASE = 55;
export const RIVAL_PER_YEAR = 26;
export const RIVAL_JITTER = 8;

export const SCORE = { perResident: 8, perBuilding: 5, perCombo: 10, perSabar: 0.5, perEmas: 20 };

export const WIN = { sabar: 10, orangDalam: 1, emas: 0.03 };
export const LOSE = { sabar: -5 };
/** Indonesia Emas 2045 barely moves. These are percentage points. */
export const EMAS = { start: 0.01, perYear: 0.02 * YEAR_SCALE, perWacana: 0.004, perRestart: 0.005, perMangkrak: -0.004 };
