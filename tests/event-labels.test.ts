import { describe, expect, it } from 'vitest';
import { EVENTS } from '../src/data/events';
import { STAGE_EVENTS } from '../src/data/higher';
import { eLabel, setLang } from '../src/i18n';

// The event card strips "· Rp N" from a label and shows the real price after it. Words after the price
// would be glued on to the label ("Join in snacks"), so a price must end the label.
describe('event labels', () => {
  for (const lang of ['en', 'id'] as const) {
    it(`a price ends the label (${lang})`, () => {
      setLang(lang);
      for (const e of [...EVENTS, ...STAGE_EVENTS]) {
        e.choices.forEach((c, i) => expect(eLabel(e, i, c), `${e.id} choice ${i}`).not.toMatch(/ · (Rp [\d.]+|\d+ Orang \w+) \S/));
      }
    });
  }
});
