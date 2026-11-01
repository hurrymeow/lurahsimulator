# Building blurbs without level numbers

## Goal
Take numbers that change with level out of three building blurbs. The building panel builds its income and per-week lines from the current level (#194, `decisions/building-panel.md`), so the blurb must not state a level 1 number. Source: TODO.md "Take level-dependent numbers out of building blurbs".

## Decisions
- Scope is the three buildings with `maxLevel` above 1 that quote a number: Pos Ronda, Kos-kosan, Bank Sampah. Kantor Pos already says "each level adds" and stays. Lapangan and Jalan Setapak have one level, so their numbers stay. `src/data/higher/*` is out of scope for this pass.
- Bank Sampah ID: `id-content.ts` is merged last into `ID_DATA` (`{ ...BASE, ...ID_CONTENT }`), so its "Rp 60rb" line is the live one and matches the EN blurb. The "Rp 40rb" line in `id-data.ts` is dead and is left alone.
- Kos-kosan ID said "6 orang" while EN said "8". The new text names no number, so the mismatch goes away.
- Each blurb stays under 25 words.

## Tasks

### T1. English blurbs (Haiku)
- Files: `src/data/buildings.ts`
- Exact changes: change exactly these three `blurb` values and nothing else.
  - `posRonda`: from `'Night watch hut. +2 Popularitas a week. Nobody has seen anyone on watch.'` to `'Night watch hut. Adds Popularitas every week. Nobody has seen anyone on watch.'`
  - `kosan`: from `'A row of rooms: houses 8 and pays rent. The noise costs 1 Popularitas a week.'` to `'A row of rooms that houses residents and pays rent. The noise costs Popularitas every week.'`
  - `bankSampah`: from `'Trades plastic for pocket money. Earns up to Rp 60rb a week and +0.8 Popularitas. Opens a pengepul job.'` to `'Trades plastic for pocket money. Earns income and adds Popularitas. Opens a pengepul job.'`
- Done when: `npm run typecheck` and `npm test` pass; `git diff` shows exactly three changed lines in `src/data/buildings.ts`; `decisions/blurbs-no-levels-T1.md` and `progress/blurbs-no-levels-T1.md` exist.
- Don't touch: any other string, `src/data/higher/`, tests, TODO.md. No refactors. Known failures on main: none. No e2e: no spec reads these blurbs.

### T2. Indonesian blurbs (Haiku)
- Files: `src/i18n/id-data.ts`, `src/i18n/id-content.ts`
- Exact changes: change exactly these three values and nothing else.
  - `src/i18n/id-data.ts`, key `'building.posRonda.blurb'`: to `'Pos jaga malam. Menambah Popularitas tiap minggu. Belum ada yang pernah lihat orang jaga.'`
  - `src/i18n/id-data.ts`, key `'building.kosan.blurb'`: to `'Deretan kamar yang menampung warga dan membayar sewa. Kebisingannya menguras Popularitas tiap minggu.'`
  - `src/i18n/id-content.ts`, key `'building.bankSampah.blurb'`: to `'Tukar plastik dengan uang saku. Menghasilkan uang dan menambah Popularitas. Membuka kerja pengepul.'`
- Done when: `npm run typecheck` and `npm test` pass; `git diff` shows exactly three changed lines across the two files; `decisions/blurbs-no-levels-T2.md` and `progress/blurbs-no-levels-T2.md` exist.
- Don't touch: the dead `'building.bankSampah.blurb'` line in `id-data.ts`, any other string, tests, TODO.md. No refactors. No e2e needed.
