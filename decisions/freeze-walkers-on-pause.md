# Freeze walkers on pause

- Any pause (manual or auto) stops walker movement and stride. Weather and idle loops still run.
- `App.frame` sets `view.frozen = !running`. Reduce motion is unchanged.
- E2E walker tests that need walkers with a still sim force `running` true at speed 0.
