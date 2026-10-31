# 17an fanfares, sounds and art, made in the engine

TODO: "17an (Agustusan) fanfares, SFX and key art". `decisions/17an-assets.md` left a choice: record audio and use AI-assisted art (a policy change), or make it in code. Decided 2026-10-31 by voidinside99: make it in the engine. `src/audio.ts` already synthesises every sound with nothing to download or license, and every sprite is drawn in code, so this changes no policy.

## What was made

Sounds (`src/audio.ts`, type `Sfx17`), all from oscillators and filtered noise:

| Sound | Built from | Plays when |
| --- | --- | --- |
| Drumband fanfare | A swelling snare roll, then a short original 2/4 march on glockenspiel (a sine with its out-of-tune overtone) and pianika (a filtered square), snare on the beat, bass drum on the one | The day opens; a clean sweep at the prizes |
| Koplo sting | Kendang "dung" (a falling sine) and "tak" (a noise click) in a fast fill, a bamboo-flute lick with vibrato, one punchy hit | A contest is lost |
| Angklung call | Five rising notes, each shaken: four quick strikes of a hollow tone | Prizes with at least one win |
| Slide whistle up, then a cheer | A sine gliding up, a cymbal-like hiss | Panjat Pinang won |
| Slide whistle down, then a thud | A sine gliding down into a drum and a muddy low hiss | Panjat Pinang lost |
| Sack hop | A low thump | Every tap in Balap Karung |
| Kerupuk crunch | Six dry noise crackles | Makan Kerupuk is played |
| Crowd cheer | Noise that swells and falls, with scattered claps | Any other win |

Art (`src/render/agustus.ts`), in palette colours with coloured outlines (ART.md):

- **The pole**: a pinang trunk with growth rings and a grease shine, mud at the foot, and a bamboo hoop with a bicycle, a fan, a bucket and a rice cooker hanging from it. It replaces the CSS stripes behind the climbing track.
- **The day banner**: firework bursts, confetti and a strip of red-and-white bunting over the title. The words stay in the HTML title, so they are read out and translated.
- **The kampung in July and August** (from year 2, `agustusan` in `src/sim/lomba.ts`): bunting from the Kantor RT's roof to its three nearest buildings, and an umbul-umbul on each free tile in front of it. Drawn before the night tint, so it darkens at night like the rest.

## Limits kept

- Every tune is original. Indonesia Raya is never used or changed, and no other song is quoted (UU 24/2009; Bengawan Solo and Hari Merdeka are likely still under copyright).
- The Merah Putih itself is never drawn: not on the pole, the ground or anyone's clothes. Bunting is red and white; umbul-umbul are many-coloured.

## Left out

- **"MERDEKA!" shout.** Synthesised speech does not convince; a crowd cheer plays instead.
- **Tarik tambang grunts.** A buzzing voice-like tone sounds robotic, so the tug of war uses the shared win and loss sounds.
- **Kelereng sendok.** There is no marble-and-spoon contest yet.
- **Big key-art scenes** (the human pyramid, sepak bola daster, malam tirakatan). Possible with the walker figures, but each is a scene of its own; they can follow as separate work.

Updates the docs: GAME-DESIGN.md, a "Look and sound" line under Lomba Agustusan.
