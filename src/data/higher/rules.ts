// Numbers for the new stages, in one place for the balance autoplayer to tune.

export const RW = {
  /** RTs on the map once the RW exists: you plus three AI. */
  rts: 4,
  /** Stempel refilled each month before any Balai RW. */
  stempelBase: 3,
  /** Each unstamped Surat Pengantar drains this much Sabar a month. */
  unstampedSabar: 0.5,
  /** Rupiah an RT needs from Dana before it builds or levels. */
  danaPerBuild: 1_000_000,
  /** Months between AI builds. */
  aiBuildEvery: 3,
  /** Rivalitas Abadi also runs between your RT and Kampung Sebelah. */
  rivalitasNeighbour: true,
  /** Musim Pindahan multiplies Surat Pengantar for this long. */
  pindahanMult: 3,
  pindahanMonths: 2,
  /** Pendataan Warga misreports the population by this fraction. */
  pendataanError: 0.1,
};

/** Ketua RT traits for the AI neighbours. */
export const RT_TRAITS = [
  { id: 'rajin', name: 'Rajin', buildEvery: 2, incomeMult: 1.2, blurb: 'Builds every 2 months and earns x1.2.' },
  { id: 'hobiWacana', name: 'Hobi Wacana', skipOneIn: 3, blurb: 'Skips one build in three to hold a wacana.' },
  { id: 'jarangMuncul', name: 'Jarang Muncul', letterMult: 2, blurb: 'Builds on time but sends 2x Surat Pengantar.' },
] as const;

export const KEL = {
  /** Budget arrives each January, in Rupiah. */
  anggaranPerYear: 24_000_000,
  /** Each unspent percent cuts next year's budget by the same percent. */
  unspentCut: 1,
  /** Serapan rush forced in December. */
  decemberRush: true,
  /** Wacana without a receipt cost this much Sabar when Tim Audit visits. */
  auditSabarPerWacana: 2,
  /** Kunjungan warns this many months ahead. */
  kunjunganWarnMonths: 1,
  /** Kelurahan lots take this many tiles on a side. */
  footprint: 2,
};
