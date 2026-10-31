// Bahasa Indonesia for the extra events (data/eventsMore.ts) and minor log lines (data/lines.ts).
// Compact form, expanded into the flat `<kind>.<id>.<field>` keys that `tr` looks up.
// A choice is [label, result] or, for advice, [label, [outcome results in data order]]. A third item is the modifier label.
type Choice = [string, string | string[], string?];

const EVENTS: [id: string, name: string, body: string, choices: Choice[]][] = [
  ['guntingPita', 'Gunting Pita', 'Kecamatan mengirim fotografer untuk gunting pita pertama Anda. Pitanya sepanjang satu meter. Guntingnya pinjaman.', [
    ['Gunting sendiri', 'Klik. Selesai sebelum fotografer menemukan sudut yang pas.'],
    ['Serahkan ke anak anak', 'Fotonya di mana mana. Pitanya jadi tiga potong.'],
  ]],
  ['partTime', 'Permintaan Kerja Paruh Waktu', 'Dimas, 16, mau kerja paruh waktu di warung. Ibunya bilang boleh. Gurunya bilang jangan. Izinkan?', [
    ['Bilang tidak', 'Dimas ngambek. Nilainya tetap persis seperti kemarin.'],
    ['Izinkan', ['Barista terbaik se-kampung. Pelanggan datang demi dia.', 'Ya sudah. Tak ada yang sadar, dan itu artinya sukses.', 'Dia tidur di kelas dan gorengannya gosong.']],
  ]],
  ['cctv', 'Sales CCTV', 'Seorang sales menawarkan "uji coba gratis" CCTV untuk pos ronda. Kontraknya 14 halaman. Tanda tangan?', [
    ['Tolak', 'Sales pergi meninggalkan brosur dan kartu nama.'],
    ['Tanda tangani uji coba', ['Kameranya jalan. Akhirnya ada yang menontonnya.', 'Kameranya menghadap tembok. Tagihannya menghadap Anda.', 'Rekamannya viral. Isinya kebanyakan ronda yang tidur.']],
  ]],
  ['kkn', 'Mahasiswa KKN', 'Mahasiswa datang untuk KKN membawa program 40 halaman dan satu spidol. Terima mereka?', [
    ['Kasih satu meja', 'Mereka bikin spanduk. Isinya KKN.'],
    ['Terima dengan layak', ['Mereka membangun titik air sungguhan. Laporannya menyebutnya workshop.', 'Poster, poster, dan reel yang bagus sekali.', 'Programnya butuh sponsor. Sponsornya Anda.']],
  ]],
  ['startupPilot', 'Uji Coba Startup', 'Sebuah startup ingin mendigitalkan iuran. Aplikasinya "hampir jadi". Sudah ada logonya. Coba?', [
    ['Tetap pakai buku kas', 'Buku kas kertas bertahan setahun lagi.'],
    ['Jalankan uji coba', ['Iuran masuk lewat QR. Biayanya 2%, disembunyikan dengan sopan.', 'Aplikasinya crash pas tenggat. Tangkapan layar crash-nya trending.', 'Demo day. Kopi gratis, tepuk tangan keras, kodenya nihil.']],
  ]],
  ['hajatan', 'Izin Tutup Jalan', 'Tetangga mau menutup jalan untuk hajatan. Izinnya tinggal satu tanda tangan Anda. Izinkan?', [
    ['Tolak', 'Tendanya dipasang di garasi. Orang-orang ingat.'],
    ['Izinkan', ['Pesta meriah. Sisa makanan dibagi satu gang.', 'Sound system sampai jam 2 pagi. Trending, bukan karena hal baik.', 'Seorang tamu "berterima kasih" ke ronda. Ada utang budi untuk Anda.']],
  ]],
  ['pasarMalam', 'Pasar Malam', 'Penyelenggara minta lapangan untuk pasar malam. Uang mukanya jabat tangan. Izinkan?', [
    ['Tolak', 'Lapangan tetap kosong. Rumputnya berterima kasih.'],
    ['Izinkan', ['Semua lapak habis terjual. Parkirnya juga.', 'Untungnya bagus. Gelas plastik sampai ke ujung jalan.', 'Hujan jam 7 malam. Uang mukanya hanya jabat tangan.']],
  ]],
  ['sisaAnggaran', 'Sisa Anggaran', 'Akhir tahun. Anggaran sisa harus dihabiskan, kalau tidak hangus dan anggaran tahun depan dipotong. Tak ada yang tanya untuk apa.', [
    ['Kembalikan uangnya', 'Bendahara menatap Anda seakan Anda melanggar aturan.'],
    ['Habiskan untuk "kegiatan"', ['Jalan yang sama diaspal lagi, dan jalannya bagus.', 'Kuitansi 40 spanduk. Spanduknya tiga.', 'Vendornya teman temannya teman. Sekarang ada yang berutang budi.']],
  ]],
  ['magang', 'Anak Magang Kecamatan', 'Kecamatan mengirim anak magang. Ketiknya cepat. Tak ada yang tahu dia duduk di mana. Terima?', [
    ['Tolak dengan sopan', 'Dia ke RT sebelah. Di sana dia dapat kursi bagus.'],
    ['Terima', ['Dia membereskan berkas. Dia juga tahu siapa tanda tangan apa.', 'Seminggu habis untuk formulir formulir.', 'Postingan LinkedIn-nya soal kampung ini laku keras.']],
  ]],
  ['pungli', 'Biaya Keamanan', 'Seorang pria menagih "biaya keamanan" ke toko-toko. Tak ada kuitansi, hanya rasa percaya diri. Bayar?', [
    ['Tolak', 'Dia menatap. Toko-toko menatap balik, diam-diam.'],
    ['Bayar biayanya', ['Tak terjadi apa-apa. Untuk sekarang.', 'Bulan depan dia datang lagi. Sekarang ada daftar tarif.']],
  ]],
  ['pangkalanOjol', 'Pangkalan Ojol', 'Para driver ojol mau pangkalan di pojok jalan. Janji menjaga kebersihan. Janji.', [
    ['Tolak', 'Mereka menunggu di jalan sebelah. Orderan ke sana.'],
    ['Izinkan pangkalan', ['Orderan naik. Penjualan mie ayam juga.', 'Helm di setiap tembok, dan grup chat yang berisik sekali.', 'Rebutan pojokan. Pojokannya selebar satu meter.']],
  ]],
  ['lesGratis', 'Les Gratis', 'Seorang guru pensiunan menawarkan les gratis di balai tiap Sabtu. Dia hanya minta kipas yang jalan.', [
    ['Terima kasih, tak ada ruang', 'Dia mengajar di bawah pohon. Beberapa anak ikut.'],
    ['Pinjamkan balai', ['Nilai naik. Kipasnya rusak dari awal.', 'Seorang anak juara lomba. Kampung mengklaim kreditnya.']],
  ]],
  ['padam', 'Pemadaman', 'Listrik mati satu blok. Pemberitahuannya bilang "pemeliharaan". Pemberitahuannya dipasang setelah mati.', [
    ['Tunggu saja', 'Lilin, gorengan, dan kesabaran banyak.', 'Mati listrik'],
    ['Sewa genset', 'Gensetnya berisik, begitu juga ucapan terima kasihnya.'],
  ]],
  ['rapatWarga', 'Rapat Warga', 'Rapat warga digelar. Agenda: satu hal. Durasi: tiga jam. Keputusan: belum ada.', [
    ['Batasi tiga jam', 'Tak ada keputusan. Rapat kedua dijadwalkan.'],
    ['Sajikan camilan', 'Camilan mengakhiri semua debat. Agenda selamat, nyaris.'],
    ['Voting angkat tangan', 'Tangan terangkat sebelum pertanyaan selesai. Mosi lolos.'],
  ]],
  ['hibah', 'Proposal Hibah', 'Hibah dibuka. Syaratnya enam formulir, empat stempel, dan foto spanduk dari kegiatan yang diusulkan.', [
    ['Lewati formulirnya', 'Hati tenang, tanpa uang.'],
    ['Isi formulirnya', 'Hibah cair. Nilainya lebih besar dari malam yang hilang.'],
  ]],
  ['lombaKampung', 'Lomba Kampung Terbaik', 'Lomba "kampung terbaik" dibuka. Kriteria penilaian: spanduk. Kriterianya dipasang di spanduk.', [
    ['Lewati', 'Kampung lain menang dengan spanduk bagus.'],
    ['Cetak spanduk', 'Spanduk di tiap gang. Juri suka. Percetakan juga.'],
    ['Telepon teman di juri', 'Juri melihat berkasnya dari sudut baru.'],
  ]],
  ['truckSampah', 'Truk Sampah Telat', 'Truknya telat seminggu. Bank sampah meluap. Jadwalnya bilang "tepat waktu".', [
    ['Tunggu truknya', 'Truk datang. Baunya tinggal seminggu lagi.'],
    ['Bayar pengangkut swasta', 'Beres sehari. Tagihannya aneh dan terperinci.'],
  ]],
  ['lubangViral', 'Lubang {plain:Viral}', 'Video lubang di depan kantor viral. Keterangannya jeritan minta tolong. Lubangnya punya penggemar.', [
    ['Abaikan', 'Lubangnya dapat tagar sendiri.'],
    ['Tambal cepat', 'Video sebelum dan sesudah: 2 juta tayangan.'],
    ['Salahkan tahun lalu', 'Tak ada yang ingat siapa yang jaga tahun lalu. Praktis.'],
  ]],
  ['sembako', 'Sembako Datang', 'Truk bansos datang membawa 70% dari yang diumumkan. Pengumumannya ada di spanduk.', [
    ['Bagikan apa adanya', 'Semua dapat sedikit kurang dari janji. Semua menghitung.'],
    ['Tambah dari kas', 'Kantong penuh. Orang-orang menyadarinya.'],
  ]],
  ['pbb', 'Tagihan PBB', 'Tagihan PBB tiba. Jatuh temponya sehari sebelum tiba. Diskon 3% untuk yang cepat.', [
    ['Bayar telat, kena denda', 'Dendanya lebih besar dari tagihan. Dendanya juga tepat waktu.'],
    ['Bayar tepat waktu', 'Kuitansi, stempel, dan senyum langka.'],
  ]],
  ['festivalKuliner', 'Festival Kuliner', 'Festival kuliner menawarkan lapak untuk kampung. Warung harus bawa sambal dan izin.', [
    ['Lewati festival', 'Warung tetap di rumah dan menggoreng seperti biasa.'],
    ['Ambil lapak', 'Antrean mengular. Warung mengalahkan sambalnya sendiri.', 'Keramaian festival'],
  ]],
  ['telponKecamatan', 'Telepon dari Kecamatan', 'Kantor kecamatan menelepon soal izin-izinmu. "Sebaiknya ada yang datang langsung." Siapa yang pergi?', [
    ['Biarkan berkasnya menunggu', 'Teleponnya berdering sekali lagi, lalu tak pernah lagi.'],
    ['Kirim orang', ['Empat berkas pulang berstempel, plus sekotak kue untuk kantor.', 'Dia pulang membawa formulir baru. Formulir barunya butuh stempel.']],
  ]],
  ['protesWarga', 'Warga di Gerbang', 'Selusin warga berkumpul di Kantor soal bising, got, dan antrean untuk segala hal. Harus ada yang keluar menemui mereka.', [
    ['Tutup jendela', 'Mereka pulang. Mereka juga pindah ke grup WA.'],
    ['Kirim orang keluar', ['Teh, canda, dan janji yang ada tanggalnya. Mereka pulang senang.', 'Ada yang merekam. Videonya berjudul "Kantor vs warga".']],
  ]],
  ['hibahTunai', 'Hibah Tunai', 'Seorang donatur menyerahkan hibah tunai, dalam amplop, malam-malam. Harus ada yang menghitung dan membukukannya.', [
    ['Kembalikan', 'Donaturnya tersinggung. Warganya terkesan.'],
    ['Suruh orang membukukan', ['Tiap rupiah tercatat, lengkap dengan kuitansi dan foto.', 'Amplopnya tiba lebih tipis daripada saat berangkat.']],
  ]],
  ['atapBocor', 'Atap Bocor', 'Selepas badai, atap bocor di sepanjang gang. Memperbaikinya butuh seharian memanjat. Siapa yang memimpin?', [
    ['Ember untuk semua', 'Ember plastik, senyum plastik.'],
    ['Kirim kru', ['Semua atap tertambal sebelum magrib. Tangganya juga selamat.', 'Separuh atap, tagihan terpal dua kali lipat.']],
  ]],
];

const LINES: [id: string, name: string, line: string][] = [
  ['loket', 'Antrean Loket', 'Loket buka jam sembilan. Antrean buka jam enam.'],
  ['stempelBasah', 'Stempel Basah', 'Stempelnya masih basah, jadi surat itu berlaku satu sore.'],
  ['rapatDadakan', 'Rapat Dadakan', 'Rapat mendesak digelar untuk merencanakan rapat berikutnya.'],
  ['grupRT', 'Grup RT Ramai', 'Grup WhatsApp tembus 200 pesan. Tak ada yang membaca.'],
  ['selamatPagi', 'Selamat Pagi', 'Empat puluh stiker selamat pagi. Satu pengumuman asli, terkubur di pesan ke-38.'],
  ['bantuanCair', 'Bantuan Cair', 'Bantuan cair. Pemberitahuan bilang Selasa. Datangnya Jumat.'],
  ['iuranLunas', 'Iuran Lunas', 'Semua bayar iuran tepat waktu. Bendahara mencari jebakannya.'],
  ['kasSelisih', 'Kas Selisih', 'Kas selisih Rp 50.000. Panitia akan mencarinya. Pelan-pelan.'],
  ['lampuJalan', 'Lampu Jalan', 'Satu lampu jalan diperbaiki. Satu lagi rusak supaya seimbang.'],
  ['jalanDitambal', 'Jalan Ditambal', 'Jalan ditambal. Tambalannya punya lubang sendiri.'],
  ['spandukBaru', 'Spanduk Baru', 'Spanduk baru berterima kasih ke RT atas proyek yang belum ada.'],
  ['formBaru', 'Form Baru', 'Formulir baru meminta data dari formulir sebelumnya.'],
  ['fotokopi', 'Fotokopi', 'Fotokopi KTP, tiga lembar, plus satu untuk abang fotokopi.'],
  ['survey', 'Survey Lagi', 'Sebuah survei bertanya ke warga soal perasaan mereka terhadap survei.'],
  ['listrikMati', 'Listrik Mati', 'Listrik mati dua puluh menit. Pemberitahuannya tiba di menit kedua puluh satu.'],
  ['sinyalHilang', 'Sinyal Hilang', 'Wifi mati. Rapatnya juga, akhirnya.'],
  ['ojolLewat', 'Ojol Lewat', 'Ojol muter-muter di blok. Orderannya untuk jalan sebelah.'],
  ['kopiGratis', 'Kopi Gratis', 'Warung beli satu gratis satu untuk kopi sachet.'],
  ['gosipHangat', 'Gosip Hangat', 'Sebuah kabar melintasi warung lebih cepat dari wifi.'],
  ['rondaAman', 'Ronda Aman', 'Malam tenang. Rondanya juga tenang, kebanyakan tidur.'],
  ['selokanLancar', 'Selokan Lancar', 'Selokan mengalir. Laporan langka yang tak dipertanyakan siapa pun.'],
  ['selokanMampet', 'Selokan Mampet', 'Selokan mampet. Semua melihat. Tak ada yang merasa punya.'],
  ['parkirLiar', 'Parkir Liar', 'Tukang parkir menagih di jalan yang tak ada parkirnya.'],
  ['kantorBuka', 'Kantor Buka', 'Kantor buka tepat waktu. Staf menyebutnya anomali.'],
  ['capHilang', 'Cap Hilang', 'Cap hilang. Semua surat kini berstatus "proses".'],
  ['kosBayar', 'Kos Bayar Awal', 'Anak kos bayar lebih awal. Orang tuanya transfer.'],
  ['senam', 'Senam Pagi', 'Senam pagi di lapangan. Speakernya lebih keras dari instrukturnya.'],
  ['bankSampahPenuh', 'Bank Sampah Penuh', 'Bank sampah penuh. Truknya dijadwalkan "segera".'],
  ['plastikDitukar', 'Plastik Ditukar', 'Bank sampah membayar. Plastik dapat kurs lebih baik dari manusia.'],
  ['hujanRingan', 'Hujan Ringan', 'Hujan sepuluh menit. Jalan banjir sejam.'],
  ['cuacaCerah', 'Cuaca Cerah', 'Hari cerah. Jemuran menutupi semua pagar.'],
  ['tamuDinas', 'Tamu Dinas', 'Tamu dari dinas datang. Kami sajikan seadanya. Dia menulis "baik".'],
  ['laporanLengkap', 'Laporan Lengkap', 'Laporan selesai. Lebih panjang dari pekerjaan yang dilaporkan.'],
  ['suratEdaran', 'Surat Edaran', 'Surat edaran menyuruh mengikuti surat edaran sebelumnya.'],
  ['nomorAntrean', 'Nomor Antrean', 'Mesin nomor antrean rusak. Orang kini antre pakai ingatan.'],
  ['pohonTumbang', 'Pohon Tumbang', 'Pohon tumbang. Grup WhatsApp terbentuk dalam semenit. Pohonnya masih di sana.'],
  ['danaCepat', 'Dana Cair Cepat', 'Dana cair dalam sehari. Semua curiga.'],
  ['telepon', 'Satu Telepon', 'Satu telepon dari teman temannya teman menggeser izin tiga minggu.'],
  ['muralLomba', 'Lomba Mural', 'Lomba mural. Penjurian setelah cat kering, jadi, tahun depan.'],
];

export const ID_EVENTS_MORE: Record<string, string> = {};
for (const [id, name, body, choices] of EVENTS) {
  ID_EVENTS_MORE[`event.${id}.name`] = name;
  ID_EVENTS_MORE[`event.${id}.body`] = body;
  choices.forEach(([label, result, mod], i) => {
    ID_EVENTS_MORE[`event.${id}.c${i}.label`] = label;
    if (Array.isArray(result)) result.forEach((r, j) => (ID_EVENTS_MORE[`event.${id}.c${i}.o${j}.result`] = r));
    else ID_EVENTS_MORE[`event.${id}.c${i}.result`] = result;
    if (mod) ID_EVENTS_MORE[`event.${id}.c${i}.mod`] = mod;
  });
}
for (const [id, name, line] of LINES) {
  ID_EVENTS_MORE[`line.${id}.name`] = name;
  ID_EVENTS_MORE[`line.${id}.line`] = line;
}
