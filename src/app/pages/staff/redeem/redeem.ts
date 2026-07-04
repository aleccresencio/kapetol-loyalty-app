import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { Html5Qrcode } from 'html5-qrcode';
import { RewardsService, Reward } from '../../../services/rewards';

const READER_ELEMENT_ID = 'staff-redeem-reader';

@Component({
  selector: 'app-staff-redeem',
  standalone: true,
  imports: [],
  templateUrl: './redeem.html',
  styleUrls: ['./redeem.css']
})
export class StaffRedeemPage implements OnInit {
  rewards: Reward[] = [];
  selectedReward: Reward | null = null;
  scanning = false;
  result: { name: string; rewardName: string; pointsDeducted: number; totalPoints: number } | null = null;
  error = '';

  readonly readerElementId = READER_ELEMENT_ID;

  private html5QrCode: Html5Qrcode | null = null;

  constructor(
    private rewardsService: RewardsService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.rewardsService.getRewards().subscribe({
      next: (rewards) => {
        this.rewards = rewards;
        this.cdr.detectChanges();
      }
    });
  }

  selectReward(reward: Reward) {
    this.selectedReward = reward;
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
    this.scanning = false;
    this.stopCamera();
    this.processRedemption(decodedText);
  }

  private processRedemption(qrCodeId: string) {
    if (!this.selectedReward) return;
    const reward = this.selectedReward;
    this.selectedReward = null;

    this.rewardsService.redeemReward(qrCodeId, reward.id).subscribe({
      next: (response) => {
        this.result = response;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err.error || 'Redemption failed. Customer may not have enough points.';
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
    this.selectedReward = null;
  }

  goBack() {
    this.stopCamera();
    this.router.navigate(['/staff/scan']);
  }
}
