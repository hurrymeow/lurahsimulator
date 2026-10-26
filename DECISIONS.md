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
