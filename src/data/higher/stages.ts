import type { StageDef } from '../../sim/types';
import type { Path } from './types';

// stars[0] is what it takes to earn 1 star, stars[1] 2 stars, stars[2] 3 stars.
// `unlocks` lists building ids that open on that star. Jobs, combos, events and meters
// open by their own `gate`. Buildings that depend on the Kelurahan or Desa path open from
// PATH_UNLOCKS, so the two paths can share one ladder.

export const RW_STAGE: StageDef = {
  id: 'rw',
  titles: ['Pak RW', 'RW Rintisan', 'RW Berkembang', 'RW Teladan'],
  next: 'kelurahan',
  stars: [
    {
      goals: [{ kind: 'fundedRts', n: 3 }, { kind: 'stempelClear', n: 6, under: 5 }],
      unlocks: ['posyandu', 'portal'],
    },
    {
      goals: [{ kind: 'rtsAtStars', n: 4, stars: 1 }, { kind: 'tierWins', n: 1, tier: 'rw' }, { kind: 'rwCombos', n: 2 }],
      unlocks: ['pasarKaget', 'gapura'],
    },
    {
      goals: [
        { kind: 'rtsAtStars', n: 4, stars: 2 },
        { kind: 'rtsAtStars', n: 2, stars: 3 },
        { kind: 'winStreak', n: 2 },
        { kind: 'noDebtMonths', n: 24 },
      ],
      unlocks: [],
    },
  ],
};

export const KELURAHAN_STAGE: StageDef = {
  id: 'kelurahan',
  titles: ['Pak Lurah', 'Kelurahan Rintisan', 'Kelurahan Berkembang', 'Lurah Teladan'],
  stars: [
    {
      goals: [{ kind: 'rwsAtStars', n: 4, stars: 1 }, { kind: 'serapanMonths', n: 12, pct: 80 }],
      unlocks: ['puskesmasPembantu', 'studiBanding'],
    },
    {
      goals: [{ kind: 'rwsAtStars', n: 4, stars: 2 }, { kind: 'tierWins', n: 1, tier: 'kelurahan' }, { kind: 'cleanAudits', n: 1 }],
      unlocks: [],
    },
    {
      goals: [{ kind: 'tierWins', n: 3, tier: 'kelurahan' }, { kind: 'rwsAtStars', n: 4, stars: 3 }],
      unlocks: [],
    },
  ],
};

/** Titles for the Desa path. Same stars and goals as the Kelurahan. */
export const DESA_TITLES: [string, string, string, string] = ['Pak Kades', 'Desa Rintisan', 'Desa Berkembang', 'Kades Teladan'];

/** Path buildings by the star that opens them: index 0 opens on 1 star. The 0-star set opens on promotion. */
export const PATH_UNLOCKS: Record<Path, { start: string[]; stars: [string[], string[], string[]] }> = {
  kelurahan: { start: ['kantorKel'], stars: [['pasar'], ['terminal', 'taman'], []] },
  desa: { start: ['balaiDesa'], stars: [['bumdes'], ['sawahIrigasi', 'embung', 'desaWisata'], []] },
};

/** Free on promotion into the stage, on both paths. */
export const PROMOTION_UNLOCKS: Record<'rw' | 'kelurahan', string[]> = { rw: ['balaiRW'], kelurahan: ['aspalUlang'] };

export const HIGHER_STAGES: StageDef[] = [RW_STAGE, KELURAHAN_STAGE];
