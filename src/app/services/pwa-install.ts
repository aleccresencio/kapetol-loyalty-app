import { Injectable, signal } from '@angular/core';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const IOS_BANNER_DISMISSED_KEY = 'pwa_ios_banner_dismissed';
const CUSTOMER_MANIFEST_HREF = 'manifest.webmanifest';
const STAFF_MANIFEST_HREF = 'manifest-staff.webmanifest';

@Injectable({ providedIn: 'root' })
export class PwaInstallService {
  private deferredPrompt: BeforeInstallPromptEvent | null = null;
  private isStaffManifest = false;

  readonly canInstall = signal(false);
  readonly showIosBanner = signal(false);

  constructor() {
    window.addEventListener('beforeinstallprompt', (event: Event) => {
      event.preventDefault();
      this.deferredPrompt = event as BeforeInstallPromptEvent;
      this.canInstall.set(true);
    });

    window.addEventListener('appinstalled', () => {
      this.deferredPrompt = null;
      this.canInstall.set(false);
    });

    this.showIosBanner.set(this.isIosSafari() && !this.isStandalone() && !this.isIosBannerDismissed());
  }

  async promptInstall(): Promise<void> {
    if (!this.deferredPrompt) return;

    await this.deferredPrompt.prompt();
    await this.deferredPrompt.userChoice;
    this.deferredPrompt = null;
    this.canInstall.set(false);
  }

  dismissIosBanner(): void {
    localStorage.setItem(IOS_BANNER_DISMISSED_KEY, 'true');
    this.showIosBanner.set(false);
  }

  /**
   * Swaps the page's <link rel="manifest"> so installing from a staff route
   * ("Add to Home Screen") creates a separate icon that opens to /staff/login,
   * instead of the customer manifest's start_url of "/".
   */
  useStaffManifest(isStaff: boolean): void {
    if (this.isStaffManifest === isStaff) return;
    this.isStaffManifest = isStaff;

    const link = document.getElementById('app-manifest') as HTMLLinkElement | null;
    if (link) {
      link.href = isStaff ? STAFF_MANIFEST_HREF : CUSTOMER_MANIFEST_HREF;
    }
  }

  private isIosSafari(): boolean {
    const ua = window.navigator.userAgent;
    const isIos = /iphone|ipad|ipod/i.test(ua);
    const isSafari = /safari/i.test(ua) && !/crios|fxios|edgios/i.test(ua);
    return isIos && isSafari;
  }

  isStandalone(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches
      || (window.navigator as unknown as { standalone?: boolean }).standalone === true;
  }

  private isIosBannerDismissed(): boolean {
    return localStorage.getItem(IOS_BANNER_DISMISSED_KEY) === 'true';
  }
}
