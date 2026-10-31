import type { ResourceId } from '../sim/types';

export interface WacanaDef {
  id: string;
  name: string;
  line: string;
  /** What it costs while the approval lasts. Monthly, at full approval. Rupiah is before inflation. */
  side: Partial<Record<ResourceId, number>>;
  /** One line that says it in words. */
  trade: string;
}

// Nothing here builds anything. That is the joke. The price is the number: each one buys Popularitas
// and charges something else, so announcing is a trade, not a free button.
export const WACANA: WacanaDef[] = [
  { id: 'digital', name: 'Kampung Digital 2030', line: 'A QR code will be placed on the pos ronda. Eventually.', side: { rupiah: -40_000, viral: 2 }, trade: 'Adds Virality. Costs Rp 40k a week in cloud bills.' },
  { id: 'gotong', name: 'Gotong Royong 2.0', line: 'Same as gotong royong, but with a hashtag.', side: { rupiah: -30_000 }, trade: 'Costs Rp 30k a week in snacks for the volunteers.' },
  { id: 'genangan', name: 'Zero Genangan', line: 'We will study the puddle. A committee will be formed.', side: { orangDalam: -0.2 }, trade: 'Spends Orang Inside. The committee needs favours.' },
  { id: 'warung', name: 'Warung Naik Kelas', line: 'Every warung to be upgraded to "UMKM". Paperwork TBD.', side: { rupiah: -50_000, viral: 1.5 }, trade: 'Adds Virality. Costs Rp 50k a week in paperwork.' },
  { id: 'hijau', name: 'Kampung Hijau', line: 'Three pots of cabai will be placed near the kantor.', side: { rupiah: -10_000 }, trade: 'Cheap. Costs Rp 10k a week for the pots.' },
];

export const WACANA_COST = 100_000;
export const WACANA_POWER = 10;
export const WACANA_DECAY = 0.8;
export const WACANA_SABAR_PER_POWER = 0.1;
/** Each repeat costs this much more, up to the cap, because people have heard it before. */
export const WACANA_COST_STEP = 0.25;
export const WACANA_COST_CAP = 4;
/** Each repeat lands this much softer, down to the floor. */
export const WACANA_FATIGUE = 0.12;
export const WACANA_FATIGUE_FLOOR = 0.4;
