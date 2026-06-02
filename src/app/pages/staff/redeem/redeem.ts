import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonButton, IonButtons,
  IonList, IonItem, IonLabel, IonBadge, IonCard, IonCardContent, IonText
} from '@ionic/angular/standalone';
import jsQR from 'jsqr';
import { RewardsService, Reward } from '../../../services/rewards';

@Component({
  selector: 'app-staff-redeem',
  standalone: true,
  imports: [
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

  @ViewChild('videoEl') videoEl!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasEl') canvasEl!: ElementRef<HTMLCanvasElement>;

  private stream: MediaStream | null = null;
  private scanning$ = false;

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
        this.scanning = false;
        this.processRedemption(code.data);
        return;
      }
    }

    requestAnimationFrame(() => this.scanLoop());
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
    this.scanning$ = false;
    this.stream?.getTracks().forEach(t => t.stop());
    this.stream = null;
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
