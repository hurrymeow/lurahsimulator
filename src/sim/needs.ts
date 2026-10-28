// What is true for the warga: Perut (fed), Kerja (in work) and Aman (safe), each 0 to 100. Sejahtera is
// their average. Hungry households and preman cost Popularitas, so warga are more than a headcount.
import { t } from '../i18n';
import { def } from './content';
import { gain, type Fx } from './gain';
import { slots, used } from './jobs';
import { noteProblem } from './problems';
import { realisasiDone, realisasiSum } from './realisasi';
import { hansipAman } from './staff';
import { isWorking, population } from './state';
import type { Building, GameState, Meters, Resident } from './types';

export const NEEDS = {
  /** Residents to a household. */
  household: 3,
  /** Households a Warung Sembako feeds at levels 1, 2 and 3. A retired Toko Kelontong feeds as level 3. */
  feeds: [4, 7, 10],
  /** Popularitas a month for each household nobody feeds. */
  hungrySabar: 0.1,
  /** Harga Sembako Naik (the cabai event) cuts what the warung can feed. */
  priceCut: 0.25,
  /** Aman falls as the kampung crowds and as idle warga hang about; lamps, ronda and Hansip lift it. */
  aman: { base: 70, perPreman: 4, perLamp: 3, perPosRonda: 2, crowdFrom: 15, perResident: 0.3, idleMonths: 6, perIdle: 2 },
  preman: {
    /** Months idle before a resident can turn. */
    idle: 12,
    /** Only while Aman is under this. */
    belowAman: 60,
    chance: 0.05,
    /** Never more than this share of the residents. */
    maxShare: 0.15,
    sabar: 0.2,
    /** Uang keamanan: share of one shop's income each preman takes, up to the cap. */
    take: 0.1,
    takeMax: 0.3,
  },
};

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

export const households = (s: GameState): number => Math.ceil(population(s) / NEEDS.household);

/** Households fed this month: every working Warung Sembako, less the price rise, plus any Bansos. */
export function fed(s: GameState): number {
  let n = 0;
  for (const b of s.buildings) {
    if (!isWorking(b)) continue;
    if (b.def === 'warung') n += NEEDS.feeds[Math.min(NEEDS.feeds.length, b.level) - 1];
    else if (b.def === 'tokoKelontong') n += NEEDS.feeds[2];
  }
  if (s.modifiers.some((m) => m.target === 'warung' && m.incomeMult < 1)) n *= 1 - NEEDS.priceCut;
  return Math.floor(n + households(s) * realisasiSum(s, 'perutCover'));
}

export const premanList = (s: GameState): Resident[] => s.residents.filter((r) => r.preman);

export function meters(s: GameState): Meters {
  const pop = population(s);
  const hh = households(s);
  const perut = hh ? (Math.min(hh, fed(s)) / hh) * 100 : 100;
  const employed = s.residents.filter((r) => r.job !== 'none' || r.staffId !== undefined).length;
  const kerja = (pop ? (employed / pop) * 100 : 100) + realisasiSum(s, 'kerja');
  const working = (id: string) => s.buildings.filter((b) => b.def === id && isWorking(b)).length;
  const a = NEEDS.aman;
  const idle = s.residents.filter((r) => !r.preman && (r.idle ?? 0) >= a.idleMonths).length;
  const crowd = Math.max(0, pop - a.crowdFrom) * a.perResident;
  const aman = a.base - crowd - a.perIdle * idle - a.perPreman * premanList(s).length + a.perLamp * working('lampuTaman') + a.perPosRonda * working('posRonda') + realisasiSum(s, 'aman') + hansipAman(s);
  return { perut: clamp(perut), kerja: clamp(kerja), aman: clamp(aman) };
}

export const sejahtera = (m: Meters): number => Math.round((m.perut + m.kerja + m.aman) / 3);

/** Shops a preman can lean on: working buildings that sell. */
const turfs = (s: GameState): Building[] => s.buildings.filter((b) => isWorking(b) && (def(b.def).shop || def(b.def).category === 'shops'));

/** The shop a preman leans on, picked by his id so it stays put month to month. */
function turfOf(s: GameState, r: Resident, pool = turfs(s)): Building | undefined {
  return pool.length ? pool[r.id % pool.length] : undefined;
}

/** Preman per shop uid, worked out once per month and layout, since income asks for every building. */
const takeCache = new WeakMap<GameState, { key: string; per: Map<number, number> }>();

/** Share of a shop's income taken as uang keamanan. */
export function premanTake(s: GameState, b: Building): number {
  if (!s.residents.some((r) => r.preman)) return 0;
  const preman = premanList(s);
  const key = `${s.month}:${s.buildings.length}:${preman.map((r) => r.id).join(',')}`;
  let hit = takeCache.get(s);
  if (hit?.key !== key) {
    const pool = turfs(s);
    const per = new Map<number, number>();
    for (const r of preman) {
      const shop = turfOf(s, r, pool);
      if (shop) per.set(shop.uid, (per.get(shop.uid) ?? 0) + 1);
    }
    hit = { key, per };
    takeCache.set(s, hit);
  }
  return Math.min(NEEDS.preman.takeMax, (hit.per.get(b.uid) ?? 0) * NEEDS.preman.take);
}

/** A 0..1 roll from the seed, month and resident, so preman never shift the shared random stream. */
function roll(s: GameState, id: number): number {
  let h = Math.imul(s.seed ^ (s.month * 0x2545f491) ^ (id * 0x9e3779b1), 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

/**
 * Monthly: hungry households cost Popularitas; long-idle residents in an unsafe kampung may turn preman,
 * and a preman takes a Satpam post the moment one is free. Then the meters are kept for the HUD.
 */
export function needsSystem(s: GameState, fx: Fx): void {
  const kantor = s.buildings.find((b) => b.def.startsWith('kantor'));
  const hungry = Math.max(0, households(s) - fed(s));
  if (hungry) gain(s, fx, 'sabar', -hungry * NEEDS.hungrySabar, kantor);

  const p = NEEDS.preman;
  // A free Satpam post turns a preman into the guard. The joke is that he goes legit.
  for (const r of premanList(s)) {
    if (used(s, 'satpam') >= slots(s, 'satpam')) break;
    r.preman = false;
    r.job = 'satpam';
    r.idle = 0;
    fx.push({ kind: 'notice', title: t('needs.reformedTitle', { name: r.name }), body: t('needs.reformedBody'), tone: 'good' });
  }
  const now = meters(s);
  const cap = Math.floor(s.residents.length * p.maxShare);
  for (const r of s.residents) {
    if (premanList(s).length >= cap || now.aman >= p.belowAman) break;
    if (r.preman || r.job !== 'none' || r.staffId !== undefined || (r.idle ?? 0) < p.idle || roll(s, r.id) >= p.chance) continue;
    r.preman = true;
    noteProblem(s, 'preman');
    const shop = turfOf(s, r);
    fx.push({ kind: 'notice', title: t('needs.premanTitle', { name: r.name }), body: t('needs.premanBody', { months: r.idle ?? 0 }), tone: 'bad', x: shop?.x, y: shop?.y });
  }
  const preman = premanList(s).length;
  if (preman) gain(s, fx, 'sabar', -preman * p.sabar, kantor);
  s.meters = meters(s);
}

/**
 * The Laporan: what Pusat reads. Reported residents, programs announced and carried out, Popularitas and
 * ranking wins. Announcing fills it as well as doing does, which is the joke; Sejahtera only moves for doing.
 */
export function laporan(s: GameState): number {
  const announced = s.wacana.reduce((n, w) => n + w.times, 0);
  const wins = s.ranking.filter((r) => r.won).length;
  return population(s) + 5 * announced + 5 * realisasiDone(s) + Math.round(s.res.sabar / 2) + 10 * wins;
}
