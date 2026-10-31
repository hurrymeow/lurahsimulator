# Cut the Desa path

Hari, 2026-10-31: cut the Desa path. Kelurahan is the only stage 3.

- GAME-DESIGN.md no longer offers a Kelurahan or Desa choice. BUMDes, Embung, Desa Wisata, Sawah Irigasi, Pendamping Desa, Panen Raya and Wisata Edukasi are removed from the spec.
- Dana Desa stays as a satire term (guardrail list).
- Older files `decisions/desa-path.md` and `progress/desa-path.md` are history and are left as written.
- Code: any Desa strings in `src/` were not touched. Remove them in a code PR if they still ship.
