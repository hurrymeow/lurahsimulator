# e2e six shards

- 6 shards. The required check is the `ci` aggregate, so shard names are free to change.
- Reverted the Playwright container image from #57. Image init took 27-33s per job, more than the ~23s of cache plus install-deps it replaced.
- Kept `workers: 2`. If the fps tests flake at this density, drop to `workers: 1`.
