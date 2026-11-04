# The combo goal names the combo; its buildings wait in the opened list

Seen at 360px ID while checking the price banner: the goal pill read "Target: buat combo: Pos Ronda, Warung Sembako, Menara Wifi" on three lines. UI.md rule 5 allows at most two, and rule 16 allows 6 words. `label-words.test.ts` had left the combo phrase out for exactly this reason.

- The pill now names the combo: "Goal: combo Tongkrongan" (ID "Target: combo Tongkrongan"). The longest combo name in play, "Dari Sawah ke Warung", still fits 6 words.
- The buildings to place move to a row in the opened goal list: "Place side by side: Pos Ronda, Warung Sembako, Menara Wifi". The first-combo tip still names them, as before.
- "Nobody new is coming" got the same treatment: "{name} draws residents". With a 3-word building name it is 6 words.
- `label-words.test.ts` now checks every goal phrase with no exceptions. It uses a 3-word building name and the longest combo name.
