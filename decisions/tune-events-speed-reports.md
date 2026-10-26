# Tune events, speed and reports

- No screen shake on event popups. Removed the method, CSS and the effects-help mention.
- Fewer repeats: a random event cannot recur within 30 months (`MIN_REPEAT_GAP`), and the popup gap goes 5 to 8 months. Scheduled events keep their own cooldowns.
- 4x speed unlocks in year 10 (`FAST_FROM_YEAR`). Before that the button cycles 1x and 2x. A loaded 4x is clamped to 2x.
- Report card is yearly (`QUARTER_MONTHS` = 12). Text says "Year n" / "Tahun n".
- Mangkrak restart has a second route: 2 Orang Inside (`RESTART_ODN`), no money. The rupiah route is unchanged.
