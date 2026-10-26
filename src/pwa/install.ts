import { t } from '../i18n';
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

let deferred: BeforeInstallPromptEvent | null = null;
let listening = false;
const buttons = new Set<HTMLButtonElement>();
const setHidden = (hidden: boolean) => buttons.forEach((b) => (b.hidden = hidden));

// Shows the install button when the browser offers an install prompt.
// iOS has no prompt, so the button shows Add to Home Screen steps instead.
// Call once per button (Menu, home screen): they share one prompt and hide together.
export function setupInstall(button: HTMLButtonElement, showHint: (text: string) => void): void {
  if (isStandalone()) return;
  buttons.add(button);
  button.hidden = !(deferred || isIos());

  if (!listening) {
    listening = true;
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferred = e as BeforeInstallPromptEvent;
      setHidden(false);
    });
    window.addEventListener('appinstalled', () => {
      deferred = null;
      setHidden(true);
    });
  }

  button.addEventListener('click', async () => {
    if (deferred) {
      const d = deferred;
      deferred = null;
      await d.prompt();
      await d.userChoice;
      setHidden(true);
    } else if (isIos()) {
      showHint(t('install.ios'));
    }
  });
}
