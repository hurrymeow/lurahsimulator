# Buzzer is player-assigned only

- #22 let residents pick jobs by weighted appeal, buzzer highest. Exposed buzzers cost 8 Sabar each, so a hands-off kampung bled Sabar and residents left (population stuck at 2 in balance tests, main red).
- Buzzer appeal is now 0 and `openJobs` skips appeal 0. Residents never choose it. The player can still assign it by hand, where the exposure risk is their call.
- Found by excluding each job from auto-pick in turn: only buzzer restored the tests.
