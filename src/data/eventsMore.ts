import type { EventDef } from './events';

// Advice events roll a hidden outcome, so the same choice can go well or badly. Paid choices cost the
// dearer of a base price and some months of net income, so they stay a decision once the kampung is rich.
// The first choice is always free. Satire targets systems only.
const NOW = 6;

export const MORE_EVENTS: EventDef[] = [
  // ---------- the first popup: a light joke with one clear winner, on schedule at month 6 (GAME-DESIGN.md target 3) ----------
  {
    id: 'guntingPita',
    name: 'Gunting Pita',
    body: 'Kecamatan sends a photographer for your first ribbon cutting. The ribbon is one metre long. The scissors are on loan.',
    when: { minMonth: NOW, maxMonth: 12, chance: 1, cooldown: 9999 },
    choices: [
      { label: 'Cut it yourself', res: { sabar: 2 }, result: 'Snip. Done before the photographer found the right angle.' },
      { label: 'Hand it to the kids', res: { sabar: 6, viral: 8 }, result: 'The photo is everywhere. The ribbon is in three pieces.' },
    ],
  },
  // ---------- advice: yes or no, outcome hidden ----------
  {
    id: 'partTime',
    name: 'Part-Time Request',
    body: 'Dimas, 16, wants a part-time job at the warung. His mother says yes. His teacher says no. Allow it?',
    when: { minMonth: NOW, chance: 0.12, cooldown: 14 },
    choices: [
      { label: 'Say no', res: { sabar: -1 }, result: 'Dimas sulks. His grades stay exactly as they were.' },
      {
        label: 'Allow it',
        outcomes: [
          { weight: 5, res: { viral: 6 }, incomePct: 0.15, result: 'Best barista in the kampung. Customers come for him.' },
          { weight: 3, res: { sabar: 3 }, result: 'Fine. Nobody notices, which counts as success.' },
          { weight: 2, res: { sabar: -4 }, incomePct: -0.05, result: 'He sleeps in class and the gorengan burns.' },
        ],
        result: '',
      },
    ],
  },
  {
    id: 'cctv',
    name: 'CCTV Vendor',
    body: 'A vendor offers a "free pilot" of CCTV for the pos ronda. The contract is 14 pages long. Sign?',
    when: { minMonth: 10, minStars: 1, chance: 0.1, cooldown: 14, needs: 'posRonda' },
    choices: [
      { label: 'Decline', res: { sabar: -1 }, result: 'The vendor leaves a brochure and a business card.' },
      {
        label: 'Sign the pilot',
        outcomes: [
          { weight: 4, res: { sabar: 6 }, result: 'The cameras work. Someone finally watches them.' },
          { weight: 3, res: { sabar: -2 }, incomePct: -0.2, result: 'The cameras face the wall. The invoice faces you.' },
          { weight: 2, res: { viral: 12, sabar: -3 }, result: 'The footage goes viral. Mostly the ronda, asleep.' },
        ],
        result: '',
      },
    ],
  },
  {
    id: 'kkn',
    name: 'KKN Students',
    body: 'Mahasiswa arrive for their KKN with a 40-page programme and one marker pen. Host them?',
    when: { minMonth: 12, minStars: 1, chance: 0.1, cooldown: 14 },
    choices: [
      { label: 'Give them a desk', res: { sabar: 1 }, result: 'They make a banner. It says KKN.' },
      {
        label: 'Host them properly',
        cost: { rupiah: 300_000, incomeMonths: 0.4 },
        outcomes: [
          { weight: 4, res: { sabar: 8 }, result: 'They build a real water point. The report says it was a workshop.' },
          { weight: 3, res: { viral: 8 }, result: 'Posters, posters and a very good reel.' },
          { weight: 2, res: { sabar: 2 }, incomePct: -0.1, result: 'The programme needed a sponsor. You were it.' },
        ],
        result: '',
      },
    ],
  },
  {
    id: 'startupPilot',
    name: 'Startup Pilot',
    body: 'A startup wants to digitise the iuran. The app is "almost ready". It has a logo. Run the pilot?',
    when: { minMonth: 14, minStars: 1, chance: 0.1, cooldown: 16, needs: 'wifi' },
    choices: [
      { label: 'Keep the paper book', res: { sabar: -1 }, result: 'The paper book survives another year.' },
      {
        label: 'Run the pilot',
        outcomes: [
          { weight: 4, incomePct: 0.25, result: 'Iuran arrive by QR. The fee is 2%, politely hidden.' },
          { weight: 4, res: { sabar: -5, viral: 3 }, result: 'The app crashes at the deadline. A screenshot of the crash trends.' },
          { weight: 2, res: { viral: 10 }, result: 'Demo day. Free coffee, loud applause, no code.' },
        ],
        result: '',
      },
    ],
  },
  {
    id: 'hajatan',
    name: 'Road Closure Request',
    body: 'A neighbour wants to close the jalan for a hajatan. The permit is one signature from you. Allow?',
    when: { minMonth: 8, chance: 0.12, cooldown: 12 },
    choices: [
      { label: 'Decline', res: { sabar: -2 }, result: 'The tent goes up in the garage. People remember.' },
      {
        label: 'Permit it',
        outcomes: [
          { weight: 5, res: { sabar: 6 }, result: 'A great party. Leftovers for the whole gang.' },
          { weight: 3, res: { sabar: -5, viral: 4 }, result: 'Sound system until 2 am. It trends, for the wrong reasons.' },
          { weight: 2, res: { orangDalam: 1 }, result: 'A guest "thanks" the ronda. A favour is now owed to you.' },
        ],
        result: '',
      },
    ],
  },
  {
    id: 'pasarMalam',
    name: 'Pasar Malam',
    body: 'An organiser asks to use the lapangan for a pasar malam. The deposit is a handshake. Allow?',
    when: { minMonth: 10, minStars: 1, chance: 0.1, cooldown: 14, needs: 'lapangan' },
    choices: [
      { label: 'Decline', res: { sabar: -1 }, result: 'The lapangan stays empty. The grass is grateful.' },
      {
        label: 'Allow it',
        outcomes: [
          { weight: 5, res: { viral: 4 }, incomePct: 0.3, result: 'Every stall sells out. So does the parkir.' },
          { weight: 3, res: { sabar: -4 }, incomePct: 0.1, result: 'Good takings. Plastic cups to the horizon.' },
          { weight: 2, res: { sabar: -2 }, incomePct: -0.1, result: 'Rain at 7 pm. The deposit was only a handshake.' },
        ],
        result: '',
      },
    ],
  },
  {
    id: 'sisaAnggaran',
    name: 'Sisa Anggaran',
    body: 'It is year end. Unspent budget must be spent, or it vanishes and next year\'s shrinks. Nobody asks what for.',
    when: { months: [10], minMonth: 10, minStars: 1, chance: 0.5, cooldown: 11 },
    choices: [
      { label: 'Return the money', res: { sabar: 1 }, result: 'The treasurer looks at you like you broke a rule.' },
      {
        label: 'Spend it on "kegiatan"',
        outcomes: [
          { weight: 4, res: { sabar: 5 }, result: 'The same road is paved again, and it is a good road.' },
          { weight: 3, res: { viral: 6, sabar: -2 }, result: 'Receipts for 40 banners. Three banners exist.' },
          { weight: 1, res: { orangDalam: 1 }, result: 'The vendor was a friend of a friend. A friend now owes you.' },
        ],
        result: '',
      },
    ],
  },
  {
    id: 'magang',
    name: 'Intern from the Kecamatan',
    body: 'The Kecamatan sends an intern. She types fast. Nobody knows where to seat her. Take her on?',
    when: { minMonth: 14, minStars: 1, chance: 0.1, cooldown: 16, needs: 'kantorRT' },
    choices: [
      { label: 'Politely decline', res: { sabar: -1 }, result: 'She goes to the next RT. They give her the good chair.' },
      {
        label: 'Take her on',
        outcomes: [
          { weight: 4, res: { orangDalam: 1 }, result: 'She fixes the files. She also knows who signs what.' },
          { weight: 3, res: { sabar: -2 }, result: 'She spends the week on forms for forms.' },
          { weight: 2, res: { viral: 4 }, result: 'Her LinkedIn post about the kampung does numbers.' },
        ],
        result: '',
      },
    ],
  },
  {
    id: 'pungli',
    name: 'Biaya Keamanan',
    body: 'A man collects a "keamanan fee" from the shops. There is no receipt, only confidence. Pay?',
    when: { minMonth: 14, minStars: 1, chance: 0.1, cooldown: 14 },
    choices: [
      { label: 'Refuse', res: { sabar: -3 }, result: 'He stares. The shops stare back, quietly.' },
      {
        label: 'Pay the fee',
        cost: { rupiah: 150_000, incomeMonths: 0.1 },
        outcomes: [
          { weight: 4, res: { sabar: 2 }, result: 'Nothing happens. For now.' },
          { weight: 4, res: { sabar: -1 }, incomePct: -0.05, result: 'He is back next week. There is now a rate card.' },
        ],
        result: '',
      },
    ],
  },
  {
    id: 'pangkalanOjol',
    name: 'Ojol Base Camp',
    body: 'The ojol drivers want a pangkalan by the corner. They promise to keep it tidy. They promise.',
    when: { minMonth: 12, minStars: 1, chance: 0.1, cooldown: 14, needs: 'wifi' },
    choices: [
      { label: 'Decline', res: { sabar: -1 }, result: 'They wait on the next street. Orders go there instead.' },
      {
        label: 'Allow a pangkalan',
        outcomes: [
          { weight: 5, incomePct: 0.15, result: 'Orders go up. So do the mie ayam sales.' },
          { weight: 3, res: { sabar: -3, viral: 5 }, result: 'Helmets on every wall, and a very loud group chat.' },
          { weight: 2, res: { sabar: -5 }, result: 'A fight over who gets the corner. The corner is a metre wide.' },
        ],
        result: '',
      },
    ],
  },
  {
    id: 'lesGratis',
    name: 'Free Tutoring',
    body: 'A retired teacher offers free les in the balai every Saturday. She asks only for a working fan.',
    when: { minMonth: 10, chance: 0.1, cooldown: 14 },
    choices: [
      { label: 'Say thanks, no room', res: { sabar: -1 }, result: 'She teaches under a tree. A few kids follow her.' },
      {
        label: 'Give her the balai',
        outcomes: [
          { weight: 6, res: { sabar: 6 }, result: 'Grades go up. The fan was broken the whole time.' },
          { weight: 4, res: { viral: 6, sabar: 2 }, result: 'A kid wins a lomba. The kampung claims the credit.' },
        ],
        result: '',
      },
    ],
  },

  // ---------- trade-offs with a price ----------
  {
    id: 'padam',
    name: 'Pemadaman',
    body: 'Listrik is out across the block. The notice said "maintenance". The notice was posted after the outage.',
    when: { minMonth: NOW, chance: 0.1, cooldown: 12 },
    choices: [
      {
        label: 'Wait it out',
        res: { sabar: -3 },
        modifier: { label: 'Blackout', target: '*', incomeMult: 0.85, months: 2 },
        result: 'Candles, gorengan and a lot of patience.',
      },
      { label: 'Rent a genset', cost: { rupiah: 300_000, incomeMonths: 0.5 }, res: { sabar: 2 }, result: 'The genset is loud, and so is the gratitude.' },
    ],
  },
  {
    id: 'rapatWarga',
    name: 'Rapat Warga',
    body: 'A rapat warga is called. Agenda: one item. Estimated duration: three hours. Estimated decision: none.',
    when: { minMonth: 8, chance: 0.12, cooldown: 10 },
    choices: [
      { label: 'Keep it to three hours', res: { sabar: -3 }, result: 'No decision. A second rapat is scheduled.' },
      { label: 'Serve snacks', cost: { rupiah: 100_000, incomeMonths: 0.15 }, res: { sabar: 5 }, result: 'Snacks end every argument. The agenda survives, barely.' },
      { label: 'Vote by show of hands', cost: { orangDalam: 1 }, res: { sabar: 6, viral: 2 }, result: 'Hands rise before the question ends. The motion passes.' },
    ],
  },
  {
    id: 'hibah',
    name: 'Proposal Hibah',
    body: 'A hibah is open. It needs six forms, four stamps, and a photo of a banner of the thing you want to do.',
    when: { minMonth: 12, minStars: 1, chance: 0.1, cooldown: 14, needs: 'kantorRT' },
    choices: [
      { label: 'Skip the forms', res: { sabar: 1 }, result: 'Peace of mind, and no money.' },
      { label: 'Fill in the forms', res: { sabar: -4 }, incomePct: 1.2, result: 'The grant lands. It is worth more than the nights you lost.' },
    ],
  },
  {
    id: 'lombaKampung',
    name: 'Kampung Terbaik Contest',
    body: 'A contest for the "best kampung" opens. Judging criteria: banners. The criteria are posted on a banner.',
    when: { minMonth: 10, minStars: 1, chance: 0.1, cooldown: 14 },
    choices: [
      { label: 'Skip it', res: { sabar: -1 }, result: 'Another kampung wins on a very good banner.' },
      { label: 'Print banners', cost: { rupiah: 300_000, incomeMonths: 0.3 }, res: { viral: 14, sabar: 2 }, result: 'Banners at every gang. The jury loved it. Also the printer.' },
      { label: 'Call a friend on the jury', cost: { orangDalam: 1 }, res: { viral: 8, sabar: 3 }, result: 'The jury saw the application in a new light.' },
    ],
  },
  {
    id: 'truckSampah',
    name: 'Truk Sampah Telat',
    body: 'The truck is a week late. The bank sampah overflows. The schedule says "on time".',
    when: { minMonth: 8, chance: 0.1, cooldown: 12 },
    choices: [
      { label: 'Wait for the truck', res: { sabar: -4 }, result: 'The truck came. The smell stayed another week.' },
      { label: 'Pay a private collector', cost: { rupiah: 200_000, incomeMonths: 0.2 }, res: { sabar: 3 }, result: 'Done in a day. The invoice is oddly specific.' },
    ],
  },
  {
    id: 'lubangViral',
    name: 'Viral Pothole',
    body: 'A video of the pothole by the kantor goes viral. The caption is a cry for help. The pothole has fans.',
    when: { minMonth: 10, minStars: 1, chance: 0.1, cooldown: 14 },
    choices: [
      { label: 'Ignore it', res: { viral: 6, sabar: -2 }, result: 'The pothole gets its own hashtag.' },
      { label: 'Patch it fast', cost: { rupiah: 250_000, incomeMonths: 0.25 }, res: { viral: 10, sabar: 4 }, result: 'Before-and-after video: 2 million views.' },
      { label: 'Blame last year', cost: { orangDalam: 1 }, res: { viral: 4, sabar: 3 }, result: 'Nobody remembers who was in charge last year. Convenient.' },
    ],
  },
  {
    id: 'sembako',
    name: 'Sembako Arrives',
    body: 'The bansos truck arrives with 70% of what was announced. The announcement is on the banner.',
    when: { minMonth: 12, minStars: 1, chance: 0.1, cooldown: 16 },
    choices: [
      { label: 'Hand it out as is', res: { sabar: -2 }, result: 'Everyone gets a little less than promised. Everyone counts.' },
      { label: 'Top it up from the kas', cost: { rupiah: 300_000, incomeMonths: 0.3 }, res: { sabar: 8 }, result: 'Full bags. People notice the full bags.' },
    ],
  },
  {
    id: 'pbb',
    name: 'Tagihan PBB',
    body: 'The PBB bill arrives. The due date is the day before it arrives. A 3% discount awaits the early.',
    when: { minMonth: 12, chance: 0.1, cooldown: 12, months: [2, 3, 4] },
    choices: [
      { label: 'Pay late, with fine', res: { sabar: -1 }, incomePct: -0.2, result: 'The fine is larger than the bill. The fine is also on time.' },
      { label: 'Pay on time', cost: { rupiah: 100_000, incomeMonths: 0.12 }, res: { sabar: 3 }, result: 'A receipt, a stamp and a rare smile.' },
    ],
  },
  {
    id: 'festivalKuliner',
    name: 'Festival Kuliner',
    body: 'A festival kuliner offers the kampung a stall. The warung must bring the sambal and the permit.',
    when: { minMonth: 10, minStars: 1, chance: 0.1, cooldown: 14, needs: 'warung' },
    choices: [
      { label: 'Skip the festival', res: { sabar: -1 }, result: 'The warung stays at home and fries as usual.' },
      {
        label: 'Take a stall',
        cost: { rupiah: 200_000, incomeMonths: 0.2 },
        res: { viral: 6 },
        modifier: { label: 'Festival crowd', target: 'warung', incomeMult: 1.4, months: 3 },
        result: 'Queues round the block. The warung outsells its own sambal.',
      },
    ],
  },
];
