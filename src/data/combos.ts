import type { ResourceId } from '../sim/types';

export interface ComboDef {
  id: string;
  name: string;
  /** Anchor is needs[0]. Every other building must stand within `radius` tiles of the anchor. */
  needs: string[];
  radius: number;
  /** Shown in Buku Combo before discovery. Vague on purpose. */
  hint: string;
  /** Shown after discovery. */
  story: string;
  /** Income multiplier per building def, applied to every member of the combo. */
  incomeMult?: Record<string, number>;
  /** Resource change per month, once per combo. */
  perMonth?: Partial<Record<ResourceId, number>>;
  /** Plain-language effect line. */
  effect: string;
}

// Add a combo by adding an object here. Nothing else to touch.
export const COMBOS: ComboDef[] = [
  {
    id: 'tongkrongan',
    name: 'Tongkrongan',
    needs: ['posRonda', 'warung', 'wifi'],
    radius: 1,
    hint: 'Somewhere to sit, something to sip, and a signal.',
    story: 'Nobody is on ronda. Everyone is on wifi. The kopi sachet sells itself.',
    incomeMult: { warung: 1.5 },
    perMonth: { sabar: 1, viral: 1 },
    effect: 'Warung income x1.5. +1 Sabar and +1 Viral a month.',
  },
  {
    id: 'rivalitas',
    name: 'Rivalitas Abadi',
    needs: ['indomaret', 'alfamart'],
    radius: 1,
    hint: 'Two giants. One street. Zero chill.',
    story: 'Promo war. Diskon every day. The queue for the diskon is the real product.',
    incomeMult: { indomaret: 1.4, alfamart: 1.4 },
    perMonth: { sabar: -2 },
    effect: 'Both stores income x1.4. -2 Sabar a month from diskon queues.',
  },
  {
    id: 'rapatMalam',
    name: 'Rapat Malam',
    needs: ['kantorRT', 'posRonda'],
    radius: 1,
    hint: 'The office and the hut share a late-night secret.',
    story: 'Decisions are made at the pos ronda at 11pm. Minutes are never taken.',
    perMonth: { orangDalam: 0.4 },
    effect: '+0.4 Orang Dalam a month.',
  },
];
