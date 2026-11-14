import { describe, it } from 'vitest';
import { act, BOTS, runBot, totalStars, SECONDS_PER_TICK, type BotId } from './driver';
import { takeover, TAKEOVERS } from './takeover';
import { SEEDS } from './plan';
import { starChecklist } from '../../src/sim/stages';
import { housing, newGame, population } from '../../src/sim/state';
import { tick } from '../../src/sim/tick';
import { activeCombos } from '../../src/sim/combos';
import { checkUpgrade } from '../../src/sim/rules';
import { upgradeCost } from '../../src/sim/state';
import { easiestCombo, nextStep } from '../../src/sim/nextstep';
import { setRoadRule } from '../../src/sim/access';
import { setGrid, type GameState, type Stars } from '../../src/sim/types';
import type { Fx } from '../../src/sim/gain';

function mulberry(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let x = Math.imul(a ^ (a >>> 15), 1 | a);
    x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

/** Plays shopkeeper tick by tick, so we can see which RT 2★ line is met last. */
function traceShopkeeper(seed: number, ticks: number) {
  setGrid('rt');
  setRoadRule(true);
  const s = newGame(seed);
  const rnd = mulberry(seed * 7919 + BOTS.indexOf('shopkeeper'));
  const noSpot = new Map<string, number>();
  const flips: Record<string, number> = {};
  let lastUnmet: string[] = [];
  let starredAt = -1;
  let prev = new Set<string>();
  try {
    for (let t = 0; t < ticks; t++) {
      const c = { s, fx: [] as Fx, rnd, acts: 0, t, noSpot };
      act(c, 'shopkeeper');
      const before = s.stage.stars.rt;
      const pre = before === 1 ? (starChecklist(s, 'rt', 1) ?? []).filter((l) => !l.done).map((l) => l.goal.kind) : [];
      tick(s);
      if (before === 1 && s.stage.stars.rt === 2) {
        starredAt = t;
        lastUnmet = pre;
      }
      if (s.stage.current !== 'rt' || s.stage.stars.rt !== 1) continue;
      const lines = starChecklist(s, 'rt', 1) ?? [];
      const unmet = new Set(lines.filter((l) => !l.done).map((l) => l.goal.kind));
      for (const kind of [...prev].filter((x) => !unmet.has(x))) flips[kind] = t;
      prev = unmet;
    }
  } finally {
    setRoadRule(false);
    setGrid('rt');
  }
  return { flips, starredAt, lastUnmet };
}

const min = (t?: number) => (t === undefined ? 'never' : ((t * SECONDS_PER_TICK) / 60).toFixed(1));

function lines(s: GameState) {
  return (starChecklist(s, s.stage.current, s.stage.stars[s.stage.current] as Stars) ?? []).map((l) => ({
    kind: l.goal.kind,
    done: l.done,
    text: l.text,
  }));
}

describe('measure T13', () => {
  it('shopkeeper seed 10: which RT 2★ line is met last', () => {
    const { flips, starredAt, lastUnmet } = traceShopkeeper(10, 200);
    process.stdout.write(`T13 seed10 RT 2★ line flips (min) ${JSON.stringify(Object.fromEntries(Object.entries(flips).map(([k, t]) => [k, min(t)])))}\n`);
    process.stdout.write(`T13 seed10 RT 2★ at ${min(starredAt)} min, unmet on the tick before: ${JSON.stringify(lastUnmet)}\n`);
  }, 1_800_000);

  it('shopkeeper seeds: which RT 2★ line never lands', () => {
    for (const seed of SEEDS) {
      const out: { s?: GameState } = {};
      const tl = runBot('shopkeeper', seed, 600, { out });
      const s = out.s!;
      process.stdout.write(`T13 shopkeeper#${seed} stars ${tl.starTicks.map((t) => min(t)).join('/')} end=${tl.end.stage} ${tl.end.stars}★ total=${totalStars(s)} pop=${population(s)} beds=${housing(s)} rupiah=${Math.round(s.res.rupiah)} sabar=${s.res.sabar.toFixed(1)} rankingWins=${s.ranking.filter((r) => r.won).length}\n`);
      if (tl.starTicks[1] === undefined) {
        process.stdout.write(`T13 shopkeeper#${seed} RT 2★ MISSED checklist ${JSON.stringify((starChecklist(s, 'rt', 1) ?? []).map((l) => ({ kind: l.goal.kind, done: l.done, text: l.text })))}\n`);
        process.stdout.write(`T13 shopkeeper#${seed} last checklist ${JSON.stringify(lines(s))}\n`);
      }
    }
  }, 1_800_000);

  it('stalled takeover seed 3: tick trace', () => {
    const out0: { s?: GameState } = {};
    runBot('random', 3, 100, { out: out0 });
    setGrid('rt');
    setRoadRule(true);
    const s = out0.s!;
    const rnd = mulberry(3 * 7919 + BOTS.indexOf('builder'));
    const noSpot = new Map<string, number>();
    try {
      for (let t = 0; t < 150; t++) {
        const c = { s, fx: [] as Fx, rnd, acts: 0, t, noSpot };
        act(c, 'builder');
        const pre = {
          kebun: s.buildings.filter((b) => b.def === 'kebunSayur').length,
          warung: s.buildings.filter((b) => b.def === 'warung').map((b) => b.level).sort().join(','),
          pick: easiestCombo(s)?.ids.join('+') ?? '-',
          step: nextStep(s)?.kind ?? '-',
        };
        tick(s);
        if (t === 118) {
          const warungs = s.buildings.filter((b) => b.def === 'warung');
          process.stdout.write(`T13 trace3 t=118 warungs ${JSON.stringify(warungs.map((b) => ({ lv: b.level, x: b.x, y: b.y, noRoad: !!b.noRoad, up: checkUpgrade(s, b).ok, cost: upgradeCost(s, b), miss: checkUpgrade(s, b).missing })))} rupiah=${Math.round(s.res.rupiah)}\n`);
        }
        if (t >= 110 || t % 20 === 0) {
          const post = { kebun: s.buildings.filter((b) => b.def === 'kebunSayur').length, warung: s.buildings.filter((b) => b.def === 'warung').map((b) => b.level).sort().join(','), disc: s.discovered.length };
          process.stdout.write(`T13 trace3 t=${t} acts=${c.acts} pre=${JSON.stringify(pre)} post=${JSON.stringify(post)}\n`);
        }
      }
    } finally {
      setRoadRule(false);
      setGrid('rt');
    }
  }, 1_800_000);

  it('stalled takeover: what the builder does in the window', () => {
    for (const seed of [3, 5]) {
      const out0: { s?: GameState } = {};
      runBot('random', seed, 100, { out: out0 });
      const from = out0.s!;
      process.stdout.write(`T13 stalled seed=${seed} random state stage=${from.stage.current} stars=${from.stage.stars.rt} rupiah=${Math.round(from.res.rupiah)} buildings=${JSON.stringify(from.buildings.map((b) => `${b.def}${b.level > 1 ? '@' + b.level : ''}:${b.status}:${b.x},${b.y}`))}\n`);
      const out1: { s?: GameState } = {};
      const tl = runBot('builder', seed, 150, { from: out0.s, out: out1 });
      const built = tl.events.filter((e) => e.kind === 'built').map((e) => `${(e as { id: string }).id}@${e.t}`);
      const s = out1.s!;
      process.stdout.write(`T13 stalled seed=${seed} builder built ${JSON.stringify(built)}\n`);
      process.stdout.write(`T13 stalled seed=${seed} end stage=${s.stage.current} stars=${s.stage.stars[s.stage.current]} discovered=${JSON.stringify(s.discovered)} pop=${population(s)} beds=${housing(s)} rupiah=${Math.round(s.res.rupiah)}\n`);
      process.stdout.write(`T13 stalled seed=${seed} end checklist ${JSON.stringify(lines(s))}\n`);
      process.stdout.write(`T13 stalled seed=${seed} rows ${JSON.stringify(tl.rows.filter((_, i) => i % 15 === 0).map((r) => ({ t: r.t, rp: Math.round(r.rupiah), pop: r.pop, beds: r.beds, net: Math.round(r.net), acts: r.acts, useful: r.useful })))}\n`);
      const interesting = s.buildings.filter((b) => ['warung', 'kebunSayur', 'posRonda', 'wifi', 'kantorRT'].includes(b.def));
      process.stdout.write(`T13 stalled seed=${seed} combo pieces ${JSON.stringify(interesting.map((b) => `${b.def}${b.level > 1 ? '@' + b.level : ''}:${b.status}:${b.x},${b.y}`))} active=${JSON.stringify(activeCombos(s).map((a) => a.combo.id))}\n`);
    }
  }, 1_800_000);

  it('takeovers: which runs gain nothing', () => {
    const rows = SEEDS.slice(0, 5).flatMap((seed) => TAKEOVERS.map(([from, at]) => takeover(seed, from, at)));
    for (const r of rows) process.stdout.write(`T13 takeover seed=${r.seed} from=${r.from} at=${r.atTick} gained=${r.gained} ${r.detail}\n`);
    for (const r of rows.filter((x) => !x.gained)) {
      const out: { s?: GameState } = {};
      runBot(r.from as BotId, r.seed, r.atTick, { out });
      const s = out.s!;
      process.stdout.write(`T13 stalled seed=${r.seed} from=${r.from} state stage=${s.stage.current} stars=${s.stage.stars[s.stage.current]} sk=${s.stage.sk} pop=${population(s)} beds=${housing(s)} rupiah=${s.res.rupiah} checklist=${JSON.stringify(lines(s))}\n`);
    }
  }, 1_800_000);
});
