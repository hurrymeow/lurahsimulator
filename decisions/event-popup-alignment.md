# Event pop-up alignment

- Event cards use the same centred text as every other pop-up. Only the buttons and the missing-cost list differ.
- The Indonesian "Cari sponsor" button no longer spells out "1 Orang Dalam" next to the icon. The label cleanup only matched the English name.
- e2e checks every event and its result for centred text and a vertically centred card, in both languages.
- The low placement was a tip's bottom-aligned layout left on the pop-up when an event followed a tip. showEvent now clears it. e2e opens an event right after a tip and checks it is centred.
