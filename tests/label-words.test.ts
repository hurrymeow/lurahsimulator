import { afterEach, describe, expect, it } from 'vitest';
import { EN } from '../src/i18n/en';
import { setLang, t, type Key } from '../src/i18n';

const words = (s: string) => s.split(/\s+/).filter((w) => /\p{L}/u.test(w)).length;
// Placeholders as the pill shows them: numbers are free, a building name is the longest one in play.
const VARS = { n: 12, min: 60, pct: 80, under: 5, stars: 2, name: 'Warung Sembako', pieces: 'Warung, Pos Ronda' };

afterEach(() => setLang('en'));

describe('UI.md rule 16: the goal pill says it in 6 words or fewer', () => {
  // The combo line names the buildings to place side by side, so its length is the combo's, not the wording's.
  const keys = (Object.keys(EN) as Key[]).filter((k) => /^(goal\.short\.|stage\.goalShort\.)/.test(k) && k !== 'goal.short.combo');
  it.each(['en', 'id'] as const)('every short goal fits with its label in %s', (lang) => {
    setLang(lang);
    const over = keys.map((k) => t('goal.label', { goal: t(k, VARS) })).filter((s) => words(s) > 6);
    expect(over).toEqual([]);
  });
});
