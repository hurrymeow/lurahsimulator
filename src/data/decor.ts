import type { BuildingDef } from '../sim/types';

// Decorations earn nothing themselves. Each working one lifts the income of every shop and farm
// within `radius` tiles by `bonus` (a fraction). The total on one building is capped by DECOR_CAP.
// They go up instantly, so a player can always spend spare cash on something that pays back.
const decor = (d: Omit<BuildingDef, 'attract' | 'income' | 'permitMonths' | 'buildMonths' | 'maxLevel' | 'placeable' | 'removable'> & Partial<BuildingDef>): BuildingDef => ({
  attract: 0,
  income: 0,
  permitMonths: 0,
  buildMonths: 0,
  maxLevel: 1,
  placeable: true,
  removable: true,
  ...d,
});

export const DECOR_BUILDINGS: BuildingDef[] = [
  // Five decorations a kampung really has, each with its own job. Pot Bunga and Kolam Ikan Hias are cut, and
  // Taman Bermain and Air Mancur wait for the city act: all four are no longer built, and old saves keep theirs.
  decor({ id: 'pohonRindang', name: 'Pohon Rindang', blurb: 'Shade for the gossip. Everyone hangs out here, so the kampung calms down.', cost: 300_000, upkeep: 0, perMonth: { sabar: 0.3 }, requires: { stars: { stage: 'rt', n: 1 } }, sprite: 'pohon' }),
  decor({ id: 'bangku', name: 'Balai-balai Bambu', blurb: 'A bamboo bench for ngobrol. Shops nearby earn more from people who stay.', cost: 400_000, upkeep: 0, boost: { radius: 2, bonus: 0.06 }, requires: { stars: { stage: 'rt', n: 2 } }, sprite: 'bangku' }),
  decor({ id: 'lampuTaman', name: 'Lampu Jalan', blurb: 'A street lamp the warga chipped in for. Shops nearby stay open later and earn more.', cost: 600_000, upkeep: 15_000, boost: { radius: 2, bonus: 0.06 }, requires: { stars: { stage: 'rt', n: 3 } }, sprite: 'lampuTaman' }),
  decor({ id: 'mural', name: 'Mural Kampung', blurb: '"Dilarang buang sampah di sini", painted beside the rubbish. Everyone posts it.', cost: 900_000, upkeep: 0, perMonth: { viral: 1 }, requires: { stars: { stage: 'rt', n: 3 } }, sprite: 'mural' }),
  decor({ id: 'potBunga', name: 'Pot Bunga', blurb: 'A pot of flowers. Neighbouring shops earn a little more.', cost: 150_000, upkeep: 0, boost: { radius: 1, bonus: 0.03 }, placeable: false, sprite: 'potBunga' }),
  decor({ id: 'kolamIkan', name: 'Kolam Ikan Hias', blurb: 'A pond of koi. Shops around it earn more and the kampung calms down.', cost: 1_200_000, upkeep: 20_000, boost: { radius: 2, bonus: 0.08 }, perMonth: { sabar: 0.3 }, placeable: false, sprite: 'kolamIkan' }),
  decor({ id: 'tamanBermain', name: 'Taman Bermain', blurb: 'Swings and a seesaw. Families visit, so shops nearby earn more.', cost: 2_500_000, upkeep: 40_000, attract: 1, boost: { radius: 3, bonus: 0.08 }, perMonth: { sabar: 0.5 }, placeable: false, sprite: 'tamanBermain' }),
  decor({ id: 'airMancur', name: 'Air Mancur', blurb: 'A fountain at the heart of the kampung. Lifts income over a wide area.', cost: 4_000_000, upkeep: 60_000, boost: { radius: 3, bonus: 0.12 }, placeable: false, sprite: 'airMancur' }),
  decor({
    id: 'patungIkon',
    name: 'Patung Ikon Kampung',
    blurb: 'A golden statue. The tender somehow went to a cousin, which takes Orang Inside. Lifts income over a wide area.',
    cost: 5_000_000,
    upkeep: 0,
    orangDalamCost: 2,
    maxCount: 2,
    boost: { radius: 3, bonus: 0.15 },
    requires: { stage: 'rw' },
    sprite: 'patungIkon',
  }),
];
