import { describe, it } from 'vitest';
import { runBot } from './driver';

/** Local measurement for T15: shopkeeper RT 1★ and 2★ on seeds 1 to 3. The reviewer deletes this file. */
const minutes = (tick: number): number => +((tick * 8) / 60).toFixed(1);

describe('measure T15: shopkeeper RT stars', () => {
  it('logs RT 1★ and 2★ for seeds 1 to 3', () => {
    for (const seed of [1, 2, 3]) {
      const tl = runBot('shopkeeper', seed, 200);
      const [one, two] = tl.starTicks.slice(0, 2).map(minutes);
      console.log(`shopkeeper seed ${seed}: RT 1★ ${one} min, RT 2★ ${two} min`);
      console.log(`  combos: ${tl.events.filter((e) => e.kind === 'combo').map((e) => `${e.id}@${minutes(e.t)}`).join(', ')}`);
    }
  }, 120_000);
});
