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
- **Tukang parkir:** pays retribusi to the kas (+60rb) and drains 0.25 Sabar a month per level. Upgrading raises both. Never removable.
- **PNS:** produce nothing. Only stat is Pensiun: fills over 10 years, then a Rp 1,5jt payout and the desk reopens. Employed residents of any job add +0.2 Sabar, so PNS still have a use.
- **Buzzer:** +6 fake Viral and +60rb a month. Exposure chance rises with the fake Viral pumped. Exposure wipes that Viral, costs 8 Sabar and ends the job.
- **Viral:** each point adds 0.5% to shop income and decays 10% a month.
- **Wacana:** costs Rp 100rb (konsumsi rapat). Gives approval that converts to Sabar and decays 20% a month. It builds nothing.
- **Proyek mangkrak:** wifi 25%, Indomaret and Alfamart 20% chance to freeze at 80%. Never in year 1. A restarted project never freezes again, so it cannot soft-lock. Costs 1 Sabar a month while frozen.
- **Viral repair path:** a frozen project restarts at normal price once Viral reaches 30, else at double. Viral is the only discount.
- **Debug hook:** `?debug` in the URL exposes `window.pakrt` for play-testing.
- **Font change (Hari feedback):** body and numbers now use Atkinson Hyperlegible. Pixelify Sans made 5 look like S/8 and was hard to read. Pixelify stays for the title, panel headings and primary buttons.
- **No truncated text:** the ticker wraps over two lines instead of using an ellipsis.
- **Map panning:** tiles have a 32px minimum, so a small phone pans the map by dragging instead of shrinking tiles to 20px.
- **E2E tests:** Playwright at 320, 360 and 390px portrait, with a legibility scanner. Runs in CI on every PR. Canvas text is not covered by the scanner.
- **Tutorial (Hari's ask, modelled on mainpecah):** one full-screen How to play page. Illustrated cards, one bold sentence plus one short sentence each, a single Got it button. Shown on first launch (flag in localStorage), reopenable from the ? button at the top. Pauses the game while open. Replaces the old welcome message.
- **Events:** 17 Agustus every August (year 1 included), banjir 30% a month from Nov to Feb, harga cabai 7% a month from month 4. At most one event a month. Events pause the game until a choice is made, and the first choice is always free.
- **Banjir:** each working selokan level cuts damage 20%, capped at 80%. Flooded buildings stop earning until repaired. Repair is 25% of build cost, free at 30 Viral. Year 1 floods break at most one building.
- **Ranking:** score = 8 per resident + 5 per working building + 10 per combo + 0.5 per Sabar + 20 per Emas point. Kampung Sebelah = 55 + 26 per year, plus or minus 8. Win: +10 Sabar, +1 Orang Dalam. Lose: -5 Sabar. No other penalty.
- **Indonesia Emas 2045:** starts at 0.01%. +0.02% a year, +0.03% per ranking win, +0.001% per wacana, +0.005% per project restart, -0.004% per frozen project. A decade of active play stays under 1%.
- **Effects off:** number pops stay (they carry the information) but stop rising. Chip flashes, spawn pops and screen shake are skipped. Reduce motion implies effects off. It defaults to your phone setting.
- **High contrast and large text:** added as settings. Both are covered by the E2E scan.
- **Flash style:** resource chips flash with a coloured inset border, not a background fill. A background fill dropped contrast below 4.5:1 mid-animation and the scanner caught it.
- **Balance autoplayer (found by tests):** a simple bot found two traps and I fixed both. A free event choice was blocked when the kas was negative (froze the game). Sabar could sink to 0 for good, because banjir came too often and parkir drain stacked per shop.
- **Sabar floor:** below 30, Sabar recovers 4 a month by itself ("the kampung calms down"). Frozen-project drain is capped at 3 a month and parkir drain is 0.25 per level. Debt drains 1 Sabar a month, not 2.
- **Event cooldowns:** banjir at least 9 months apart, cabai at least 6.
- **Slim HUD and one Menu (Hari feedback, Dungeon Village as reference):** the title bar, two-row resource chips, four speed buttons and four panel buttons were cut. Top is one row of resource icons and values. Bottom is pause, a 1x/2x/4x cycle button, the date and a Menu button. Menu is one sheet with big tiles in three groups. Own pixel glyphs, no Kairosoft names or art.
- **Settings moved into the Menu:** replaces the old "settings at the top" rule. A gear in the top bar was one button too many next to five resources at 320px.
- **Compact Rupiah in the top bar:** shows 4,85jt next to the money icon, rounded down so it never shows money you lack. The full figure is in Kas & ranking and the screen-reader label.
- **Ticker stays in the layout, not over the map:** an overlay hid the top row of tiles from taps on small phones.
- **Build is two taps (Menu, Build):** matches the reference layout. Revisit if play-testing says building feels slow.
- **Isometric map (Hari: "not feeling the visual"):** 2:1 diamond tiles with box buildings, hipped limasan roofs and a dirt edge. Art is rasterised in code at 32x16 art pixels per tile and scaled by a whole number, so pixels stay crisp. Tiles are 64x32 on a phone; the map pans sideways in portrait. Build menu thumbnails use the same art.
