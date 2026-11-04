# CI checks for UI rules 10, 15, 16 and 17

TODO item "CI checks for UI rules 10, 15, 16 and 17, then a full re-audit". Plan: `docs/plans/ui-audit-fixes.md` T10. The `data-clamp` skip was already removed in #287.

## Rule 10: the tutorial tap lock
The opener test already covered the Build and Housing steps. It now also checks the Rumah step (another card, the info button and the close button do nothing) and the tile step (the speed control does nothing). The dock is hidden while placing, so the Menu cannot be tapped there anyway.

## Rule 15: one kind of thing per tab set
New e2e test `tab sets`. Every Build tab lists only `build-row`s. Every Combo filter lists only combo tiles, plus the opened entry. Every Warga filter lists only groups. The Combo book is a header button, not a Build tab.

## Rule 16: 6 words or fewer on buttons, pills and chips
- `scanLabelWords` runs on every screen the density test visits: home, setup, Menu and every panel, the Build tabs, Wacana, and event cards.
- A sweep of the RT 3★, RW and Kelurahan seeds, 25 events and the promotion card in both languages found one kind of fail: the goal pill. Ten EN and four ID short goals ran to 7 to 14 words with their "Goal:" label.
- Those phrases are rewritten to 6 or fewer, for example "Goal: win 2 rankings in a row" and "Goal: clear letters: run a Calo". The detail moved to the how-to lines from the goal hints work.
- `tests/label-words.test.ts` checks every phrase with its label in both languages. The combo phrase is left out, because its length is the list of buildings to place.

## Rule 17: map art stays in its footprint
- The planned canvas diff on the live map would be slow and flaky: walkers, clouds and weather move. Instead, `tests/footprint-art.test.ts` paints every building sprite, at every level, with the same `Painter` the map uses. It then fails on any opaque pixel more than 1.5px below the footprint's two front edges, which is the part that would land on the tiles and roads in front.
- 31 sprites spill today. The 2x2 Kelurahan and Kecamatan buildings each spill 10px, most likely their drop shadow. The others are shop props: Bengkel 51px for its car pad, Pos Satpam 22px for its barrier arm, Warung 16px for its crate, Baliho 15px, Indomaret and Alfamart 14px, Bidan 11px for its sign, Kantor RT and Bank Sampah 8px, Portal 3px, and seven 1px edges.
- They are capped in `SPILL_ALLOW` at today's worst level, so any new spill fails and fixed sprites can lower their cap. A new TODO item covers fixing them.

## Not done here
T11, the full re-audit, needs the crawl in the project files. It stays open in TODO.md.

Verdict: self-approved. `npm test` (590) passes, and the four specs pass at 320, 360, 412 and 430px ID and 320 and 412px EN.
