# Decisions

One line per decision, with the reason. Newest at the bottom.

## Needs Hari's review

- None yet.

## Log

- **Repo:** used existing `hurrymeow/lurahsimulator` instead of creating `pakrt`. Sessions cannot create GitHub repos, and this one was already attached to the project.
- **Seed commit:** pushed README and logs straight to `main`. The repo was empty, and PRs need a base branch. Docs-only, so allowed by the shipping rules.
- **Mono Dark:** defined as near-black `#0b0b0c` background, white pixel glyph, monochrome UI chrome. No spec was in the repo or memory.
- **Font:** bundled Pixelify Sans (OFL) via `@fontsource`, latin subset only. Works offline, no Google Fonts request.
- **Service worker:** hand-written, about 30 lines, with a tiny Vite plugin for the precache list. Lighter than `vite-plugin-pwa`.
- **Base path:** `./` so the build works on Pages and any other host.
- **Deploy:** one CI workflow. PRs run typecheck, test, build. Pushes to `main` also deploy to Pages.
- **Toolchain:** Vite 8, Vitest 5, TypeScript 5.9. Skipped TypeScript 7 to avoid native-port surprises.
- **Rumah (houses):** added an auto-spawning `rumah` building. Residents need somewhere to live, and growth must show on the map.
- **Start state:** kampung starts with a Kantor RT, two rumah and four residents. An empty map gives nothing to look at in minute one.
- **Month length:** 8 seconds at 1x, so a year is about 100 seconds. Gives a resident, unlock or event roughly every minute.
- **Pacing director:** if 8 months pass with nothing new, a bonus perantau moves in. Enforces the 1-2 minute novelty rule.
- **Permits:** every build waits in a permit queue that drains 1 Sabar a month. Orang Dalam skips it. This is the core bureaucracy joke.
- **Year 1 safety net:** upkeep can never push the kas below zero in year 1. After that, a negative kas drains Sabar instead of blocking play.
- **Pause while reading:** the sim pauses while a sheet or message is open. Mobile players read in short bursts.
- **Speed control:** shipped pause/1x/2x/4x in M2 instead of M4. Needed to play-test the tick.
- **UI split:** map on canvas, menus in DOM. DOM text gets real font rendering, contrast and screen-reader labels.
- **Content as TS data:** buildings, combos, jobs and events are typed TS objects in `src/data/`. Typos fail the typecheck instead of the game.
- **Saves:** stored as versioned JSON. An unknown version or building starts a fresh game instead of crashing.
- **Combo geometry:** a combo works when every needed building is within its radius (1 tile, diagonals count) of the first listed building. A row of warung, pos ronda, wifi works.
- **Third combo:** added Rapat Malam (Kantor RT + Pos Ronda, +Orang Dalam). Hari asked for two. It is one data entry, so delete it if unwanted.
- **Rivalitas Abadi numbers:** both stores x1.4 income, -2 Sabar a month. Competition earns money and costs patience.
- **Tukang parkir:** pays retribusi to the kas (+60rb) and drains 0.5 Sabar a month per level. Upgrading raises both. Never removable.
- **PNS:** produce nothing. Only stat is Pensiun: fills over 10 years, then a Rp 1,5jt payout and the desk reopens. Employed residents of any job add +0.2 Sabar, so PNS still have a use.
- **Buzzer:** +6 fake Viral and +60rb a month. Exposure chance rises with the fake Viral pumped. Exposure wipes that Viral, costs 8 Sabar and ends the job.
- **Viral:** each point adds 0.5% to shop income and decays 10% a month.
- **Wacana:** costs Rp 100rb (konsumsi rapat). Gives approval that converts to Sabar and decays 20% a month. It builds nothing.
- **Proyek mangkrak:** wifi 25%, Indomaret and Alfamart 20% chance to freeze at 80%. Never in year 1. A restarted project never freezes again, so it cannot soft-lock. Costs 1 Sabar a month while frozen.
- **Viral repair path:** a frozen project restarts at normal price once Viral reaches 30, else at double. Viral is the only discount.
- **Debug hook:** `?debug` in the URL exposes `window.pakrt` for play-testing.
