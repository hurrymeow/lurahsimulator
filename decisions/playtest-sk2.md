# Playtest to SK 2: what changes

A real playtest by voidinside99 up to the SK to Kelurahan, on 2026-11-01. Each note, the call made with voidinside99, and where it lands. This changes the docs only; the build work is in TODO.md.

## Decided

| Note from the playtest | Decision | Docs |
| --- | --- | --- |
| The NEW label is easy to miss: one star unlocks several things, and one Build visit clears them all. | A card's NEW tag stays until that card has been at least half on screen for **2s**, or has been tapped. Tab and dock badges stay while any card under them is still unseen. UI.md already said "in view for 1s"; the code clears tags when the sheet opens, which is a bug. | UI.md, GAME-DESIGN.md section 6 |
| Menara Wifi should not need a road. | It is road-exempt, like fields, ponds and paths. A mast needs power, not visitors. | GAME-DESIGN.md section 2 |
| The pixel font's "2" is hard to read (2045, "Triwulan 2", "2x"). | Redraw the one glyph in Pak Pixel so it cannot read as a Z, with `scripts/patch-pixel-font.py`, as was done for "f" (`decisions/pixel-font-f.md`). | ART.md |
| Gudang Material and Koperasi look like a Rumah scaled up, too tall. | A 2x2 building is no taller than a 1x1 of its tier, so its size reads as width. The crane over a 2x2 site is drawn at native pixels, not a 1x1 crane scaled 2x. | ART.md |
| Keep the Bangun button's size; make room for Staf. | The dock is Bangun at its current width, then Warga, Staf and Menu sharing the rest. Staf leaves the Menu. | UI.md, GAME-DESIGN.md section 6 |
| 4x Rumah Lv3 house 28, instantly, on 4 tiles; Kontrakan is 9x the price for 12 on 4 tiles. | Bigger housing is denser and pays rent; Rumah is fast and draws warga. Rumah **3/4/5** beds, Lv3 needs RT 2★. Kos-kosan (2x1) **10**, Lv2 **14**. Kontrakan (2x2) **24**, Lv2 **32**. The panel shows rent per week. | GAME-DESIGN.md sections 2 and 4 |
| Rajin is the only staff stat that matters. | Each stat is the work stat of two roles and the risk stat of two (table below). | GAME-DESIGN.md section 4 |
| The Kelurahan screen (16 RTs) is overwhelming. | RW = **2** RTs: yours and Kampung Sebelah. Kelurahan = **2 RWs of 2 RTs**. At promotion, Kampung Sebelah joins your RW as yours to build on (like a free takeover), so you are guaranteed new land. RW 2 is 2 AI RTs you fund. | GAME-DESIGN.md section 2 |

### Housing by the numbers

| | Cost to full | Beds | Tiles | Beds per tile | Rent | Wait |
| --- | --- | --- | --- | --- | --- | --- |
| Rumah Lv3, before | Rp 3,2jt | 7 | 1 | 7 | none | none |
| Rumah Lv3, now | Rp 3,2jt | 5 | 1 | 5 | none | none, Lv3 needs RT 2★ |
| Kos-kosan Lv2, now | Rp 8jt | 14 | 2 | 7 | Rp 200rb | 4 weeks |
| Kontrakan Lv2, now | Rp 14jt | 32 | 4 | 8 | Rp 300rb | 2 weeks |

Rumah keeps what only it has: it is instant, and it draws new warga (`attract`).

### Staff stats

| Role | Work | Risk (mishap) |
| --- | --- | --- |
| Asisten | Lobi | Rajin: a folder is misfiled, −2 Popularitas |
| Sekretaris | Lobi | Jujur: a small scandal, −3 |
| Tukang Tagih Iuran | Gaul: talks warga into paying | Jujur: skims Rp 150rb |
| Admin Grup WA | Gaul | Lobi: the group gets reported, −3 |
| Hansip | Rajin | Gaul: a scuffle, −2 |
| Petugas PU | Rajin | Lobi: no materials from the supplier, Rp 250rb |
| Bendahara | Jujur | Rajin: the receipts go missing, Rp 300rb |
| Supir | Jujur: no detours to his cousin's warung | Gaul: clips a gerobak, −1 |

Each stat is now the work stat of two roles and the risk stat of two. The specials keep their roles; their stat spreads lean on their role's new work stat.

## Progression review to Act 2

The ladder as it now stands, with the target times at 1x:

| Stage | Map | The verb | Stars wait on | Target |
| --- | --- | --- | --- | --- |
| RT | your RT | build, combos, housing | residents, combos, ranking wins, Popularitas | ~12 min |
| RW | your RT + Kampung Sebelah | Dana, Stempel | Kampung Sebelah's stars, RW combos, wins, no debt | ~20 min |
| Kelurahan | your RW (2 RTs, both yours) + RW 2 (2 AI RTs) | Anggaran, Serapan | RW 2's stars, your kampung's size and Popularitas, Piala wins, Tim Audit | ~30 min |
| Act 2: Kecamatan | not designed | (proposed: Musrenbang) | waits on Hari | |

What the playtest and the bots show:
- **The RW was crowded and the Kelurahan was empty.** At the RW you funded three AI RTs; at the Kelurahan, fifteen, and the 1★ goal waited on four RWs while most lots sat empty (screenshot: "4 RW berbintang 1★ (punya 1)"). With 2 and then 4 RTs, the AI side is one RT to tend at the RW and one RW at the Kelurahan.
- **The land you get matters more than the land you watch.** Kampung Sebelah becoming yours at the Kelurahan doubles your lots at the moment the own-kampung goals (200 residents) need them, and gives the denser Kos-kosan and Kontrakan somewhere to go.
- **Stempel fades at the Kelurahan.** Your RW has no AI RT left, so no letters reach you; RW 2 stamps its own. Stempel is the RW's verb, and Anggaran takes over, as section 2 intends.
- **Some content needs two AI RTs.** The Grup Chat Warga combo (two neighbouring RTs with the same trait) cannot happen at the RW any more; it moves to the Kelurahan, where RW 2 has two AI RTs.
- **The pacing targets need re-tuning.** One AI RT at the RW and one AI RW at the Kelurahan make the AI side faster, so the own-kampung goals carry the pace. The RW, Kelurahan and balance bots must be re-run once the map change is built.
- **Act 2 still waits on Hari** (TODO: "Decide on Kecamatan and above"). The proposal in `decisions/kelurahan-playtest.md` assumed a Kelurahan of 4 RWs; with 2, a Kecamatan of 4 Kelurahan stays the size the playtest found comfortable.

## Corrected in passing

GAME-DESIGN.md said the RW's 3★ needs "no RT in debt for 2 years"; the code counts **24 weeks** since the weekly calendar. The doc now says 24 weeks.
