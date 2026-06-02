import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface Reward {
  id: number;
  name: string;
  description: string;
  pointsCost: number;
}

@Injectable({ providedIn: 'root' })
export class RewardsService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5166';

  getRewards() {
    return this.http.get<Reward[]>(`${this.apiUrl}/api/rewards`);
  }

  redeemReward(qrCodeId: string, rewardId: number) {
    return this.http.post<{ name: string; rewardName: string; pointsDeducted: number; totalPoints: number }>(
      `${this.apiUrl}/api/loyalty/redeem`,
      { qrCodeId, rewardId }
    );
  }
}
