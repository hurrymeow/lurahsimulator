// The calendar. One tick (MONTH_MS, 8s at 1x) is one week. A month is 4 weeks, a year 48.
// `GameState.month` counts weeks. It kept its old name so older saves load as they are.
export const WEEKS_PER_MONTH = 4;
export const MONTHS_PER_YEAR = 12;
export const WEEKS_PER_YEAR = WEEKS_PER_MONTH * MONTHS_PER_YEAR;
/** Rates written per year when a year was 12 ticks. Times this, they pay out the same per second now. */
export const YEAR_SCALE = WEEKS_PER_YEAR / 12;
/** The ranking runs every 12 weeks (a Triwulan, a quarter), so the star pacing of the 12-tick year holds. */
export const RANKING_WEEKS = 12;
/** The soft start: 12 weeks (3 months) with a bailout and a gentler flood. */
export const GRACE_WEEKS = 12;

/** Week of the year, 0 to 47. */
export const weekOfYear = (week: number): number => ((week % WEEKS_PER_YEAR) + WEEKS_PER_YEAR) % WEEKS_PER_YEAR;
/** Week of the month, 0 to 3. */
export const weekOfMonth = (week: number): number => weekOfYear(week) % WEEKS_PER_MONTH;
/** Calendar month, 0 = January. */
export const monthOfYear = (week: number): number => Math.floor(weekOfYear(week) / WEEKS_PER_MONTH);
/** Years done, 0 in the first year. */
export const yearsDone = (week: number): number => Math.floor(week / WEEKS_PER_YEAR);
/** True on the first week of calendar month `m` (0 = January). */
export const atMonth = (week: number, m: number): boolean => weekOfMonth(week) === 0 && monthOfYear(week) === m;
/** True on the first week of any month in the list. */
export const inMonths = (week: number, months: number[]): boolean => weekOfMonth(week) === 0 && months.includes(monthOfYear(week));
