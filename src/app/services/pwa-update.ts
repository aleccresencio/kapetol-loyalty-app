import { Injectable, signal } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class PwaUpdateService {
  readonly updateAvailable = signal(false);

  constructor(private swUpdate: SwUpdate) {
    if (!this.swUpdate.isEnabled) return;

    this.swUpdate.versionUpdates
      .pipe(filter((event): event is VersionReadyEvent => event.type === 'VERSION_READY'))
      .subscribe(() => this.updateAvailable.set(true));

    this.swUpdate.checkForUpdate();

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.swUpdate.checkForUpdate();
      }
    });
  }

  reloadForUpdate(): void {
    this.swUpdate.activateUpdate().then(() => document.location.reload());
  }
}
