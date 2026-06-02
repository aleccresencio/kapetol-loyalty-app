import { Component, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonButton, IonButtons,
  IonItem, IonLabel, IonInput, IonCard, IonCardContent, IonText
} from '@ionic/angular/standalone';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { LoyaltyService } from '../../../services/loyalty';
import { SessionService } from '../../../services/session';

@Component({
  selector: 'app-staff-scan',
  standalone: true,
  imports: [
    FormsModule, ZXingScannerModule,
    IonContent, IonHeader, IonToolbar, IonTitle, IonButton, IonButtons,
    IonItem, IonLabel, IonInput, IonCard, IonCardContent, IonText
  ],
  templateUrl: './scan.html',
  styleUrls: ['./scan.css']
})
export class StaffScanPage {
  scanning = false;
  qrCodeId = '';
  totalSpent = 0;
  result: { name: string; pointsEarned: number; totalPoints: number } | null = null;
  error = '';
  selectedDevice: MediaDeviceInfo | undefined;

  constructor(
    private loyaltyService: LoyaltyService,
    private session: SessionService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  async startScanning() {
    this.selectedDevice = await this.pickRealCamera();
    this.scanning = true;
  }

  // Picks the first real camera, skipping virtual devices like OBS.
  private async pickRealCamera(): Promise<MediaDeviceInfo | undefined> {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices.filter(d => d.kind === 'videoinput');
    const real = cameras.find(d => !d.label.toLowerCase().includes('virtual') &&
                                   !d.label.toLowerCase().includes('obs'));
    return real ?? cameras[0];
  }

  onScanSuccess(result: string) {
    this.qrCodeId = result;
    this.scanning = false;
    this.cdr.detectChanges();
  }

  submit() {
    if (!this.qrCodeId) {
      this.error = 'Please scan a QR code first.';
      return;
    }
    this.error = '';
    this.result = null;

    this.loyaltyService.scanQr({ qrCodeId: this.qrCodeId, totalSpent: this.totalSpent }).subscribe({
      next: (response: any) => {
        this.result = response;
        this.qrCodeId = '';
        this.totalSpent = 0;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err.error || 'Transaction failed. Check QR code or amount.';
        this.cdr.detectChanges();
      }
    });
  }

  goToRedeem() {
    this.router.navigate(['/staff/redeem']);
  }

  logout() {
    this.session.clearStaff();
    this.router.navigate(['/']);
  }
}
