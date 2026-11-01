# Indonesian blurbs without level numbers

The card blurbs for Pos Ronda, Kos-kosan and Bank Sampah stated level-scaled numbers (`+2 Popularitas per minggu`, `1 Popularitas`, `Rp 60rb` and `+0,8 Popularitas`) that go stale as soon as balance changes. The new Indonesian text keeps the same effects but drops the numbers for Pos Ronda and Bank Sampah and softens the Kos-kosan Popularitas drain to "tiap minggu". Only the three strings named in the task changed; the dead `building.bankSampah.blurb` entry in `id-data.ts` was left alone on purpose because `id-content.ts` overrides it.
