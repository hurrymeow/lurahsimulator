# Popup spacing and pacing tests

- PACING.md target 6: a random popup keeps 3 months (`EVENT_CLEAR`, 24s at 1x) clear of any other event, before and after. It checks the last event of any kind, scheduled events due by month, and the next Kecamatan warning.
- Why: random popups ignored scheduled ones, so Agustusan, Kecamatan and a random card often landed 8s apart.
- Scheduled events are never deferred. Only the random pool backs off, so no scheduled event is skipped.
- Side effect: the shifted event order cleared the bot seed 2 stall (no 2★ in 15 min). All 10 seeds now reach 2★ by month 30.
- New test asserts 1★ by month 15, 2★ by 37, 3★ by 75 and no two events under 3 months apart.
