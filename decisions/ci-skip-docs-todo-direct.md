# CI: docs-only PRs skip e2e, TODO.md edited on main only

- PRs that change only `*.md` files skip the e2e shards. The `changes` job decides, and `ci` still reports success.
- Pushes to main always run e2e, so deploy is unchanged.
- PRs never edit TODO.md. Claim, done and new items go in by a docs-only push to main. This ends the repeated merge-main-and-rerun loops.
- Against: the TODO record moves outside the PR.
