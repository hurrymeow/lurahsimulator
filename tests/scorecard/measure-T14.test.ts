import { describe, expect, it } from 'vitest';
import { act, runBot } from './driver';
import { connectedRoad, hasRoadBeside, setRoadRule } from '../../src/sim/access';
import { requirementGaps, siteGaps } from '../../src/sim/rules';
import { def } from '../../src/sim/content';
import { COMBOS } from '../../src/data/combos';
import { parseNeed } from '../../src/sim/combos';
import { count } from '../../src/sim/state';
import { easiestCombo, nextStep } from '../../src/sim/nextstep';
import { newGame } from '../../src/sim/state';
import { tick } from '../../src/sim/tick';
import { setGrid } from '../../src/sim/types';

/** Tick to minutes at 1x: one 8s tick is one week. */
const min = (t: number): number => (t * 8) / 60;

// Local measuring only: the reviewer deletes this file from the review commit.
describe('T14 measure: shopkeeper RT stars', () => {
  it('reports RT 1★ and RT 2★ minutes on seeds 1 to 3', () => {
    const runs = [1, 2, 3].map((seed) => {
      const tl = runBot('shopkeeper', seed, 200);
      const rt = tl.events.flatMap((e) => (e.kind === 'star' && e.stage === 'rt' ? [{ n: e.n, t: e.t }] : []));
      console.log(`seed ${seed} combos: ${tl.events.filter((e) => e.kind === 'combo').map((e) => `${(e as { id: string }).id}@${e.t}`).join(', ')}`);
      return { seed, rt };
    });
    for (const r of runs) console.log(`shopkeeper seed ${r.seed}: ${r.rt.map((x) => `RT ${x.n}★ ${min(x.t).toFixed(1)} min`).join(', ')}`);
    expect(runs.every((r) => r.rt.length > 0)).toBe(true);
  }, 60_000);

  it('traces builder staffing on seed 3', () => {
    const out: { s?: import('../../src/sim/types').GameState } = {};
    const tl = runBot('builder', 3, 400, { out });
    const staff = out.s?.staff ?? [];
    console.log(`builder seed3: asisten=${staff.filter((x) => x.role === 'asisten').length} stars=${tl.starTicks.join(',')} disc=${tl.end.discovered.length}`);
    expect(staff.length).toBeGreaterThanOrEqual(0);
  }, 60_000);

  it('traces the strip and the map around Kantor RT for the first ticks', () => {
    setGrid('rt');
    setRoadRule(true);
    const s = newGame(1);
    const noSpot = new Map<string, number>();
    let seen = 0;
    for (let t = 0; t < 70; t++) {
      const c = { s, fx: [], rnd: () => 0.5, acts: 0, t, noSpot };
      act(c, 'shopkeeper');
      const fresh = s.buildings.slice(seen).map((b) => `${b.def}@${b.x},${b.y}`);
      seen = s.buildings.length;
      const step = nextStep(s);
      if (t < 16 || t % 10 === 0) console.log(`t${t}: month=${s.month} cash=${Math.round(s.res.rupiah / 1000)}k res=${s.residents.length} acts=${c.acts} strip=${step?.kind} easiest=${easiestCombo(s)?.name} fresh=[${fresh.join(' ')}]`);
      if (t === 4 || t === 12) {
        const rp = def('posRonda');
        console.log(`  posRonda@6,9 gaps=[${siteGaps(s, rp, 6, 9).join('|')}] fed=${hasRoadBeside(connectedRoad(s), { def: 'posRonda', x: 6, y: 9 })}`);
        for (const cb of COMBOS) {
          if (cb.retired || s.discovered.includes(cb.id)) continue;
          const ids = cb.needs.map((n) => parseNeed(n).id);
          const defs = ids.map((id) => def(id));
          if (defs.some((d) => !d.placeable || requirementGaps(s, d, { ignoreLimit: true }).length)) continue;
          const cost = defs.reduce((sum, d) => sum + (count(s, d.id) ? 0 : d.cost), 0);
          console.log(`  cand ${cb.id} cost=${Math.round(cost / 1000)}k ids=${ids.join('+')} have=${ids.map((id) => count(s, id)).join(',')}`);
        }
      }
      tick(s);
    }
    setRoadRule(false);
    expect(true).toBe(true);
  }, 60_000);
});
