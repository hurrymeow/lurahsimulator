# The last seven quest chains: every special has one

TODO item "Quest chains for the other eleven specials". After `decisions/special-chains-four.md`, this adds the last seven, so every special in `SPECIALS` has a chain (a test now checks that). Spec: `decisions/staff-requests.md` section 3.

As with the first four, each payoff is simpler than the spec's, so it fits what the sim already has:

| Special | Steps | Payoff shipped | Spec's payoff, not yet built |
| --- | --- | --- | --- |
| Pak Breaking | level 2, a working Balai Warga and Wifi (the studio), Virality 30 | Virality +8, Popularitas +3 | bad events announced a week early; the scoop from a send-event |
| Bang Lawak | level 2, two non-special hires on the staff, a working Balai Warga | Popularitas +6, Virality +3 | "bad news lands softer" as a lasting effect; the two finds from lowongan among your warga |
| Bro Kripto | level 2, a working Wifi, a kas of Rp 5 juta (price-scaled) | on Jujur (25% + Jujur/200): kas +Rp 3 juta, or a rug pull: kas −Rp 2 juta and Popularitas −5 | a scandal event on the rug pull |
| Bang Rental PS | level 2, a working Wifi, a kas of Rp 2 juta | Rp 1 juta spent, Virality +5, Popularitas +4 | a new shop on the map and a combo with Wifi |
| Om Lalu Lintas | level 2, a working Portal, 2 Orang Dalam | Orang Dalam +2, Popularitas +3 | a traffic-light decor that speeds the permit queue |
| Bu Sinetron | level 2, a working Portal, Virality 40 | Virality +10, Popularitas −2 | the road closed for 2 weeks; events that month "zoom in three times" |
| Om Motivasi | level 2, a working Balai Warga, a kas of Rp 1.5 juta | on Jujur: kas +Rp 2 juta and Popularitas +3, or a "seminar bodong": kas −Rp 1.5 juta and Popularitas −6 | iuran up as a lasting effect |

The two gambles use the same odds as a staff loan (`REQUEST.loanBase + Jujur/200`), drawn from the seeded rng. A lost gamble sets `chainWon = false` and the closing card uses `chain.<id>.lostTitle` and `chain.<id>.lost`, in a bad tone. Amounts go through `price()`, so the lines name no rupiah figure.

Om Lalu Lintas and Bu Sinetron need a Portal, which opens at RW: their chains wait for the stage, which suits a radio reporter and a soap star who arrive with a bigger kampung.

Verdict (self-approved, per TODO.md's approval note): `tests/chains.test.ts` drives every chain to its payoff, both endings of each gamble, and checks every line in both languages.
