# Hand-back stall fix

- `takeover` stores `autoBefore`; `handBack` restores `autoKeep` from it (`src/sim/grow.ts`).
- `lotFull(n)`; the Neighbours status line shows a full lot.
- Hand-back toast in EN and ID (`grow.handedBack*`).
- Tests: a funded hand-back builds again; Auto-dana resumes and builds with no tap; a full lot is reported. The e2e takeover test checks the toast.
