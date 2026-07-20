import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { TransactionsService, Transaction } from '../../../services/transactions';

const PAGE_SIZE = 25;

@Component({
  selector: 'app-staff-history',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './history.html',
  styleUrls: ['./history.css']
})
export class StaffHistoryPage implements OnInit {
  transactions: Transaction[] = [];
  hasMore = false;
  loading = false;
  error = '';

  constructor(
    private transactionsService: TransactionsService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadMore();
  }

  loadMore() {
    this.loading = true;
    this.error = '';

    this.transactionsService.getHistory(this.transactions.length, PAGE_SIZE).subscribe({
      next: (response) => {
        this.transactions = [...this.transactions, ...response.items];
        this.hasMore = response.hasMore;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err.error || 'Unable to load transaction history.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  goBack() {
    this.router.navigate(['/staff/scan']);
  }
}
