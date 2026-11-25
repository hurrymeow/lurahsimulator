# A Dana tap shows its price, and the sheet shows what it bought

TODO item "Funding a neighbour feels silent" (agent playtest 2026-11-25, #484).

## What was wrong
- In an RT's Tetangga sheet, "Dana ×6" showed no price. A tap took Rp 8,6jt.
- After the tap the sheet looked the same: the RT's star lines ("10 warga (punya 2)") move only when the RT builds, weeks later.
- The strings for what Dana buys ("Dana for {n} more builds." and "+{n}% boost") already existed in both languages but were never shown.

## What changed
- Each Dana button carries its price, for the builds that still fit in the bank: "Dana ×6 · Rp 8,6jt". The sheet shows "Rp" as the money icon, as every sheet does (`src/ui/statIcons.ts`). The format is the top bar's (`rupiahHud`), which keeps both buttons on one row at 320px.
- Once an RT has Dana banked, the sheet shows a line above the buttons with the builds paid for and the speed-up ("Dana untuk {n} pembangunan lagi · +{n}% lebih cepat"; the speed-up shows from 2 builds, where it starts). A tap now changes the sheet at once.
- The neighbours e2e test checks the price before the tap and the line after it, with the legibility scan after funding.

## Not done here
- A build puff or a pan to the RT on the map after a tap, the item's other idea. The sheet line meets the done-when ("a visible change in the sheet or on the map").

## Verdict
Self-approved under the TODO rule (UI.md: one line of at most 12 words, no new primary button). `npm run typecheck`, `npm test`, and the neighbour e2e tests at 320 id and 412 en (14) pass.
