# Tap on a building no longer flickers

A phone fires the tap's click after pointerup. By then the building sheet and its scrim are up, so the click hit the scrim and closed the sheet at once. A long press fires no click, so it worked.

The scrim now ignores clicks in the first 400ms after a sheet opens. Regression test in ui.spec.ts.
