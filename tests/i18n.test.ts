import { afterEach, describe, expect, it } from 'vitest';
import { BUILDINGS } from '../src/data/buildings';
import { COMBOS } from '../src/data/combos';
import { EVENTS } from '../src/data/events';
import { JOBS } from '../src/data/jobs';
import { LINES } from '../src/data/lines';
import { STAGES } from '../src/data/stages';
import { WACANA } from '../src/data/wacana';
import { EN } from '../src/i18n/en';
import { ID } from '../src/i18n/id';
import { ID_DATA } from '../src/i18n/id-data';
import { setLang, t, tr } from '../src/i18n';

const vars = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();

afterEach(() => setLang('en'));

describe('string tables', () => {
  it('Indonesian has exactly the English keys and the same placeholders', () => {
    expect(Object.keys(ID).sort()).toEqual(Object.keys(EN).sort());
    for (const k of Object.keys(EN) as (keyof typeof EN)[]) expect(vars(ID[k]), k).toEqual(vars(EN[k]));
  });

  it('every data key points at real content and every field is translated', () => {
    const expected = new Set<string>();
    for (const b of BUILDINGS) {
      expected.add(`building.${b.id}.blurb`);
      if (b.removeBlockedReason) expected.add(`building.${b.id}.block`);
    }
    for (const c of COMBOS) ['hint', 'story', 'effect'].forEach((f) => expected.add(`combo.${c.id}.${f}`));
    for (const j of JOBS) expected.add(`job.${j.id}.blurb`);
    for (const st of STAGES) st.titles.forEach((_, i) => expected.add(`stage.${st.id}.title${i}`));
    for (const w of WACANA) expected.add(`wacana.${w.id}.line`);
    for (const e of EVENTS) {
      expected.add(`event.${e.id}.name`);
      expected.add(`event.${e.id}.body`);
      e.choices.forEach((c, i) => {
        expected.add(`event.${e.id}.c${i}.label`);
        if (c.result) expected.add(`event.${e.id}.c${i}.result`);
        if (c.modifier) expected.add(`event.${e.id}.c${i}.mod`);
        c.outcomes?.forEach((_, j) => expected.add(`event.${e.id}.c${i}.o${j}.result`));
      });
    }
    for (const l of LINES) {
      expected.add(`line.${l.id}.name`);
      expected.add(`line.${l.id}.line`);
    }
    for (const k of expected) expect(ID_DATA[k], k).toBeTruthy();
    const orphans = Object.keys(ID_DATA).filter((k) => !expected.has(k) && !/\.(name)$/.test(k));
    expect(orphans).toEqual([]);
  });

  it('switches language and falls back to English for unknown data keys', () => {
    setLang('id');
    expect(t('page.menu')).toBe('Menu');
    expect(t('set.on')).toBe('Nyala');
    expect(tr('nope.key', 'English')).toBe('English');
    setLang('en');
    expect(t('set.on')).toBe('On');
  });
});
