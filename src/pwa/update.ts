// Registers the service worker and shows the update banner (and the home screen button) when a new version is waiting.
export function setupUpdates(banner: HTMLElement, button: HTMLButtonElement, homeButton: HTMLButtonElement): void {
  if (!('serviceWorker' in navigator) || import.meta.env.DEV) return;

  let reloading = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (reloading) return;
    reloading = true;
    window.location.reload();
  });

  const show = (worker: ServiceWorker) => {
    banner.hidden = false;
    homeButton.hidden = false;
    const go = () => {
      button.disabled = true;
      homeButton.disabled = true;
      worker.postMessage('SKIP_WAITING');
    };
    button.onclick = go;
    homeButton.onclick = go;
  };

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
