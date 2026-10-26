# Shops, facilities, housing, jobs and combos (playtest feedback)

- Fourteen new buildings so there is always something new to want: Gerobak Bakso, Warteg, Warkop, Toko Kelontong, Fotokopi, Barbershop, Bengkel, Apotek, Koperasi (shops), Pos Satpam, PAUD, Balai Warga, Gudang Material (facilities), Kontrakan (housing). Each is gated by stars, population or another building, so the Build list stays a ladder and not a menu of everything.
- Shops differ by what they add besides income: Warkop makes Virality, Fotokopi makes a little Orang Inside, Barbershop and Apotek lift Patience, Bengkel opens ojol slots. A shop that only earned would just be a bigger warung.
- Only the bigger shops set `shop: true`, so a bakso cart does not attract a tukang parkir liar.
- Four more jobs with effects that read in one line: Guru (Patience, costs kas), Satpam (Patience, costs kas), Panitia (Orang Inside, costs kas for konsumsi), Tukang (each one speeds every construction site by a quarter; at most 3 count). Tukang is the one job whose effect is not a resource, because faster building is what a busy player wants.
- The "costs kas" jobs are on purpose: Patience and Orang Inside are paid for in rupiah, so jobs are a trade, not free output.
- Twenty combos with six more ingredients each in range, so the Buku Combo has a long tail of things to discover. Each logs on first discovery with its own joke. Every joke moves a number, and satire stays on systems (konsumsi budgets, double-bought cement, "organik" pricing).
- Combo lookups are cached on a hash of the layout. Income asks for combos once per building, and with 26 combos the old search made the balance autoplayer twice as slow.
