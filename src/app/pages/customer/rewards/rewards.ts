import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { RewardsService, Reward } from '../../../services/rewards';
import { CustomerService } from '../../../services/customer';
import { SessionService } from '../../../services/session';

@Component({
  selector: 'app-customer-rewards',
  standalone: true,
  imports: [],
  templateUrl: './rewards.html',
  styleUrls: ['./rewards.css']
})
export class CustomerRewardsPage implements OnInit {
  rewards: Reward[] = [];
  totalPoints = 0;
  qrCodeId = '';
  selectedReward: Reward | null = null;
  redemptionQrUrl = '';

  constructor(
    private rewardsService: RewardsService,
    private customerService: CustomerService,
    private session: SessionService,
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

    const phone = this.session.getCustomerPhone();
    if (phone) {
      this.customerService.getByPhone(phone).subscribe({
        next: (customer) => {
          this.totalPoints = customer.totalPoints;
          this.qrCodeId = customer.qrCodeId;
          this.cdr.detectChanges();
        }
      });
    }
  }

  redeemReward(reward: Reward) {
    if (this.totalPoints < reward.pointsCost) {
      alert(`You need ${reward.pointsCost} points but only have ${this.totalPoints}.`);
      return;
    }

    this.selectedReward = reward;
    this.redemptionQrUrl = this.rewardsService.getRedemptionQrCodeUrl(this.qrCodeId, reward.id);
  }

  onQrLoadError() {
    alert('Unable to generate redemption code. This reward may no longer be available.');
    this.dismissQr();
  }

  dismissQr() {
    this.selectedReward = null;
    this.redemptionQrUrl = '';
  }

  goBack() {
    this.router.navigate(['/']);
  }
}
