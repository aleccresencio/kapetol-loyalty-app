import { Component, ElementRef, ViewChild } from '@angular/core';
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
  cameraStatus = '';
  showCamera = false;

  @ViewChild('videoEl') videoEl!: ElementRef<HTMLVideoElement>;

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

  async testCamera() {
    this.cameraStatus = 'Starting camera...';
    this.showCamera = true;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = this.videoEl.nativeElement;
      video.srcObject = stream;
      await video.play();
      this.cameraStatus = 'Camera is working!';
    } catch (err: any) {
      this.cameraStatus = `Error: ${err.name} — ${err.message}`;
      this.showCamera = false;
    }
  }
}
