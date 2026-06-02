import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonButton,
  IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButtons
} from '@ionic/angular/standalone';
import { CustomerService } from '../../../services/customer';
import { SessionService } from '../../../services/session';

@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  imports: [
    IonContent, IonHeader, IonToolbar, IonTitle, IonButton,
    IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButtons
  ],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class CustomerDashboardPage implements OnInit {
  customerName = '';
  totalPoints = 0;
  qrCodeUrl = '';

  constructor(
    private customerService: CustomerService,
    private session: SessionService,
    private router: Router
  ) {}

  ngOnInit() {
    const id = this.session.getCustomerId();
    const phone = this.session.getCustomerPhone();

    if (!id || !phone) {
      this.router.navigate(['/customer/register']);
      return;
    }

    this.qrCodeUrl = this.customerService.getQrCodeUrl(id);

    this.customerService.getByPhone(phone).subscribe({
      next: (customer) => {
        this.customerName = customer.name;
        this.totalPoints = customer.totalPoints;
      }
    });
  }

  goToRewards() {
    this.router.navigate(['/customer/rewards']);
  }

  logout() {
    this.session.clearCustomer();
    this.router.navigate(['/']);
  }
}
