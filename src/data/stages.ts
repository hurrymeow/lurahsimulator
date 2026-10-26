import type { StageDef } from '../sim/types';

// The star ladder. Numbers live in STAGES.md; tune them here.
// stars[0] is what it takes to earn 1 star, stars[1] 2 stars, stars[2] 3 stars.
// RW and Kelurahan are added by their own threads.
export const STAGES: StageDef[] = [
  {
    id: 'rt',
    titles: ['Pak RT', 'RT Rintisan', 'RT Berkembang', 'RT Teladan'],
    next: 'rw',
    stars: [
      { goals: [{ kind: 'residents', n: 12 }, { kind: 'combos', n: 1 }], unlocks: ['indomaret', 'alfamart', 'kosan'], reward: { orangDalam: 1 } },
      { goals: [{ kind: 'residents', n: 25 }, { kind: 'rankWins', n: 1 }, { kind: 'combos', n: 2 }], unlocks: ['lapangan', 'bankSampah'] },
      { goals: [{ kind: 'residents', n: 40 }, { kind: 'winStreak', n: 2 }, { kind: 'combos', n: 3 }, { kind: 'sabar', n: 50 }], unlocks: [] },
    ],
  },
];
