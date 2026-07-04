import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class StaffAuthService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  verifyPin(pin: string) {
    return this.http.post<{ token: string; expiresAt: string }>(
      `${this.apiUrl}/api/staff/verify-pin`,
      { pin }
    );
  }
}
