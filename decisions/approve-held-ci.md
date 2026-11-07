# Approve held CI runs on our own PRs (2026-11-07)

On hurrymeow/lurahsimulator#351 the Update baselines bot pushed new screenshots, and GitHub held the pull_request CI run on that commit for approval. The PR stayed "blocked" although the required `ci` check had passed in the workflow_dispatch run. Hari: "Fix it yourself. Approve yourself next time."

Agents now approve such a held run on their own PR and let auto-merge finish, without asking. Recorded in AGENTS.md, Workflow rules.
