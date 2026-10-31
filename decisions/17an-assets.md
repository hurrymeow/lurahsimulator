# 17an (Agustusan) fanfares, SFX and key art

From a team chat handed off on 2026-10-31. Nothing here is built. It waits on one decision (TODO: "17an (Agustusan) fanfares, SFX and key art"): `src/audio.ts` synthesises every sound so nothing is downloaded or licensed, and ART.md paints the art in code. Recorded audio and AI-assisted art would change that.

## Music limits

- Do not parody or rearrange Indonesia Raya. UU 24/2009 Pasal 64 bars changing the anthem's melody, rhythm, lyrics or arrangement to demean it, and bars commercial use such as ads. The penalties now sit in the new KUHP (UU 1/2023). The backlash risk is high too.
- Bengawan Solo (Gesang, died 2010) and Hari Merdeka (H. Mutahar, died 2004) are likely still under copyright. Do not quote them.
- Ibu Pertiwi's tune is said to come from a public-domain 19th-century hymn, but it is slow and sad, wrong for a fanfare.
- So: original fanfares that sound like 17an through instruments and rhythm (drumband snare, pianika, glockenspiel, kendang, angklung), never a quoted melody. Prompts name instruments and mood, never song titles.

## Flag rule

Treat the Merah Putih with respect: never on the greased pole, the ground or costumes (UU 24/2009 also sets flag-use rules). Red-and-white bunting, umbul-umbul and gate paint are fine.

## If recorded audio and AI art are allowed

Tools, all through Scenario:

- Lomba SFX and crowd: ElevenLabs Sound Effects v2 (commercial licence, loop toggle, up to 30s). MM Audio 2 SFX as a second choice.
- Fanfares and jingles: a Scenario music model, since SFX models are weak at melody. Generate 8 to 15s and trim.
- "MERDEKA!" shout: record a teammate, not TTS.
- AI often gets kendang koplo and angklung wrong. Layer real samples if it sounds generic.
- Art: concept with a strong prompt-following image model (Gemini or Seedream) using reference photos (panjat pinang tends to come out as a maypole), restyle through a Scenario style model trained on our art, then Scenario's image-to-pixel-art tool, then clean up by hand to ART.md (coloured outlines, the palette). PixelLab for animated sprite sheets.

SFX prompts:

1. Drumband fanfare: `Indonesian school marching band fanfare, snare drum roll into bright pianika and glockenspiel melody, 2/4 march, triumphant, outdoor, 6 seconds`
2. Koplo sting: `dangdut koplo kendang drum fill, bamboo flute lick, ending on a punchy drum hit, comedic and upbeat, 3 seconds`
3. Angklung jingle: `short ascending bamboo angklung melody, cheerful, bright, notification jingle, 2 seconds`
4. Crowd cheer: `village crowd cheering and clapping outdoors, festive, children laughing, loopable`
5. Kerupuk crunch: `loud crunchy cracker bite, cartoonish, close-up`
6. Balap karung: `burlap sack hopping thumps on dirt ground, rhythmic, three hops`
7. Tarik tambang: `group of men grunting in unison while pulling a rope, rope creaking, effort`
8. Kelereng sendok: `glass marble rattling on a metal spoon, then dropping and bouncing on concrete`
9. Panjat pinang fail: `comedic descending slide whistle, then a soft muddy thud`
10. Panjat pinang win: `ascending slide whistle into a crowd cheer and a celebratory cymbal crash`

Art prompts:

1. Panjat pinang key art: `pixel art, cozy Kairosoft style, Indonesian village Independence Day festival, tall greased areca palm pole with a prize ring at the top holding a bicycle, electric fan, bucket and rice cooker, human pyramid of muddy villagers in shorts climbing, a kid on top reaching for the bicycle, cheering crowd, red and white bunting`
2. Lomba lineup: `pixel art, Indonesian kampung August 17 games, kids eating hanging crackers with hands tied behind their backs, sack race, tug of war, bamboo stilt walking, festive red and white flags strung overhead, sunny afternoon`
3. Sepak bola daster: `pixel art, comedic scene, middle-aged Indonesian men playing football while wearing colorful floral house dresses, dusty field, laughing spectators`
4. Kampung decorated: `pixel art, Indonesian alley village decorated for Independence Day, painted red and white gate archway, plastic flag bunting across the street, umbul-umbul banners, isometric town view`
5. Malam tirakatan: `pixel art, night village stage, organ tunggal keyboard player and dangdut singer, tumpeng rice cone on a table, string lights, neighbors sitting on mats`
6. Event banner: `pixel art banner, red and white confetti, fireworks, festive, wide format`. Add "Dirgahayu RI" by hand, since models render text badly, and leave out the anniversary number so the banner works every year.

## If they are not allowed

Write the 17an fanfare and stings in `src/audio.ts` with the same cues: a snare roll into a bright 2/4 march for the day, a short kendang fill for a comic fail, a rising angklung-like arpeggio for a win. Draw the banner and the panjat pinang scene in code to ART.md.
