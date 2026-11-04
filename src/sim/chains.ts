// Quest chains for the named specials (decisions/staff-requests.md section 3): three steps each, like Inem's dream,
// and some need another special, so the staff become an ensemble. Steps are checked weekly, one at a time; each gives
// a toast, and the last one pays out. Chains never gate stars. Every special has one.
import { t, type Key } from '../i18n';
import { STAT_MAX } from '../data/staff';
import { gain, type Fx } from './gain';
import { isWorking, price } from './state';
import { rand } from './rng';
import { monthOfYear } from './calendar';
import type { GameState, Staff } from './types';

export interface ChainDef {
  /** The special who chases it. */
  special: string;
  /** Three checks, in order. Text lives at `chain.<special>.step<n>`. */
  steps: ((s: GameState, x: Staff) => boolean)[];
  payoff: (s: GameState, x: Staff, fx: Fx) => void;
}

const working = (s: GameState, def: string) => s.buildings.some((b) => b.def === def && isWorking(b));
const hired = (s: GameState, special: string) => (s.staff ?? []).some((o) => o.special === special && !o.away);

export const CHAINS: ChainDef[] = [
  {
    // "37 Tahun di Meja yang Sama": Pak Purna's memoir, typed by Bu Juru Ketik, launched before a full hall.
    special: 'pakPurna',
    steps: [
      (_s, x) => x.level >= 3,
      (s) => hired(s, 'buJuruKetik'),
      (s) => s.res.sabar >= 50 && s.buildings.some((b) => (b.def === 'balaiWarga' || b.def === 'balaiRW') && isWorking(b)),
    ],
    payoff: (s, x, fx) => {
      x.stats.lobi = Math.min(STAT_MAX, x.stats.lobi + 10);
      gain(s, fx, 'sabar', 5);
    },
  },
  {
    // Bu Juru Ketik's old typewriter: Bang Rental PS fixes it with one screwdriver and parts from the Bengkel.
    special: 'buJuruKetik',
    steps: [
      (_s, x) => x.level >= 2,
      (s) => hired(s, 'bangRentalPS'),
      (s) => s.buildings.some((b) => b.def === 'bengkel' && isWorking(b)),
    ],
    // The payoff lives in output(): her desk folders count twice once chainDone is set.
    payoff: () => undefined,
  },
  {
    // 100k followers through a prank series. Each prank step costs a little Popularitas.
    special: 'masKonten',
    steps: [
      (s) => s.res.viral >= 20,
      (s) => s.res.viral >= 40,
      (s) => s.res.viral >= 60,
    ],
    payoff: (s, _x, fx) => {
      gain(s, fx, 'viral', 10);
      gain(s, fx, 'sabar', -3);
    },
  },
  {
    // Unmask the anonymous gossip account: she finds it, traces it to a Wifi, and exposes it.
    special: 'mbakGosip',
    steps: [
      (_s, x) => x.level >= 2,
      (s) => s.buildings.some((b) => b.def === 'wifi' && isWorking(b)),
      (s) => s.res.viral >= 30,
    ],
    payoff: (s, _x, fx) => gain(s, fx, 'sabar', 6),
  },
  {
    // A rekor kampung for the biggest senam: a Lapangan, and a kampung in the mood.
    special: 'mbakSenam',
    steps: [
      (_s, x) => x.level >= 2,
      (s) => s.buildings.some((b) => b.def === 'lapangan' && isWorking(b)),
      (s) => s.res.sabar >= 60,
    ],
    payoff: (s, _x, fx) => {
      gain(s, fx, 'sabar', 6);
      gain(s, fx, 'viral', 4);
    },
  },
  {
    // "Kuis Kampung" on the 17 Agustus stage: a Lapangan and an August with a full house.
    special: 'pakKuis',
    steps: [
      (_s, x) => x.level >= 2,
      (s) => s.buildings.some((b) => b.def === 'lapangan' && isWorking(b)),
      (s) => monthOfYear(s.month) === 7 && s.res.sabar >= 50,
    ],
    payoff: (s, _x, fx) => {
      gain(s, fx, 'viral', 6);
      gain(s, fx, 'orangDalam', 1);
    },
  },
  {
    // "Breaking Kampung": a studio in the Balai Warga with a Wifi link, and Virality to go on air.
    special: 'pakBreaking',
    steps: [
      (_s, x) => x.level >= 2,
      (s) => working(s, 'balaiWarga') && working(s, 'wifi'),
      (s) => s.res.viral >= 30,
    ],
    payoff: (s, _x, fx) => {
      gain(s, fx, 'viral', 8);
      gain(s, fx, 'sabar', 3);
    },
  },
  {
    // The campus-radio trio back together: two more hires on the staff, then a show at the Balai Warga.
    special: 'bangLawak',
    steps: [
      (_s, x) => x.level >= 2,
      (s) => (s.staff ?? []).filter((o) => !o.inem && !o.special).length >= 2,
      (s) => working(s, 'balaiWarga'),
    ],
    payoff: (s, _x, fx) => {
      gain(s, fx, 'sabar', 6);
      gain(s, fx, 'viral', 3);
    },
  },
  {
    // "KampungCoin": a kas worth gambling, then the coin goes to the moon or the dev rugs it, on his Jujur.
    special: 'broKripto',
    steps: [
      (_s, x) => x.level >= 2,
      (s) => working(s, 'wifi'),
      (s) => s.res.rupiah >= price(s, 5_000_000),
    ],
    payoff: (s, x, fx) => {
      if (rand(s) < 0.25 + x.stats.jujur / 200) {
        x.chainWon = true;
        gain(s, fx, 'rupiah', price(s, 3_000_000));
      } else {
        x.chainWon = false;
        gain(s, fx, 'rupiah', -Math.min(Math.max(0, s.res.rupiah), price(s, 2_000_000)));
        gain(s, fx, 'sabar', -5);
      }
    },
  },
  {
    // His own rental PS: a Wifi for online play, and the kas to buy the consoles.
    special: 'bangRentalPS',
    steps: [
      (_s, x) => x.level >= 2,
      (s) => working(s, 'wifi'),
      (s) => s.res.rupiah >= price(s, 2_000_000),
    ],
    payoff: (s, _x, fx) => {
      gain(s, fx, 'rupiah', -price(s, 1_000_000));
      gain(s, fx, 'viral', 5);
      gain(s, fx, 'sabar', 4);
    },
  },
  {
    // A traffic light in the gang: he reports the macet, the Portal proves the point, Orang Inside signs it off.
    special: 'omLaluLintas',
    steps: [
      (_s, x) => x.level >= 2,
      (s) => working(s, 'portal'),
      (s) => s.res.orangDalam >= 2,
    ],
    payoff: (s, _x, fx) => {
      gain(s, fx, 'orangDalam', 2);
      gain(s, fx, 'sabar', 3);
    },
  },
  {
    // A sinetron shoots in the gang: the road closed at the Portal, and a kampung famous enough to film.
    special: 'buSinetron',
    steps: [
      (_s, x) => x.level >= 2,
      (s) => working(s, 'portal'),
      (s) => s.res.viral >= 40,
    ],
    payoff: (s, _x, fx) => {
      gain(s, fx, 'viral', 10);
      gain(s, fx, 'sabar', -2);
    },
  },
  {
    // "Kaya dari Iuran": a seminar in the Balai Warga, paid with a loan; on his Jujur it pays or it backfires.
    special: 'omMotivasi',
    steps: [
      (_s, x) => x.level >= 2,
      (s) => working(s, 'balaiWarga'),
      (s) => s.res.rupiah >= price(s, 1_500_000),
    ],
    payoff: (s, x, fx) => {
      if (rand(s) < 0.25 + x.stats.jujur / 200) {
        x.chainWon = true;
        gain(s, fx, 'rupiah', price(s, 2_000_000));
        gain(s, fx, 'sabar', 3);
      } else {
        x.chainWon = false;
        gain(s, fx, 'rupiah', -Math.min(Math.max(0, s.res.rupiah), price(s, 1_500_000)));
        gain(s, fx, 'sabar', -6);
      }
    },
  },
];

export const chainOf = (x: Staff): ChainDef | undefined => CHAINS.find((c) => c.special === x.special);

export const chainKey = (x: Staff, part: string): Key => `chain.${x.special}.${part}` as Key;

/** Weekly: each special with a chain moves on by at most one step. */
export function chainSystem(s: GameState, fx: Fx): void {
  for (const x of s.staff ?? []) {
    const c = chainOf(x);
    if (!c || x.chainDone || x.away) continue;
    const step = x.chainStep ?? 0;
    if (!c.steps[step](s, x)) continue;
    x.chainStep = step + 1;
    if (x.chainStep < c.steps.length) {
      fx.push({ kind: 'notice', title: t('chain.stepTitle', { name: x.name, n: x.chainStep, of: c.steps.length }), body: t(chainKey(x, `step${step}`)), tone: 'good' });
      continue;
    }
    x.chainDone = true;
    c.payoff(s, x, fx);
    // A gamble (Bro Kripto, Om Motivasi) has a second ending when it goes wrong.
    const lost = x.chainWon === false;
    fx.push({ kind: 'notice', title: t(chainKey(x, lost ? 'lostTitle' : 'doneTitle')), body: t(chainKey(x, lost ? 'lost' : 'reward')), tone: lost ? 'bad' : 'good', card: true, open: 'staff' });
  }
}
