# Titles fit names, hair fits titles

2026-11-08. Playtest: the Staf list showed a "Pak Yanti" and a "Pak Oki" with long hair.

**Cause:** a title (Pak, Bu, Mas, Mbak) and a given name were picked apart from each other for
residents and applicants, and a generic hire's hair was picked from the staff id alone, apart from both.

- `src/data/names.ts` splits the given names into men's, women's and a few unisex ones (Dian, Eka, Kiki,
  Nanda), adding Agus, Bayu, Eko and Wahyu so both lists have 15. A name is picked after its title, from
  that title's list plus the unisex ones (`namesFor`), for residents and applicants alike.
- Portraits (`staffLook`) take the hire's gender from their title: Pak and Mas get short, side-parted,
  curly, grey or bald hair; Bu and Mbak long hair, a bun (now and then grey) or a ponytail. Under a beret,
  helmet or cap a woman's hair is tied back in a ponytail, and a woman driver drops the peci.
- Old saves keep every name and turn a wrong title to fit it on load: Pak Yanti becomes Bu Yanti, Mbak
  Joko becomes Mas Joko. Specials and Inem are left alone.

Some existing hires get a new hairstyle so it fits their title; skin, outfit and expression stay.
`tests/names.test.ts` covers names, hair and the save fix.
