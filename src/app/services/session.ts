import { Injectable } from '@angular/core';

const STAFF_SESSION_KEY = 'staff_session';
const CUSTOMER_ID_KEY = 'customer_id';
const CUSTOMER_PHONE_KEY = 'customer_phone';

export const STAFF_IDLE_TIMEOUT_MS = 15 * 60 * 1000;

interface StaffSession {
  token: string;
  expiresAt: number;
}

@Injectable({ providedIn: 'root' })
export class SessionService {
  setStaffSession(token: string, expiresAt: number) {
    const session: StaffSession = { token, expiresAt };
    sessionStorage.setItem(STAFF_SESSION_KEY, JSON.stringify(session));
  }

  getStaffSession(): StaffSession | null {
    const raw = sessionStorage.getItem(STAFF_SESSION_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as StaffSession;
    } catch {
      return null;
    }
  }

  isStaffAuthenticated(): boolean {
    const session = this.getStaffSession();
    return !!session && session.expiresAt > Date.now();
  }

  refreshStaffExpiry(timeoutMs: number = STAFF_IDLE_TIMEOUT_MS) {
    const session = this.getStaffSession();
    if (!session) return;
    session.expiresAt = Date.now() + timeoutMs;
    sessionStorage.setItem(STAFF_SESSION_KEY, JSON.stringify(session));
  }

  clearStaff() {
    sessionStorage.removeItem(STAFF_SESSION_KEY);
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
