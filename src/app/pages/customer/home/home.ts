import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { CustomerService } from '../../../services/customer';
import { SessionService } from '../../../services/session';
import { PwaInstallService } from '../../../services/pwa-install';
import { COLD_START_STATUSES } from '../../../interceptors/cold-start-retry-interceptor';

type ViewState = 'phone' | 'name' | 'dashboard';

@Component({
  selector: 'app-customer-home',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class CustomerHomePage implements OnInit {
  view: ViewState = 'phone';

  phone = '';
  name = '';
  error = '';
  loading = false;

  customerName = '';
  totalPoints = 0;
  qrCodeUrl = '';

  constructor(
    private customerService: CustomerService,
    private session: SessionService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    readonly pwaInstall: PwaInstallService
  ) {}

  ngOnInit() {
    const id = this.session.getCustomerId();
    const phone = this.session.getCustomerPhone();

    if (id && phone) {
      this.customerService.getByPhone(phone).subscribe({
        next: (customer) => this.showDashboard(customer.id, phone, customer.name, customer.totalPoints),
        error: (err: HttpErrorResponse) => {
          if (!COLD_START_STATUSES.has(err.status)) return;
          this.error = 'Unable to reach the server. Please check your connection and try again.';
          this.cdr.detectChanges();
        }
      });
    }
  }

  continueWithPhone() {
    if (!this.phone.trim()) {
      this.error = 'Please enter your phone number.';
      return;
    }
    this.error = '';
    this.loading = true;
    const phone = this.phone.trim();

    this.customerService.getByPhone(phone).subscribe({
      next: (customer) => this.showDashboard(customer.id, phone, customer.name, customer.totalPoints),
      error: (err: HttpErrorResponse) => {
        this.loading = false;
        if (err.status === 404) {
          this.view = 'name';
        } else {
          this.error = 'Unable to reach the server. Please check your connection and try again.';
        }
        this.cdr.detectChanges();
      }
    });
  }

  register() {
    if (!this.name.trim()) {
      this.error = 'Please enter your name.';
      return;
    }
    this.error = '';
    this.loading = true;
    const phone = this.phone.trim();

    this.customerService.register(this.name.trim(), phone).subscribe({
      next: (customer) => this.showDashboard(customer.id, phone, customer.name, 0),
      error: () => {
        this.error = 'Registration failed. Please try again.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  goToRewards() {
    this.router.navigate(['/rewards']);
  }

  logout() {
    this.session.clearCustomer();
    this.view = 'phone';
    this.phone = '';
    this.name = '';
  }

  installApp() {
    this.pwaInstall.promptInstall();
  }

  dismissIosBanner() {
    this.pwaInstall.dismissIosBanner();
  }

  private showDashboard(id: number, phone: string, name: string, totalPoints: number) {
    this.session.setCustomerId(id);
    this.session.setCustomerPhone(phone);
    this.customerName = name;
    this.totalPoints = totalPoints;
    this.qrCodeUrl = this.customerService.getQrCodeUrl(id);
    this.loading = false;
    this.view = 'dashboard';
    this.cdr.detectChanges();
  }
}
