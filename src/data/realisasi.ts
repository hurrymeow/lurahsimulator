// Every policy has two ways to go. Wacana (in data/wacana.ts) is the announcement: cheap, instant, it buys
// Popularitas and fills the Laporan, and nothing happens. Realisasi is the program done for real: it costs
// more, takes months to land, and moves a meter the warga feel. Promotion reads the Laporan; the ending
// reads Sejahtera. So the game keeps asking: announce it, or do it?

export interface RealisasiDef {
  id: string;
  /** The wacana it is the real version of. */
  wacana: string;
  name: string;
  line: string;
  cost: number;
  /** Months from paying to working. */
  delay: number;
  /** Months it works. 0 means it lasts. */
  lasts: number;
  /** Points added to a meter while it works. */
  kerja?: number;
  aman?: number;
  /** Share of households it feeds while it works, on top of the warung. */
  perutCover?: number;
  /** Extra share of banjir damage it absorbs, for good. */
  banjirProtect?: number;
  /** Warung Sembako income multiplier while it works. */
  warungMult?: number;
  /** Virality a month while it works. */
  viral?: number;
  /** Damaged buildings fixed a month while it works. */
  repairs?: number;
  /** Plain words: what it really does. */
  effect: string;
}

export const REALISASI: RealisasiDef[] = [
  { id: 'wifiGratis', wacana: 'digital', name: 'Wifi Gratis di Balai', line: 'A router in the balai, and a password on the wall.', cost: 2_000_000, delay: 3, lasts: 24, kerja: 5, viral: 2, effect: 'Kerja +5 and +2 Virality a month for 2 years.' },
  { id: 'kerjaBakti', wacana: 'gotong', name: 'Kerja Bakti Rutin', line: 'Every Sunday, 7 sharp. Coffee and gorengan on the kas.', cost: 1_000_000, delay: 3, lasts: 24, aman: 5, repairs: 1, effect: 'Aman +5, and one damaged building fixed a month, for 2 years.' },
  { id: 'bioporiMassal', wacana: 'genangan', name: 'Biopori Massal', line: 'A hole in every yard. Nobody argues with a hole.', cost: 2_500_000, delay: 3, lasts: 0, banjirProtect: 0.2, effect: 'Banjir damage 20% lower, for good.' },
  { id: 'pelatihanUmkm', wacana: 'warung', name: 'Pelatihan UMKM', line: 'Bookkeeping, packaging and how to post a menu.', cost: 3_000_000, delay: 3, lasts: 24, kerja: 8, warungMult: 1.1, effect: 'Kerja +8 and warung income +10% for 2 years.' },
  { id: 'bansos', wacana: 'hijau', name: 'Bansos Sembako', line: 'Rice, oil and sugar, to the right houses this time.', cost: 1_500_000, delay: 1, lasts: 6, perutCover: 0.3, effect: 'Feeds 30% more households for 6 months.' },
];

export const realisasiDef = (id: string): RealisasiDef | undefined => REALISASI.find((r) => r.id === id);
