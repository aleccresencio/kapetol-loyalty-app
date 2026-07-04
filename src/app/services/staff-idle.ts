import { Injectable } from '@angular/core';
import { SessionService } from './session';

const ACTIVITY_EVENTS = ['click', 'keydown', 'touchstart'];

@Injectable({ providedIn: 'root' })
export class StaffIdleService {
  constructor(private session: SessionService) {
    ACTIVITY_EVENTS.forEach(eventName =>
      document.addEventListener(eventName, () => this.onActivity(), { passive: true })
    );
  }

  private onActivity() {
    if (this.session.isStaffAuthenticated()) {
      this.session.refreshStaffExpiry();
    }
  }
}
