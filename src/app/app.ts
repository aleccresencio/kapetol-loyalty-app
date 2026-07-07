import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { StaffIdleService } from './services/staff-idle';
import { PwaUpdateService } from './services/pwa-update';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  constructor(private staffIdle: StaffIdleService, readonly pwaUpdate: PwaUpdateService) {}
}
