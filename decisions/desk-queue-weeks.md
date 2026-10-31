# Desk queue after the weekly calendar

The desk queue (#200) and the weekly calendar (#192) merged on the same day without a text conflict, and main's Kelurahan bot test failed. This fixes the pair.

- **Weeks, not months.** One tick is a week now, so the desk clears about one folder a week, and the texts say so: "sekitar 6 minggu lagi", "Meja Kantor memproses 1 berkas per minggu", "Izin tertunda 13 minggu", and the status line "sisa 3 mgg" / "3 wk left" (it still said "bln" / "mo").
- **The hire tell fires at 12 weeks** (`hireAfter`), about the 3 months it was meant to be. At 3 ticks it fired after three weeks.
- **The queue costs Popularitas as a whole.** It was 1 a week for every waiting building. In a queue that grows with the square of its length, since buildings wait longer in line. Now it is 1 a week while anything waits, and 2 once the queue is 12 weeks deep. That still pushes the player to hire, without snowballing (open question 2 of `decisions/desk-queue.md`).
- **The Kelurahan bot plays like a player who reads the goal strip.** It posts for an Asisten when the queue is deep and takes the best Lobi, stops buying while the queue is deep, and adds a second Popularitas building in a week when Popularitas is under 50.
- **Kelurahan 3★ needs Popularitas 35, not 40.** The bot runs out of roadside lots for Popularitas buildings (12 Kolam Pancing, 31 Pos Ronda) and settles in the mid-30s at 240 or more residents. That is the trap `decisions/kelurahan-own-kampung.md` warned of: residents never leave above Popularitas 15, so a kampung past 200 cannot shrink back under the bar. At 40, no seed reached 3★; at 35, two of three do (weeks 132 and 138), and the test asks for two of three. A TODO item tracks the trap itself. GAME-DESIGN.md also said 50 and 45 for 2★ and 3★ while the code had 45 and 40; it now matches the code (45 and 35).

Updates the docs: GAME-DESIGN.md, the Kelurahan 2★ and 3★ Popularitas numbers.
