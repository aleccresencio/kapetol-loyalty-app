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

    const confirmed = confirm(
      `Redeem "${reward.name}" for ${reward.pointsCost} points? Show this to the staff to complete.`
    );
    if (confirmed) {
      this.doRedeem(reward);
    }
  }

  private doRedeem(reward: Reward) {
    this.rewardsService.redeemReward(this.qrCodeId, reward.id).subscribe({
      next: (result) => {
        this.totalPoints = result.totalPoints;
        this.cdr.detectChanges();
        alert(`"${result.rewardName}" redeemed. Remaining points: ${result.totalPoints}`);
      },
      error: () => {
        alert('Redemption failed. Please ask staff for help.');
      }
    });
  }

  goBack() {
    this.router.navigate(['/']);
  }
}
