import { Component, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { Html5Qrcode } from 'html5-qrcode';
import { RewardsService } from '../../../services/rewards';

const READER_ELEMENT_ID = 'staff-redeem-reader';
const REDEMPTION_QR_PATTERN = /^REDEEM:(.+):(\d+)$/;

@Component({
  selector: 'app-staff-redeem',
  standalone: true,
  imports: [],
  templateUrl: './redeem.html',
  styleUrls: ['./redeem.css']
})
export class StaffRedeemPage {
  scanning = false;
  processing = false;
  result: { name: string; rewardName: string; pointsDeducted: number; totalPoints: number } | null = null;
  error = '';

  readonly readerElementId = READER_ELEMENT_ID;

  private html5QrCode: Html5Qrcode | null = null;

  constructor(
    private rewardsService: RewardsService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  startScanning() {
    this.result = null;
    this.error = '';
    this.scanning = true;
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
    if (this.processing) {
      return;
    }
    this.scanning = false;
    this.stopCamera();
    this.processRedemption(decodedText);
  }

  private processRedemption(decodedText: string) {
    const match = REDEMPTION_QR_PATTERN.exec(decodedText);
    if (!match) {
      this.error = 'Invalid redemption code. Ask the customer to select a reward again.';
      this.cdr.detectChanges();
      return;
    }
    const [, qrCodeId, rewardIdStr] = match;
    this.processing = true;

    this.rewardsService.redeemReward(qrCodeId, Number(rewardIdStr)).subscribe({
      next: (response) => {
        this.result = response;
        this.processing = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err.error || 'Redemption failed. Customer may not have enough points.';
        this.processing = false;
        this.cdr.detectChanges();
      }
    });
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

  goBack() {
    this.stopCamera();
    this.router.navigate(['/staff/scan']);
  }
}
