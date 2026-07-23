import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { StaffIdleService } from './services/staff-idle';
import { PwaUpdateService } from './services/pwa-update';
import { PwaInstallService } from './services/pwa-install';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  constructor(
    private staffIdle: StaffIdleService,
    private router: Router,
    private pwaInstall: PwaInstallService,
    readonly pwaUpdate: PwaUpdateService
  ) {
    this.pwaInstall.useStaffManifest(window.location.pathname.startsWith('/staff'));

    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => this.pwaInstall.useStaffManifest(event.urlAfterRedirects.startsWith('/staff')));
  }
}
