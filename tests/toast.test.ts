import { afterEach, describe, expect, it } from 'vitest';
import { toastParts } from '../src/format';
import { setLang, t } from '../src/i18n';

const words = (s: string) => s.split(/\s+/).filter((w) => /\p{L}/u.test(w)).length;

afterEach(() => setLang('en'));

describe('toast text', () => {
  it('shows an empty title as the body alone', () => {
    expect(toastParts('', 'Saved')).toEqual(['', 'Saved']);
  });

  it('keeps the body when title and body fit in 8 words', () => {
    expect(toastParts('Bu Fajar moved in', 'Rumah 2 is full')).toEqual(['Bu Fajar moved in', 'Rumah 2 is full']);
  });

  it('drops the body when the two run past 8 words', () => {
    expect(toastParts('Bu Fajar moved out today', 'Popularitas is below 15, raise it')).toEqual(['Bu Fajar moved out today', '']);
  });

  it('the moved-out title names the reason in 8 words or fewer, in both languages', () => {
    for (const lang of ['en', 'id'] as const) {
      setLang(lang);
      const title = t('sim.movedOut', { name: 'Fajar', n: 15 });
      expect(title).toContain('15');
      expect(words(title), `${lang}: ${title}`).toBeLessThanOrEqual(8);
    }
  });
});
