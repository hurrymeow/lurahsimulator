# Four more quest chains: Mas Konten, Mbak Gosip, Mbak Senam Pagi, Pak Kuis

TODO item "Quest chains for the other eleven specials". This change adds four, on the framework from #305 (`decisions/special-chains.md`). Spec: `decisions/staff-requests.md` section 3.

Each payoff is simpler than the spec's, so it fits what the sim already has. The simplifications are on purpose and listed here:

| Special | Steps | Payoff shipped | Spec's payoff, not yet built |
| --- | --- | --- | --- |
| Mas Konten | Virality 20, 40, 60 (the prank series) | Virality +10, Popularitas −3 | "each prank costs some Popularitas": shipped as one cost at the end |
| Mbak Gosip | level 2, a working Wifi tower, Virality 30 | Popularitas +6 (expose it) | the choice to expose or recruit it (Virality) |
| Mbak Senam Pagi | level 2, a working Lapangan, Popularitas 60 | Popularitas +6, Virality +4 | Aman and Popularitas up for a whole season |
| Pak Kuis | level 2, a working Lapangan, August with Popularitas 50 | Virality +6, 1 Orang Dalam | a fourth 17an contest |

The fuller payoffs need a choice card, a timed modifier on Aman, or a Lomba contest. Each can replace its simple payoff later without touching the steps.

Still to come: Pak Breaking, Bang Lawak, Bro Kripto, Bang Rental PS, Om Lalu Lintas, Bu Sinetron and Om Motivasi.

Verdict (self-approved): `tests/chains.test.ts` drives each chain to its payoff and checks every line in both languages.
