interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

function isStandalone(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches || (navigator as { standalone?: boolean }).standalone === true;
}

function isIos(): boolean {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

// Shows the install button when the browser offers an install prompt.
// iOS has no prompt, so the button shows Add to Home Screen steps instead.
export function setupInstall(button: HTMLButtonElement, showHint: (text: string) => void): void {
  if (isStandalone()) return;
  let deferred: BeforeInstallPromptEvent | null = null;

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferred = e as BeforeInstallPromptEvent;
    button.hidden = false;
  });

  window.addEventListener('appinstalled', () => {
    deferred = null;
    button.hidden = true;
  });

  if (isIos()) button.hidden = false;

  button.addEventListener('click', async () => {
    if (deferred) {
      await deferred.prompt();
      await deferred.userChoice;
      deferred = null;
      button.hidden = true;
    } else if (isIos()) {
      showHint('Tap Share, then "Add to Home Screen".');
    }
  });
}
