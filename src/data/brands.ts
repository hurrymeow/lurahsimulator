// Chain brands. A building gets a brand only when its real-world version is a chain, and the brand
// acts the way the chain does in real life. Parody names only: never a logo or brand colours.
//
// - rival: two different brands within RIVAL radius start a price war (a combo, see Perang Kuota).
// - franchise: outlets of one brand anywhere in the area lift each other, and pay a royalty up the chain.
// Minimarkets are their own buildings (IndoApril, BetaMart), so their brand is the building itself.

export type BrandKind = 'rival' | 'franchise';

export interface BrandSet {
  kind: BrandKind;
  names: string[];
}

export const BRANDS: Record<string, BrandSet> = {
  wifi: { kind: 'rival', names: ['Telkomkesel', 'M4', 'Indosatset', 'XXL', 'Smartfriend', 'By.Utang'] },
  rumahMakan: {
    kind: 'franchise',
    names: ['Sadarhina', 'Seafood 88', 'Warteg Bahari', 'Warteg Karisma Banjir', 'Siang Malam', 'Bebek Kalem', 'Mie Gacor', 'Bakso Bang Toyib', 'Bakso Urat Malu', 'Janji Palsu', 'Starbaks', 'Kopi Utang'],
  },
  apotek: { kind: 'franchise', names: ['K-12', 'Kimia Farmasih', 'Whatsons', 'Gardu Ian'] },
  bengkel: { kind: 'franchise', names: ['Planet Ban Bocor', 'Ahas-Ahas', 'Bengkel Ketok Magic', 'Tambal Ban 24 Jam'] },
  barbershop: { kind: 'franchise', names: ['Kapten Cukur', 'Cukur Gaya Oppa', 'Om Kumis', 'Pangkas Kilat'] },
};

/** Buildings that are not chains get a plain local name. {name} is a resident's given name. */
export const LOCAL_NAMES: Record<string, string[]> = {
  warung: ['Warung Bu {name}', 'Warung Pak {name}', 'Warung Mbak {name}'],
  kosan: ['Kos Pak {name}', 'Kos Bu {name}'],
  kontrakan: ['Kontrakan Pak {name}', 'Kontrakan Bu {name}'],
  fotokopi: ['Fotokopi Berkah Jaya Abadi', 'Fotokopi Barokah Kilat', 'Fotokopi Legalisir 3 Hari'],
  koperasi: ['KSP Sejahtera Bersama (Pengurus)', 'Koperasi Simpan Pinjam Pinjam'],
};

/** Each other outlet of the same brand adds this much income, up to the cap. A share goes up the chain. */
export const FRANCHISE = { perOutlet: 0.08, max: 0.24, royalty: 0.05 };

/** Two of the same minimarket this close eat each other's customers. */
export const KANIBAL = { radius: 2, mult: 0.85 };
export const MINIMARKETS = ['indomaret', 'alfamart'];

/** Longest name a player may give a building, so it fits the inspector title at 320px. */
export const NAME_MAX = 24;
