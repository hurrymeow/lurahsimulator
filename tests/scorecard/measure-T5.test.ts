import { describe, expect, it } from 'vitest';
import { runBot } from './driver';
import { bandOf } from './scorecard';
import { buildCost } from '../../src/sim/state';
import { def } from '../../src/sim/content';

describe('T5 measure', () => {
  it('logs odn in B1', () => {
    let info = '';
    for (const seed of [1, 2, 3]) {
      const tl = runBot('builder', seed, 40);
      info += `seed ${seed} ` + tl.rows.filter((r) => bandOf(r.t) <= 2).map((r) => `t${r.t}:o${r.odn.toFixed(1)}/r${(r.rupiah / 1e6).toFixed(2)}M/s${r.stars}`).join(' ') + '\n';
      info += 'stars ' + tl.starTicks.join(',') + '\n';
      info += 'built ' + tl.events.filter((e) => e.kind === 'built').map((e) => `${e.t}:${(e as { id: string }).id}`).join(' ') + '\n';
      for (const n of [20, 30, 33, 34, 35, 36, 37]) {
        const o: { s?: import('../../src/sim/types').GameState } = {};
        runBot('builder', seed, n, { out: o });
        info += `t${n} k${o.s ? buildCost(o.s, def('kosan')) : '?'} b${o.s ? buildCost(o.s, def('barbershop')) : '?'} cash ${o.s?.res.rupiah} staff ${o.s?.staff?.length} `;
      }
      info += '\n';
    }
    expect(info).toBe('');
  });
});
