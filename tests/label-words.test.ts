import { afterEach, describe, expect, it } from 'vitest';
import { EN } from '../src/i18n/en';
import { setLang, t, type Key } from '../src/i18n';

const words = (s: string) => s.split(/\s+/).filter((w) => /\p{L}/u.test(w)).length;
// Placeholders at their longest: a 3-word building name, and the longest combo name in play.
const VARS = { n: 12, min: 60, pct: 80, under: 5, stars: 2, name: 'Koperasi Simpan Pinjam' };
const COMBO = { name: 'Dari Sawah ke Warung' };

afterEach(() => setLang('en'));

describe('UI.md rule 16: the goal pill says it in 6 words or fewer', () => {
  const keys = (Object.keys(EN) as Key[]).filter((k) => /^(goal\.short\.|stage\.goalShort\.)/.test(k));
  it.each(['en', 'id'] as const)('every short goal fits with its label in %s', (lang) => {
    setLang(lang);
    const over = keys.map((k) => t('goal.label', { goal: t(k, k === 'goal.short.combo' ? COMBO : VARS) })).filter((s) => words(s) > 6);
    expect(over).toEqual([]);
  });
});
