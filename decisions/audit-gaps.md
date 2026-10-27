# Audit gaps: coach note, badges, event labels

- Coach note: when the target sits low in a sheet, the note used to land above it, on the sheet's own text and tabs. It now goes above the sheet. On the Place step it moves above the Place button if the bottom bar would put it on top.
- Map badges lift in whole badge-heights when they would overlap another (`src/render/badge.ts`). A badge may sit above its building, never over another badge.
- Event labels end with their price. "Join in · Rp 300.000 snacks" showed as "Join in snacks · Rp 300.000". Test in `tests/event-labels.test.ts`.
- Left as is: Indonesian words in English event text (rombongan, panitia, kerupuk). They are the flavour, per CONTRIBUTING.
