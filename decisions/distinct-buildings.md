# Distinct buildings and the kampung look

Requests (2026-11-08, after the building scale sheet): Rumah is the most common building, so nothing else may look like one; RT big lots were too simple; then "can we get this vibe for the kampung buildings?" with a reference sheet of kampung houses (patched zinc and tile roofs, paved lots, antennas, jemuran, pots). Judged in rounds on local before and after renders at every level, as ART.md's workflow asks. Each note below was answered in the review page's comment threads.

## Round 1: nothing reads as a rumah

- **Kantor RT:** a two-tier stepped roof at every level (green zinc, red tile, then the joglo), whitewash over a green plinth, the merah putih on a grey pole with a concrete foot in the front yard, a kanopi at level 2. Review: the flags floated behind the building and were too bright, so the pole moved to the yard and went grey, the white half of the flag cream.
- **Barbershop:** no house roof at any level. A striped tarp, a teal kiosk with a tricolour false front, a charcoal shop with a gold lightbox. A 2px spiral pole by the door at every level.
- **Apotek:** a flat dak, a deep green fascia and a plus-shaped green lightbox at every level. Asked for the Kimia Farma logo; ART.md bans third-party logos, so it uses the generic medical cross.
- **Balai Warga:** a white pagar and a red gapura from level 1. **PAUD:** rainbow fence, flower beds, a yellow bear mascot.
- **Kontrakan:** level 1 first became three petak; review asked it to reflect level 2 more, so level 1 is now level 2's L on one storey.
- **Panggung Senam:** umbul-umbul with bent tips and swaying pennants in place of the stiff flag, a banner frame, speakers, steps, an instructor. **Kolam Pancing:** a saung, a jetty with anglers, lily pads, fish, a payung.
- **Taman Bermain:** a play set after the user's reference photos (tower with a pyramid roof, slide, climbing wall, monkey bars, seesaw) in place of the giant seesaw. Review: the tree was hidden, so the tower moved to the back corner and the tree to the right corner.
- **Balai RW:** the office wing was drawn under the hall at levels 2 and 3; it is now drawn after it. Review asked for a signifier on the roof: the merah putih on the ridge from level 1, a gold Garuda over the door from level 2.

## The kampung look (pilot, then rollout)

What carries over at 32px per tile, and what does not:

- **In:** patched roofs, add-on masses (a dapur lean-to, a tile skirt on the rumah tingkat), paved yards with a kerb, clutter (pots, ember, jemuran, tandon on a frame, motor, chest freezer, crates), painted doors and a damp band on rumah walls. Shared helpers in `src/render/kampung-kit.ts`.
- **Out:** readable signs (a word needs about 20px and two languages) and a pole on every house (ART.md keeps poles along the paths, and wires never cross a house).
- **Review notes:** the antennas were too big, so they are short, muted and on cream houses only. Zinc was too bright and noisy, so seng is a warm mid grey with a soft rib every third column and no shine, on the big zinc sheds too. Kontrakan's zinc fought its red tile, so its roofs are red with one narrow sheet of rusty seng.
- **Rollout:** every RT and RW building with its own lot stands on the paved yard (`PAVED` and `lotGround` in `iso.ts`) with a pot at each free side corner. Kelurahan and Kecamatan buildings, paths, farms, decorations and parks keep their own ground.

## One engine change

`Painter.shadow` used to replace every pixel under it with a see-through ink pixel, so on a paved yard it punched a hole. It now darkens an opaque pixel under it and leaves a see-through shadow only over bare map, which looks the same as before for every building that paints no ground.

## Construction

Review (2026-11-08): the building under construction "looks unfinished". The clip that raises it stopped at the lot's centre, so its front walls never drew, and its finished paved yard and clutter showed from the first month. Now the lot is a proyek (bare earth, sand, bata, cement sacks), the building is drawn without its yard (`Painter.site`), and it rises whole from the ground behind the scaffold. Mangkrak uses the same, greyed out.

## Checks

- `npm test`: the height rules (28px cap, at most 8px over level 1), the one-tile rule for every rumah variant and the footprint spill rule all pass. The roof flag on Balai RW, the Kantor RT flags and the antennas were shortened to fit them.
- Verdict: approved by the user in review rounds on 2026-11-08 ("Roll it out", "Ship it").

Updates the docs: ART.md, Building levels (Kantor RT, Apotek, Barbershop, Kontrakan, Rumah, RT big lots and parks), Roofs and walls (the kampung look), Lighting (the shadow over a painted lot).
