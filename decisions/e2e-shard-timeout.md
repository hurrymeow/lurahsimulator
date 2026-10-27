# E2E shard timeout

Hari (2026-10-27): cap e2e shards. One shard hung for 3.5h on 2026-10-26 and blocked deploy.

- Each e2e shard job has `timeout-minutes: 10`. A 5 min cap would fail healthy shards, which sometimes take 7 min.
- Playwright `globalTimeout` is 8 min in CI. It ends a hung run with a report before the job cap cancels it.
- The report uploads on `failure() || cancelled()`, so a timed-out shard still leaves evidence.
- `ci` has a 5 min cap and `deploy` a 10 min cap, so a stuck job cannot hold main.
- A timed-out shard fails the `ci` check. Rerun the failed jobs from the Actions page. Deploy runs once `ci` deps pass.
