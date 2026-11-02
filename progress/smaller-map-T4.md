# Smaller map T4

Set `SAVE_VERSION = 4` and changed `deserialize` to accept versions 3 and 4, refusing a v3 save unless `stage.current` is `'rt'` and stamping loaded v3 RT saves as version 4. Updated the rt3, rw and kel seed files to version 4. Added grow tests for a v3 RT save loading as v4 and a v3 RW save returning null.
