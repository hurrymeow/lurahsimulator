# Kelurahan stars read the player's own kampung

- `src/sim/grow.ts`: on a Kelurahan map only the RTs in the player's own RW send Surat Pengantar to the player. The other RWs stamp their own, so the backlog no longer pins Popularitas at 0.
- `src/data/higher/stages.ts`: each Kelurahan star also needs the player's own residents and Popularitas: 50 and 50, 120 and 45, 200 and 40.
- `GAME-DESIGN.md`: the Kelurahan goals and the Stempel lines.
- Tests: `tests/grow.test.ts` covers letters from the own RW only. `tests/kel-bot.test.ts` plays a bot that tends its kampung, and pins 1★ at month 48 or later and 3★ between months 120 and 180 (16 to 24 min at 1x).
- Numbers and the open questions are in `decisions/kelurahan-own-kampung.md`.
- Updates the docs: GAME-DESIGN.md, the Kelurahan goals in section 2 and both Stempel lines.
