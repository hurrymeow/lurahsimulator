# Bubble layering and goal wording

- Speech bubbles are queued and painted after buildings, window lights, weather and badges, so no layer covers them. An e2e check records the draw order of a night frame and fails if anything paints after the bubble.
- English goal lines read "Combos found: 0 of 1" instead of "1 combos found", so no count needs a plural.
- A second e2e check asserts the menu sheet, message card and bars are on top at their own centre.
