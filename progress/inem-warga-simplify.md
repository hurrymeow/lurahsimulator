# Inem only on events; warga without stars

- `src/app.ts`: `Notice.inem`; the message card shows Inem only when set; event results set it. `src/sim/staff.ts`: gig notices set it.
- `src/ui/lists.ts`: no level stars on warga chips, no By level filter. `src/ui/panels.ts`: `experienceLine()` in a resident's sheet.
- Strings: `res.xp*` replace `res.levelNext`, `res.levelMax` and `ls.byLevel`; `sim.levelUp` reads as experience.
- E2E: event cards carry Inem, the meter card does not; the Warga test checks there are no stars and the experience line shows.
