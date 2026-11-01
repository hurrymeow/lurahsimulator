// Kecamatan numbers (docs/plans/kecamatan-slice.md, "Mechanics"). A first pass: the balance bots tune them.
// A week is one tick.
import type { Gate, StageBuildingDef, StageComboDef, StageEventDef } from './types';

const C0: Gate = { stage: 'kecamatan', stars: 0 };
const C1: Gate = { stage: 'kecamatan', stars: 1 };

/** Pinjol: households borrow when idle or unfed, and the debt collector follows. */
export const PINJOL = {
  /** Residents to a household, as in NEEDS.household. */
  household: 3,
  /** A household where most members have been idle this many weeks can borrow. */
  idleWeeks: 24,
  /** Chance a week that an eligible household borrows. */
  borrow: 0.03,
  /** A household in debt counts this much of a fed household as unfed. */
  unfedShare: 0.5,
  /** Weeks in debt before the debt collector comes. */
  collectAfter: 24,
  /** Aman the debt collector costs, and for how many weeks. */
  collectorAman: 5,
  collectorWeeks: 12,
  /** Each working Koperasi Simpan Pinjam cuts the weekly borrow chance by this share, up to two of them. */
  koperasiCut: 0.25,
  /** Chance a week that a household in debt who is neither idle nor unfed pays it off. Not in the plan: needed so the meter can fall. */
  repay: 0.02,
} as const;

/** The razia: a Satpol PP response. It buys time and moves the problem next door. */
export const RAZIA = {
  orangDalam: 1,
  /** Aman while it lasts, before the Satpol PP role adds to it. */
  aman: 8,
  weeks: 8,
  sabar: -3,
  /** Share of the households in debt or on judol that move to the next Kelurahan. */
  moveShare: 0.5,
} as const;

/** Judol: spreads with Viral. */
export const JUDOL = {
  /** Viral above this starts to feed it. */
  viralFloor: 20,
  /** Each step of Viral above the floor adds `perStep` to the weekly chance a household starts. */
  viralStep: 10,
  perStep: 0.01,
  /** Share of a judol household's income that goes. Applied as a cut on shop income, scaled by the judol share of households. */
  incomeCut: 0.3,
  /** Each working Baliho adds this to the weekly chance a household starts on judol. */
  balihoStart: 0.005,
  /** Judol households borrow this many times as often. */
  borrowMult: 2,
  /** Chance a week that a judol household quits. Not in the plan: needed so the meter can fall. */
  quit: 0.02,
} as const;

// Kecamatan lots are Kelurahan lots, 2x2 tiles each (the scope default for a stage building).
export const KEC_BUILDINGS: StageBuildingDef[] = [
  {
    id: 'kantorKec',
    name: 'Kantor Kecamatan',
    blurb: '4 PNS desks. The stamp that approves the Kelurahan stamps lives here.',
    cost: 30_000_000,
    upkeep: 500_000,
    income: 0,
    attract: 3,
    permitMonths: 3,
    buildMonths: 3,
    maxLevel: 3,
    maxCount: 1,
    placeable: true,
    removable: false,
    removeBlockedReason: 'The kantor kecamatan outlives every Pak Camat.',
    jobSlots: { pns: 4, honorer: 2 },
    sprite: 'kantorKec',
    gate: C0,
    fx: { pnsSlots: 4 },
  },
  {
    id: 'posSatpol',
    name: 'Pos Satpol PP',
    blurb: '+4 Aman. The post that runs the razia, and the place the stalls were last seen.',
    cost: 8_000_000,
    upkeep: 200_000,
    income: 0,
    attract: 2,
    permitMonths: 2,
    buildMonths: 2,
    maxLevel: 3,
    maxCount: 3,
    placeable: true,
    removable: true,
    sprite: 'posSatpol',
    gate: C0,
    fx: { aman: 4 },
  },
  {
    id: 'koperasiSP',
    name: 'Koperasi Simpan Pinjam',
    blurb: 'Small loans at fair rates. Each one standing cuts new pinjol cases by 25%.',
    cost: 10_000_000,
    upkeep: 150_000,
    income: 300_000,
    attract: 3,
    permitMonths: 3,
    buildMonths: 2,
    maxLevel: 3,
    maxCount: 2,
    placeable: true,
    removable: true,
    sprite: 'koperasiSP',
    gate: C0,
  },
  {
    id: 'balaiLatihanKerja',
    name: 'Balai Latihan Kerja',
    blurb: 'Retrains one idle warga a week, so their idle time starts again. The certificates are very good.',
    cost: 9_000_000,
    upkeep: 200_000,
    income: 0,
    attract: 3,
    permitMonths: 3,
    buildMonths: 2,
    maxLevel: 3,
    maxCount: 2,
    placeable: true,
    removable: true,
    sprite: 'balaiLatihanKerja',
    gate: C0,
    fx: { retrain: 1 },
  },
  {
    id: 'baliho',
    name: 'Baliho',
    blurb: 'Ad income and +1 Virality a week. Some ads are judol, so gambling starts a little faster.',
    cost: 4_000_000,
    upkeep: 100_000,
    income: 600_000,
    attract: 0,
    perMonth: { viral: 1 },
    permitMonths: 2,
    buildMonths: 1,
    maxLevel: 3,
    maxCount: 4,
    placeable: true,
    removable: true,
    sprite: 'baliho',
    gate: C1,
  },
  {
    id: 'tamanKota',
    name: 'Taman Kota',
    blurb: '+2 Popularitas a week, and shops within 3 tiles earn 8% more. The fountain is off.',
    cost: 12_000_000,
    upkeep: 250_000,
    income: 0,
    attract: 3,
    perMonth: { sabar: 2 },
    boost: { radius: 3, bonus: 0.08 },
    permitMonths: 3,
    buildMonths: 2,
    maxLevel: 3,
    maxCount: 2,
    placeable: true,
    removable: true,
    sprite: 'tamanKota',
    gate: C1,
  },
];

export const KEC_COMBOS: StageComboDef[] = [
  {
    id: 'modalUsaha',
    name: 'Modal Usaha',
    needs: ['koperasiSP', 'balaiLatihanKerja'],
    radius: 3,
    hint: 'A loan and a skill, side by side.',
    story: 'The course ends with a certificate and a form. The form is the interesting part.',
    incomeMult: { koperasiSP: 1.5 },
    perMonth: { sabar: 1 },
    effect: 'Koperasi income x1.5. +1 Popularitas a week.',
    gate: C0,
  },
  {
    id: 'raziaPasar',
    name: 'Razia Pasar',
    needs: ['posSatpol', 'pasar'],
    radius: 3,
    hint: 'A uniform at the end of the market lane.',
    story: 'Every stall shows its permit. By lunch the stalls have moved one street over.',
    incomeMult: { pasar: 1.2 },
    perMonth: { sabar: -1 },
    effect: 'Pasar income x1.2. -1 Popularitas a week.',
    gate: C0,
  },
  {
    id: 'iklanBertarget',
    name: 'Iklan Bertarget',
    needs: ['baliho', 'wifi'],
    radius: 3,
    hint: 'A big ad near a strong signal.',
    story: 'The ad knows what you searched. So does the other ad, the one with the free spins.',
    incomeMult: { baliho: 1.6, wifi: 1.3 },
    perMonth: { viral: 3 },
    effect: 'Baliho and Wifi income up. +3 Virality a week, which also feeds judol.',
    gate: C1,
  },
  {
    id: 'kampungTertib',
    name: 'Kampung Tertib',
    needs: ['posSatpol', 'lampuTaman'],
    radius: 2,
    hint: 'A post with a lamp over the door.',
    story: 'The lamp stays on and the post stays staffed. Nobody can say which one does the work.',
    perMonth: { sabar: 2 },
    effect: '+2 Popularitas a week.',
    gate: C0,
  },
];

// Random events for the Kecamatan. The first choice of each is free, so none can soft-lock.
const EV = { minMonth: 8, chance: 0.3, cooldown: 36 } as const;

export const KEC_EVENTS: StageEventDef[] = [
  {
    id: 'smsPinjol',
    name: 'SMS Pinjol',
    body: 'An SMS offers Rp 2 juta in five minutes, no questions. Half the Grup WA has already clicked.',
    gate: C0,
    when: { ...EV },
    choices: [
      { label: 'Ignore it', res: { sabar: -1 }, result: 'The SMS comes again tomorrow, with a smaller font.' },
      { label: 'Post a warning · Rp 300.000', cost: { rupiah: 300_000 }, res: { viral: 2, sabar: 1 }, result: 'Forty-one thumbs up. Six people ask where to click.' },
      { label: 'Ask the Koperasi to reply · 1 Orang Inside', cost: { orangDalam: 1 }, res: { sabar: 2 }, result: 'A friendly leaflet goes round. It is longer than the SMS.' },
    ],
  },
  {
    id: 'judolGrupWa',
    name: 'Iklan Judol',
    body: 'A judol ad lands in the Grup WA between a recipe and a prayer time reminder.',
    gate: C0,
    when: { ...EV },
    choices: [
      { label: 'Mute the group', res: { viral: -3 }, result: 'Quiet for a day. The ad finds the next group.' },
      { label: 'Report the ad · Rp 500.000', cost: { rupiah: 500_000 }, res: { sabar: 2 }, result: 'Reported. A bot replies that the ad meets all guidelines.' },
      { label: 'Let it run', incomePct: 0.6, res: { sabar: -2, viral: 3 }, result: 'The ad money is good. The comments are not.' },
    ],
  },
  {
    id: 'penagihDepan',
    name: 'Penagih di Gang',
    body: 'A man in a black jacket asks around the lane for a house with a pinjol. The neighbours go quiet.',
    gate: C0,
    when: { ...EV },
    choices: [
      { label: 'Look away', res: { sabar: -2 }, result: 'He leaves. The lane stays quiet a bit longer than usual.' },
      { label: 'Walk him to the Kantor · Rp 400.000', cost: { rupiah: 400_000 }, res: { sabar: 1 }, result: 'Tea, forms and a stern word. He leaves with a leaflet about collection hours.' },
    ],
  },
  {
    id: 'raziaPindah',
    name: 'Razia Pindah',
    body: 'The razia in the next Kelurahan worked. The stalls moved here the same night.',
    gate: C0,
    when: { ...EV },
    choices: [
      { label: 'Do nothing', res: { sabar: -1 }, result: 'The stalls open at dawn. By evening they are the lane.' },
      { label: 'Ask Satpol PP to meet them · Rp 800.000', cost: { rupiah: 800_000 }, res: { sabar: 1, viral: 1 }, result: 'A friendly talk. The stalls promise to move to the next Kelurahan next week.' },
    ],
  },
  {
    id: 'utangViral',
    name: 'Utang Viral',
    body: "A warga's pinjol debt goes viral. The comments are meaner than the interest.",
    gate: C0,
    when: { ...EV },
    choices: [
      { label: 'Stay out of it', res: { viral: 2, sabar: -2 }, result: 'The post gets 9,000 shares. The app that sent the SMS gets none.' },
      { label: 'Ask the Grup WA to be kind · Rp 200.000', cost: { rupiah: 200_000 }, res: { sabar: 2, viral: -1 }, result: 'Three people delete their comments. One adds a heart.' },
      { label: 'Chip in for the first instalment · Rp 1.000.000', cost: { rupiah: 1_000_000 }, res: { sabar: 3 }, result: 'The first instalment is paid. The second is a different story.' },
    ],
  },
  {
    id: 'timLiterasi',
    name: 'Tim Literasi',
    body: 'Tim Literasi from Pusat arrives with a banner and a slide deck. The deck has 84 slides.',
    gate: C0,
    when: { ...EV },
    choices: [
      { label: 'Attend the session', res: { sabar: 1 }, result: 'Slide 61 is the good one. Most people were gone by slide 30.' },
      { label: 'Host their lunch · Rp 1.500.000', cost: { rupiah: 1_500_000 }, res: { sabar: 3, orangDalam: 1 }, result: 'The lunch was excellent. The team files a very positive report.' },
    ],
  },
];
