# E2E shard timeout

Hari (2026-10-27): cap e2e shards. One shard hung for 3.5h on 2026-10-26 and blocked deploy.

- Each e2e shard job has `timeout-minutes: 10`. A 5 min cap would fail healthy shards, which sometimes take 7 min.
- Playwright `globalTimeout` is 8 min in CI. It ends a hung run with a report before the job cap cancels it.
- The report uploads on `failure() || cancelled()`, so a timed-out shard still leaves evidence.
- `ci` has a 5 min cap and `deploy` a 10 min cap, so a stuck job cannot hold main.
- A timed-out shard fails the `ci` check. Rerun the failed jobs from the Actions page. Deploy runs once `ci` deps pass.

## Why 10 and 8 are safe
Checked runs 40468623084 and 40482228048 (2026-10-27). Playwright itself took 1.5 to 3.5 min per shard.
The 7 to 14 min shards were `playwright install-deps` stalling on apt for about 10 min on one shard in each run.
Cause (main run 40489019943, shard 3): another apt-get held the dpkg lock. The `timeout 180` retry from #100 killed npx but not apt-get, so the retry hit the same lock and failed.
Fix: apt waits up to 180s for the lock (`DPkg::Lock::Timeout`), and each install step has `timeout-minutes: 5`. A real stall fails in 5 min and can be rerun.
