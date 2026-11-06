import { it } from 'vitest';
import { writeFileSync } from 'node:fs';
import { runBot } from '../scorecard/driver';
import { serialize } from '../../src/sim/save';
it('snapshots', () => {
  for (const stop of [3, 4, 5, 6, 7]) {
    const out: { s?: any } = {};
    const tl = runBot('hint', 2, 450, { stopStars: stop, out });
    const s = out.s;
    console.log('stop', stop, s.stage.current, JSON.stringify(s.stage.stars), 't', tl.ticks);
    writeFileSync('/tmp/claude-0/-home-user-lurahsimulator/314e3fbd-c738-5b20-9adb-09d6633d2373/scratchpad/t7/stop' + stop + '.json', serialize(s));
  }
}, 600000);
