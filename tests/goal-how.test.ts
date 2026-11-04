import { afterEach, describe, expect, it } from 'vitest';
import { setLang, t } from '../src/i18n';
import { EN } from '../src/i18n/en';
import { ID } from '../src/i18n/id';
import { GOAL_HOW } from '../src/sim/stages';

const words = (s: string) => s.split(/\s+/).filter((w) => /\p{L}/u.test(w)).length;

afterEach(() => setLang('en'));

describe('goal how-to lines', () => {
  it('every goal kind has its own line in both languages, 20 words or fewer (UI.md rule 13)', () => {
    for (const [kind, key] of Object.entries(GOAL_HOW)) {
      expect(key, kind).toBe(`goal.how.${kind}`);
      expect(EN[key], kind).toBeTruthy();
      expect(ID[key], kind).toBeTruthy();
      for (const lang of ['en', 'id'] as const) {
        setLang(lang);
        expect(words(t(key)), `${lang} ${kind}`).toBeLessThanOrEqual(20);
      }
    }
  });
});
