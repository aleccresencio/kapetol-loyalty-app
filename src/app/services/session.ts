import { Injectable } from '@angular/core';

const STAFF_KEY = 'staff_authenticated';
const CUSTOMER_ID_KEY = 'customer_id';
const CUSTOMER_PHONE_KEY = 'customer_phone';

@Injectable({ providedIn: 'root' })
export class SessionService {
  setStaffAuthenticated() {
    sessionStorage.setItem(STAFF_KEY, 'true');
  }

  isStaffAuthenticated(): boolean {
    return sessionStorage.getItem(STAFF_KEY) === 'true';
  }

  clearStaff() {
    sessionStorage.removeItem(STAFF_KEY);
  }

  setCustomerId(id: number) {
    localStorage.setItem(CUSTOMER_ID_KEY, String(id));
  }

  getCustomerId(): number | null {
    const val = localStorage.getItem(CUSTOMER_ID_KEY);
    return val ? Number(val) : null;
  }

  setCustomerPhone(phone: string) {
    localStorage.setItem(CUSTOMER_PHONE_KEY, phone);
  }

  getCustomerPhone(): string | null {
    return localStorage.getItem(CUSTOMER_PHONE_KEY);
  }

  clearCustomer() {
    localStorage.removeItem(CUSTOMER_ID_KEY);
    localStorage.removeItem(CUSTOMER_PHONE_KEY);
  }
}
