# 90s special hires and a portrait for every special

TODO: "90s special hires and a portrait for every special".

## The ask, and the line it stays inside

The ask was portraits for parodies of famous Indonesians and 90s characters (Si Bobo, Doraemon, Mbak Yul, Dono Kasino Indro, Si Komo). Two rules stood in the way:
- `src/data/staff.ts` and GAME-DESIGN.md section 5 make specials recognisable *types*, never one real person ("blusukan is tied to one real person, so it is out").
- The fictional characters belong to their owners, so a recognisable take on them carries copyright and trademark risk.

Parodying Dono and Kasino, who have died, also risks offending fans, and the Warkop DKI name is actively guarded.

voidinside99 chose 90s archetypes: original types that carry the decade through what they did on TV and radio, not through who they were.

## The six new specials (4★, Online, one each)

| Special | Type | Role | Quirk |
| --- | --- | --- | --- |
| Bang Lawak | comic from a campus-radio trio | Admin Grup WA | every bad event gets a punchline: Virality x1.5 |
| Om Lalu Lintas | radio traffic reporter | Supir | knows every macet: crews 1.5x sooner |
| Bu Juru Ketik | typewriter typist from the old kantor | Asisten | ten fingers, carbon paper: folders x1.5 |
| Pak Kuis | TV quiz-show host | Sekretaris | every caller wins something: Orang Inside x1.5 |
| Mbak Senam Pagi | morning-aerobics instructor | Hansip | senam at six: Aman x1.5 |
| Bang Rental PS | games-rental repairman | Petugas PU | one screwdriver: repairs x1.5 |

Each has a 4★ stat total near 210, leaning on the role's work stat. Their risk stats are deliberately uneven. Pak Kuis's Jujur 40 gives the occasional scandal, and Om Lalu Lintas's Gaul 45 now and then clips a gerobak.

## Portraits

`src/render/portraits.ts` paints every special at Inem's size, 44x60, from parts: skin, hair (short, side part, long, bun, curly, bald, ponytail, mullet, pompadour, grey), outfit (suit, dress, kebaya, hoodie, t-shirt, safari, vest, blouse, sequin jacket, tracksuit, tank top), and props (mic, phone, glasses, sunglasses, headset, headphones, cap, headband, tie, bow tie, pencil, screwdriver, mustache, chain). It follows ART.md:
- fills are lit from the top left, with a softer shade on the right;
- a 1px coloured outline is a dark shade of what it borders, never black;
- colours come from the palette.

The portrait shows on the staff card and on the applicant card. Other hires keep the star badge.

Updates the docs: GAME-DESIGN.md, the staff specials line.
