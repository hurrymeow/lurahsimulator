import { writeFileSync } from 'node:fs';
import { afterEach, describe, expect, it } from 'vitest';
import { setGrid } from '../src/sim/types';
import { playKec } from './kec-bot-lib';

afterEach(() => setGrid('rt'));

describe.skipIf(!process.env.KEC_BOT)('Kecamatan bot (exploration, KEC_BOT=1)', () => {
  it('explores', () => {
    const out = [3, 4, 6].map((seed) => playKec(seed));
    writeFileSync('/tmp/kec-bot.json', JSON.stringify(out));
    expect(out.length).toBe(3);
  }, 3_000_000);
});
