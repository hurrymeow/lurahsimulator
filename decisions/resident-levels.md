# Resident levels

- XP is months spent employed. Level comes from `LEVEL_MONTHS` in `data/jobs.ts`: 0, 6, 18, 36 and 60 months, so 5 levels.
- XP belongs to the resident, not the job. Changing jobs keeps it, so manual reassigning is never punished.
- Each job has `perLevel: { resources, boost }`. Ojol income grows 20% per level above 1, influencer and buzzer Viral 25%. Sabar costs do not grow.
- Buzzers also pump fake Viral 25% faster per level. Exposure odds follow `fake`, so higher levels pay more and get caught sooner.
- PNS earn nothing from levels. Their level (golongan) raises the pension payout 30% per level. The joke: promotion makes the kas pay more.
- Old saves have no `xp`, which reads as level 1. No save version bump.
- Star checklists do not use levels yet. A goal kind can read `levelOf` later.
