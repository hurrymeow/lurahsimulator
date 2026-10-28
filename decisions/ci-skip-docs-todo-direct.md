# CI: docs-only PRs skip e2e, TODO.md edited on main only

- PRs that change only `*.md` files skip the e2e shards. The `changes` job decides, and `ci` still reports success.
- Pushes to main always run e2e, so deploy is unchanged.
- Code PRs never edit TODO.md. Claim, done and new items go in a separate docs-only change: a push to main where allowed, otherwise a docs-only PR (cheap, since e2e is skipped). Agent pushes to main are blocked by the `ci` ruleset for at least some sessions, so a PR is the reliable path. This ends the repeated merge-main-and-rerun loops.
- Against: the TODO record moves outside the PR.
