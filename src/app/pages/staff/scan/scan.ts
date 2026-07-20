import { Component, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Html5Qrcode } from 'html5-qrcode';
import { LoyaltyService } from '../../../services/loyalty';
import { SessionService } from '../../../services/session';

const READER_ELEMENT_ID = 'staff-scan-reader';

@Component({
  selector: 'app-staff-scan',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './scan.html',
  styleUrls: ['./scan.css']
})
export class StaffScanPage {
  scanning = false;
  qrCodeId = '';
  totalSpent = 0;
  result: { name: string; pointsEarned: number; totalPoints: number } | null = null;
  error = '';

  readonly readerElementId = READER_ELEMENT_ID;

  private html5QrCode: Html5Qrcode | null = null;

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
      this.html5QrCode = new Html5Qrcode(this.readerElementId);
      await this.html5QrCode.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => this.onScanSuccess(decodedText),
        undefined
      );
    } catch (err: any) {
      this.error = `Camera error: ${err}`;
      this.scanning = false;
      this.cdr.detectChanges();
    }
  }

  private onScanSuccess(decodedText: string) {
    this.qrCodeId = decodedText;
    this.scanning = false;
    this.stopCamera();
    this.cdr.detectChanges();
  }

  private stopCamera() {
    if (this.html5QrCode) {
      this.html5QrCode.stop().then(() => this.html5QrCode?.clear()).catch(() => {});
      this.html5QrCode = null;
    }
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

  goToHistory() {
    this.router.navigate(['/staff/history']);
  }

  logout() {
    this.stopCamera();
    this.session.clearStaff();
    this.router.navigate(['/']);
  }
}
