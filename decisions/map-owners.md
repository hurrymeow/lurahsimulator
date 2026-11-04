# Who runs which RT, on the map

TODO item "Show which RW and RT is yours and which the AI runs on the map, and let the player take over an RT in another RW" (Hari, 2026-11-01: "super unclear in map").

- From the RW on, every RT has a nameplate on its far (top) corner, drawn over the buildings with the map badges.
  - The player's RTs: gold with dark text, "RT 1 · Yours" (ID "Milikmu").
  - AI-run RTs: dark grey with light text, "Kampung Sebelah · AI".
  - At the Kelurahan and above, the RW is named too: "RT 4 · RW 2 · AI".
- Words carry who runs it as well as the colour, as UI.md rule 6 asks. At the RT stage there is one RT, so there is no plate.
- The Neighbours list names the RW on each row once the map has two RWs.
- An absorbed Kampung Sebelah and any RT taken over in an older save read as the player's.
- **The own-RW limit:** #297 replaced takeover with building on any AI-run RT, in any RW, so the limit is gone rather than explained.

Verdict (self-approved): `tests/owners.test.ts` covers the RT (no plates), the RW (Yours and AI) and the Kelurahan (RW named, Kampung Sebelah the player's). Checked by eye on the RW and Kelurahan dev seeds at 412px ID. The Neighbours and density specs pass at 320px ID and 412px EN.
