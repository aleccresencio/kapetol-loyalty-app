import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface Transaction {
  id: number;
  customerId: number;
  customerName: string;
  customerPhone: string;
  points: number;
  reason: string;
  createdAt: string;
}

export interface TransactionHistoryResponse {
  items: Transaction[];
  totalCount: number;
  hasMore: boolean;
}

@Injectable({ providedIn: 'root' })
export class TransactionsService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getHistory(skip: number, take: number) {
    return this.http.get<TransactionHistoryResponse>(`${this.apiUrl}/api/transactions`, {
      params: { skip, take }
    });
  }
}
