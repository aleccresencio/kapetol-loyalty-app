import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent, IonHeader, IonToolbar, IonTitle,
  IonItem, IonLabel, IonInput, IonButton, IonText
} from '@ionic/angular/standalone';
import { CustomerService } from '../../../services/customer';
import { SessionService } from '../../../services/session';

@Component({
  selector: 'app-customer-register',
  standalone: true,
  imports: [FormsModule, IonContent, IonHeader, IonToolbar, IonTitle,
    IonItem, IonLabel, IonInput, IonButton, IonText],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class CustomerRegisterPage {
  name = '';
  phone = '';
  error = '';
  loading = false;

  constructor(
    private customerService: CustomerService,
    private session: SessionService,
    private router: Router
  ) {}

  register() {
    if (!this.name.trim() || !this.phone.trim()) {
      this.error = 'Please fill in all fields.';
      return;
    }

    this.loading = true;
    this.error = '';

    this.customerService.register(this.name.trim(), this.phone.trim()).subscribe({
      next: (customer) => {
        this.session.setCustomerId(customer.id);
        this.session.setCustomerPhone(this.phone.trim());
        this.router.navigate(['/customer/dashboard']);
      },
      error: () => {
        this.error = 'Registration failed. Please try again.';
        this.loading = false;
      }
    });
  }

  login() {
    if (!this.phone.trim()) {
      this.error = 'Please enter your phone number.';
      return;
    }

    this.loading = true;
    this.error = '';

    this.customerService.getByPhone(this.phone.trim()).subscribe({
      next: (customer) => {
        this.session.setCustomerId(customer.id);
        this.session.setCustomerPhone(this.phone.trim());
        this.router.navigate(['/customer/dashboard']);
      },
      error: () => {
        this.error = 'No account found with that phone number.';
        this.loading = false;
      }
    });
  }
}
