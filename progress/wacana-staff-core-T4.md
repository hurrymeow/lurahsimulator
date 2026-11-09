# T4: show and change the PIC in the Wacana pop-up

Shipped the lead row in both columns of the Wacana detail (`src/ui/panels.ts`), the `.wac-pic` style, the `wac.picPower`, `wac.picWeeks` and `wac.picNext` strings in English and Indonesian, and an e2e test that checks both columns name Inem and that no Change button appears when she is the only candidate. `npm run typecheck`, `npm test`, the Wacana specs on the default projects and `--project=phone-412-en`, and the rule 13/14 density scan all pass.
