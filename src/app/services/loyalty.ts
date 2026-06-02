import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class LoyaltyService {

  private http = inject(HttpClient);

  private apiUrl = 'http://localhost:5166/api/loyalty';

  scanQr(data: any) {
    return this.http.post(`${this.apiUrl}/scan`, data);
  }
}