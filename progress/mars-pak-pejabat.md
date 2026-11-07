# Mars Pak Pejabat background loop

- `src/music.ts` (new): plays the score with Web Audio voices: brass, glockenspiel, strings, suling, pianika, electric piano, bass, plucked guitar and cello, timpani, drum kit and kendang.
- `src/music-score.ts` (new, generated): the 84-bar score, 2,539 notes, about 5 KB gzipped.
- `src/audio.ts`: the old 8-bar tune is gone; the music scheduler plays the new score through the same bus and volume slider.
- `scripts/music/compose.py` (new): writes the score and `docs/music/mars-pak-pejabat.mid`; `--preview DIR` renders a WAV.
- Tests: `tests/music.test.ts` checks the loop length (180 s) and that every note sits in its bar on a known channel. An offline render of the whole loop in Chromium ran with no page or console error.
- Details: `decisions/mars-pak-pejabat.md`.
