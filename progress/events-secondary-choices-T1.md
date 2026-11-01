# Event choice buttons are secondary

In `src/app.ts` `showEvent`, the per-choice button class changed from `` `btn ${i === 0 ? '' : 'btn-primary'}` `` to `'btn'`, and the send-candidate button class from `'btn btn-primary send-btn'` to `'btn send-btn'`. Two lines, no other changes. Typecheck and unit tests pass. The event popup screenshot baseline changes with this visual change; baselines are not updated in this executor run, so CI's visual check will need the baseline refreshed on the branch by the maintainer.
