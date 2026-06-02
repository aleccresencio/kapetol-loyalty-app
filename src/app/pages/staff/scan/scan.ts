import { Component, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonButton, IonButtons,
  IonItem, IonLabel, IonInput, IonCard, IonCardContent, IonText
} from '@ionic/angular/standalone';
import jsQR from 'jsqr';
import { LoyaltyService } from '../../../services/loyalty';
import { SessionService } from '../../../services/session';

@Component({
  selector: 'app-staff-scan',
  standalone: true,
  imports: [
    FormsModule,
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

  @ViewChild('videoEl') videoEl!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasEl') canvasEl!: ElementRef<HTMLCanvasElement>;

  private stream: MediaStream | null = null;
  private scanning$ = false;

  constructor(
    private loyaltyService: LoyaltyService,
    private session: SessionService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  async startScanning() {
    this.scanning = true;
    this.error = '';
    setTimeout(() => this.initCamera());
  }

  private async initCamera() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = this.videoEl.nativeElement;
      video.srcObject = this.stream;
      await video.play();
      this.scanning$ = true;
      this.scanLoop();
    } catch (err: any) {
      this.error = `Camera error: ${err.name} — ${err.message}`;
      this.scanning = false;
      this.cdr.detectChanges();
    }
  }

  private scanLoop() {
    if (!this.scanning$) return;

    const video = this.videoEl.nativeElement;
    const canvas = this.canvasEl.nativeElement;

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);

      if (code) {
        this.stopCamera();
        this.qrCodeId = code.data;
        this.scanning = false;
        this.cdr.detectChanges();
        return;
      }
    }

    requestAnimationFrame(() => this.scanLoop());
  }

  private stopCamera() {
    this.scanning$ = false;
    this.stream?.getTracks().forEach(t => t.stop());
    this.stream = null;
  }

  cancelScanning() {
    this.stopCamera();
    this.scanning = false;
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
    this.stopCamera();
    this.session.clearStaff();
    this.router.navigate(['/']);
  }
}
