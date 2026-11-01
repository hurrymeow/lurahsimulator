import type { StageDef } from '../sim/types';
import { HIGHER_STAGES } from './higher';

// The star ladder. Numbers live in GAME-DESIGN.md; tune them here.
// stars[0] is what it takes to earn 1 star, stars[1] 2 stars, stars[2] 3 stars.
// RW and Kelurahan are added by their own threads.
export const STAGES: StageDef[] = [
  {
    id: 'rt',
    titles: ['Pak RT', 'RT Rintisan', 'RT Berkembang', 'RT Teladan'],
    next: 'rw',
    stars: [
      { goals: [{ kind: 'residents', n: 10 }, { kind: 'combos', n: 1 }], unlocks: ['indomaret', 'alfamart', 'kosan', 'barbershop', 'pohonRindang', 'sawah'], reward: { orangDalam: 1 } },
      { goals: [{ kind: 'residents', n: 25 }, { kind: 'rankWins', n: 1 }, { kind: 'combos', n: 2 }, { kind: 'sabar', n: 50 }], unlocks: ['lapangan', 'bankSampah', 'bengkel', 'paud', 'bangku', 'kandangAyam'] },
      { goals: [{ kind: 'residents', n: 55 }, { kind: 'winStreak', n: 2 }, { kind: 'combos', n: 3 }, { kind: 'sabar', n: 65 }], unlocks: ['apotek', 'koperasi', 'balaiWarga', 'lampuTaman', 'mural'] },
    ],
  },
  ...HIGHER_STAGES,
];
