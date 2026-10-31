# Building panel: live description, roof level badge, fewer messages

From the WNI Sim handoff (team chat, 2026-10-31), with the layouts agreed there. TODO: "Redo the building panel".

## What changed

- **One source for the numbers.** The panel's description is built from the current level: "Menampung 5 warga · Menarik warga baru". A Rumah at level 3 used to say "Menampung 3 warga" in its blurb while its level line said 7. Housing buildings show only the built line; other buildings keep their blurb under it for what the numbers do not say (jobs, combos, jokes).
- **Roof badge instead of the level strip.** The Lv1/Lv2/Lv3 strip is gone. A pixel gable roof beside the name carries the number (`src/ui/levelBadge.ts`): terracotta with a dark brown edge and a cream number; a small arrow over the peak when an upgrade is affordable; gold with a sparkle and MAKS at the top level. ART.md's line "the inspector shows every level side by side" changes to describe the badge. The level art still shows on the map, in Build and while moving.
- **No max-level messages.** "Level 3/3", "Level maks" and "Sudah level maks 3" are gone. At the top level the upgrade button is hidden; the gold badge says it.
- **The upgrade button shows the gain.** "Naikkan ke Lv 3 · 500" with "Kapasitas 5 → 7" under it, plus income and per-month changes where the building has them.
- **Grey reasons, red only for attempts.** A disabled button in any panel (`actionButton`) now has one grey line under it, the reasons joined by " · ", in place of the red ✕ list. The red list stays where the player tried something and it was blocked, such as placing a building.
- **Bongkar says how many.** "Masih ada 4 warga. Pindahkan dulu ke rumah lain: perlu 1 tempat kosong." The first number is the warga living there (the same as "Warga 4/5"); the second is the beds the rest of the kampung is short.
- **Occupancy.** "Warga 4/5" under the description. Warga are not tied to a house in the sim, so the panel fills houses in the order they were built (`occupants` in `src/sim/state.ts`).
- **Status only when not working.** "Aktif" is gone. Waiting for a permit, being built, damaged and mangkrak show a coloured dot and the word, never colour alone (UI.md rule 4).
- **One verb per effect.** The Rumah blurb said "mengundang warga baru"; it now says "menarik", like every other panel. English uses Houses, Attracts, Earns, Raises.

## Where it differs from the handoff

- **Bongkar copy.** The agreed line was "Masih ada n warga. Pindahkan dulu ke rumah lain." The game has no way to move a warga by hand: they move when another house has a free bed. So the line adds "perlu k tempat kosong": the free beds the player has to make elsewhere. English avoids plurals: "Residents here: 4. Move them to another house first. Free beds needed: 1."
- **The upgrade arrow is green, not cream.** The panel is cream in the light theme, so a cream arrow would vanish.
- **MAKS is drawn in the badge.** Tiny HTML text would break UI.md rule 4 (16px or more); pixel letters in the image do not, and the badge's alt text says "level tertinggi".
- **Effect line scope.** The built line covers housing and attraction. Income and per-month lines keep their own rows, as before; the blurbs of other buildings still carry level 1 numbers in places (for example Bank Sampah), which is a follow-up for a blurb pass.

Updates the docs: ART.md, the inspector line under "Building levels".
