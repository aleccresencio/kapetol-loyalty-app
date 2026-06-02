import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent, IonHeader, IonToolbar, IonTitle,
  IonItem, IonLabel, IonInput, IonButton, IonText
} from '@ionic/angular/standalone';
import { SessionService } from '../../../services/session';

const STAFF_PIN = '1234';

@Component({
  selector: 'app-staff-login',
  standalone: true,
  imports: [FormsModule, IonContent, IonHeader, IonToolbar, IonTitle,
    IonItem, IonLabel, IonInput, IonButton, IonText],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class StaffLoginPage {
  pin = '';
  error = '';

  constructor(private session: SessionService, private router: Router) {}

  login() {
    if (this.pin === STAFF_PIN) {
      this.session.setStaffAuthenticated();
      this.router.navigate(['/staff/scan']);
    } else {
      this.error = 'Incorrect PIN. Please try again.';
      this.pin = '';
    }
  }
}
