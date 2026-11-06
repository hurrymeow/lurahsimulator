import { afterEach, describe, expect, it } from 'vitest';
import { EVENTS } from '../src/data/events';
import { STAGE_EVENTS } from '../src/data/higher';
import { eBody, eLabel, setLang } from '../src/i18n';
import { splitStatText } from '../src/ui/statIcons';

/**
 * Words as the density scan counts them on screen: runs with a letter. Stat names and money amounts render as
 * icons (src/ui/statIcons.ts), and numbers and icons are not words.
 */
const words = (s: string, lang: 'en' | 'id') =>
  splitStatText(s, lang).filter((g) => g.kind === 'text' || g.kind === 'plain').map((g) => (g as { text: string }).text).join(' ').split(/\s+/).filter((w) => /\p{L}/u.test(w)).length;

afterEach(() => setLang('en'));

describe('event text (UI.md rules 13 and 16)', () => {
  for (const lang of ['en', 'id'] as const) {
    it(`every event body is one paragraph of 20 words or fewer, and every choice 6 or fewer, in ${lang}`, () => {
      setLang(lang);
      const over: string[] = [];
      for (const e of [...EVENTS, ...STAGE_EVENTS]) {
        const b = words(eBody(e), lang);
        if (b > 20) over.push(`${e.id} body ${b}: ${eBody(e)}`);
        e.choices.forEach((c, i) => {
          const n = words(eLabel(e, i, c), lang);
          if (n > 6) over.push(`${e.id} choice ${i} ${n}: ${eLabel(e, i, c)}`);
        });
      }
      expect(over).toEqual([]);
    });
  }
});
