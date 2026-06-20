import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LoyaltyService {

  private http = inject(HttpClient);

  private apiUrl = `${environment.apiUrl}/api/loyalty`;

  scanQr(data: any) {
    return this.http.post(`${this.apiUrl}/scan`, data);
  }
}