import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CustomerService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  register(name: string, phone: string) {
    return this.http.post<{ id: number; name: string; phone: string; qrCodeId: string }>(
      `${this.apiUrl}/customers`,
      { name, phone }
    );
  }

  getById(id: number) {
    return this.http.get<{ id: number; name: string; phone: string; qrCodeId: string }>(
      `${this.apiUrl}/customers/${id}`
    );
  }

  getByPhone(phone: string) {
    return this.http.get<{ id: number; name: string; phone: string; qrCodeId: string; totalPoints: number }>(
      `${this.apiUrl}/customers/by-phone/${encodeURIComponent(phone)}`
    );
  }

  getTotalPoints(id: number) {
    return this.http.get<{ totalPoints: number }>(
      `${this.apiUrl}/customers/${id}/totalpoints`
    );
  }

  getQrCodeUrl(id: number): string {
    return `${this.apiUrl}/customers/${id}/qrcode`;
  }

  downloadQrCode(id: number) {
    return this.http.get(`${this.apiUrl}/customers/${id}/qrcode`, { responseType: 'blob' });
  }
}
