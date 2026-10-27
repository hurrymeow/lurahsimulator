# UI mockup on the live site

- `mockup.html` is now a second Vite build input, so it deploys with the game at `/mockup.html` (`?lang=id` for Indonesian). Before this it only ran on the dev server, so the UI update from the rolling-hills PR never reached the live site.
- The game page is unchanged. The mockup is not linked from it and is not precached by the service worker.
