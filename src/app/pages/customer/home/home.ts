import { AfterViewInit, Component, ChangeDetectorRef, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { CustomerService } from '../../../services/customer';
import { SessionService } from '../../../services/session';
import { PwaInstallService } from '../../../services/pwa-install';
import { COLD_START_STATUSES } from '../../../interceptors/cold-start-retry-interceptor';

type ViewState = 'phone' | 'name' | 'dashboard';

const PULL_MAX_OFFSET = 70;
const PULL_REFRESH_THRESHOLD = 50;

@Component({
  selector: 'app-customer-home',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class CustomerHomePage implements OnInit, AfterViewInit, OnDestroy {
  view: ViewState = 'phone';

  phone = '';
  name = '';
  error = '';
  loading = false;
  showPointsInfo = false;

  customerName = '';
  totalPoints = 0;
  qrCodeUrl = '';

  refreshing = false;
  pullOffset = 0;

  private pullStartY: number | null = null;
  private readonly onTouchStart = (event: TouchEvent) => this.handleTouchStart(event);
  private readonly onTouchMove = (event: TouchEvent) => this.handleTouchMove(event);
  private readonly onTouchEnd = () => this.handleTouchEnd();

  constructor(
    private customerService: CustomerService,
    private session: SessionService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private elementRef: ElementRef<HTMLElement>,
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

  ngAfterViewInit() {
    const el = this.elementRef.nativeElement;
    el.addEventListener('touchstart', this.onTouchStart, { passive: true });
    el.addEventListener('touchmove', this.onTouchMove, { passive: false });
    el.addEventListener('touchend', this.onTouchEnd, { passive: true });
  }

  ngOnDestroy() {
    const el = this.elementRef.nativeElement;
    el.removeEventListener('touchstart', this.onTouchStart);
    el.removeEventListener('touchmove', this.onTouchMove);
    el.removeEventListener('touchend', this.onTouchEnd);
  }

  refreshDashboard() {
    const id = this.session.getCustomerId();
    const phone = this.session.getCustomerPhone();
    if (!id || !phone) {
      this.pullOffset = 0;
      return;
    }
    this.refreshing = true;
    this.pullOffset = 0;

    this.customerService.getByPhone(phone).subscribe({
      next: (customer) => {
        this.refreshing = false;
        this.showDashboard(id, phone, customer.name, customer.totalPoints);
      },
      error: () => {
        this.refreshing = false;
        this.cdr.detectChanges();
      }
    });
  }

  private handleTouchStart(event: TouchEvent) {
    if (this.view !== 'dashboard' || this.refreshing || window.scrollY > 0 || !this.pwaInstall.isStandalone()) {
      this.pullStartY = null;
      return;
    }
    this.pullStartY = event.touches[0].clientY;
  }

  private handleTouchMove(event: TouchEvent) {
    if (this.pullStartY === null) return;
    const deltaY = event.touches[0].clientY - this.pullStartY;
    if (deltaY <= 0) {
      this.pullOffset = 0;
      return;
    }
    event.preventDefault();
    this.pullOffset = Math.min(deltaY / 2, PULL_MAX_OFFSET);
    this.cdr.detectChanges();
  }

  private handleTouchEnd() {
    if (this.pullStartY === null) return;
    this.pullStartY = null;

    if (this.pullOffset >= PULL_REFRESH_THRESHOLD) {
      this.refreshDashboard();
    } else {
      this.pullOffset = 0;
      this.cdr.detectChanges();
    }
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
