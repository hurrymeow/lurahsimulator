import { afterEach, describe, expect, it } from 'vitest';
import { allDefs } from '../src/sim/content';
import { bBlurb, setLang, type Lang } from '../src/i18n';

/** UI.md rule 8: a building blurb is 25 words or fewer. */
const MAX_WORDS = 25;

const countWords = (s: string): number => s.trim().split(/\s+/).filter(Boolean).length;

afterEach(() => setLang('en'));

describe('building blurbs', () => {
  for (const lang of ['en', 'id'] as Lang[]) {
    it(`says at most ${MAX_WORDS} words in ${lang}`, () => {
      setLang(lang);
      const over = allDefs()
        .map((d) => ({ id: d.id, words: countWords(bBlurb(d)) }))
        .filter((b) => b.words > MAX_WORDS)
        .map((b) => `${b.id} (${lang}): ${b.words} words`);
      expect(over).toEqual([]);
    });
  }
});
