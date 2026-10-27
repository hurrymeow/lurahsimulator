# Contributing to Pak Pejabat

A satirical kampung management sim, shipped as a PWA. The player is **Pak RT**.
This page is the short version. The rules live in the files linked below. Read them, don't copy them.

## Read first

| File | Covers |
| --- | --- |
| [GAME-DESIGN.md](GAME-DESIGN.md) | Pitch, stages and stars, pacing targets, economy, tone and politics, UI layout, accessibility, tech |
| [UI.md](UI.md) | 12 measurable UI and UX rules a PR is checked against |
| [ART.md](ART.md) | Look, palette, outlines, shading, adding a sprite, art checklist |
| [decisions/](decisions/) | Why things are the way they are. Skim it before changing behaviour. |

Read the decision log with `node scripts/logs.mjs decisions`.

## Naming

- The game is **Pak Pejabat**. The player is **Pak RT**.
- Older names (Kampung Kita, Kampung Story, Pejabat Sim) must not come back.

## UI

- Mobile portrait first. Test at 320, 360, 412 and 430px wide.
- Style reference is Kairosoft's Dungeon Village. Own art and names only, no Kairosoft assets.
- Main screen: the console frame (slim title bar, resource bar, one status row with the goal and the 2045 meter, the full-width map with a small satellite view, one bottom row). Notices are toasts over the map. See [GAME-DESIGN.md](GAME-DESIGN.md#touch-and-layout).
- Settings > Theme switches the frame between Light (default) and Dark. Both share one layout; only colours change. Check new UI in both.
- New panel? Register an `ActionButton` with a `group` in the Menu. Never add a main-screen button.
- Nothing on the main screen duplicates a Menu panel.
- Text never cuts off. No ellipsis, text wraps, panels scroll. Body font 16px or more.
- Touch targets 48px or more.
- New panel or message needs a scan in `tests/e2e/ui.spec.ts`.

## Language

- English is the default. Bahasa Indonesia is an option in Settings.
- Every string exists in both. Strings live in `src/i18n/`, content translations in the `id-*.ts` files.
- `tests/i18n.test.ts` fails if a key or placeholder is missing.
- Slang and proper names stay as they are in both languages (Sabar, Wacana, Warga, warung). Resource names are translated: see `decisions/resource-names.md` (English "Orang Inside" and "Virality", Indonesian "Orang Dalam" and "Viral").
- Check every screen you touch in both languages.

## Art

- Follow [ART.md](ART.md). Run its checklist before merging art.
- Warm palette from `PALETTE`. 1px dark-brown ink, never pure black. Two-tone cel shading, light from the top left.
- Never overwrite the artist's sprites. Add new ones beside them.
- Everything is drawn in code. No third-party assets or names.

## Tone and politics

- Satirise system behaviour, not people. The joke is the process.
- No real politicians, parties, ormas or officials.
- No ethnic, regional or religious jokes.
- Superiors are faceless. The player is promoted by SK and never runs for office.
- Every joke is a mechanic that moves a number. Flavour text alone gets cut.
- Bad choices slow the player. They never soft-lock the game.

## Workflow

1. Branch from latest `origin/main`.
2. Run `npm run typecheck`, `npm test` and `npm run e2e` locally.
3. Open a PR. Enable auto-merge: `gh pr merge --auto --squash <n>`. It merges when the required `ci` check is green.
4. After every push, check the PR for merge conflicts. A conflicted PR never starts CI and sends no alert. If it conflicts, merge main in and push.
5. CI runs both languages at 320, 360, 412 and 430px. Don't cut that down.
   Five screens also have screenshot baselines. Refresh them only for an intended visual change, and attach the before and after. See UI.md.
6. Log decisions in `decisions/<pr-or-slug>.md` and shipped work in `progress/<pr-or-slug>.md`. One file per PR.
   Never edit `DECISIONS.md`, `PROGRESS.md` or another PR's file.
7. After merge, confirm the live site changed: https://hurrymeow.github.io/lurahsimulator/. Merged is not deployed.

Docs-only changes (`*.md`) can go straight to main for the maintainer. Everyone else opens a PR.
