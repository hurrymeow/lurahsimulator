import { afterEach, describe, expect, it } from 'vitest';
import { BUILDINGS } from '../src/data/buildings';
import { STAGE_BUILDINGS } from '../src/data/higher';
import { bBlurb, setLang, type Lang } from '../src/i18n';

// The building panel shows a blurb through bBlurb (src/ui/inspect.ts), so that is what we count.
// BUILDINGS already holds the core, shop, farm and decoration sets; STAGE_BUILDINGS adds every
// RW, Kelurahan/Desa and Kecamatan building from src/data/higher/.
const ALL_BUILDINGS = [...BUILDINGS, ...STAGE_BUILDINGS];
const MAX_WORDS = 25;

const wordCount = (text: string): number => text.trim().split(/\s+/).filter(Boolean).length;

afterEach(() => setLang('en'));

describe('building blurbs', () => {
  for (const lang of ['en', 'id'] as Lang[]) {
    it(`stay at ${MAX_WORDS} words or fewer in ${lang}`, () => {
      setLang(lang);
      const over = ALL_BUILDINGS.map((d) => {
        const text = bBlurb(d);
        return { id: d.id, text, count: wordCount(text) };
      })
        .filter((b) => b.count > MAX_WORDS)
        .map((b) => `${lang} ${b.id}: ${b.count} words — ${b.text}`);
      expect(over, over.join('\n')).toEqual([]);
    });
  }
});
