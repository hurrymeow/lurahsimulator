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
- Main screen: the console frame (a time row and a money row on top, the full-width map with a goal pill and a small satellite view, a dock of Build, Warga and Menu). Notices are toasts over the map. See [GAME-DESIGN.md](GAME-DESIGN.md#touch-and-layout).
- Settings > Theme switches the frame between Light (default) and Dark. Both share one layout; only colours change. Check new UI in both.
- New panel? Register an `ActionButton` with a `group` in the Menu. Never add a main-screen button. Build and Warga are the only docked panels, and the Menu does not list them twice.
- Text never cuts off. No ellipsis, text wraps, panels scroll. The one exception is a clamped line inside a button that opens the whole text (UI.md rule 5). Body font 16px or more.
- Touch targets 48px or more, except the slim top rows and the goal pill (28px). See UI.md rule 1.
- New panel or message needs a scan in `tests/e2e/ui.spec.ts`.

## Language

- Bahasa Indonesia is the default. English is an option in Settings.
- Every string exists in both. Strings live in `src/i18n/`, content translations in the `id-*.ts` files.
- Keep keys sorted A to Z in `en.ts`, `id.ts` and the `id-*.ts` files. Insert new keys in place, never at the end, so parallel PRs do not conflict.
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

Batch small tweaks (text, sounds, small TODO items) into one PR. Each PR costs a full CI run. When claiming TODO items, claim several small related ones together.

1. Branch from latest `origin/main`. Pick work from [TODO.md](TODO.md), and remove the item from it in your PR.
2. Run `npm run typecheck`, `npm test` and only the e2e specs your change touches, locally. Don't run the full `npm run e2e`; CI runs it.
3. Open a PR. Enable auto-merge: `gh pr merge --auto --squash <n>`. It merges when the required `ci` check is green.
4. After every push, check the PR for merge conflicts. A conflicted PR never starts CI and sends no alert. If it conflicts, merge main in and push.
5. CI runs the full e2e suite in Indonesian at 320, 360, 412 and 430px. English runs only locally, so run the touched specs with `--project=phone-<width>-en` before you push a change to English text or layout.
   Five screens also have screenshot baselines. Refresh them only for an intended visual change, and attach the before and after. See UI.md.
6. Log decisions in `decisions/<pr-or-slug>.md` and shipped work in `progress/<pr-or-slug>.md`. One file per PR.
   Never edit `DECISIONS.md`, `PROGRESS.md` or another PR's file.
7. After merge, confirm the live site changed: https://hurrymeow.github.io/lurahsimulator/. Merged is not deployed.

Docs-only changes (`*.md`) can go straight to main for the maintainer. Everyone else opens a PR.
