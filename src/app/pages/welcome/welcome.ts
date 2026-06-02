import { Component } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonContent,
  IonButton
} from '@ionic/angular/standalone';
import { SessionService } from '../../services/session';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [IonContent, IonButton],
  templateUrl: './welcome.html',
  styleUrls: ['./welcome.css']
})
export class WelcomePage {
  constructor(private router: Router, private session: SessionService) {}

  goCustomer() {
    const id = this.session.getCustomerId();
    if (id) {
      this.router.navigate(['/customer/dashboard']);
    } else {
      this.router.navigate(['/customer/register']);
    }
  }

  goStaff() {
    if (this.session.isStaffAuthenticated()) {
      this.router.navigate(['/staff/scan']);
    } else {
      this.router.navigate(['/staff/login']);
    }
  }
}
