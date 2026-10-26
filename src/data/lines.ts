import type { Resources } from '../sim/types';

/**
 * Minor happenings. They never stop the game: one line in the ticker and the log, with a small number moved.
 * Satire targets systems only. `pct` is Rupiah as a fraction of one month's net income.
 */
export interface LineDef {
  id: string;
  name: string;
  line: string;
  res?: Partial<Resources>;
  pct?: number;
  /** Building that must be standing and working. */
  needs?: string;
  /** Relative odds. Default 1. */
  weight?: number;
  /** Earliest month since start. */
  minMonth?: number;
}

/** Chance a month brings a line. */
export const LINE_CHANCE = 0.6;
/** A line cannot repeat until this many others have shown. */
export const LINE_MEMORY = 12;

export const LINES: LineDef[] = [
  { id: 'loket', name: 'Antrean Loket', line: 'The loket opened at nine. The queue opened at six.', res: { sabar: -1 } },
  { id: 'stempelBasah', name: 'Stempel Basah', line: 'The stempel was still wet, so the letter was valid for one afternoon.', res: { sabar: -1 } },
  { id: 'rapatDadakan', name: 'Rapat Dadakan', line: 'An urgent rapat was called to plan the next rapat.', res: { sabar: -1 } },
  { id: 'grupRT', name: 'Grup RT Ramai', line: 'The WhatsApp group hit 200 messages. Nobody read them.', res: { viral: 2 } },
  { id: 'selamatPagi', name: 'Selamat Pagi', line: 'Forty good-morning stickers. One real announcement, buried at message 38.', res: { viral: 2 } },
  { id: 'bantuanCair', name: 'Bantuan Cair', line: 'The aid arrived. The notice said Tuesday. It was Friday.', pct: 0.04 },
  { id: 'iuranLunas', name: 'Iuran Lunas', line: 'Everyone paid iuran on time. The treasurer is checking for a catch.', pct: 0.05, minMonth: 6 },
  { id: 'kasSelisih', name: 'Kas Selisih', line: 'The kas is off by Rp 50.000. A committee will find it. Slowly.', pct: -0.03, minMonth: 12 },
  { id: 'lampuJalan', name: 'Lampu Jalan', line: 'A streetlight was fixed. A new one broke to keep things balanced.', res: { sabar: 1 } },
  { id: 'jalanDitambal', name: 'Jalan Ditambal', line: 'The road was patched. The patch has its own pothole.', res: { sabar: 1 } },
  { id: 'spandukBaru', name: 'Spanduk Baru', line: 'A new banner thanks the RT for a project that does not exist yet.', res: { viral: 3 } },
  { id: 'formBaru', name: 'Form Baru', line: 'A new form asks for the data on the previous form.', res: { sabar: -1 } },
  { id: 'fotokopi', name: 'Fotokopi', line: 'Fotokopi KTP, three copies, plus one for the copier man.', pct: -0.02 },
  { id: 'survey', name: 'Survey Lagi', line: 'A survey asked residents how they feel about surveys.', res: { viral: 1 } },
  { id: 'listrikMati', name: 'Listrik Mati', line: 'Listrik was off for twenty minutes. The notice arrived on minute twenty-one.', res: { sabar: -1 } },
  { id: 'sinyalHilang', name: 'Sinyal Hilang', line: 'The wifi died. So did the meeting, finally.', res: { sabar: 1 }, needs: 'wifi' },
  { id: 'ojolLewat', name: 'Ojol Lewat', line: 'Ojol drivers circle the block. The order was for the next street.', res: { viral: 1 }, needs: 'wifi' },
  { id: 'kopiGratis', name: 'Kopi Gratis', line: 'The warung runs buy-one-get-one on kopi sachet.', pct: 0.04, needs: 'warung' },
  { id: 'gosipHangat', name: 'Gosip Hangat', line: 'A rumour crossed the warung faster than the wifi.', res: { viral: 3 }, needs: 'warung' },
  { id: 'rondaAman', name: 'Ronda Aman', line: 'A quiet night. The ronda was quiet too, mostly asleep.', res: { sabar: 1 }, needs: 'posRonda' },
  { id: 'selokanLancar', name: 'Selokan Lancar', line: 'The selokan flowed. A rare report nobody questioned.', res: { sabar: 1 }, needs: 'selokan' },
  { id: 'selokanMampet', name: 'Selokan Mampet', line: 'The selokan clogged. Everyone saw it. Nobody owned it.', res: { sabar: -2 }, needs: 'selokan' },
  { id: 'parkirLiar', name: 'Parkir Liar', line: 'The parkir man charged for a street with no parking.', res: { sabar: -1 }, needs: 'parkir' },
  { id: 'kantorBuka', name: 'Kantor Buka', line: 'The kantor opened on time. Staff called it an anomaly.', res: { sabar: 1 }, needs: 'kantorRT' },
  { id: 'capHilang', name: 'Cap Hilang', line: 'The cap went missing. Every letter is now "pending".', res: { sabar: -1 }, needs: 'kantorRT' },
  { id: 'kosBayar', name: 'Kos Bayar Awal', line: 'The kos kids paid early. Their parents wired money.', pct: 0.04, needs: 'kosan' },
  { id: 'senam', name: 'Senam Pagi', line: 'Morning senam on the lapangan. The speaker is louder than the instructor.', res: { sabar: 1 }, needs: 'lapangan' },
  { id: 'bankSampahPenuh', name: 'Bank Sampah Penuh', line: 'The bank sampah is full. The truck is scheduled for "soon".', res: { sabar: -1 }, needs: 'bankSampah' },
  { id: 'plastikDitukar', name: 'Plastik Ditukar', line: 'Bank sampah paid out. The plastic got a better rate than the people.', pct: 0.03, needs: 'bankSampah' },
  { id: 'hujanRingan', name: 'Hujan Ringan', line: 'It rained for ten minutes. The jalan flooded for an hour.', res: { sabar: -1 } },
  { id: 'cuacaCerah', name: 'Cuaca Cerah', line: 'A clear day. The jemuran covers every fence.', res: { sabar: 1 } },
  { id: 'tamuDinas', name: 'Tamu Dinas', line: 'A visitor from the dinas came. We served what we had. He wrote "good".', res: { sabar: 1 } },
  { id: 'laporanLengkap', name: 'Laporan Lengkap', line: 'The report is done. It is longer than the work it describes.', res: { viral: 1 } },
  { id: 'suratEdaran', name: 'Surat Edaran', line: 'A surat edaran says to follow the previous surat edaran.', res: { sabar: -1 } },
  { id: 'nomorAntrean', name: 'Nomor Antrean', line: 'The nomor antrean machine broke. People queue by memory now.', res: { sabar: -1 } },
  { id: 'pohonTumbang', name: 'Pohon Tumbang', line: 'A tree fell. A WhatsApp group formed within the minute. The tree is still there.', res: { viral: 2 } },
  { id: 'danaCepat', name: 'Dana Cair Cepat', line: 'The dana cleared in one day. Everyone is suspicious.', pct: 0.06, minMonth: 12 },
  { id: 'telepon', name: 'Satu Telepon', line: 'One phone call from a friend of a friend moved a permit three weeks.', res: { orangDalam: 1 }, weight: 0.25, minMonth: 8 },
  { id: 'muralLomba', name: 'Lomba Mural', line: 'Mural contest. Judging begins after the paint dries, so, next year.', res: { viral: 2 } },
];
