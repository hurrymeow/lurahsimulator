// Turns bot timelines into the GAME-DESIGN.md section 8 scorecard: one row per checklist item, Pass, Fail or Unknown.
// A row is Unknown when the harness cannot judge it yet. It never reads Pass on a check that was not run.
import { readFileSync, readdirSync } from 'node:fs';
import { COMBOS } from '../../src/data/combos';
import { EVENTS } from '../../src/data/events';
import { STAGES } from '../../src/data/stages';
import { placeableDefs } from '../../src/sim/content';
import { setGrid } from '../../src/sim/types';
import { newGame } from '../../src/sim/state';
import { starChecklist } from '../../src/sim/stages';
import { def } from '../../src/sim/content';
import { SECONDS_PER_TICK, type BotId, type Timeline, type TLEvent } from './driver';

export type Verdict = 'Pass' | 'Fail' | 'Unknown';
export interface ScoreRow {
  n: number;
  title: string;
  tier: 'T1' | 'T2' | 'T3';
  verdict: Verdict;
  evidence: string;
}

export type Runs = Partial<Record<BotId, Timeline[]>>;
export interface Takeover {
  seed: number;
  from: BotId;
  atTick: number;
  gained: boolean;
  detail: string;
}

const min = (t: number) => (t * SECONDS_PER_TICK) / 60;
const fmtMin = (t: number) => `${min(t).toFixed(1)} min`;
const median = (xs: number[]): number => {
  if (!xs.length) return NaN;
  const a = [...xs].sort((p, q) => p - q);
  return a.length % 2 ? a[(a.length - 1) / 2] : (a[a.length / 2 - 1] + a[a.length / 2]) / 2;
};
const sum = (xs: number[]) => xs.reduce((n, x) => n + x, 0);

/** Time bands from GAME-DESIGN.md section 8, by wall minutes at 1x. */
export const BANDS = ['B0', 'B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8'] as const;
const BAND_END_MIN = [1, 5, 15, 30, 60, 120, 240, 360, 480];
export const bandOf = (t: number): number => {
  const m = min(t);
  const i = BAND_END_MIN.findIndex((end) => m < end);
  return i < 0 ? BAND_END_MIN.length - 1 : i;
};

/** Section 3 target 4: 1★, 2★ and 3★ of the RT, in ticks. Later stars use the star gap column. */
const RT_TARGETS = [15, 37, 90];
/** Star gap column: RT 4 min, RW 7 min, Kelurahan 10 min, in ticks. */
const STAR_GAP: Record<string, number> = { rt: 30, rw: 52, kelurahan: 75 };
/** Goal max (seconds) and Novelty max (seconds) by band B1..B4. */
const GOAL_MAX_S = [NaN, 90, 120, 180, 240];
const NOVELTY_MAX_S = [10, 30, 30, 45, 60];
/** Stop point gap in minutes for bands B3 and B4. */
const STOP_MAX_MIN = [NaN, NaN, NaN, 15, 15];

const verdict = (ok: boolean): Verdict => (ok ? 'Pass' : 'Fail');
/** Pass only when the measured checks pass and nothing is left unmeasured. */
const partial = (ok: boolean): Verdict => (ok ? 'Unknown' : 'Fail');

const runsOf = (r: Runs, bot: BotId) => r[bot] ?? [];
/** Median tick of the nth star over the seeds that got there, or NaN if fewer than half did. */
function starMedian(tls: Timeline[], idx: number): number {
  const ts = tls.map((t) => t.starTicks[idx]).filter((x): x is number => x !== undefined);
  return ts.length * 2 < tls.length || ts.length === 0 ? NaN : median(ts);
}
const reached = (tls: Timeline[], idx: number) => tls.filter((t) => t.starTicks[idx] !== undefined).length;
const STAR_NAMES = ['RT 1★', 'RT 2★', 'RT 3★', 'RW 1★', 'RW 2★', 'RW 3★', 'Kel 1★', 'Kel 2★', 'Kel 3★'];

const isNovel = (e: TLEvent) => e.kind === 'resident' || e.kind === 'popup' || e.kind === 'combo' || e.kind === 'unlock' || e.kind === 'level' || e.kind === 'job';

/** The longest gap in a list of ticks, within the first and last tick given. */
function gaps(ticks: number[], from: number, to: number): { t: number; gap: number }[] {
  const pts = [from, ...ticks.filter((t) => t >= from && t <= to), to];
  return pts.slice(1).map((t, i) => ({ t, gap: t - pts[i] }));
}

// ---------------------------------------------------------------- rows

export function buildScorecard(runs: Runs, takeovers: Takeover[], srcText: string): ScoreRow[] {
  const builder = runsOf(runs, 'builder');
  const idle = runsOf(runs, 'idle');
  const rows: ScoreRow[] = [];
  const add = (n: number, title: string, tier: ScoreRow['tier'], v: Verdict, evidence: string) => rows.push({ n, title, tier, verdict: v, evidence });
  const none = (n: number, title: string, tier: ScoreRow['tier'], why: string) => add(n, title, tier, 'Unknown', why);
  if (!builder.length) throw new Error('scorecard needs builder runs');

  // 1. Always a useful next move. Proxy: a stall is a run of ticks where the cheapest next building costs more than the cash in hand.
  {
    let worst = 0;
    for (const tl of builder) {
      let run = 0;
      for (const r of tl.rows) {
        run = r.nextKey > 0 && r.rupiah < r.nextKey && r.goalsDone < r.goalsTotal ? run + 1 : 0;
        worst = Math.max(worst, run);
      }
    }
    add(1, 'Always a useful next move', 'T1', verdict(worst * SECONDS_PER_TICK <= 60), `Longest wait with nothing affordable: ${worst * SECONDS_PER_TICK}s at 1x (bar 60s). Proxy: the cheapest kind not owned yet, not the goal ETA.`);
  }

  // 2. Data lint.
  {
    const noEffect = placeableDefs().filter((d) => !(d.income > 0 || d.attract > 0 || d.housing || d.perMonth || d.category === 'decoration' || srcText.includes(`'${d.id}'`) || srcText.includes(`"${d.id}"`)));
    const deadEvents = EVENTS.filter((e) => e.choices.every((c) => !c.cost && !c.res && !c.incomePct && !c.outcomes && !c.modifier && !c.special && !c.inspectPrep));
    const dead = [...noEffect.map((d) => d.id), ...deadEvents.map((e) => e.id)];
    add(2, 'Data lint: nothing dead', 'T1', verdict(dead.length === 0), dead.length ? `Orphans: ${dead.join(', ')}.` : 'No orphan buildings or events. Traits and combos are not linted yet.');
    if (dead.length === 0) rows[rows.length - 1].verdict = 'Unknown';
    if (dead.length === 0) rows[rows.length - 1].evidence += ' Verdict held at Unknown because traits and combos are unchecked.';
  }

  // 3. Growth shows on the map.
  none(3, 'Growth shows on the map', 'T2', 'Needs a Playwright run on the real app that counts sprites per star.');

  // 4. Skill matters.
  {
    const parts: string[] = [];
    let ok = true;
    for (let i = 1; i < 9; i++) {
      const b = starMedian(builder, i);
      const id = starMedian(idle, i);
      if (Number.isNaN(b)) continue;
      const ratio = Number.isNaN(id) ? Infinity : id / b;
      if (ratio < 2) ok = false;
      parts.push(`${STAR_NAMES[i]} ${Number.isFinite(ratio) ? ratio.toFixed(1) + 'x' : 'idle never'}`);
    }
    add(4, 'Skill matters', 'T1', verdict(ok), `Idle over builder, median star time (bar 2x, from 2★): ${parts.join(', ')}.`);
  }

  // 5. Meters stay in play.
  {
    const meters = { Popularitas: (r: Timeline['rows'][number]) => r.sabar, Viral: (r: Timeline['rows'][number]) => r.viral, Aman: (r: Timeline['rows'][number]) => r.aman, Sejahtera: (r: Timeline['rows'][number]) => r.sejahtera };
    const bad: string[] = [];
    let worst = 0;
    for (const [name, get] of Object.entries(meters)) {
      for (let b = 0; b < BANDS.length; b++) {
        const rs = builder.flatMap((tl) => tl.rows.filter((r) => bandOf(r.t) === b));
        if (rs.length < 20) continue;
        const pinned = rs.filter((r) => get(r) <= 5 || get(r) >= 95).length / rs.length;
        worst = Math.max(worst, pinned);
        if (pinned >= 0.25) bad.push(`${name} ${BANDS[b]} ${(pinned * 100).toFixed(0)}%`);
      }
    }
    add(5, 'Meters stay in play', 'T1', verdict(bad.length === 0), bad.length ? `Pinned within 5 of floor or cap for 25%+ of ticks: ${bad.join(', ')}.` : `Worst pinned share ${(worst * 100).toFixed(0)}% (bar 25%).`);
  }

  // 6. Causes are legible.
  {
    const drops = builder.flatMap((tl) => tl.events.filter((e): e is Extract<TLEvent, { kind: 'drop' }> => e.kind === 'drop'));
    const logged = drops.filter((d) => d.cause).length;
    add(6, 'Causes are legible', 'T1', partial(logged === drops.length), `${logged} of ${drops.length} Popularitas drops over 2 had a logged cause (a pop number or a bad notice). Whether the cause is shown to the player is T2.`);
  }

  // 7. Goal cadence and stop points.
  {
    const bad: string[] = [];
    const notes: string[] = [];
    for (const tl of builder) {
      const goalTicks = tl.events.filter((e) => e.kind === 'goal' || e.kind === 'star' || e.kind === 'promote').map((e) => e.t);
      const stopTicks = tl.events.filter((e) => e.kind === 'star' || e.kind === 'promote' || e.kind === 'report').map((e) => e.t);
      for (const { t, gap } of gaps(goalTicks, 0, tl.ticks)) {
        const b = bandOf(t);
        if (b >= 1 && b <= 4 && gap * SECONDS_PER_TICK > GOAL_MAX_S[b]) bad.push(`seed ${tl.seed} ${BANDS[b]} goal gap ${gap * SECONDS_PER_TICK}s`);
      }
      for (const { t, gap } of gaps(stopTicks, 0, tl.ticks)) {
        const b = bandOf(t);
        if (b >= 3 && b <= 4 && min(gap) > STOP_MAX_MIN[b]) bad.push(`seed ${tl.seed} ${BANDS[b]} stop gap ${min(gap).toFixed(0)} min`);
      }
    }
    notes.push(`${builder.length} seeds. Payoff screens counted: star, SK, quarterly report.`);
    add(7, 'Goal cadence and stop points', 'T1', verdict(bad.length === 0), bad.length ? `${bad.length} misses, for example ${bad.slice(0, 3).join('; ')}. ${notes[0]}` : `All gaps inside Goal max and Stop point. ${notes[0]}`);
  }

  // 8. Three horizons.
  none(8, 'Three horizons at once', 'T1', 'Needs goal ETAs, which the timeline does not compute yet. The long goal (2045 review) also does not exist beyond the Emas bar.');

  // 9. Goals say what is missing.
  {
    setGrid('rt');
    const s = newGame(1);
    const blank: string[] = [];
    for (const st of STAGES) for (let k = 0; k < 3; k++) {
      const list = starChecklist(s, st.id, k as 0 | 1 | 2) ?? [];
      for (const l of list) if (!/\d/.test(l.text) && l.text.length < 6) blank.push(`${st.id} ${k + 1}★ ${l.goal.kind}`);
    }
    add(9, 'Goals say what is missing', 'T2', verdict(blank.length === 0), blank.length ? `Lines without a count or a name: ${blank.join(', ')}.` : 'Every goal line in the data renders a count or a name. The screen check is T2.');
  }

  // 10. Gates that loosen.
  {
    const weak = (['shopkeeper', 'safety', 'cheapskate', 'pencitraan', 'honest'] as BotId[]).filter((b) => runsOf(runs, b).length);
    const bad: string[] = [];
    for (const bot of weak) {
      for (const tl of runsOf(runs, bot)) {
        const stages = ['rt', 'rw', 'kelurahan'] as const;
        stages.forEach((st, si) => {
          const idx = [0, 1, 2].map((k) => si * 3 + k);
          const startT = si === 0 ? 0 : tl.stageTicks[st];
          if (startT === undefined) return;
          let prev = startT;
          for (const i of idx) {
            const at = tl.starTicks[i];
            if (at === undefined) {
              if (tl.ticks - prev > 2 * STAR_GAP[st]) bad.push(`${bot}#${tl.seed} stuck before ${STAR_NAMES[i]}`);
              return;
            }
            if (at - prev > 2 * STAR_GAP[st]) bad.push(`${bot}#${tl.seed} ${STAR_NAMES[i]} after ${fmtMin(at - prev)}`);
            prev = at;
          }
        });
      }
    }
    add(10, 'Gates that loosen', 'T1', verdict(bad.length === 0), bad.length ? `${bad.length} gaps over 2x the star gap. Examples: ${bad.slice(0, 4).join('; ')}.` : 'No gap over 2x the star gap for any non-idle strategy bot.');
  }

  // 11. Novelty and content depth.
  {
    const bad: string[] = [];
    for (const tl of builder) {
      const novel = tl.events.filter(isNovel).map((e) => e.t);
      for (const { t, gap } of gaps(novel, 0, tl.ticks)) {
        const b = bandOf(t);
        if (b <= 4 && gap * SECONDS_PER_TICK > NOVELTY_MAX_S[b]) bad.push(`seed ${tl.seed} ${BANDS[b]} ${gap * SECONDS_PER_TICK}s`);
      }
    }
    const firsts = builder.map((tl) => Math.max(0, ...tl.events.filter((e) => e.kind === 'unlock' || e.kind === 'combo' || e.kind === 'promote').map((e) => e.t)));
    const runOut2x = (median(firsts) * SECONDS_PER_TICK) / 2 / 60;
    const ok = bad.length === 0 && runOut2x >= 420;
    add(11, 'Novelty and content depth', 'T1', verdict(ok), `Novelty gaps over the band max: ${bad.length}${bad.length ? ` (e.g. ${bad.slice(0, 3).join('; ')})` : ''}. Last new unlock, combo or stage at minute ${runOut2x.toFixed(0)} at 2x. The 8h run needs content to about minute 480.`);
  }

  // 12. Star rewards.
  {
    const bad: string[] = [];
    let checked = 0;
    for (const tl of builder) {
      for (const e of tl.events) {
        if (e.kind !== 'star') continue;
        const unlocks = tl.events.filter((u) => u.kind === 'unlock' && u.t === e.t).map((u) => (u as { id: string }).id).filter((id) => placeableDefs().some((d) => d.id === id && d.category !== 'decoration'));
        if (!unlocks.length) continue;
        checked++;
        const row = tl.rows[e.t];
        const cheapest = Math.min(...unlocks.map((id) => def(id).cost));
        if (row.rupiah + 4 * row.net < cheapest) bad.push(`seed ${tl.seed} ${STAR_NAMES[e.n - 1]}`);
      }
    }
    const kinds: string[] = [];
    STAGES.forEach((st) => st.stars.forEach((star, k) => {
      const n = (star.unlocks.length ? 1 : 0) + (star.reward ? 1 : 0);
      if (n < 2) kinds.push(`${st.id} ${k + 1}★`);
    }));
    add(12, 'Star rewards', 'T1', verdict(bad.length === 0 && kinds.length === 0), `Cheapest new non-decor building affordable within 30s: ${checked - bad.length} of ${checked} star events${bad.length ? ` (misses: ${bad.slice(0, 4).join(', ')})` : ''}. Stars with one kind of reward: ${kinds.length ? kinds.join(', ') : 'none'}.`);
  }

  // 13. Sources and sinks.
  {
    const bad: string[] = [];
    const res = { Rupiah: (r: Timeline['rows'][number]) => r.rupiah, Popularitas: (r: Timeline['rows'][number]) => r.sabar, Viral: (r: Timeline['rows'][number]) => r.viral, 'Orang Dalam': (r: Timeline['rows'][number]) => r.odn };
    for (const [name, get] of Object.entries(res)) {
      for (let b = 0; b < BANDS.length; b++) {
        let up = false;
        let down = false;
        let n = 0;
        for (const tl of builder) {
          const rs = tl.rows.filter((r) => bandOf(r.t) === b);
          n += rs.length;
          for (let i = 1; i < rs.length; i++) {
            const d = get(rs[i]) - get(rs[i - 1]);
            if (d > 0) up = true;
            if (d < 0) down = true;
          }
        }
        if (n < 20) continue;
        if (!up || !down) bad.push(`${name} ${BANDS[b]} ${!up ? 'never earned' : 'never spent'}`);
      }
    }
    add(13, 'Sources and sinks', 'T1', verdict(bad.length === 0), bad.length ? `${bad.join(', ')}. Dana, Stempel and Anggaran are not tracked in the timeline yet.` : 'Every tracked resource moves up and down in every band reached. Dana, Stempel and Anggaran are not tracked yet.');
    if (!bad.length) rows[rows.length - 1].verdict = 'Unknown';
  }

  // 14. Cash health.
  {
    let longest = 0;
    for (const tl of builder) {
      let run = 0;
      for (const r of tl.rows) {
        run = r.nextKey > 0 && r.rupiah > 5 * r.nextKey ? run + 1 : 0;
        longest = Math.max(longest, run);
      }
    }
    const neg = (tls: Timeline[]) => Math.min(0, ...tls.flatMap((tl) => tl.rows.map((r) => r.rupiah)));
    const nb = neg(builder);
    const ni = neg(idle);
    add(14, 'Cash health', 'T1', verdict(longest * SECONDS_PER_TICK <= 180 && nb >= 0 && ni >= 0), `Cash over 5x the next key item for up to ${fmtMin(longest)} (bar 3 min). Lowest cash: builder ${(nb / 1e6).toFixed(1)}M, idle ${(ni / 1e6).toFixed(1)}M.`);
  }

  // 15. Cost curve and snowball.
  {
    const secs: number[] = [];
    for (const tl of builder) for (const r of tl.rows) if (bandOf(r.t) <= 4 && r.nextKey > 0 && r.net > 0 && r.t >= 5) secs.push((r.nextKey / r.net) * SECONDS_PER_TICK);
    const med = median(secs);
    const p95 = [...secs].sort((a, b) => a - b)[Math.floor(secs.length * 0.95)];
    add(15, 'Cost curve and snowball', 'T1', partial(med >= 30 && med <= 120 && p95 <= 300), `Seconds of income to afford the next key item, B0 to B4: median ${med.toFixed(0)}s (bar 30 to 120s), 95th percentile ${p95?.toFixed(0)}s (bar 300s). Income against cost growth per stage is not measured.`);
  }

  // 16. Diminishing returns.
  none(16, 'Diminishing returns', 'T1', 'Needs ablation runs (remove one action, measure star time). Not built.');

  // 17. No dominant strategy.
  {
    const four: BotId[] = ['builder', 'shopkeeper', 'safety', 'pencitraan'];
    const parts: string[] = [];
    let ok = true;
    for (let i = 0; i < 9; i++) {
      const ms = four.map((b) => starMedian(runsOf(runs, b), i));
      if (ms.some(Number.isNaN)) {
        if (ms.some((m) => !Number.isNaN(m))) { ok = false; parts.push(`${STAR_NAMES[i]}: ${four.filter((_, k) => Number.isNaN(ms[k])).join('/')} never`); }
        continue;
      }
      const ratio = Math.max(...ms) / Math.min(...ms);
      // A gap under two minutes is too small to feel, whatever the ratio (RT 1★ takes 18 to 100 seconds).
      const gapSeconds = (Math.max(...ms) - Math.min(...ms)) * SECONDS_PER_TICK;
      if (ratio > 1.3 && gapSeconds >= 120) { ok = false; parts.push(`${STAR_NAMES[i]} ${ratio.toFixed(2)}x`); }
    }
    // The cheapskate is never stranded: it reaches RT 2★ in at least half the seeds, and a builder can always take over its game.
    const cheap = runsOf(runs, 'cheapskate');
    const cheapBad: string[] = [];
    if (Number.isNaN(starMedian(cheap, 1))) cheapBad.push(`RT 2★ reached in ${reached(cheap, 1)} of ${cheap.length} seeds`);
    const cheapStuck = takeovers.filter((t) => t.from === 'cheapskate' && !t.gained);
    if (cheapStuck.length) cheapBad.push(`${cheapStuck.length} takeovers did not progress`);
    add(17, 'No dominant strategy', 'T1', verdict(ok && cheapBad.length === 0), `Slowest over fastest of builder, shopkeeper, safety-first and Pencitraan (bar 1.3x, and a gap of at least 2 min): ${parts.length ? parts.join(', ') : 'all within'}. Cheapskate never stranded (reaches RT 2★, every takeover progresses): ${cheapBad.length ? cheapBad.join(', ') : 'yes'}. "No bot wins every metric" is not checked.`);
  }

  // 18. Every choice has a cost.
  {
    const dominated: string[] = [];
    for (const e of EVENTS) {
      const fixed = e.choices.map((c, i) => ({ c, i })).filter(({ c }) => !c.outcomes && !c.special && !c.modifier && !c.incomePct);
      // Cost is a vector: a choice only beats another when it is no dearer in rupiah, Orang Dalam and income months at once.
      const price = (c: (typeof e.choices)[number]) => [c.cost?.rupiah ?? 0, c.cost?.orangDalam ?? 0, c.cost?.incomeMonths ?? 0];
      const gain = (c: (typeof e.choices)[number]) => ({ ...(c.res ?? {}), ...(c.inspectPrep ? { inspectPrep: c.inspectPrep } : {}) });
      for (const a of fixed) for (const b of fixed) {
        if (a.i === b.i) continue;
        const ga = gain(a.c) as Record<string, number>;
        const gb = gain(b.c) as Record<string, number>;
        const keys = new Set([...Object.keys(ga), ...Object.keys(gb)]);
        const pa = price(a.c);
        const pb = price(b.c);
        const cheaper = pb.every((v, k) => v <= pa[k]);
        const geq = [...keys].every((k) => (gb[k] ?? 0) >= (ga[k] ?? 0));
        const gt = [...keys].some((k) => (gb[k] ?? 0) > (ga[k] ?? 0)) || pb.some((v, k) => v < pa[k]);
        // Gunting Pita is the first popup: a light joke with one clear winner on purpose (GAME-DESIGN.md target 3).
        if (e.id !== 'guntingPita' && cheaper && geq && gt) dominated.push(`${e.id}#${a.i}`);
      }
    }
    add(18, 'Every choice has a cost', 'T1', verdict(dominated.length === 0), dominated.length ? `Strictly dominated options: ${[...new Set(dominated)].join(', ')}. Only options with fixed results are compared; advice with rolled outcomes is skipped.` : 'No strictly dominated option among fixed-result choices. Rolled outcomes are skipped.');
    if (!dominated.length) rows[rows.length - 1].verdict = 'Unknown';
  }

  // 19. Laporan vs Sejahtera.
  {
    const pen = runsOf(runs, 'pencitraan');
    const hon = runsOf(runs, 'honest');
    const speed: string[] = [];
    let ok = pen.length > 0 && hon.length > 0;
    let honestHigher = 0;
    let differ = 0;
    for (const p of pen) {
      const h = hon.find((x) => x.seed === p.seed);
      if (!h) continue;
      const k = Math.min(p.starTicks.length, h.starTicks.length) - 1;
      if (k >= 0) {
        const gainPct = (h.starTicks[k] / p.starTicks[k] - 1) * 100;
        speed.push(`${gainPct.toFixed(0)}%`);
        if (gainPct < 10 || gainPct > 30) ok = false;
      } else ok = false;
      if (h.end.sejahtera > p.end.sejahtera) honestHigher++;
      if (h.end.stage !== p.end.stage || h.end.stars !== p.end.stars) differ++;
    }
    if (honestHigher < pen.length) ok = false;
    add(19, 'Laporan vs Sejahtera', 'T1', verdict(ok), `Pencitraan faster to the last star both reach, by seed (bar 10 to 30%): ${speed.join(', ')}. Honest ends higher on Sejahtera in ${honestHigher} of ${pen.length} seeds. Endings differ in ${differ} (no endings exist yet, so stage and stars stand in).`);
  }

  // 20. Management load.
  {
    const perBand = BANDS.map((_, b) => {
      const buckets: number[] = [];
      for (const tl of builder) {
        const rs = tl.rows.filter((r) => bandOf(r.t) === b);
        for (let i = 0; i + 8 <= rs.length; i += 8) buckets.push(sum(rs.slice(i, i + 8).map((r) => r.acts)));
      }
      return buckets.length ? Math.max(...buckets) : 0;
    });
    const b2 = perBand[2];
    const bad = perBand.map((v, b) => (v > 1.5 * b2 ? `${BANDS[b]} ${v}` : '')).filter(Boolean);
    add(20, 'Management load', 'T1', verdict(bad.length === 0 && b2 > 0), `Most actions in a minute, by band: ${perBand.map((v, b) => `${BANDS[b]} ${v}`).join(', ')}. Bar: no band above 1.5x the B2 peak (${(1.5 * b2).toFixed(0)}). An action is a placement, an upgrade, a repair, an event answer or a promotion.`);
  }

  // 21. Combo discovery.
  {
    const rnd = runsOf(runs, 'random');
    const early = rnd.map((tl) => tl.events.filter((e) => e.kind === 'combo' && min(e.t) < 15).length);
    const total = COMBOS.length;
    const found = new Set<string>();
    for (const tls of Object.values(runs)) for (const tl of tls ?? []) for (const id of tl.end.discovered) found.add(id);
    const hint = runsOf(runs, 'hint');
    const hintShare = hint.length ? median(hint.map((tl) => tl.end.discovered.length)) / Math.max(1, found.size) : NaN;
    const ok = median(early) >= 3 && hintShare >= 0.65 && hintShare <= 0.85;
    add(21, 'Combo discovery', 'T1', verdict(ok), `Random placer finds a median ${median(early)} combos in the first 15 min (bar 3). Hint reader finds ${(hintShare * 100).toFixed(0)}% of the ${found.size} combos any bot found (bar 65 to 85%). Bots found ${found.size} different combos in all (${total} base combos plus stage combos exist).`);
  }

  // 22. Calendar rhythm.
  none(22, 'Calendar rhythm', 'T1', 'Needs the warning lead of each fixed beat in wall seconds, which the timeline does not log yet.');

  // 23. Reliability.
  {
    const bad: string[] = [];
    for (let i = 0; i < 3; i++) {
      const ts = builder.map((tl) => tl.starTicks[i]);
      if (ts.some((x) => x === undefined)) { bad.push(`${STAR_NAMES[i]} missed by ${ts.filter((x) => x === undefined).length} seeds`); continue; }
      const late = (ts as number[]).filter((x) => x > RT_TARGETS[i]).length;
      if (late) bad.push(`${STAR_NAMES[i]} late in ${late} of ${ts.length} seeds`);
      const spread = Math.max(...(ts as number[])) / Math.min(...(ts as number[]));
      if (spread > 1.5) bad.push(`${STAR_NAMES[i]} spread ${spread.toFixed(2)}x`);
    }
    const stuck = takeovers.filter((t) => !t.gained);
    if (stuck.length) bad.push(`soft-lock: ${stuck.length} of ${takeovers.length} takeovers did not progress`);
    add(23, 'Reliability: seeds, bad luck, recovery', 'T1', partial(bad.length === 0), `${bad.length ? bad.join('; ') + '. ' : `RT 1★ to 3★ on target in ${builder.length} of ${builder.length} seeds, spread under 1.5x. `}Soft-lock check: a builder bot took over an idle game at mid-state in ${takeovers.filter((t) => t.gained).length} of ${takeovers.length} runs and still earned a star or a goal. The forced worst-event chain is not built.`);
  }

  // 24. Stage change feels new.
  {
    const bad: string[] = [];
    for (const st of STAGES) st.stars.forEach((star, k) => { if (k === 0 && !star.unlocks.length) bad.push(`${st.id} 1★ unlocks nothing`); });
    const firstStar: string[] = [];
    for (const tl of builder) {
      for (const [si, st] of (['rw', 'kelurahan'] as const).entries()) {
        const entered = tl.stageTicks[st];
        const first = tl.starTicks[3 + si * 3];
        if (entered === undefined) continue;
        if (first === undefined) { bad.push(`seed ${tl.seed} no ${st} 1★`); continue; }
        if (first - entered > STAR_GAP[st]) bad.push(`seed ${tl.seed} ${st} 1★ after ${fmtMin(first - entered)}`);
        firstStar.push(`${st} ${fmtMin(first - entered)}`);
      }
    }
    add(24, 'Stage change feels new', 'T1', partial(bad.length === 0), bad.length ? `${bad.slice(0, 4).join('; ')}.` : `Each stage's first star opens buildings, and arrives within the star gap of promotion. Whether the old map stays useful is T2.`);
  }

  none(25, 'The run ends', 'T1', 'Act 3 and the endings do not exist yet. The builder bot finishes all content at minute ' + median(builder.map((t) => min(t.ticks))).toFixed(0) + ' at 1x against a target near 480.');
  none(26, 'Replay drivers (optional New Game+)', 'T3', 'A design check, not a sim measurement. Not required for the core 8h.');
  none(27, 'Coming back', 'T2', 'Needs a Playwright save, reload and screenshot at 5s, in both languages.');
  return rows;
}

/** All of src/sim and src/data as one string, so a lint can ask whether an id is used anywhere. */
export function sourceText(): string {
  const read = (dir: string): string => readdirSync(dir, { withFileTypes: true }).map((f) => (f.isDirectory() ? read(`${dir}/${f.name}`) : f.name.endsWith('.ts') ? readFileSync(`${dir}/${f.name}`, 'utf8') : '')).join('\n');
  return read('src/sim') + read('src/data');
}

// ---------------------------------------------------------------- report

export interface Trend {
  generated: string;
  seeds: number;
  verdicts: Record<number, Verdict>;
  starMedianTicks: Partial<Record<BotId, (number | null)[]>>;
  finalPop: Partial<Record<BotId, number>>;
}

export function trendOf(runs: Runs, rows: ScoreRow[], generated: string): Trend {
  const trend: Trend = { generated, seeds: runsOf(runs, 'builder').length, verdicts: {}, starMedianTicks: {}, finalPop: {} };
  for (const r of rows) trend.verdicts[r.n] = r.verdict;
  for (const [bot, tls] of Object.entries(runs) as [BotId, Timeline[]][]) {
    trend.starMedianTicks[bot] = Array.from({ length: 9 }, (_, i) => (Number.isNaN(starMedian(tls, i)) ? null : starMedian(tls, i)));
    trend.finalPop[bot] = median(tls.map((tl) => tl.rows.at(-1)?.pop ?? 0));
  }
  return trend;
}

export function renderMarkdown(runs: Runs, rows: ScoreRow[], takeovers: Takeover[], generated: string, previous?: Trend): string {
  const counts = { Pass: 0, Fail: 0, Unknown: 0 };
  for (const r of rows) counts[r.verdict]++;
  const out: string[] = [];
  out.push('# Scorecard', '');
  out.push(`Generated ${generated} by \`npm run scorecard\`. Checklist: GAME-DESIGN.md section 8. Wall times are at 1x unless said (8s a tick).`);
  out.push('', `**${counts.Pass} Pass · ${counts.Fail} Fail · ${counts.Unknown} Unknown** of ${rows.length} items. Unknown means the harness cannot judge the item yet, and says why.`, '');
  out.push('| # | Item | Tier | Verdict | Evidence |', '| --- | --- | --- | --- | --- |');
  for (const r of rows) out.push(`| ${r.n} | ${r.title} | ${r.tier} | ${r.verdict} | ${r.evidence.replace(/\|/g, '/')} |`);
  out.push('', '## Star times by bot', '', 'Median minute each star was earned, over the seeds that got there. A count in brackets means some seeds never did. A dash means fewer than half did.', '');
  out.push(`| Bot | Seeds | ${STAR_NAMES.join(' | ')} | Final pop |`, `| --- | --- | ${STAR_NAMES.map(() => '---').join(' | ')} | --- |`);
  for (const [bot, tls] of Object.entries(runs) as [BotId, Timeline[]][]) {
    const cells = STAR_NAMES.map((_, i) => (Number.isNaN(starMedian(tls, i)) ? `– (${reached(tls, i)}/${tls.length})` : min(starMedian(tls, i)).toFixed(1) + (reached(tls, i) < tls.length ? ` (${reached(tls, i)}/${tls.length})` : '')));
    out.push(`| ${bot} | ${tls.length} | ${cells.join(' | ')} | ${median(tls.map((tl) => tl.rows.at(-1)?.pop ?? 0)).toFixed(0)} |`);
  }
  out.push('', '## Soft-lock takeover', '', 'An idle or random bot plays to mid-game, then a builder bot takes over the state. It must earn a star or finish a goal line within 150 ticks (20 min).', '');
  out.push('| Seed | From | At tick | Progressed | Detail |', '| --- | --- | --- | --- | --- |');
  for (const t of takeovers) out.push(`| ${t.seed} | ${t.from} | ${t.atTick} | ${t.gained ? 'yes' : 'NO'} | ${t.detail} |`);
  if (previous) {
    const changed = rows.filter((r) => previous.verdicts[r.n] && previous.verdicts[r.n] !== r.verdict);
    out.push('', '## Changes since the last golden trend', '');
    out.push(changed.length ? changed.map((r) => `- ${r.n} ${r.title}: ${previous.verdicts[r.n]} to ${r.verdict}`).join('\n') : 'No verdict changed.');
  }
  out.push('', '## Not measured yet', '', ...rows.filter((r) => r.verdict === 'Unknown').map((r) => `- ${r.n} ${r.title} (${r.tier}): ${r.evidence}`), '');
  return out.join('\n');
}
