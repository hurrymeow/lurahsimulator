// "Who do you send?" events: a choice that sends one of your staff, with the odds set by one stat. The event card
// lists the best three for that stat with their odds, so the pick is a staffing decision the player can see.
// Each stat has one: Lobi gets things through the Kecamatan, Gaul talks warga down, Jujur books the money,
// Rajin does the climbing. outcomes[0] is the success, outcomes[1] the failure.
import type { EventDef } from './events';

export const STAFF_EVENTS: EventDef[] = [
  {
    id: 'telponKecamatan',
    name: 'A Call from the Kecamatan',
    body: 'The Kecamatan office calls about your permits. "Someone should come in person." Who goes?',
    when: { minMonth: 8, chance: 0.12, cooldown: 24, queue: true },
    choices: [
      { label: 'Let the folders wait', res: { sabar: -1 }, result: 'The phone rings once more, then never again.' },
      {
        label: 'Send someone',
        send: { stat: 'lobi', base: 0.55, perPoint: 0.012 },
        outcomes: [
          { weight: 1, stamp: 4, res: { sabar: 1 }, result: 'Four folders come back stamped, with a box of kue for the office.' },
          { weight: 1, res: { sabar: -3 }, result: 'They come back with a new form. The new form needs a stamp.' },
        ],
        result: '',
      },
    ],
  },
  {
    id: 'protesWarga',
    name: 'Warga at the Gate',
    body: 'A dozen warga gather at the Kantor about the noise, the drains and the queue for everything. Someone has to go out to them.',
    when: { minMonth: 12, minStars: 1, chance: 0.1, cooldown: 30 },
    choices: [
      { label: 'Close the window', res: { sabar: -3 }, result: 'They go home. They also go on the group chat.' },
      {
        label: 'Send someone out',
        send: { stat: 'gaul', base: 0.5, perPoint: 0.012 },
        outcomes: [
          { weight: 1, res: { sabar: 5 }, result: 'Tea, jokes, and a promise with a date on it. They go home happy.' },
          { weight: 1, res: { sabar: -5, viral: 4 }, result: 'Someone filmed it. The video is called "Kantor vs warga".' },
        ],
        result: '',
      },
    ],
  },
  {
    id: 'hibahTunai',
    name: 'A Hibah in Cash',
    body: 'A donor hands over a hibah in cash, in an envelope, at night. Someone has to count it and book it.',
    when: { minMonth: 16, minStars: 1, chance: 0.08, cooldown: 36 },
    choices: [
      { label: 'Give it back', res: { sabar: 2 }, result: 'The donor is offended. The warga are impressed.' },
      {
        label: 'Have someone book it',
        send: { stat: 'jujur', base: 0.55, perPoint: 0.012 },
        outcomes: [
          { weight: 1, incomePct: 1, result: 'Every rupiah is booked, with a receipt and a photo.' },
          { weight: 1, incomePct: 0.3, res: { sabar: -3 }, result: 'The envelope arrives lighter than it left.' },
        ],
        result: '',
      },
    ],
  },
  {
    id: 'atapBocor',
    name: 'Leaking Roofs',
    body: 'After the storm, roofs leak all down the gang. Fixing them is a day of climbing. Who leads the crew?',
    when: { minMonth: 10, chance: 0.1, cooldown: 24 },
    choices: [
      { label: 'Buckets for everyone', res: { sabar: -2 }, result: 'Plastic buckets, plastic smiles.' },
      {
        label: 'Send a crew',
        send: { stat: 'rajin', base: 0.55, perPoint: 0.012 },
        outcomes: [
          { weight: 1, res: { sabar: 4 }, result: 'Every roof patched by sunset. The ladder survived too.' },
          { weight: 1, res: { sabar: -1 }, incomePct: -0.15, result: 'Half the roofs, double the tarpaulin bill.' },
        ],
        result: '',
      },
    ],
  },
];
