# AI Jalan Setapak and walkers

- `layAiPath`, `builtBy`, link-once for old saves (`pathsLaid`), and path-aware spot choice in `src/sim/grow.ts`.
- AI walkers in `src/render/people.ts` (`aiPlan`, cached; `AI_WALKERS_PER_RT` 3, `AI_WALKERS_MAX` 24).
- Neighbours screen counts buildings without paths.
- Tests: every AI building reaches its Kantor (≥95% over 5 years, 3 seeds), old saves link once; e2e AI paths and walkers stay in AI lots; the fps specs pass.
