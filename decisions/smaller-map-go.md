# Smaller map: go (Hari, 2026-11-01)

Hari said "yes" on 2026-11-01 to building the smaller ladder that GAME-DESIGN.md section 2 already describes (from `decisions/playtest-sk2.md`): the RW is your RT plus Kampung Sebelah, and the Kelurahan is your RW (2 RTs, both yours once Kampung Sebelah is absorbed at promotion) plus RW 2 (2 AI RTs). The Kelurahan drops from 16 RTs to 4.

## Why
- The Kelurahan with 16 RTs was overwhelming in Hari's playtest, and its 1★ waited on many mostly empty RTs.
- One AI RT to tend at the RW and two at the Kelurahan keep the neighbour load small.

## What it changes
- Build on AI RTs and Kunjungan (TODO) is planned against this map: at most 1 AI RT at the RW and 2 at the Kelurahan, so panning to an AI RT is short and the per-RT build-focus fallback is unlikely to be needed.
- The Neighbours sheet revamp (`docs/plans/neighbour-sheet.md`) still ships first. It fails UI.md rule 13 at 4 RTs today, and the list-then-detail design works at any count.
- Absorbing Kampung Sebelah at promotion is automatic, so it does not conflict with retiring the Ambil alih action.

## Open for the plan
- Kecamatan slice 1 is live on the 16-RT Kelurahan. The plan must say how the Kecamatan ring and its bots change with the smaller Kelurahan.
- Not built until a plan is written in `docs/plans/` and approved.
