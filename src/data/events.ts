import type { Resources } from '../sim/types';

export interface EventChoice {
  label: string;
  cost?: { rupiah?: number; orangDalam?: number };
  /** Instant resource change. */
  res?: Partial<Resources>;
  /** Timed income multiplier. */
  modifier?: { label: string; target: string; incomeMult: number; months: number };
  /** Special handling in code, for effects that need the map. */
  special?: 'banjir';
  /** Shown after choosing. */
  result: string;
}

export interface EventDef {
  id: string;
  name: string;
  body: string;
  when: {
    /** Calendar months, 0 = Jan. */
    months?: number[];
    /** Earliest month since start. */
    minMonth?: number;
    /** RT stars needed before it can happen. */
    minStars?: number;
    /** Chance each eligible month. 1 = always. */
    chance: number;
    /** Months before the same event can come back. */
    cooldown?: number;
  };
  /** The first choice must always be free so an event can never soft-lock. */
  choices: EventChoice[];
}

// Rupiah costs here are base prices. The engine applies inflation.
export const EVENTS: EventDef[] = [
  {
    id: 'agustusan',
    name: '17 Agustus: Lomba',
    body: 'Panjat pinang, balap karung and kerupuk. The panitia wants a budget, and the kampung wants a prize.',
    when: { months: [7], chance: 1 },
    choices: [
      { label: 'Skip the lomba', res: { sabar: -8 }, result: 'Nobody won anything.' },
      {
        label: 'Fund it · Rp 1.000.000',
        cost: { rupiah: 1_000_000 },
        res: { sabar: 15, viral: 10 },
        modifier: { label: 'Lomba crowd', target: '*', incomeMult: 1.2, months: 2 },
        result: 'The kampung got a proper lomba.',
      },
      { label: 'Ask a sponsor · 1 Orang Dalam', cost: { orangDalam: 1 }, res: { sabar: 10 }, result: 'A "sponsor" appeared.' },
    ],
  },
  {
    id: 'banjir',
    name: 'Banjir',
    body: 'Hujan deras for three days. Selokan level decides how much of the kampung floats. Each selokan level cuts the damage by 20%.',
    when: { months: [10, 11, 0, 1], minMonth: 10, chance: 0.3, cooldown: 9 },
    choices: [{ label: 'Check the damage', special: 'banjir', result: '' }],
  },
  {
    id: 'cabai',
    name: 'Harga Cabai Naik',
    body: 'Cabai rawit at a price nobody can explain. Every warung is affected.',
    when: { minMonth: 4, minStars: 1, chance: 0.07, cooldown: 6 },
    choices: [
      {
        label: 'Let it ride',
        res: { sabar: -4 },
        modifier: { label: 'Harga cabai', target: 'warung', incomeMult: 0.75, months: 4 },
        result: 'Sambal prices stay a mystery.',
      },
      { label: 'Subsidise · Rp 500.000', cost: { rupiah: 500_000 }, res: { sabar: 3 }, result: 'Sambal stays affordable.' },
      {
        label: 'Operasi pasar · 1 Orang Dalam',
        cost: { orangDalam: 1 },
        modifier: { label: 'Operasi pasar', target: 'warung', incomeMult: 0.9, months: 2 },
        result: 'A truck of cabai arrived.',
      },
    ],
  },
];

export const eventDef = (id: string) => EVENTS.find((e) => e.id === id);

export const BANJIR_PROTECT_PER_LEVEL = 0.2;
export const BANJIR_MAX_PROTECT = 0.8;
export const BANJIR_HIT_CHANCE = 0.45;
export const BANJIR_SABAR = 6;
export const REPAIR_FRACTION = 0.25;
