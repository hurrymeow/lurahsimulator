# A portrait for every staff member

TODO item "A portrait for every staff member" (voidinside99, 2026-11-01). Spec: `decisions/staff-requests.md` section 1.

- **Outfits:** generic hires are painted by the same code as the specials (`src/render/portraits.ts`, 44x60, two-tone, coloured outline), in the outfit of their job:
  - Hansip: a green uniform and beret.
  - Petugas PU: an orange vest and a site helmet.
  - Supir: a jacket and a peci.
  - Bendahara: batik, a new outfit with a diamond motif.
  - Admin Grup WA: a hoodie and a phone.
  - Asisten: a shirt and an ID lanyard.
  - Sekretaris: a blazer.
  - Tukang Tagih: a waist bag and a notebook.
- **Satpol PP:** this role is not in the spec, since it came with the Kecamatan. It gets a khaki uniform and a dark cap.
- **Faces:** skin, hair, hair colour, expression and sometimes glasses are seeded by the staff id. An applicant keeps the same id when hired, so the face on the applicant card is the face on the staff card, for good. A Mutasi changes the role and so the outfit, but never the face.
- **Headwear:** a beret, helmet, peci or cap never sits on long hair, a bun or a ponytail; those become a short cut.
- **Where it shows:** the staff card, the detail view and the applicant card. Specials keep their hand-picked looks, and Inem keeps hers. The star badge that stood in for a face is gone. The stars are still on the role line.
- **Not done here:** the personal-request card (Urusan Pribadi) does not exist yet. It can use `staffPortraitURL` when it lands.

Verdict (self-approved): `tests/portraits.test.ts` checks four things. Every role has an outfit, and no two are the same. A hire keeps the same face, and 12 hires give at least 8 different faces. Every portrait is 44x60 with no pure black (ART.md). Headwear never sits on long hair. The Staff e2e specs pass at 320px ID and 412px EN.
