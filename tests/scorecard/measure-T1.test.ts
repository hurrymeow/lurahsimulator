// Local measuring for T1 (decisions/scorecard-design-calls.md). The reviewer deletes this file.
import { describe, it } from 'vitest';
import { act, runBot, type BotId, type Timeline } from './driver';
import { newGame, population } from '../../src/sim/state';
import { tick } from '../../src/sim/tick';
import { nextStep, easiestCombo } from '../../src/sim/nextstep';
import { setGrid } from '../../src/sim/types';
import { setRoadRule } from '../../src/sim/access';

/** Tick of the first star event with total-star number n, or undefined. */
const starTick = (tl: Timeline, n: number): number | undefined => tl.events.find((e) => e.kind === 'star' && e.n === n)?.t;
/** Tick of the first combo discovery. */
const comboTick = (tl: Timeline): number | undefined => tl.events.find((e) => e.kind === 'combo')?.t;
const min = (t: number | undefined) => (t === undefined ? 'none' : (t * 8 / 60).toFixed(1));
const mulberry = (seed: number): (() => number) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let x = Math.imul(a ^ (a >>> 15), 1 | a);
    x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
};

describe('T1 measure', () => {
  it('logs RT 1★, RT 2★ and first combo per bot and seed', () => {
    for (const bot of ['builder', 'shopkeeper', 'safety', 'hint', 'cheapskate'] as const) {
      for (const seed of [1, 2, 3]) {
        const tl = runBot(bot, seed, 200);
        const c = tl.events.find((e) => e.kind === 'combo');
        console.log(`${bot} seed ${seed}: RT1=${min(starTick(tl, 1))} RT2=${min(starTick(tl, 2))} firstCombo=${min(comboTick(tl))} (${c?.kind === 'combo' ? c.id : 'none'})`);
      }
    }
  }, 120_000);

  it('traces the first ticks and the lots beside Kantor RT', () => {
    setGrid('rt');
    setRoadRule(true);
    const s = newGame(1);
    const rnd = mulberry(1 * 7919 + 2);
    const noSpot = new Map<string, number>();
    const k = s.buildings.find((b) => b.def === 'kantorRT')!;
    const near = () => s.buildings.filter((b) => b.def !== 'jalan' && Math.abs(b.x - k.x) <= 2 && Math.abs(b.y - k.y) <= 2).map((b) => `${b.def}@${b.x},${b.y}`).join(' ');
    console.log(`t0 before: ${near()}`);
    for (let t = 0; t < 14; t++) {
      const step = nextStep(s);
      const pick = easiestCombo(s);
      act({ s, fx: [], rnd, acts: 0, t, noSpot }, 'shopkeeper' as BotId);
      tick(s);
      console.log(`t${t} ${min(t)}m step=${step?.kind ?? '-'} pick=${pick?.ids.join('+') ?? '-'}/${pick?.cost ?? '-'} pop=${population(s)} cash=${Math.round(s.res.rupiah / 1000)}k near=[${near()}]`);
    }
  }, 60_000);

  it('traces what the strip names and what the shopkeeper owns', () => {
    setGrid('rt');
    setRoadRule(true);
    const s = newGame(1);
    const rnd = mulberry(1 * 7919 + 2);
    const noSpot = new Map<string, number>();
    for (let t = 0; t < 60; t++) {
      const step = nextStep(s);
      const pick = easiestCombo(s);
      const c = { s, fx: [], rnd, acts: 0, t, noSpot };
      act(c, 'shopkeeper' as BotId);
      tick(s);
      if (t >= 10 && t <= 24) {
        const where = (id: string) => s.buildings.filter((b) => b.def === id).map((b) => `${b.x},${b.y}:${b.status}`).join(' ');
        console.log(`t${t} ${min(t)}m cash=${Math.round(s.res.rupiah / 1000)}k step=${step?.kind ?? '-'} pick=${pick?.ids.join('+') ?? '-'} disc=${s.discovered.join(',')} kantor=[${where('kantorRT')}] pos=[${where('posRonda')}]`);
      }
    }
  }, 60_000);
});
