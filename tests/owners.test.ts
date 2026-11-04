import { afterEach, describe, expect, it } from 'vitest';
import { promote } from '../src/sim/grow';
import { cellPlates } from '../src/sim/owners';
import { newGame } from '../src/sim/state';
import { setGrid } from '../src/sim/types';
import { setLang } from '../src/i18n';

afterEach(() => {
  setGrid('rt');
  setLang('en');
});

describe('who runs which RT, on the map', () => {
  it('the RT stage has one RT and no plates', () => {
    expect(cellPlates(newGame(3))).toEqual([]);
  });

  it('at the RW both RTs read Yours', () => {
    const s = newGame(3);
    s.stage.stars.rt = 3;
    promote(s, []);
    const plates = cellPlates(s);
    expect(plates.map((p) => [p.text, p.mine])).toEqual([
      ['RT 1 · Yours', true],
      ['Kampung Sebelah · Yours', true],
    ]);
  });

  it('at the Kelurahan every plate names its RW, and Kampung Sebelah is the player\'s', () => {
    const s = newGame(3);
    s.stage.stars.rt = 3;
    promote(s, []);
    s.stage.stars.rw = 3;
    promote(s, []);
    const plates = cellPlates(s);
    expect(plates.filter((p) => p.mine).map((p) => p.text)).toEqual(['RT 1 · RW 1 · Yours', 'Kampung Sebelah · RW 1 · Yours']);
    expect(plates.filter((p) => !p.mine).every((p) => / · RW 2 · AI$/.test(p.text))).toBe(true);
    expect(plates).toHaveLength(4);
  });
});
