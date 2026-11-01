# Crane shadow fix

- The crane sprite asked for a ground shadow with inset 10. That gave a negative radius, so the oval test passed for every pixel and a dark rectangle covered the site and the road beside it.
- The crane now uses inset 5, and the shadow radius is clamped so no sprite can repeat this.
