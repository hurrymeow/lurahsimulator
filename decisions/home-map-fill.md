# Home map fills the screen

The console frame pads #stage by the rail width. The home screen hides the rail but kept the gutter, and the camera stayed centred for the old box. Result on a wide phone: black strip on the left, map cut at the right.

Decision: on home, #stage covers the whole screen with no gutter, and the camera re-centres when home opens or closes. E2E asserts the map box, canvas and camera match at every width in EN and ID, plus standalone display mode.
