import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { StaffIdleService } from './services/staff-idle';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  constructor(private staffIdle: StaffIdleService) {}
}
