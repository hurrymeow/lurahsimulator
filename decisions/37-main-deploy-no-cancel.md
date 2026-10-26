# Stop cancelling main CI runs

- **Main runs finish (my call):** `cancel-in-progress` is now true only for pull requests. On main, every merge cancelled the previous run, so its `deploy` job never ran. Merges land every 2 to 3 minutes and CI takes about 3, so nothing deployed while threads were merging in parallel.
- **Cost:** main runs queue behind each other. GitHub keeps only the newest queued run, so the deployed build is always the latest commit that finished.
