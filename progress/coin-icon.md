# Coin icon for money

- `src/ui/statIcons.ts`: `MONEY` token; a money segment renders as a coin pair with the signed amount.
- `grow.row` in EN and ID: ★ for stars, counts after labels.
- Tests: renderer unit tests for amounts, signs and units; the Wacana e2e checks the coin pair instead of "Rp".
- `statIcon`: inside a button, link or label the icon no longer stops the click (the Lomba e2e caught a contest button that did nothing).
