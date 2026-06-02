import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonButton, IonButtons,
  IonCard, IonCardContent,
  IonList, IonItem, IonLabel, IonBadge,
  AlertController
} from '@ionic/angular/standalone';
import { RewardsService, Reward } from '../../../services/rewards';
import { CustomerService } from '../../../services/customer';
import { SessionService } from '../../../services/session';

@Component({
  selector: 'app-customer-rewards',
  standalone: true,
  imports: [
    IonContent, IonHeader, IonToolbar, IonTitle, IonButton, IonButtons,
    IonCard, IonCardContent,
    IonList, IonItem, IonLabel, IonBadge,
  ],
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
    private alertCtrl: AlertController,
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

  async redeemReward(reward: Reward) {
    if (this.totalPoints < reward.pointsCost) {
      const alert = await this.alertCtrl.create({
        header: 'Not Enough Points',
        message: `You need ${reward.pointsCost} points but only have ${this.totalPoints}.`,
        buttons: ['OK']
      });
      await alert.present();
      return;
    }

    const confirm = await this.alertCtrl.create({
      header: 'Redeem Reward',
      message: `Redeem "${reward.name}" for ${reward.pointsCost} points? Show this to the staff to complete.`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Confirm',
          handler: () => this.doRedeem(reward)
        }
      ]
    });
    await confirm.present();
  }

  private doRedeem(reward: Reward) {
    this.rewardsService.redeemReward(this.qrCodeId, reward.id).subscribe({
      next: async (result) => {
        this.totalPoints = result.totalPoints;
        this.cdr.detectChanges();
        const alert = await this.alertCtrl.create({
          header: 'Redeemed!',
          message: `"${result.rewardName}" redeemed. Remaining points: ${result.totalPoints}`,
          buttons: ['OK']
        });
        await alert.present();
      },
      error: async () => {
        const alert = await this.alertCtrl.create({
          header: 'Error',
          message: 'Redemption failed. Please ask staff for help.',
          buttons: ['OK']
        });
        await alert.present();
      }
    });
  }

  goBack() {
    this.router.navigate(['/customer/dashboard']);
  }
}
