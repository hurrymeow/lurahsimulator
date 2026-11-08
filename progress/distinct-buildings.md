# Distinct buildings and the kampung look

Shipped (2026-11-08):

- Kantor RT, Barbershop and Apotek redrawn so none reads as a rumah; Balai Warga, PAUD, Kontrakan level 1, Panggung Senam, Kolam Pancing, Taman Bermain and Balai RW given more detail. Balai RW's office wing no longer draws under the hall.
- New `src/render/sign-art.ts` (flag, barber pole, plus sign, awnings, fence, gateway, Garuda) and `src/render/park-art.ts` (Taman Bermain, Panggung Senam, Kolam Pancing).
- New `src/render/kampung-kit.ts`: paved yard, seng and patched roofs, pots, ember, jemuran, tandon, motor, TV antenna.
- Rumah, Warung and Kontrakan redrawn in the kampung look; every other RT and RW building stands on a paved yard with corner pots.
- Zinc on the big sheds toned down to a warm grey without the bright shine.
- `Painter.shadow` darkens an opaque pixel under it instead of replacing it.
- Construction: a proyek ground sprite, the building rises without its yard and with its front walls (`Painter.site`, `iso(..., site)`), mangkrak the same in grey.

See `decisions/distinct-buildings.md`.
