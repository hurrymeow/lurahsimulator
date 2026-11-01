# Spread the staff stats

## Goal
Rajin is the work stat of most roles, so it is the only stat players look at. Move the role data to the table already in GAME-DESIGN.md section 4 (Roles), so each stat is the work stat of two roles and the risk stat of two. Source: TODO.md "Spread the staff stats: each stat works two roles and risks two" (`decisions/playtest-sk2.md`). Routed to the DeepSeek executor by voidinside99, 2026-11-01.

## Decisions
- GAME-DESIGN.md already holds the table, so this is data only: no doc change.
- Satpol PP is a Kecamatan role and not in the table. It keeps Rajin and Gaul, and the two-and-two check counts only roles that open below Kecamatan.
- Two specials whose role moves to a new work stat swap two stats, so their total stays the same and their best stat is still their job's.
- Mishap costs stay as they are. Only the three roles with a new risk stat get a new mishap text, matching what the new stat lets slip.

## Tasks

### T1. Role work and risk stats, mishap texts, two specials (Haiku)
- Files: `src/data/staff.ts`, `src/i18n/en.ts`, `src/i18n/id.ts`, `tests/staff.test.ts`, `tests/staff-stats.test.ts`
- Exact changes:
  - `src/data/staff.ts`, in `ROLES`, change only these fields:
    - `asisten`: `risk: 'jujur'` becomes `risk: 'rajin'`.
    - `penagih`: `stat: 'rajin'` becomes `stat: 'gaul'`.
    - `pu`: `risk: 'jujur'` becomes `risk: 'lobi'`.
    - `adminWa`: `risk: 'jujur'` becomes `risk: 'lobi'`.
    - `supir`: `stat: 'rajin'` becomes `stat: 'jujur'`.
  - `src/data/staff.ts`, in the specials list, change only these `stats`:
    - `omMotivasi`: `{ rajin: 70, lobi: 55, jujur: 40, gaul: 45 }` becomes `{ rajin: 45, lobi: 55, jujur: 40, gaul: 70 }`.
    - `omLaluLintas`: `{ rajin: 75, lobi: 45, jujur: 50, gaul: 45 }` becomes `{ rajin: 50, lobi: 45, jujur: 75, gaul: 45 }`.
  - `src/i18n/en.ts`, replace three values and keep the keys where they are:
    - `'staff.mishapWhat.adminWa'`: `'the group chat gets reported'`
    - `'staff.mishapWhat.asisten'`: `'a folder is misfiled'`
    - `'staff.mishapWhat.pu'`: `'the supplier sends no materials'`
  - `src/i18n/id.ts`, the same three keys:
    - `'staff.mishapWhat.adminWa'`: `'grup WA-nya dilaporkan'`
    - `'staff.mishapWhat.asisten'`: `'berkas salah taruh'`
    - `'staff.mishapWhat.pu'`: `'pemasok tidak kirim bahan'`
  - `tests/staff.test.ts`, in the test `Bimtek raises the role stat and sends them away a month; firing pays pesangon`: the helper's role is `penagih`, whose work stat is now Gaul, so `x.stats.rajin` becomes `x.stats.gaul` on both lines (the `before` line and the `before + 5` line).
  - `tests/staff-stats.test.ts`:
    - in the test `a level-up raises the role's work stat`, `x.stats.rajin` becomes `x.stats.gaul`;
    - add one test after `every role has a work stat and a different risk stat`, named `each stat is the work stat of two roles and the risk stat of two`. For the roles whose `opens.stage` is not `'kecamatan'`, count how many have each stat as `stat` and how many as `risk`, and expect 2 for each of `rajin`, `lobi`, `jujur` and `gaul`.
- Done when: `npm run typecheck` and `npm test` pass; the new test fails on main's role data and passes with the change; `decisions/staff-stat-spread-T1.md` lists the five role changes and the two specials; `progress/staff-stat-spread-T1.md` exists. If any other test fails, including a balance, pacing, scorecard or bot test, set status `stopped` with the failing test names and numbers. Do not edit those tests.
- Don't touch: mishap amounts, `RISK`, role blurbs, `src/sim/`, `src/ui/`, other specials, other strings, GAME-DESIGN.md, TODO.md. No e2e needed.
