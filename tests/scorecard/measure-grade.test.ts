import { describe, it } from 'vitest';
import { GRADE_BONUS } from '../../src/sim/balance';
import { runBot, SECONDS_PER_TICK, type BotId } from './driver';

// Local measure for the GRADE_BONUS TODO idea: how often each grade lands, what the bonus adds, and whether star
// times move with the bonus off, as is, or doubled.
// BOTS=builder,honest SEEDS=1,2,3 MEASURE_GRADE=1 npx vitest run tests/scorecard/measure-grade
type G = keyof typeof GRADE_BONUS;
const GRADES: G[] = ['S', 'A', 'B', 'C', 'D'];
const ORIG = Object.fromEntries(GRADES.map((g) => [g, { ...GRADE_BONUS[g] }])) as Record<G, Record<string, number>>;
let counts: Record<G, number> = { S: 0, A: 0, B: 0, C: 0, D: 0 };
let scale = 1;
for (const g of GRADES) {
  Object.defineProperty(GRADE_BONUS, g, {
    configurable: true,
    get: () => {
      counts[g]++;
      return Object.fromEntries(Object.entries(ORIG[g]).map(([k, v]) => [k, v * scale]).filter(([, v]) => (v as number) > 0));
    },
  });
}

describe.skipIf(!process.env.MEASURE_GRADE)('measure GRADE_BONUS', () => {
  it('prints grades, bonus totals and star minutes at x0, x1 and x2', () => {
    const bots = (process.env.BOTS ?? 'builder,shopkeeper,honest,cheapskate,idle').split(',') as BotId[];
    const seeds = (process.env.SEEDS ?? '1,2,3').split(',').map(Number);
    const ticks = Number(process.env.TICKS ?? 520);
    const min = (t?: number) => (t === undefined ? 'never' : ((t * SECONDS_PER_TICK) / 60).toFixed(1));
    for (const bot of bots) {
      for (const sc of [0, 1, 2]) {
        scale = sc;
        const lines: string[] = [];
        for (const seed of seeds) {
          counts = { S: 0, A: 0, B: 0, C: 0, D: 0 };
          const tl = runBot(bot, seed, ticks, { stopStars: 9 });
          const sabarBonus = GRADES.reduce((n, g) => n + counts[g] * (ORIG[g].sabar ?? 0) * sc, 0);
          const odBonus = counts.S * (ORIG.S.orangDalam ?? 0) * sc;
          // Popularitas gained from every source: the sum of the week-on-week rises.
          let gained = 0;
          for (let i = 1; i < tl.rows.length; i++) gained += Math.max(0, tl.rows[i].sabar - tl.rows[i - 1].sabar);
          const grades = GRADES.map((g) => `${g}${counts[g]}`).join(' ');
          lines.push(`s${seed} [${grades}] bonus Pop +${sabarBonus} OD +${odBonus} of Pop gained ${Math.round(gained)} | stars ${[0, 2, 3, 5, 6, 8].map((i) => min(tl.starTicks[i])).join('/')}`);
        }
        process.stdout.write(`GRADE ${bot} x${sc}\n  ${lines.join('\n  ')}\n`);
      }
    }
  }, 6_000_000);
});
