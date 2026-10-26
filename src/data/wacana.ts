export interface WacanaDef {
  id: string;
  name: string;
  line: string;
}

// Nothing here builds anything. That is the joke, and the Sabar is the number.
export const WACANA: WacanaDef[] = [
  { id: 'digital', name: 'Kampung Digital 2030', line: 'A QR code will be placed on the pos ronda. Eventually.' },
  { id: 'gotong', name: 'Gotong Royong 2.0', line: 'Same as gotong royong, but with a hashtag.' },
  { id: 'genangan', name: 'Zero Genangan', line: 'We will study the puddle. A committee will be formed.' },
  { id: 'warung', name: 'Warung Naik Kelas', line: 'Every warung to be upgraded to "UMKM". Paperwork TBD.' },
  { id: 'hijau', name: 'Kampung Hijau', line: 'Three pots of cabai will be placed near the kantor.' },
];

export const WACANA_COST = 100_000;
export const WACANA_POWER = 10;
export const WACANA_DECAY = 0.8;
export const WACANA_SABAR_PER_POWER = 0.15;
