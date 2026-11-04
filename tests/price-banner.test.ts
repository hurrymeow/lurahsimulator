import { afterEach, describe, expect, it } from 'vitest';
import { PRICE_REASONS } from '../src/sim/balance';
import { WEEKS_PER_YEAR } from '../src/sim/calendar';
import { newGame } from '../src/sim/state';
import { yearEnd } from '../src/sim/tick';
import type { Fx } from '../src/sim/gain';
import { EN } from '../src/i18n/en';
import { ID } from '../src/i18n/id';
import { setLang, t, type Key } from '../src/i18n';

const words = (s: string) => s.split(/\s+/).filter((w) => /\p{L}/u.test(w)).length;

afterEach(() => setLang('en'));

describe('the yearly price banner', () => {
  it('is a card from year 2, with a fresh reason each year and never the same twice in a row', () => {
    const s = newGame(7);
    const reasons: string[] = [];
    for (let y = 1; y <= 40; y++) {
      s.month = y * WEEKS_PER_YEAR;
      const fx: Fx = [];
      yearEnd(s, fx);
      const card = fx.find((f) => f.kind === 'notice' && f.card);
      expect(card, `year ${y + 1}`).toBeTruthy();
      if (card?.kind !== 'notice') continue;
      expect(card.cls).toBe('price-banner');
      expect(card.title).toContain(`year ${y + 1}`);
      reasons.push(card.body);
    }
    for (let i = 1; i < reasons.length; i++) expect(reasons[i], `year ${i + 2}`).not.toBe(reasons[i - 1]);
    // Over 40 years every reason in the bank turns up.
    expect(new Set(reasons).size).toBe(PRICE_REASONS);
  });

  it('every reason exists in both languages and stays a short pop-up body (UI.md rule 8)', () => {
    for (let i = 0; i < PRICE_REASONS; i++) {
      const k = `price.reason.${i}` as Key;
      expect(EN[k], k).toBeTruthy();
      expect(ID[k], k).toBeTruthy();
      for (const lang of ['en', 'id'] as const) {
        setLang(lang);
        expect(words(t(k)), `${lang} ${k}`).toBeLessThanOrEqual(25);
      }
    }
    expect(EN[`price.reason.${PRICE_REASONS}` as Key]).toBeUndefined();
  });
});
