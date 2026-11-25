import { describe, expect, it } from 'vitest';
import { setLang } from '../src/i18n';
import { def } from '../src/sim/content';
import { newGame } from '../src/sim/state';
import { effectLine } from '../src/ui/build';

describe('build card effect line', () => {
  it('names weekly income and Popularitas in one short line, or the draw, or nothing', () => {
    setLang('en');
    const s = newGame(1);
    // A shop earns: income per week, with "Rp" for the sheet's money icon.
    expect(effectLine(s, def('warung')).text).toMatch(/^\+Rp \S+$/);
    // A building with only Popularitas.
    expect(effectLine(s, { income: 0, perMonth: { sabar: 1 } })).toEqual({ text: '+1 Popularitas', draws: false });
    // A building that only pulls people in: an icon on the card.
    expect(effectLine(s, { income: 0, attract: 2 })).toEqual({ text: '', draws: true });
    // Houses already show their beds on the card.
    expect(effectLine(s, { income: 0, housing: 4, attract: 1 })).toEqual({ text: '', draws: false });
  });
});
