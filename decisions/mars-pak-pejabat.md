# Mars Pak Pejabat: a 3-minute background loop

Asked for by the owner (2026-11-06): scout Indonesian official and campaign jingles from the 1960s to 2010s, and make a 3-minute looping soundtrack for Pak Pejabat in their style. It replaces the old 8-bar pentatonic loop in `src/audio.ts`.

## What it is

An original medley, 84 bars at 112 bpm, exactly 180 s, that loops with no gap. Each section hands over to the next by its last chord, and the turnaround ends on C7 so the top (F) follows.

| Bars | Section | Style it borrows from |
| --- | --- | --- |
| 1-4 | Fanfare | A flag-ceremony brass call with a snare roll |
| 5-20 | Mars pembangunan, F | The 1970s-90s brass march of the official election song, "Pemilihan Umum" (Mochtar Embut, 1971): tuba oom-pah, snare march figure |
| 21-28 | Siaran berita, B flat | 1970s-80s TVRI programme themes (Dunia Dalam Berita, Kelompencapir): horn, strings, timpani |
| 29-44 | Dangdut koplo kampanye, D minor | 2000s-2010s rally stages: kendang tak/dhut, suling, off-beat guitar, dangdut bass |
| 45-60 | Jingle iklan, D major | 1980s-90s TV-ad jingles; SBY's 2009 campaign reused an instant-noodle ad jingle, which is the joke here |
| 61-68 | Keroncong, D | 1960s RRI keroncong: cak-cuk guitar, plucked cello, ornamented flute |
| 69-84 | Mars reprise and turnaround | Full band, pianika counter-line, snare roll back to the top |

## Choices

- **Made in code, like every other sound.** The score is note data (`src/music-score.ts`) played by oscillators and filtered noise (`src/music.ts`). Nothing is recorded or downloaded, so this follows `decisions/17an-in-engine.md` and GAME-DESIGN "Look and sound".
- **No song is quoted.** The sections take only genre traits: instruments, rhythms, forms. Every melody is new. No jingle, march or anthem is sampled or paraphrased, and Indonesia Raya is never used (same limits as `decisions/17an-in-engine.md`).
- **One source of truth.** `scripts/music/compose.py` writes both the game score and a General MIDI file (`docs/music/mars-pak-pejabat.mid`, with `loopStart`/`loopEnd` markers and CC111) for listening or arranging in a DAW. Edit the script and run it again; never edit `src/music-score.ts` by hand.
- **Same mix and controls.** It plays through the existing music bus, so the Music volume slider, 0 to turn it off, and the pause when the tab is hidden all work as before. Notes are scheduled one bar ahead, as before.
- **Sound stays optional.** The music carries no game information, so UI.md rule 11 (playable with sound off) is unaffected.

Follows the docs.
