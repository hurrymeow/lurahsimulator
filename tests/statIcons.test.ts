import { describe, expect, it } from 'vitest';
import { groupStatSegments, hasStatWord, splitStatText } from '../src/ui/statIcons';

const segs = (str: string, lang: 'id' | 'en') => splitStatText(str, lang);
const stats = (str: string, lang: 'id' | 'en') => segs(str, lang).filter((s) => s.kind === 'stat').map((s) => (s as { stat: string }).stat);

describe('stat word replacement', () => {
  it('replaces each word in each language', () => {
    expect(stats('Popularitas dan Viral dan Orang Dalam dan Rupiah', 'id')).toEqual(['sabar', 'viral', 'orangDalam', 'rupiah']);
    expect(stats('Popularitas and Virality and Orang Inside and Rupiah', 'en')).toEqual(['sabar', 'viral', 'orangDalam', 'rupiah']);
    expect(stats('memakan rupiah, Viral, atau Orang Dalam', 'id')).toEqual(['rupiah', 'viral', 'orangDalam']);
  });

  it('matches whole words only', () => {
    expect(stats('Popularitasx xPopularitas Popularitas.', 'id')).toEqual(['sabar']);
    expect(stats('Viralitas Viral', 'id')).toEqual(['viral']);
    // English stat is Virality, not Viral alone.
    expect(stats('Viral Pothole', 'en')).toEqual([]);
    expect(stats('Fake Virality collapsed', 'en')).toEqual(['viral']);
  });

  it('turns Rp amounts into the coin and the signed amount', () => {
    const money = (str: string) => segs(str, 'id').filter((s) => s.kind === 'money').map((s) => (s as { amount: string }).amount);
    expect(money('Menguras Rp 40rb sebulan')).toEqual(['40rb']);
    expect(money('Rp 500.000 untuk cat.')).toEqual(['500.000']);
    expect(money('+0,5 Orang Dalam dan -Rp 50rb per bulan.')).toEqual(['-50rb']);
    expect(money('+Rp 100rb per bulan')).toEqual(['+100rb']);
    expect(money('for Rp 50 juta.')).toEqual(['50 juta']);
    expect(hasStatWord('Rp 40rb', 'id')).toBe(true);
    expect(hasStatWord('RPG 40', 'id')).toBe(false);
    const grouped = groupStatSegments(segs('Dana ×6 Rp 8.064.000', 'id'));
    expect(grouped).toEqual([{ kind: 'text', text: 'Dana ×6 ' }, { kind: 'pair', before: '', stat: 'rupiah', after: '8.064.000' }]);
  });

  it('honours the plain escape', () => {
    const out = segs('Video itu {plain:Viral} di medsos', 'id');
    expect(out).toEqual([
      { kind: 'text', text: 'Video itu ' },
      { kind: 'plain', text: 'Viral' },
      { kind: 'text', text: ' di medsos' },
    ]);
    expect(stats('{plain:Popularitas}', 'id')).toEqual([]);
  });

  it('is idempotent on text segments, so the observer cannot loop', () => {
    for (const str of ['+1 Popularitas dan +1 Viral per bulan.', 'Pemasukan Warung x1,5. +1 Popularitas dan +1 Viral per bulan.']) {
      for (const seg of segs(str, 'id')) {
        if (seg.kind === 'text') expect(segs(seg.text, 'id')).toEqual([{ kind: 'text', text: seg.text }]);
      }
    }
  });

  it('pairs a number with its icon, so they never split across lines', () => {
    const grouped = groupStatSegments(segs('Pemasukan Warung x1,5. +1 Popularitas dan +1 Viral per bulan.', 'id'));
    expect(grouped.filter((g) => g.kind === 'pair')).toEqual([
      { kind: 'pair', before: '+1', stat: 'sabar', after: '' },
      { kind: 'pair', before: '+1', stat: 'viral', after: '' },
    ]);
    const before = groupStatSegments(segs('Capai 30 Viral', 'id'));
    expect(before.filter((g) => g.kind === 'pair')).toEqual([{ kind: 'pair', before: '30', stat: 'viral', after: '' }]);
    const after = groupStatSegments(segs('Viral 30 ke atas', 'id'));
    expect(after.filter((g) => g.kind === 'pair')).toEqual([{ kind: 'pair', before: '', stat: 'viral', after: '30' }]);
  });
});

describe('number grouping ignores sentence punctuation', () => {
  it('does not pull a trailing full stop into the pair', () => {
    const g = groupStatSegments(splitStatText('Dapat 5. Viral naik', 'id'));
    const pair = g.find((s) => s.kind === 'pair') as { before: string };
    expect(pair.before).toBe('');
  });
});
