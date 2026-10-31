# Staffing prototype: the permit desk queue

A prototype for Hari, from a chat on 2026-10-31. Staffing should feel like Kairosoft's, where staff are the hands that turn money into output (Game Dev Story's staff make the game; Hot Spring Story's do the serving and cleaning). Here they were small optional bonuses: Inem made permits up to 40% faster, a Hansip added Aman, and nothing broke or asked for anyone when the player hired nobody.

## The change

- **Permits are a queue of folders.** A building's permit months become folders (berkas). The Kantor clears them in the order buildings were placed, whole folders only, carrying part of a folder to the next month. Before, every permit counted down on its own, in parallel.
- **People clear it.** Each Asisten clears `output x 0.85` folders a month (output = level x Lobi / 50 x trait). Inem at level 1 clears about 1. The Kantor never clears fewer than 0.5, so the queue always drains, even while Inem is away at Bimtek. Inem's old 40% permit bonus is gone: the desk replaces it.
- **The Asisten role can be posted from RT 1★**, the moment the second and third staff slots open. Before, only Inem held it.
- **The game says so.**
  - A permit's map badge and panel show the months to go in the queue.
  - The panel adds "Antrean izin: urutan 2 dari 3, sekitar 6 bln lagi. Meja Kantor memproses 1 berkas per bulan."
  - The Kantor RT carries a pile of folders while the queue has work.
  - Once the queue is 3 months deep and a slot is free, the goal strip leads with "Izin tertunda 9 bulan: pasang lowongan Asisten".
- **Unchanged.** Every month a building waits still costs 1 Popularitas, so a long queue hurts. Orang Dalam still skips the queue. Rumah need no permit, so the first house is still instant. The Supir still speeds the building phase.

The loop it aims for: build, the queue fills, hire or train an Asisten, build faster, more money and Popularitas, bigger builds.

## How hard it bites

Four shops placed in one month (Warung, Pos Ronda, Kos-kosan, Barbershop: 5 folders):

| Asisten | All open after | Before (parallel timers) |
| --- | --- | --- |
| Inem only | 6 months | 4 months |
| Inem + 1 | 5 months | 4 months |
| Inem + 2 | 4 months | 4 months |

Bigger buildings carry 3 or 4 folders, so the queue grows faster later. The RT balance and pacing bots, the RW bot and the Kelurahan bot all still pass with Inem alone, because they build a few things at a time. The queue bites a player who places several buildings at once, which is how people play.

## Open for Hari

1. **The bite.** `ROLE_FX.asisten.berkasPerOutput` (0.85) sets it. At 0.6, Inem clears about 0.7 a month and the queue becomes the main brake on building.
2. **Popularitas per waiting month.** With a queue, waits are longer, so the drain grows. Keep 1 per building, or count it per folder?
3. **Next steps from the proposal**, not built: big public buildings that run at half strength until a staff member is assigned (petugas), staff cards that show their output as a number, and the same queue for Stempel letters at the RW and Serapan at the Kelurahan.

Updates the docs: GAME-DESIGN.md, the staff line (Inem), a desk queue line, and the Asisten role.
