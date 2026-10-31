// Staff: the people the player manages, as Kairosoft's staff are. Warga still live on their own and pick
// their own jobs; staff are hired through a Lowongan, come in star rarities, level up, and can be promoted
// out to run a neighbouring RT. Inem is staff number 1 and never leaves.
//
// Special characters are recognisable TYPES (a news anchor who pauses, an infotainment host), never one real
// person: GAME-DESIGN.md section 5.

import type { StageId } from '../sim/types';

export type StatId = 'rajin' | 'lobi' | 'jujur' | 'gaul';
export const STATS: StatId[] = ['rajin', 'lobi', 'jujur', 'gaul'];

export type RoleId = 'asisten' | 'hansip' | 'penagih' | 'pu' | 'adminWa' | 'supir' | 'bendahara' | 'sekretaris';

export interface RoleDef {
  id: RoleId;
  name: string;
  blurb: string;
  /** The stat that drives it. */
  stat: StatId;
  /** Opens at this stage and star count. */
  opens: { stage: StageId; stars: number };
  /** Only Inem holds it, and it is never posted. */
  inemOnly?: boolean;
}

export const ROLES: RoleDef[] = [
  { id: 'asisten', name: 'Asisten', blurb: 'Works a desk at the Kantor and clears the permit queue, folder by folder.', stat: 'lobi', opens: { stage: 'rt', stars: 1 } },
  { id: 'hansip', name: 'Hansip', blurb: 'Keeps the gang safe: Aman rises, and a preman on the beat finds work as a guard.', stat: 'rajin', opens: { stage: 'rt', stars: 1 } },
  { id: 'penagih', name: 'Tukang Tagih Iuran', blurb: 'Finds the warga who are "never home". More iuran comes in; a low Jujur keeps some.', stat: 'rajin', opens: { stage: 'rt', stars: 1 } },
  { id: 'pu', name: 'Petugas PU', blurb: 'Fixes damaged buildings on his own, one a week per level.', stat: 'rajin', opens: { stage: 'rt', stars: 3 } },
  { id: 'adminWa', name: 'Admin Grup WA', blurb: 'Runs the warga group chat: Virality every week, and bad news lands softer.', stat: 'gaul', opens: { stage: 'rt', stars: 3 } },
  { id: 'supir', name: 'Supir', blurb: 'Drives the official car. Building crews arrive sooner.', stat: 'rajin', opens: { stage: 'rw', stars: 0 } },
  { id: 'bendahara', name: 'Bendahara', blurb: 'Keeps the kas. Upkeep leaks less, unless Jujur is low.', stat: 'jujur', opens: { stage: 'kelurahan', stars: 0 } },
  { id: 'sekretaris', name: 'Sekretaris', blurb: 'Knows who to call. Orang Inside every week.', stat: 'lobi', opens: { stage: 'kelurahan', stars: 0 } },
];

export const roleDef = (id: RoleId): RoleDef => ROLES.find((r) => r.id === id)!;

/** Staff slots by stage and stars, Inem included. Never more than STAFF_CAP. */
export const STAFF_CAP = 10;
export const SLOTS: { stage: StageId; stars: number; slots: number }[] = [
  { stage: 'rt', stars: 0, slots: 1 },
  { stage: 'rt', stars: 1, slots: 3 },
  { stage: 'rt', stars: 3, slots: 4 },
  { stage: 'rw', stars: 0, slots: 6 },
  { stage: 'kelurahan', stars: 0, slots: 8 },
];

/** Stars set only the starting stat total and the salary. The kampung act never sees 5 or 6 stars. */
export const STAR_TOTAL: Record<number, number> = { 2: 120, 3: 160, 4: 210, 5: 270, 6: 340 };
export const STAR_SALARY: Record<number, number> = { 2: 300_000, 3: 450_000, 4: 700_000, 5: 1_200_000, 6: 2_000_000 };
export const STAT_MAX = 99;

export type ChannelId = 'grupWa' | 'online';

export interface ChannelDef {
  id: ChannelId;
  name: string;
  blurb: string;
  cost: number;
  /** Months until the applicants arrive. */
  wait: number;
  /** Odds by star, in percent. */
  odds: Record<number, number>;
  /** Applicants come from your own jobless warga, longest idle first. */
  local: boolean;
  /** Chance one applicant is a Titipan sent by Pak Camat. */
  titipan: number;
}

export const CHANNELS: ChannelDef[] = [
  { id: 'grupWa', name: 'Grup WA RT', blurb: 'Free and slow. Your own jobless warga apply, the longest idle first.', cost: 0, wait: 2, odds: { 2: 60, 3: 35, 4: 5 }, local: true, titipan: 0.15 },
  { id: 'online', name: 'Online (LokerJalan)', blurb: 'Rp 500k and quick. Better odds, but outsiders: no help for your jobless.', cost: 500_000, wait: 1, odds: { 2: 30, 3: 50, 4: 20 }, local: false, titipan: 0 },
];

/** Applicants wait until the player hires one or cancels the lowongan: they never go home on their own. */
export const APPLICANTS = { min: 3, max: 5 };

/** Job-ad requirement lines. Flavour only: every applicant is an adult. Keys in i18n: staff.req.N. */
export const REQUIREMENTS = 10;

export type TraitId = 'titipan' | 'jamKaret' | 'rajinLembur' | 'healingMulu' | 'siPalingWa' | 'mantanPreman' | 'freshGrad' | 'pensiunan' | 'multitalenta' | 'baperan';

export interface TraitDef {
  id: TraitId;
  name: string;
  effect: string;
  /** Multiplier on the staff member's output. */
  output?: number;
  /** Multiplier on how fast they level. */
  xp?: number;
  /** Stat changes when hired. */
  stats?: Partial<Record<StatId, number>>;
  /** Cannot be fired (Titipan). */
  noFire?: boolean;
  /** Orang Inside a month, for who sent them. */
  orangDalam?: number;
  /** Away a month after every event (Healing Mulu). */
  healing?: boolean;
  /** Retires after this many months (Pensiunan PNS). */
  retireAfter?: number;
  /** Leaves at once if a raise is refused (Baperan). */
  leavesOnRefuse?: boolean;
  /** Never asks for a raise (Jam Karet). */
  noRaise?: boolean;
  /** Quits after this many months without a raise (Rajin Lembur). */
  quitsUnpaidAfter?: number;
}

export const TRAITS: TraitDef[] = [
  { id: 'titipan', name: 'Titipan', effect: 'Sent by Pak Camat. Cannot be fired. Low Rajin, +0.1 Orang Inside a week.', stats: { rajin: -25 }, noFire: true, orangDalam: 0.1 },
  { id: 'jamKaret', name: 'Jam Karet', effect: 'Always late: output -20%, but never asks for a raise.', output: 0.8, noRaise: true },
  { id: 'rajinLembur', name: 'Rajin Lembur', effect: 'Output +20%. Quits after 36 weeks without a raise.', output: 1.2, quitsUnpaidAfter: 36 },
  { id: 'healingMulu', name: 'Healing Mulu', effect: 'Takes a week off after every event.', healing: true },
  { id: 'siPalingWa', name: 'Si Paling Grup WA', effect: 'Lives in the group chat: Gaul +15, Jujur -10.', stats: { gaul: 15, jujur: -10 } },
  { id: 'mantanPreman', name: 'Mantan Preman', effect: 'Knows every gang: as Hansip, output x2.', output: 1 },
  { id: 'freshGrad', name: 'Fresh Graduate', effect: 'Low stats, levels up twice as fast.', stats: { rajin: -10, lobi: -10, jujur: -10, gaul: -10 }, xp: 2 },
  { id: 'pensiunan', name: 'Pensiunan PNS', effect: 'Lobi +25, levels half as fast, retires after 60 weeks.', stats: { lobi: 25 }, xp: 0.5, retireAfter: 60 },
  { id: 'multitalenta', name: 'Multitalenta', effect: 'Every stat +5.', stats: { rajin: 5, lobi: 5, jujur: 5, gaul: 5 } },
  { id: 'baperan', name: 'Baperan', effect: 'Leaves at once if a raise is refused.', leavesOnRefuse: true },
];

export const traitDef = (id: TraitId): TraitDef => TRAITS.find((t) => t.id === id)!;

export interface SpecialDef {
  id: string;
  name: string;
  /** What kind of person they are. Never one real person. */
  type: string;
  role: RoleId;
  stats: Record<StatId, number>;
  quirk: string;
  /** Multiplier on output, for the quirk. */
  output?: number;
}

/** Four-star specials, one of each in a game. A 4-star Online applicant has a SPECIAL_CHANCE to be one. */
export const SPECIAL_CHANCE = 0.3;
export const SPECIALS: SpecialDef[] = [
  { id: 'pakBreaking', name: 'Pak Breaking', type: 'TV news anchor who pauses... dramatically', role: 'adminWa', stats: { rajin: 45, lobi: 40, jujur: 50, gaul: 80 }, quirk: 'Every announcement is BREAKING: Virality x2.', output: 2 },
  { id: 'mbakGosip', name: 'Mbak Gosip', type: 'Infotainment host', role: 'adminWa', stats: { rajin: 50, lobi: 45, jujur: 30, gaul: 85 }, quirk: 'Leaks your own scandals for Virality.', output: 1.5 },
  { id: 'omMotivasi', name: 'Om Motivasi', type: 'Success-seminar motivator', role: 'penagih', stats: { rajin: 70, lobi: 55, jujur: 40, gaul: 45 }, quirk: 'Talks warga into paying: iuran collection x1.5.', output: 1.5 },
  { id: 'broKripto', name: 'Bro Kripto', type: 'Crypto flexer', role: 'bendahara', stats: { rajin: 40, lobi: 60, jujur: 25, gaul: 85 }, quirk: 'To the moon: the kas grows, until it does not.', output: 1.3 },
  { id: 'buSinetron', name: 'Bu Sinetron', type: 'Soap-opera mother', role: 'adminWa', stats: { rajin: 55, lobi: 50, jujur: 55, gaul: 50 }, quirk: 'Every bad event zooms in three times.' },
  { id: 'masKonten', name: 'Mas Konten', type: 'Prank content creator', role: 'adminWa', stats: { rajin: 45, lobi: 35, jujur: 35, gaul: 95 }, quirk: 'Virality x1.5, the odd prank costs Popularitas.', output: 1.5 },
  { id: 'pakPurna', name: 'Pak Purna', type: 'Retired senior PNS', role: 'hansip', stats: { rajin: 60, lobi: 90, jujur: 60, gaul: 30 }, quirk: 'Lobi 90. Sleeps through rapat.' },
];

/** Months worked to reach levels 2 to 5, as warga jobs. */
export const STAFF_LEVEL_MONTHS = [0, 6, 18, 36, 60];
export const RAISE = 0.15;
/** Chance a month that Kampung Sebelah poaches someone whose raise was refused. */
export const POACH_CHANCE = 0.1;
export const BIMTEK = { cost: 2_000_000, gain: 5, away: 1 };
export const PESANGON_MONTHS = 2;
/** Mutasi to Ketua RT: needs this many stars and this level. */
export const MUTASI = { stars: 3, level: 3 };

/** What each role does per level, before the stat and trait multipliers. */
export const ROLE_FX = {
  /**
   * The desk queue: every permit is a pile of folders (its permitMonths), cleared in order. Each Asisten clears
   * output x berkasPerOutput folders a month (Inem at level 1: about 1). The Kantor never stops: at least floor a month.
   * The goal strip says to hire once the queue is hireAfter months deep.
   */
  asisten: { berkasPerOutput: 0.85, floor: 0.5, hireAfter: 3 },
  hansip: { amanPerLevel: 2 },
  penagih: { iuranPerLevel: 0.1, iuranMax: 0.5, skimBelowJujur: 40, skim: 0.1 },
  pu: { repairsPerLevel: 1 },
  adminWa: { viralPerLevel: 0.5, softenBad: 0.2 },
  supir: { buildBoostPerLevel: 0.1 },
  bendahara: { upkeepCutPerLevel: 0.03, upkeepCutMax: 0.15 },
  sekretaris: { orangDalamPerLevel: 0.05 },
};

/** Inem: staff number 1, the Asisten. Fixed stats, a modest salary, and a dream. */
export const INEM = { name: 'Inem', stats: { rajin: 55, lobi: 60, jujur: 70, gaul: 75 } as Record<StatId, number>, salary: 75_000 };

export interface GigDef {
  id: string;
  name: string;
  /** Plain words: what it takes. */
  needs: string;
  reward: string;
}

/** Inem's dangdut dream, as optional sub-goals. They never gate stars. Checked in sim/staff.ts. */
export const GIGS: GigDef[] = [
  { id: 'agustus', name: 'Panggung 17 Agustus', needs: 'A Lapangan, and Popularitas 50 or more in August.', reward: '+5 Virality, Inem level 2.' },
  { id: 'hajatan', name: 'Hajatan circuit', needs: 'Reach RW, with Virality 30 or more.', reward: 'Inem tips +Rp 100k a week, level 3.' },
  { id: 'lomba', name: 'Lomba Dangdut Kecamatan', needs: 'Win the Piala Kelurahan once.', reward: '+10 Popularitas, Inem level 4.' },
  { id: 'audisi', name: 'Akademi Goyang (TV audition)', needs: 'The city act, with Virality 60 or more.', reward: '+20 Virality, Inem level 5.' },
  { id: 'sidang', name: 'The stage at Sidang Emas 2045', needs: 'Reach the final review.', reward: 'She sings at your ending.' },
];
