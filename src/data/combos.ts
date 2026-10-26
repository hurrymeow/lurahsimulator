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
  /** Extra share of banjir damage this combo absorbs. The overall cap still applies. */
  banjirProtect?: number;
  /** Multiplier on the 17 Agustus prize while this combo stands. */
  agustusMult?: number;
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
    effect: 'Warung income x1.5. +1 Patience and +1 Virality a month.',
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
    effect: 'Both stores income x1.4. -2 Patience a month from diskon queues.',
  },
  {
    id: 'rapatMalam',
    name: 'Rapat Malam',
    needs: ['kantorRT', 'posRonda'],
    radius: 1,
    hint: 'The office and the hut share a late-night secret.',
    story: 'Decisions are made at the pos ronda at 11pm. Minutes are never taken.',
    perMonth: { orangDalam: 0.4 },
    effect: '+0.4 Orang Inside a month.',
  },
  {
    id: 'anakKos',
    name: 'Anak Kos',
    needs: ['kosan', 'warung', 'wifi'],
    radius: 1,
    hint: 'Students who live on mie instan and signal.',
    story: 'Midnight kopi, wifi voucher, and a rent that is always three days late.',
    incomeMult: { warung: 1.3 },
    perMonth: { viral: 1 },
    effect: 'Warung income x1.3. +1 Virality a month.',
  },
  {
    id: 'panjatPinang',
    name: 'Panjat Pinang',
    needs: ['lapangan', 'posRonda'],
    radius: 1,
    hint: 'A field, a greasy pole and the night watch for a referee.',
    story: 'The pos ronda holds the prizes. Nobody counts them before or after.',
    agustusMult: 1.5,
    effect: '17 Agustus prize +50%.',
  },
  {
    id: 'kaliBersih',
    name: 'Kali Bersih',
    needs: ['bankSampah', 'biopori'],
    radius: 1,
    hint: 'What goes in the bank stays out of the hole.',
    story: 'The plastic is weighed and the water soaks in. The kali has not looked this good in years.',
    banjirProtect: 0.2,
    effect: 'Banjir damage 20% lower. The 80% cap stays.',
  },
];
