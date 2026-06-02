import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonButton, IonButtons,
  IonList, IonItem, IonLabel, IonBadge, IonCard, IonCardContent, IonText
} from '@ionic/angular/standalone';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { RewardsService, Reward } from '../../../services/rewards';

@Component({
  selector: 'app-staff-redeem',
  standalone: true,
  imports: [
    ZXingScannerModule,
    IonContent, IonHeader, IonToolbar, IonTitle, IonButton, IonButtons,
    IonList, IonItem, IonLabel, IonBadge, IonCard, IonCardContent, IonText
  ],
  templateUrl: './redeem.html',
  styleUrls: ['./redeem.css']
})
export class StaffRedeemPage implements OnInit {
  rewards: Reward[] = [];
  selectedReward: Reward | null = null;
  scanning = false;
  result: { name: string; rewardName: string; pointsDeducted: number; totalPoints: number } | null = null;
  error = '';

  constructor(
    private rewardsService: RewardsService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.rewardsService.getRewards().subscribe({
      next: (rewards) => (this.rewards = rewards)
    });
  }

  selectReward(reward: Reward) {
    this.selectedReward = reward;
    this.result = null;
    this.error = '';
    this.scanning = true;
  }

  onScanSuccess(qrCodeId: string) {
    this.scanning = false;
    if (!this.selectedReward) return;

    this.rewardsService.redeemReward(qrCodeId, this.selectedReward.id).subscribe({
      next: (response) => {
        this.result = response;
        this.selectedReward = null;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err.error || 'Redemption failed. Customer may not have enough points.';
        this.selectedReward = null;
        this.cdr.detectChanges();
      }
    });
  }

  goBack() {
    this.router.navigate(['/staff/scan']);
  }
}
