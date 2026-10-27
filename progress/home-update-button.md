# Update button on the home screen

When a new service worker is waiting, the home screen shows an "Update available" button above Start. Tapping it sends SKIP_WAITING, the page reloads on controllerchange. Shares the logic with the in-game banner (`setupUpdates`). EN and ID strings added.
