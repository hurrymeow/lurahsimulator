// Registers the service worker. When a new version is waiting it shows a full-screen update on the home screen
// only, so a reload never cuts into play. During play the Menu button carries a dot and Menu lists an Update tile.
export interface UpdateUi {
  /** Full-screen card, shown by CSS only while the home screen is open. */
  screen: HTMLElement;
  screenButton: HTMLButtonElement;
  /** Menu tile for players who never leave the map. */
  menuTile: HTMLButtonElement;
  /** Called once when a version is waiting, to mark the Menu button. */
  onReady: () => void;
  /** Called before the reload, so the game is saved. */
  beforeReload: () => void;
}

export function setupUpdates(ui: UpdateUi): void {
  let announced = false;
  const announce = (go: () => void) => {
    const run = () => {
      ui.screenButton.disabled = true;
      ui.menuTile.disabled = true;
      ui.beforeReload();
      go();
    };
    ui.screenButton.onclick = run;
    ui.menuTile.onclick = run;
    if (announced) return;
    announced = true;
    ui.screen.hidden = false;
    ui.menuTile.hidden = false;
    ui.onReady();
  };
  // Tests and the debug build can show the update UI without a real new version.
  if (new URLSearchParams(location.search).has('debug')) (window as unknown as { pakrtUpdate?: () => void }).pakrtUpdate = () => announce(() => {});

  if (!('serviceWorker' in navigator) || import.meta.env.DEV) return;

  let reloading = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (reloading) return;
    reloading = true;
    window.location.reload();
  });

  const show = (worker: ServiceWorker) => announce(() => worker.postMessage('SKIP_WAITING'));

  navigator.serviceWorker
    .register('./sw.js')
    .then((reg) => {
      if (reg.waiting && navigator.serviceWorker.controller) show(reg.waiting);
      reg.addEventListener('updatefound', () => {
        const worker = reg.installing;
        if (!worker) return;
        worker.addEventListener('statechange', () => {
          if (worker.state === 'installed' && navigator.serviceWorker.controller) show(worker);
        });
      });
      // Check for a new version when the app comes back to the foreground.
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') reg.update().catch(() => {});
      });
    })
    .catch(() => {
      /* offline support is optional */
    });
}
